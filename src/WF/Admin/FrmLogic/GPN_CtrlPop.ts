import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapExt } from '../../Admin/FrmLogic/MapExt';
import { MapAttr } from '../../Admin/FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '../GloWF';
import { GPN_CtrlInput } from './GPN_CtrlInput';
import { MapData } from './MapData';
import GPNMenuExt from '/@/CCFast/GPM/CCMenu/GPNMenuExt';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import { SFDBSrcs } from './SFDBSrc/SFDBSrc';
import { SFSearchs } from './SFSearch/SFSearch';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';

export class GPN_CtrlPop extends PageBaseGroupNew {
  constructor() {
    super('GPN_CtrlPop');
    //  this.ForEntityClassID = 'TS.FrmUI.SFTable';
    this.PageTitle = 'Pop弹窗';
  }
  public async Init() {
    this.AddGroup('A', '单据实体引入'); //增加分组.
    this.SelectItemsByGroupList('FrmEntity', '实体', this.HelpTodo, false, GloWF.srcFrmTree, GloWF.srcFrmDictList);
    this.SelectItemsByList('FrmEntity.SelectField', '引入字段', this.HelpTodo, true, this.GenerTableFields);
    //单据.
    this.SelectItemsByGroupList('FrmBill', '单据', this.HelpTodo, false, GloWF.srcFrmTree, GloWF.srcFrmListOfBill);
    this.SelectItemsByList('FrmBill.Fields', '引入字段', this.HelpTodo, true, this.GenerTableFields);

    //高代码实体
    this.AddBlank('Entity', 'TS实体(高代码)', '');
    this.AddTableByOptions({
      no: 'Entity.EnName',
      name: '选择实体',
      columns: GPNMenuExt.TableCols(),
      helpDocs: '选择实体(单选)',
      IsMultiSelect: false,
      srcOfList: await GPNMenuExt.GenerEnsList('Entity'),
    });
    this.SelectItemsByList('Entity.EnName.Fields', '引入字段', this.HelpTodo, true, this.GenerEntityFields);

    this.AddIcon('icon-plus', 'FrmEntity');
    this.AddIcon('icon-notebook', 'FrmBill');
    this.AddIcon('icon-drop', 'Entity');

    this.AddGroup('B', '从数据源引入(开发中)'); //增加分组.
    //     this.SelectItemsByGroupList('SFTable', '数据字典', this.HelpTodo, false, new SFDBSrcs(), new SFTable(), true, '', 'ProType'); // 写sql
    //this.SelectItemsByGroupList('SFTable', '数据字典', this.HelpTodo, false, new SFDBSrcs(), new SFTables(), false, '', 'FK_SFDBSrc');
    // this.TextBox2_NameNo('SFTable.No.Name', '字段', '', null, '字段英文名', '字段中文名', '');
    this.SelectItemsByGroupList('SFSearch', '查询', this.HelpTodo, false, new SFDBSrcs(), new SFSearchs(), false, '', 'FK_SFDBSrc');
  }

  public async GenerSorts(): Promise<any[]> {
    return [];
  }
  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = this.RequestVal('FrmID');

    //引入查询.
    if (pageNo == 'SFSearch') {
      const groupID = await GPN_CtrlInput.GenerNewGroupField(tb1, frmID);
      return await this.FrmBillInput(pageNo, frmID, groupID, 'No', 'Name', tb1, tb2);
    }

    //实体选择.
    if (pageNo == 'FrmEntity.SelectField') {
      const fromFrmID = this.RequestVal('tb1', 'FrmEntity');
      const fromFrmName = this.RequestVal('tb2', 'FrmEntity');
      const groupID = await GPN_CtrlInput.GenerNewGroupField(fromFrmName, frmID);
      // return await this.FrmEntityInput(frmID, fromFrmID, groupID, tb1, tb2);
      return await this.FrmBillInput(frmID, fromFrmID, groupID, 'No', 'Name', tb1, tb2);
    }
    if (pageNo == 'SQLInput.Table.No.Name.Fields') {
      //  return await this.SQLInput(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo == 'FrmBill.Fields') {
      const frmFrmID = this.RequestVal('tb1', 'FrmBill');
      const fromFrmName = this.RequestVal('tb2', 'FrmBill');
      const groupID = await GPN_CtrlInput.GenerNewGroupField(fromFrmName, frmID);
      return await this.FrmBillInput(frmID, frmFrmID, groupID, 'BillNo', 'Title', tb1, tb2);
    }
    if (pageNo == 'Entity.EnName.Fields') {
      const enName = this.RequestVal('tb1', 'Entity.EnName');
      const groupID = await GPN_CtrlInput.GenerNewGroupField(this.RequestVal('tb2', 'Entity.EnName'), frmID);
      const en = await ClassFactory.GetEn(enName);
      const pkAttr = en.PK;
      let pkName = 'Name';
      if (pkAttr != 'No') {
        const hasNameAttr = en._enMap.attrs.find((attr) => attr.Key == 'Title');
        if (hasNameAttr) {
          pkName = 'Title';
        } else {
          const inputNameField = window.prompt('请输入lable的字段名称,比如:Title', 'Title');
          if (inputNameField?.trim() != '') {
            pkName = inputNameField?.trim() || '';
          }
        }
      }
      return await this.FrmTSEntityInput(frmID, enName, groupID, pkAttr, pkName, tb1, tb2);
    }

    // alert('没有解析' + pageNo);
  }
  async FrmTSEntityInput(frmID: any, enName: any, _sortNo: string, _no: string, _name: string, attrIDs: string, _tb2: string) {
    //1. 创建No,Name字段,的自动完成.

    const en = await ClassFactory.GetEn(enName);
    const shortID = en._enMap.PhysicsTable;

    const mapAttr = new MapAttr();
    mapAttr.MyPK = frmID + '_' + shortID + _no;
    if (await mapAttr.IsExits()) {
      return new GPNReturnObj(GPNReturnType.Error, '该控件ID已经存在,请检查该实体是否引入过？');
    }
    mapAttr.KeyOfEn = shortID + _no;
    mapAttr.Name = _name;
    if (_no == 'No') mapAttr.Tip = '请输入[' + en._enMap.EnDesc + ']编号或名称.';
    if (_no == 'OID') mapAttr.Tip = '请输入[' + en._enMap.EnDesc + ']编号或名称.';
    if (_no == 'BillNo') mapAttr.Tip = '请输入[' + en._enMap.EnDesc + ']单号或标题.';

    mapAttr.Icon = 'icon-notebook';
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.Idx = 1;
    await mapAttr.Insert();

    //插入名称.
    const mapAttrName = new MapAttr();
    mapAttrName.MyPK = frmID + '_' + shortID + _name;
    mapAttrName.KeyOfEn = shortID + _name;
    if (_no == 'BillNo') mapAttrName.Name = en._enMap.EnDesc + '单据标题';
    else mapAttrName.Name = en._enMap.EnDesc + '名称';

    mapAttrName.GroupID = _sortNo;
    mapAttrName.FK_MapData = frmID;
    mapAttrName.Idx = 2;
    mapAttrName.UIIsEnable = 0;
    await mapAttrName.Insert();

    let colNames = _no + '=编号,' + _name + '=名称,';
    //2. 开始创建字段.
    const ids = attrIDs.split(',');
    let fields = '';
    let idx = 1;

    for (const selectedId of ids) {
      const attrEn = en._enMap.GetAttrByKey(selectedId);
      const attr = new MapAttr();
      attr.FK_MapData = frmID;
      attr.KeyOfEn = attrEn.Key;
      attr.MyPK = attr.FK_MapData + '_' + attrEn.Key;
      attr.Name = attrEn.Desc;
      attr.MyDataType = attrEn.MyDataType;
      attr.MyFieldType = attrEn.MyFieldType;
      attr.UIContralType = attrEn.UIContralType;
      attr.UIIsEnable = false;
      attr.UIWidth = attrEn.UIWidth;
      attr.MinLen = attrEn.MinLength;
      attr.MaxLen = attrEn.MaxLength;
      attr.UIIsEnable = !attrEn.UIIsReadonly;
      attr.GroupID = _sortNo;
      attr.Idx = idx + 10;
      if ((await attr.IsExits()) == true) await attr.Update();
      else await attr.Insert();
      fields += attr.KeyOfEn + ',';
      colNames += '' + attr.KeyOfEn + '=' + attr.Name + ',';
      idx++;
    }
    fields = fields.substring(0, fields.length - 1);
    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + mapAttr.KeyOfEn + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';

    mapExt.DoWay = 'PopTableSimple'; //简单表格.
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Doc = '';
    mapExt.Tag = colNames; //列名转换.
    mapExt.Tag5 = 'Self'; //自定义设置.

    mapExt.Tag2 =
      'SELECT ' + _no + ' AS No, ' + _name + ' AS Name,' + fields + ' FROM ' + en._enMap.PhysicsTable + ' WHERE ' + _no + ' like ~%@Key%~ OR ' + _name + ' like ~%@Key%~';
    mapExt.Tag6 = 'SELECT ' + _name + ' AS ' + shortID + _name + ', ' + fields + ' FROM ' + en._enMap.PhysicsTable + ' WHERE ' + _no + '=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.PopSelectType = 0; //单选.
    mapExt.H = 600;
    mapExt.W = 800;

    if (_no == 'No') mapExt.AtPara = '@Title=弹窗返回值@BtnLab=查找@SearchTip=请输入' + mapAttrName.Name + '编号、名称@ShowModel=0@PopSelectType=0';
    else mapExt.AtPara = '@Title=弹窗返回值@BtnLab=查找@SearchTip=请输入' + mapAttrName.Name + '单据编号、标题@ShowModel=0@PopSelectType=0';

    //查询.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapAttr.KeyOfEn, 'Pop.TableSearch', 'SFTable', mapExt.Tag2);
    //填充.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapAttr.KeyOfEn, 'FullDataBody', 'Search', mapExt.Tag6);

    mapExt.Tag2 = '';
    mapExt.Tag6 = '';
    mapExt.SetPara('IsUp', '1');
    if ((await mapExt.IsExits()) == true) await mapExt.Update();
    else await mapExt.Insert();

    //处理填充.
    //转向.
    //const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mapAttr.MyPK);
    return new GPNReturnObj(GPNReturnType.Message, '已经引入成功，请测试设置。');
  }
  //文本框自动完成: 导入其他字典字段.
  async FrmBillInput(frmID: any, _fromFrmID: any, _sortNo: string, _no: string, _name: string, attrIDs: string, _tb2: string) {
    //1. 创建No,Name字段,的自动完成.
    let shortID = _fromFrmID.replace('Dict_', ''); //一个短的ID.
    shortID = _fromFrmID.replace('Bill_', '');
    shortID = _fromFrmID.replace('Ask_', '');
    shortID = _fromFrmID.replace('Port_', '');
    shortID = _fromFrmID.replace('En_', '');

    const frmFromMD = new MapData();
    frmFromMD.No = _fromFrmID;
    await frmFromMD.Retrieve();

    const mapAttr = new MapAttr();
    mapAttr.MyPK = frmID + '_' + shortID + _no;
    if (await mapAttr.IsExits()) {
      return new GPNReturnObj(GPNReturnType.Error, '该控件ID已经存在,请检查该实体是否引入过？');
    }
    mapAttr.KeyOfEn = shortID + _no;
    mapAttr.Name = frmFromMD.Name;
    if (_no == 'No') mapAttr.Tip = '请输入[' + frmFromMD.Name + ']编号或名称.';
    if (_no == 'BillNo') mapAttr.Tip = '请输入[' + frmFromMD.Name + ']单号或标题.';

    mapAttr.Icon = 'icon-notebook';
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.Idx = -100;
    await mapAttr.Insert();
    mapAttr.Idx = -1002;
    await mapAttr.DirectUpdate();

    //插入名称.
    const mapAttrName = new MapAttr();
    mapAttrName.MyPK = frmID + '_' + shortID + _name;
    mapAttrName.KeyOfEn = shortID + _name;
    if (_no == 'BillNo') mapAttrName.Name = frmFromMD.Name + '单据标题';
    else mapAttrName.Name = frmFromMD.Name + '名称';

    mapAttrName.GroupID = _sortNo;
    mapAttrName.FK_MapData = frmID;
    mapAttrName.Idx = -1001;
    mapAttrName.UIIsEnable = 0;
    await mapAttrName.DirectInsert();

    let colNames = _no + '=编号,' + _name + '=名称,';
    //2. 开始创建字段.
    const ids = attrIDs.split(',');
    let fields = '';
    for (let index = 0; index < ids.length; index++) {
      const element = ids[index];

      const attr = new MapAttr();
      attr.MyPK = element;
      await attr.Retrieve();
      attr.FK_MapData = frmID;
      attr.MyPK = attr.FK_MapData + '_' + attr.KeyOfEn;
      attr.UIIsEnable = false;
      attr.GroupID = _sortNo;
      attr.Idx = index;
      if ((await attr.IsExits()) == true) await attr.Update();
      else await attr.Insert();
      fields += attr.KeyOfEn + ',';
      colNames += '' + attr.KeyOfEn + '=' + attr.Name + ',';
    }
    fields = fields.substring(0, fields.length - 1);

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + mapAttr.KeyOfEn + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';

    mapExt.DoWay = 'PopTableSimple'; //简单表格.
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Doc = '';
    mapExt.Tag = colNames; //列名转换.
    mapExt.Tag5 = 'Self'; //自定义设置.

    mapExt.Tag2 = 'SELECT ' + _no + ' AS No, ' + _name + ' AS Name,' + fields + ' FROM ' + frmFromMD.PTable + ' WHERE ' + _no + ' like ~%@Key%~ OR ' + _name + ' like ~%@Key%~';
    mapExt.Tag6 = 'SELECT ' + _name + ' AS ' + shortID + _name + ', ' + fields + ' FROM ' + frmFromMD.PTable + ' WHERE ' + _no + '=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.PopSelectType = 0; //单选.
    mapExt.H = 600;
    mapExt.W = 800;

    //查询.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapAttr.KeyOfEn, 'Pop.TableSearch', 'SFTable', mapExt.Tag2);
    //填充.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapAttr.KeyOfEn, 'FullDataBody', 'Search', mapExt.Tag6);

    mapExt.Tag2 = '';
    mapExt.Tag6 = '';
    mapExt.SetPara('IsUp', '1');


    if (_no == 'No') mapExt.AtPara = '@Title=弹窗返回值@BtnLab=查找@SearchTip=请输入' + mapAttrName.Name + '编号、名称@ShowModel=0@PopSelectType=0';
    else mapExt.AtPara = '@Title=弹窗返回值@BtnLab=查找@SearchTip=请输入' + mapAttrName.Name + '单据编号、标题@ShowModel=0@PopSelectType=0';

    if ((await mapExt.IsExits()) == true) await mapExt.Update();
    else await mapExt.Insert();

    //处理填充.
    //转向.
    //const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mapAttr.MyPK);
    return new GPNReturnObj(GPNReturnType.Message, '已经引入成功，请测试设置。');
  }

  public async GenerEntityFields() {
    const enName = this.RequestVal('tb1', 'Entity.EnName');
    const en = await ClassFactory.GetEn(enName);
    const filterKeys = ['No', 'OID', 'MyPK', 'NodeID', 'WorkID', 'Name'];
    const attrs = en._enMap.attrs
      .filter((attr) => !filterKeys.includes(attr.Key))
      .map((attr) => {
        return {
          No: attr.Key,
          Name: attr.Desc,
        };
      });

    return JSON.stringify(attrs);
    // return GloWF.SQLOfBillFields(enName);
  }
  //获得表的字段.
  public GenerTableFields() {
    let myFrmID = this.RequestVal('tb1', 'FrmInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmBill');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'RefEntityNoName');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmEntityNoNameInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmEntity');
    // const sql = `SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='${myFrmID}'
    // AND KeyOfEn NOT IN ('OID','FID','AtPara','DeptNo','DeptName','Rec','OrgNo','BillState','EntityState',
    // 'No','Name','BillNo','Title','PFrmID','Starter','PWorkID','StarterName','RDT') AND UIVisible=1 `;
    return GloWF.SQLOfBillFields(myFrmID);
  }
}
