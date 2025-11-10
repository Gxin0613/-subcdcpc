import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { MapExt } from '../../Admin/FrmLogic/MapExt';
import { MapAttr } from '../../Admin/FrmLogic/MapAttrs/MapAttr';
import { useDesignerStore } from '/@/store/modules/form';
import { GloWF } from '../GloWF';
import { MapData } from './MapData';
import { createGroupField } from '../FoolFormDesigner/props/type-utils/CreateContainerFunctions';

export class GPN_CtrlAutoFullDict extends PageBaseGroupNew {
  constructor() {
    super('GPN_CtrlAutoFullDict');
    //  this.ForEntityClassID = 'TS.FrmUI.SFTable';
    this.PageTitle = '引用实体';
  }
  public async Init() {
    this.AddGroup('AA', '内置', 'icon-list'); //增加分组.
    this.SelectItemsByList('FrmEntityNoNameInput', '实体引用', this.InputEmpDesc, false, GloWF.srcFrmEntityNoName);
    this.SelectItemsByList('FrmEntityNoNameInput.Fields', '引入字段', this.InputEmpDesc, true, this.GenerTableFields);
  }

  public async GenerSorts(): Promise<any[]> {
    const fdStore = useDesignerStore();
    return Promise.resolve(
      fdStore.widgetsList.map((w) => {
        return {
          No: w.id,
          Name: w.title,
        };
      }),
    );
  }
  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = this.RequestVal('FrmID');
    if (pageNo == 'FrmEntityNoNameInput.Fields') {
      const frmFrmID = this.RequestVal('tb1', 'FrmEntityNoNameInput');
      return await this.FrmInput(frmID, frmFrmID, _sortNo, 'No', 'Name', tb1, tb2);
    }
  }
  //获得表的字段.
  public GenerTableFields() {
  //  debugger;
    let myFrmID = this.RequestVal('tb1', 'FrmInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmBillInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'RefEntityNoName');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmEntityNoNameInput');

    // const sql = `SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='${myFrmID}'
    // AND KeyOfEn NOT IN ('OID','FID','AtPara','DeptNo','DeptName','Rec','OrgNo','BillState','EntityState',
    // 'No','Name','BillNo','Title','PFrmID','Starter','PWorkID','StarterName','RDT') AND UIVisible=1 `;
    return GloWF.SQLOfBillFields(myFrmID);
  }
  //文本框自动完成: 导入其他字典字段.
  async FrmInput(frmID: any, _fromFrmID: any, _sortNo: string, _no: string, _name: string, attrIDs: string, _tb2: string) {
    //1. 创建No,Name字段,的自动完成.
    let shortID = _fromFrmID.replace('Dict_', ''); //一个短的ID.
    shortID = _fromFrmID.replace('Bill_', '');
    shortID = _fromFrmID.replace('Ask_', '');
    shortID = _fromFrmID.replace('Port_', '');
    shortID = _fromFrmID.replace('En_', '');

    const frmFromMD = new MapData();
    frmFromMD.No = _fromFrmID;
    await frmFromMD.Retrieve();

    const item = { title: frmFromMD.Name };
    const group = await createGroupField(item, frmID + '', 2, '');
    const groupID = parseInt(group.PKVal);

    const mapAttr = new MapAttr();
    mapAttr.MyPK = frmID + '_' + shortID + _no;
    if (await mapAttr.IsExits()) {
      alert('改控件ID已经存在,请检查该实体是否引入过？');
      return;
    }
    mapAttr.KeyOfEn = 'F' + shortID + _no;
    mapAttr.Name = frmFromMD.Name;
    mapAttr.GroupID = groupID;
    mapAttr.FK_MapData = frmID;
    mapAttr.Idx = 1;
    mapAttr.UIIsEnable = 1;
    await mapAttr.Insert();

    //插入名称.
    const idx = 10;
    const mapAttrName = new MapAttr();
    mapAttrName.MyPK = frmID + '_' + shortID + _name;
    mapAttrName.KeyOfEn = 'F' + shortID + _name;
    if (_no == 'BillNo') mapAttrName.Name = frmFromMD.Name + '单据标题';
    else mapAttrName.Name = frmFromMD.Name + '名称';

    mapAttrName.GroupID = groupID;
    mapAttrName.FK_MapData = frmID;
    mapAttrName.Idx = 1 + idx;
    mapAttrName.UIIsEnable = 0;
    await mapAttrName.Insert();

    //2. 开始创建字段.
    const ids = attrIDs.split(',');
    let sqlField = 'SELECT  Name as ' + mapAttrName.KeyOfEn;
    for (let index = 0; index < ids.length; index++) {
      const element = ids[index];

      const attr = new MapAttr(element);
      await attr.RetrieveFromDBSources();

      const keyOfEn = attr.KeyOfEn;
      //attr.FK_MapData = element;
      await attr.Retrieve();
      attr.FK_MapData = frmID;
      attr.MyPK = attr.FK_MapData + '_' + attr.KeyOfEn;
      attr.KeyOfEn = attr.FK_MapData + '_' + attr.KeyOfEn;
      attr.UIIsEnable = false;
      attr.UIVisible = 1;
      attr.GroupID = groupID;
      if ((await attr.IsExits()) == true) await attr.Update();
      else await attr.Insert();
      sqlField += ' ,' + keyOfEn + ' AS ' + attr.KeyOfEn;
    }
    sqlField += ' FROM ' + frmFromMD.PTable + ' WHERE (No like ~%@Key%~ OR Name like ~%@Key%~) AND EntityState >=1 ';

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + mapAttr.KeyOfEn + '_TBFullCtrl';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'TBFullCtrl';
    mapExt.ExtType = 'TBFullCtrl';

    mapExt.DoWay = 'Simple';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Doc = '';
    mapExt.Tag4 = 'SELECT ' + _no + ' AS No, ' + _name + ' AS Name From ' + frmFromMD.PTable + ' WHERE ' + _no + ' like ~%@Key%~ OR ' + _name + ' like ~%@Key%~';
    mapExt.Tag5 = 'Self';
    mapExt.Tag6 = sqlField;
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';

    if ((await mapExt.IsExits()) == true) await mapExt.Update();
    else await mapExt.Insert();

    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mapAttr.MyPK);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public readonly InputEmpDesc = `
  #### 帮助
  - 创建一个文本框的字段，存储人员编号。
  - 附加创建：电话、邮件字段。
  - 让其可以使用文本框自动完成模式的人员信息的填充,数据获取 Port_Emp表， 电话，邮件。 
  - 用户输入账号，就可以查询出来，该人员的姓名，进而把其他的数据也显示到字段里。
  - 字段名规则，比如输入，人员账号
  #### 数据存储.
  - 数据存在Sys_MapExt的扩展属性里.
  
    `;
}
