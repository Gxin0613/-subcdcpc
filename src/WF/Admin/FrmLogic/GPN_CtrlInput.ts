import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { MapExt } from '../../Admin/FrmLogic/MapExt';
import { MapAttr } from '../../Admin/FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '../GloWF';
import { SFDBSrc } from './SFDBSrc/SFDBSrc';
import { DataType } from '/@/bp/en/DataType';
import { MapData } from './MapData';
import { GroupField } from './GroupField';
import { Flow } from '../../TSClass/Flow';
import { number } from 'echarts';
import { SFSearchs } from './SFSearch/SFSearch';
import { SFColumns } from './SFSearch/SFColumn';
import { Emp, Emps } from '/@/bp/port/Emp';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';

export class GPN_CtrlInput extends PageBaseGroupNew {
  constructor() {
    super('GPN_CtrlInput');
    //  this.ForEntityClassID = 'TS.FrmUI.SFTable';
    this.PageTitle = '文本框自动完成';
  }
  public async Init() {
    this.AddGroup('B', '单据实体引入'); //增加分组.
    this.SelectItemsByGroupList('FrmEntity', '实体', this.HelpTodo, false, GloWF.srcFrmTree, GloWF.srcFrmDictList);
    this.SelectItemsByList('FrmEntity.SelectField', '选择字段', this.InputEmpDesc, true, this.GenerTableFields);
    //单据.
    this.SelectItemsByGroupList('FrmBill', '单据', this.InputEmpDesc, false, GloWF.srcFrmTree, GloWF.srcFrmListOfBill);
    this.SelectItemsByList('FrmBill.Fields', '引入字段', this.InputEmpDesc, true, this.GenerTableFields);

    this.SelectItemsByGroupList('FlowEntity', '流程', this.HelpTodo, false, GloWF.srcFlowSorts, GloWF.srcFlows);
    this.SelectItemsByList('FlowEntity.SelectField', '选择字段', this.InputEmpDesc, true, this.GenerTableFields);

    this.AddIcon('icon-plus', 'FrmEntity');
    this.AddIcon('icon-notebook', 'FrmBill');

    //*****************************************   SQL导入 */
    this.SelectItemsByList('SQLInput', 'SQL导入', this.HelpTodo, false, GloWF.srcDBSrc);
    this.SelectItemsByList('SQLInput.Table', '选择表', this.HelpTodo, false, async () => {
      const dbsrc = new SFDBSrc(this.RequestVal('tb1', 'SQLInput'));
      await dbsrc.Retrieve();
      const val = await dbsrc.GenerTables();
      return JSON.stringify(val);
    });

    this.SelectItemsByList('SQLInput.Table.No', '编号列', this.HelpTodo, false, async () => {
      const dbsrc = new SFDBSrc(this.RequestVal('tb1', 'SQLInput'));
      await dbsrc.Retrieve();
      const val = await dbsrc.GenerTableFields(this.RequestVal('tb1', 'SQLInput.Table'));
      return JSON.stringify(val);
    });

    this.SelectItemsByList('SQLInput.Table.No.Name', '名称列', this.HelpTodo, false, async () => {
      const dbsrc = new SFDBSrc(this.RequestVal('tb1', 'SQLInput'));
      await dbsrc.Retrieve();
      const val = await dbsrc.GenerTableFields(this.RequestVal('tb1', 'SQLInput.Table'));
      return JSON.stringify(val);
    });

    this.SelectItemsByList('SQLInput.Table.No.Name.Fields', '引入的字段', this.HelpTodo, true, async () => {
      const dbsrc = new SFDBSrc(this.RequestVal('tb1', 'SQLInput'));
      await dbsrc.Retrieve();
      const val = await dbsrc.GenerTableFields(this.RequestVal('tb1', 'SQLInput.Table'));
      return JSON.stringify(val);
    });

    //其他引入.
    this.AddGroup('Z', '其他引入');
    this.SelectItemsByGroupList('FlowInput', '流程引用(开发中)', this.HelpTodo, false, GloWF.srcFlowSorts, GloWF.srcFlows, false);
    this.SelectItemsByList('FlowInput.Fields', '引入字段', this.InputEmpDesc, true, this.GenerTableFields);

    //@wanglu.
    this.SelectItemsByList('RefSFSearch', '引入查询', this.InputEmpDesc, false, new SFSearchs());
    this.SelectItemsByList('RefSFSearch.Fields', '引入字段', this.InputEmpDesc, true, this.SFSearchTableFields);
    this.SelectItemsByList('RefSFSearch.Fields.No', '编号列', this.InputEmpDesc, true, this.SFSearchTableFields);
    this.SelectItemsByList('RefSFSearch.Fields.No.Name', '名称列', this.InputEmpDesc, true, this.SFSearchTableFields);

    //this.TextBox1_Name('RefSFSearch', '引入查询(开发中)', this.HelpTodo, '单据名称', '字段名称', '请输入引入的单据名称');
  }
  public async SFSearchTableFields() {
    const myFrmID = this.RequestVal('tb1', 'RefSFSearch');
    const ens = new SFColumns();
    await ens.Retrieve('RefPKVal', myFrmID);

    const emps = new Emps();
    for (let index = 0; index < ens.length; index++) {
      const element = ens[index];
      const emp = new Emp();
      emp.No = element.AttrKey;
      emp.Name = element.AttrKey;
      emps.push(emp);
    }
    return emps;
  }

  //获得表的字段.
  public async GenerTableFields() {
    let myFrmID = this.RequestVal('tb1', 'FrmInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmBill');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'RefEntityNoName');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmEntityNoNameInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmEntity');
    if (!myFrmID) {
      myFrmID = this.RequestVal('tb1', 'FlowEntity');
      const flow = new Flow(myFrmID);
      flow.No = myFrmID;
      await flow.RetrieveFromDBSources();
      myFrmID = flow.PTable;
      if (!myFrmID) myFrmID = 'ND' + number.parseDate(flow.PTable) + 'Rpt';
    }

    return GloWF.SQLOfBillFields(myFrmID);
  }
  public async GenerSorts(): Promise<any[]> {
    return [];
  }
  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = this.RequestVal('FrmID');

    if (pageNo === 'InputEmp') {
      const groupID = await GPN_CtrlInput.GenerNewGroupField('人员信息', frmID);
      return await this.InputEmp(frmID, groupID, tb1, tb2);
    }

    //实体选择.
    if (pageNo == 'FrmEntity.SelectField') {
      const fromFrmID = this.RequestVal('tb1', 'FrmEntity');
      const fromFrmName = this.RequestVal('tb2', 'FrmEntity');
      const groupID = await GPN_CtrlInput.GenerNewGroupField(fromFrmName, frmID);
      return await this.FrmBillInput(frmID, fromFrmID, groupID, 'No', 'Name', tb1, tb2);
    }
    if (pageNo == 'SQLInput.Table.No.Name.Fields') {
      const groupID = await GPN_CtrlInput.GenerNewGroupField('SQL模式获取', frmID);
      return await this.SQLInput(frmID, groupID, tb1, tb2);
    }

    if (pageNo == 'FrmBill.Fields') {
      const frmFrmID = this.RequestVal('tb1', 'FrmBill');
      const fromFrmName = this.RequestVal('tb2', 'FrmBill');
      const groupID = await GPN_CtrlInput.GenerNewGroupField(fromFrmName, frmID);
      return await this.FrmBillInput(frmID, frmFrmID, groupID, 'BillNo', 'Title', tb1, tb2);
    }

    if (pageNo == 'FlowEntity.Fields') {
      const frmFrmID = this.RequestVal('tb1', 'FlowEntity');
      const fromFrmName = this.RequestVal('tb2', 'FlowEntity');
      const groupID = await GPN_CtrlInput.GenerNewGroupField(fromFrmName, frmID);
      return await this.FrmBillInput(frmID, frmFrmID, groupID, 'BillNo', 'Title', tb1, tb2);
    }
    if (pageNo == 'RefSFSearch.Fields.No.Name') {
      const searchNo = this.RequestVal('tb1', 'RefSFSearch');
      const searchName = this.RequestVal('tb2', 'RefSFSearch');

      const attrsID = this.RequestVal('tb1', 'RefSFSearch.Fields');
      const attrsName = this.RequestVal('tb1', 'RefSFSearch.Fields');

      const attrNo = this.RequestVal('tb1', 'RefSFSearch.Fields.No');
      const attrName = this.RequestVal('tb1', 'RefSFSearch.Fields.No.Name');

      const groupID = await GPN_CtrlInput.GenerNewGroupField(searchName, searchNo);
      return await this.SearchInput(frmID, searchNo, groupID, attrNo, attrName, attrsID, attrsName);
    }
  }
  public static async GenerNewGroupField(groupName: string, frmID: string): Promise<string> {
    const gf = new GroupField();
    gf.Lab = groupName;
    gf.FrmID = frmID;
    await gf.Insert();
    return gf.OID.toString();
  }
  async SearchInput(frmID: any, searchNo: any, _sortNo: string, _no: string, _name: string, attrIDs: string, _tb2: string) {
    //1. 创建No,Name字段,的自动完成.

    const mapAttr = new MapAttr();
    mapAttr.MyPK = frmID + '_' + searchNo + _no;
    if (await mapAttr.IsExits()) {
      alert('该控件ID已经存在,请检查该实体是否引入过？');
      return;
    }
    mapAttr.KeyOfEn = searchNo + _no;
    mapAttr.Name = _name;
    mapAttr.Tip = '请输入[' + _name + ']编号或名称.';

    mapAttr.Icon = 'icon-notebook';
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.Idx = 0;
    await mapAttr.Insert();
    mapAttr.Idx = -1;
    await mapAttr.DirectUpdate();

    //插入名称.
    const mapAttrName = new MapAttr();
    mapAttrName.MyPK = frmID + '_' + searchNo + _name;

    mapAttrName.KeyOfEn = searchNo + _name;
    mapAttrName.Name = _name + '名称';

    mapAttrName.GroupID = _sortNo;
    mapAttrName.FK_MapData = frmID;
    mapAttrName.Idx = 1;
    mapAttrName.UIIsEnable = 0;
    await mapAttrName.Insert();
    mapAttrName.Idx = -1;
    await mapAttrName.DirectUpdate();

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
      attr.Idx = index + 10;
      if ((await attr.IsExits()) == true) await attr.Update();
      else await attr.Insert();
      fields += attr.KeyOfEn + ',';
    }
    fields = fields.substring(0, fields.length - 1);

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + mapAttr.KeyOfEn + '_TBFullCtrl';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'TBFullCtrl';
    mapExt.ExtType = 'TBFullCtrl';

    //@yln.
    mapExt.DoWay = 'Simple';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Doc = '';
    // mapExt.Tag4 = 'SELECT ' + _no + ' AS No, ' + _name + ' AS Name FROM ' +  _no + ' WHERE ' + _no + ' like ~%@Key%~ OR ' + _name + ' like ~%@Key%~';
    mapExt.Tag5 = 'Self';
    // mapExt.Tag6 = 'SELECT ' + _name + ' AS ' + searchNo + _name + ', ' + fields + ' FROM ' + frmFromMD.PTable + ' WHERE ' + _no + '=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';

    if ((await mapExt.IsExits()) == true) await mapExt.Update();
    else await mapExt.Insert();

    // mapAttrName.MyPK = myPKOfNo;
    // await mapAttrName.RetrieveFromDBSources();
    // mapAttrName.Idx = -10;
    // await mapAttrName.DirectUpdate();

    // mapAttrName.MyPK = myPKOfName;
    // await mapAttrName.RetrieveFromDBSources();
    // mapAttrName.Idx = -10;
    // await mapAttrName.DirectUpdate();

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
      alert('该控件ID已经存在,请检查该实体是否引入过？');
      return;
    }
    mapAttr.KeyOfEn = shortID + _no;
    mapAttr.Name = frmFromMD.Name;
    if (_no == 'No') mapAttr.Tip = '请输入[' + frmFromMD.Name + ']编号或名称.';
    if (_no == 'BillNo') mapAttr.Tip = '请输入[' + frmFromMD.Name + ']单号或标题.';

    mapAttr.Icon = 'icon-notebook';
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.Idx = 0;
    await mapAttr.Insert();
    mapAttr.Idx = -1;
    await mapAttr.DirectUpdate();

    //插入名称.
    const mapAttrName = new MapAttr();
    mapAttrName.MyPK = frmID + '_' + shortID + _name;

    mapAttrName.KeyOfEn = shortID + _name;
    if (_no == 'BillNo') mapAttrName.Name = frmFromMD.Name + '单据标题';
    else mapAttrName.Name = frmFromMD.Name + '名称';

    mapAttrName.GroupID = _sortNo;
    mapAttrName.FK_MapData = frmID;
    mapAttrName.Idx = 1;
    mapAttrName.UIIsEnable = 0;
    await mapAttrName.Insert();
    mapAttrName.Idx = -1;
    await mapAttrName.DirectUpdate();

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
      attr.Idx = index + 10;
      if ((await attr.IsExits()) == true) await attr.Update();
      else await attr.Insert();
      fields += attr.KeyOfEn + ',';
    }
    fields = fields.substring(0, fields.length - 1);

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + mapAttr.KeyOfEn + '_TBFullCtrl';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'TBFullCtrl';
    mapExt.ExtType = 'TBFullCtrl';

    mapExt.DoWay = 'Simple';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Doc = '';
    mapExt.Tag4 = 'SELECT ' + _no + ' AS No, ' + _name + ' AS Name FROM ' + frmFromMD.PTable + ' WHERE ' + _no + ' like ~%@Key%~ OR ' + _name + ' like ~%@Key%~';
    mapExt.Tag5 = 'Self';
    mapExt.Tag6 = 'SELECT ' + _name + ' AS ' + shortID + _name + ', ' + fields + ' FROM ' + frmFromMD.PTable + ' WHERE ' + _no + '=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';

    //查询.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapAttr.KeyOfEn, 'TBFullCtrl', 'SFTable', mapExt.Tag4);

    //填充.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapAttr.KeyOfEn, 'FullDataBody', 'Search', mapExt.Tag6);

    mapExt.Tag4 = '';
    mapExt.Tag6 = '';
    mapExt.SetPara('IsUp', '1');

    if ((await mapExt.IsExits()) == true) await mapExt.Update();
    else await mapExt.Insert();

    // mapAttrName.MyPK = myPKOfNo;
    // await mapAttrName.RetrieveFromDBSources();
    // mapAttrName.Idx = -10;
    // await mapAttrName.DirectUpdate();

    // mapAttrName.MyPK = myPKOfName;
    // await mapAttrName.RetrieveFromDBSources();
    // mapAttrName.Idx = -10;
    // await mapAttrName.DirectUpdate();

    //转向.
    //const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mapAttr.MyPK);
    return new GPNReturnObj(GPNReturnType.Message, '已经引入成功，请测试设置。');
  }
  //构成人员信息.
  async InputEmp(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    const idx = 90;
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    mapAttr.MyPK = frmID + '_' + ctrlID + 'Emp';
    if (await mapAttr.IsExits()) {
      alert('该控件ID已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID + 'Emp';
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.Tip = '请输入人员账号或名称.';
    mapAttr.Idx = 1;
    await mapAttr.Insert();

    //创建电话.
    mapAttr.KeyOfEn = ctrlID + 'Name';
    mapAttr.UIVisible = true;
    mapAttr.UIIsEnable = 0;
    mapAttr.Name = '姓名';
    mapAttr.Idx = 1 + idx;
    await mapAttr.Insert();

    //创建电话.
    mapAttr.KeyOfEn = ctrlID + 'Tel';
    mapAttr.Name = '电话';
    mapAttr.UIIsEnable = 0;
    mapAttr.UIVisible = true;
    mapAttr.Idx = 2 + idx;
    await mapAttr.Insert();

    //创建邮件.
    mapAttr.KeyOfEn = ctrlID + 'Email';
    mapAttr.Name = '邮件';
    mapAttr.UIIsEnable = 0;
    mapAttr.UIVisible = true;
    mapAttr.Idx = 3 + idx;
    await mapAttr.Insert();

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + 'Emp_TBFullCtrl';
    mapExt.RefPKVal = frmID + '_' + ctrlID + 'Emp';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'TBFullCtrl';
    mapExt.ExtType = 'TBFullCtrl';

    mapExt.DoWay = 'Simple';
    mapExt.AttrOfOper = ctrlID + 'Emp';
    mapExt.Doc = '';
    mapExt.Tag4 = 'SELECT No,Name From Port_Emp WHERE No like ~%@Key%~ OR Name like ~%@Key%~';
    mapExt.Tag5 = 'Self';
    mapExt.Tag6 = 'SELECT No,Name, Name as ' + ctrlID + 'Name, Email as ' + ctrlID + 'Email,Tel as ' + ctrlID + 'Tel From Port_Emp WHERE No=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    await mapExt.Insert();

    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', frmID + '_' + ctrlID + 'Emp');
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  async SQLInput(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    const idx = 90;
    const mapAttr = new MapAttr();
    mapAttr.MyPK = frmID + '_' + 'DictNo';
    if ((await mapAttr.IsExits()) == true) {
      alert('该控件ID=[' + mapAttr.MyPK + ']已经存在');
      return;
    }
    mapAttr.KeyOfEn = 'DictNo';
    mapAttr.Name = '编号';
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.Idx = 0 + idx;
    mapAttr.Tip = '请输入编号或名称.';
    mapAttr.Icon = 'icon-notebook';
    await mapAttr.Insert();

    //创建名称
    mapAttr.KeyOfEn = 'DictName';
    mapAttr.Name = '名称';
    mapAttr.Idx = 1 + idx;
    await mapAttr.Insert();

    const table = this.RequestVal('tb1', 'SQLInput.Table');
    const no = this.RequestVal('tb1', 'SQLInput.Table.No');
    const name = this.RequestVal('tb1', 'SQLInput.Table.No.Name');

    const fields = tb1.split(',');
    const labs = tb2.split(',');

    const dbsrc = new SFDBSrc(this.RequestVal('tb1', 'SQLInput'));
    await dbsrc.Retrieve();
    const cols = await dbsrc.GenerTableFields(this.RequestVal('tb1', 'SQLInput.Table'));

    let sqlField = 'SELECT ' + name + ' as DictName';
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      let lab = labs[index]; //名称.
      if (lab == '') lab = field;

      const myMapAttr = new MapAttr();
      myMapAttr.FK_MapData = frmID;
      myMapAttr.KeyOfEn = 'Dict' + field;
      myMapAttr.Name = lab;

      //修改变量然后插入进去.
      myMapAttr.FK_MapData = frmID;
      myMapAttr.GroupID = _sortNo;
      myMapAttr.MyPK = myMapAttr.FK_MapData + '_' + myMapAttr.KeyOfEn;
      myMapAttr.Idx = 1 + idx + index;

      //  debugger;
      //获得列的类型.
      for (let index1 = 0; index1 < cols.length; index1++) {
        const ff = cols[index1];
        if (ff.FType.includes('int') == true && ff.No == field) {
          myMapAttr.MyDataType = DataType.AppInt;
        }

        if (ff.FType.includes('float') == true && ff.No == field) {
          myMapAttr.MyDataType = DataType.AppFloat;
        }

        if (myMapAttr.MyDataType == DataType.AppString && ff.FLen < 4000) {
          myMapAttr.MaxLen = ff.FLen;
        }
      }

      await myMapAttr.Save();
      sqlField += ',' + field + ' AS ' + myMapAttr.KeyOfEn;
    }

    sqlField += ' FROM ' + table + ' WHERE ' + no + '=~@Key~ ';

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + 'DictNo_TBFullCtrl';
    if ((await mapExt.IsExits()) == true) {
      await mapExt.Delete();
    }
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'TBFullCtrl';
    mapExt.ExtType = 'TBFullCtrl';

    mapExt.DoWay = 'Simple';
    mapExt.AttrOfOper = 'DictNo';
    mapExt.Doc = '';
    mapExt.Tag4 = 'SELECT ' + no + ' as No,' + name + ' as Name FROM ' + table + ' WHERE (' + no + ' like ~%@Key%~ OR ' + name + ' like ~%@Key%~)';
    mapExt.Tag5 = 'Self';
    mapExt.Tag6 = sqlField; // 'SELECT No,Name, Name as ' + ctrlID + 'Name, Email as ' + ctrlID + 'Email,Tel as ' + ctrlID + 'Tel From Port_Emp WHERE No=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = this.RequestVal('tb1', 'SQLInput');

    mapExt.SetPara('FromDBSrc', this.RequestVal('tb1', 'SQLInput'));
    mapExt.SetPara('FromTable', table);
    mapExt.SetPara('FromTable_No', no);
    mapExt.SetPara('FromTable_Name', name);
    await mapExt.Insert();
    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', frmID + '_' + 'DictNo');
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
