import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { MapExt } from './MapExt';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { DataType } from '/@/bp/en/DataType';
import { GroupFields } from './GroupField';
import { GloComm } from '../../Comm/GloComm';
import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
import { GloWF } from '../GloWF';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';

export class GPN_ComponentMapExt extends PageBaseGroupNew {
  constructor() {
    super('GPN_ComponentMapExt');
    this.PageTitle = '新建扩展自定义组件';
  }
  public Init() {
    this.AddGroup('B', '组合字段'); //增加分组.
    this.TextBox2_NameNo('DTFromToDD', '日期从/到/天数(整数)', this.DTFromToDesc, '', '字段ID', '字段名称', '请假日期');
    this.TextBox2_NameNo('DTFromToHH', '日期从/到/天数(小时)', this.DTFromToDesc, '', '字段ID', '字段名称', '请假日期');

    this.TextBox2_NameNo('XiaoJi', '小计=单价*数量', this.XiaoJiDesc, '', '字段ID', '字段名称', '名称');

    this.TextBox2_NameNo('InputEmp', '人员,名称,电话,邮件', this.InputEmpDesc, '', '字段ID', '字段名称', '');

    //  this.SelectItemsByGroupList('DictInput.SelectDict', '选择实体', this.InputEmpDesc, '', '字段ID', '字段名称', '');
    this.AddGroup('Z', '实验中'); //增加分组.
    this.TextBox2_NameNo('JLDeptEmp', '部门,人员级联', this.HelpTodo, '', '字段ID', '字段名称', '');
    this.TextBox2_NameNo('City', '级联-省份/城市/区县', this.CityDesc, 'Str', '字段前缀', '字段名称', '籍贯');

    // -- 内置.
    this.AddGroup('C', '内置Pop窗体'); //增加分组.
    this.TextBox2_NameNo('Pop_TreeEns_Dept2Emp', '左树(部门)右表-人员选择器', this.HelpUn, 'Str', '字段ID', '字段名称', '选择人员');
    this.AddIcon('icon-user', 'Pop_TreeEns_Dept2Emp');

    this.TextBox2_NameNo('Pop_TreeEns_Station2Emp', '左树(岗位)右表-人员选择器', this.HelpUn, 'Str', '字段ID', '字段名称', '选择人员');
    this.AddIcon('icon-user', 'Pop_TreeEns_Station2Emp');

    this.TextBox2_NameNo('Pop_TreeEns_DeptStation2Emp', '左树(部门+岗位)右表-人员选择器', this.HelpUn, 'Str', '字段ID', '字段名称', '选择人员');
    this.AddIcon('icon-user', 'Pop_TreeEns_DeptStation2Emp');

    this.TextBox2_NameNo('Pop_Group_Stas', '选择岗位', this.HelpUn, 'Str', '字段ID', '字段名称', '选择岗位');
    this.AddIcon('icon-people', 'Pop_Group_Stas');

    this.TextBox2_NameNo('Pop_Tree_Depts', '选择部门', this.HelpUn, 'Str', '字段ID', '字段名称', '选择部门');
    this.AddIcon('icon-people', 'Pop_Tree_Depts');

    this.TextBox2_NameNo('Pop_Table_Emps', '表格选择人', this.HelpUn, 'PopTable', '字段ID', '字段名称', '选择人员');
    this.AddIcon('icon-drop', 'Pop_Table_Emps');

    this.AddGroup('D', '题库控件'); //增加分组.
    this.TextBox3_NameNoNote('AskFrmDanXuan', '单选题', this.HelpUn, 'XB', '字段ID', '问题标题', '选项值(比如:良好,优秀,一般)', '您的性别');
    this.TextBox3_NameNoNote('AskFrmDuoXuan', '多选题', this.HelpUn, 'XB', '字段ID', '问题标题', '选项值(比如:良好,优秀,一般)', '您的性别');
  }

  public async GenerSorts(): Promise<any[]> {
    const frmID = this.RequestVal('FrmID');
    const gfs = new GroupFields();
    await gfs.Retrieve('FrmID', frmID, 'Idx');
    return gfs.filter((gf) => gf.CtrlType === '' || gf.CtrlType === 'Attr').map((gf) => ({ No: gf.PKVal, Name: gf.Lab }));
  }

  //选择表:
  public GenerDBSrcTabls() {
    let myFrmID = this.RequestVal('tb1', 'FrmInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmBillInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'RefEntityNoName');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmEntityNoNameInput');

    // const sql = `SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='${myFrmID}'
    // AND KeyOfEn NOT IN ('OID','FID','AtPara','DeptNo','DeptName','Rec','OrgNo','BillState','EntityState',
    // 'No','Name','BillNo','Title','PFrmID','Starter','PWorkID','StarterName','RDT') AND UIVisible=1 `;
    return GloWF.SQLOfGenerDBSrcTabls(myFrmID);
  }

  //获得表的字段.
  public GenerTableFields() {
    let myFrmID = this.RequestVal('tb1', 'FrmInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmBillInput');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'RefEntityNoName');
    if (!myFrmID) myFrmID = this.RequestVal('tb1', 'FrmEntityNoNameInput');

    // const sql = `SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='${myFrmID}'
    // AND KeyOfEn NOT IN ('OID','FID','AtPara','DeptNo','DeptName','Rec','OrgNo','BillState','EntityState',
    // 'No','Name','BillNo','Title','PFrmID','Starter','PWorkID','StarterName','RDT') AND UIVisible=1 `;
    return GloWF.SQLOfGenerDBSrcTabls(myFrmID);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = this.RequestVal('FrmID');
    if (pageNo == 'SQLInput.Table.No.Name.Fields') {
      return await this.SQLInput(frmID, _sortNo, tb1, tb2);
    }
    if (pageNo == 'DictInput.SelectField') {
      const fromFrmID = this.RequestVal('tb1', 'DictInput');
      return await GPN_ComponentMapExt.DictInput(frmID, fromFrmID, _sortNo, tb1, tb2);
    }

    //单选.
    if (pageNo === 'AskFrmDanXuan') {
      return await this.AskFrmDanXuan(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'InputEmp') {
      return await this.InputEmp(frmID, _sortNo, tb1, tb2);
    }
    if (pageNo === 'JLDeptEmp') {
      return await this.JLDeptEmp(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'XiaoJi') {
      return await this.XiaoJi(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'DTFromToDD') {
      return await this.DTFromToDD(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'DTFromToHH') {
      return await this.DTFromToHH(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'Pop_TreeEns_Station2Emp') {
      return await this.Pop_TreeEns_Station2Emp(frmID, _sortNo, tb1, tb2);
    }
    if (pageNo === 'Pop_TreeEns_Dept2Emp') {
      return await this.Pop_TreeEns_Dept2Emp(frmID, _sortNo, tb1, tb2);
    }
    if (pageNo === 'Pop_TreeEns_DeptStation2Emp') {
      return await this.Pop_TreeEns_DeptStation2Emp(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'Pop_Table_Emps') {
      return await this.Pop_Table_Emps(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'Pop_Group_Stas') {
      return await this.Pop_Group_Stas(frmID, _sortNo, tb1, tb2);
    }

    if (pageNo === 'Pop_Tree_Depts') {
      return await this.Pop_Tree_Depts(frmID, _sortNo, tb1, tb2);
    }
  }

  //单选.
  async AskFrmDanXuan(frmID: any, _sortNo: string, tb1: string, tb2: string, tb3: string) {
    //新建字段-字段附件.
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    const mypk = frmID + '_' + ctrlID;
    mapAttr.MyPK = mypk;
    if (await mapAttr.IsExits()) {
      alert('改控件ID已经存在');
      return;
    }

    mapAttr.KeyOfEn = ctrlID;
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    await mapAttr.Insert();

    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mypk);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  async Pop_Tree_Depts(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    //新建字段-字段附件.
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    const mypk = frmID + '_' + ctrlID;
    mapAttr.MyPK = mypk;
    if (await mapAttr.IsExits()) {
      alert('改控件ID已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID;
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    await mapAttr.Insert();
    mapAttr.setPKVal(mypk + 'T');
    //插入一条对应的T字段
    if ((await mapAttr.RetrieveFromDBSources()) == 0) {
      mapAttr.MyPK = mapAttr.MyPK + 'T';
      mapAttr.KeyOfEn = mapAttr.KeyOfEn + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      mapAttr.UIVisible = false;
      mapAttr.UIIsEnable = false;
      await mapAttr.Insert();
    }

    // 设置MapExt. PopTreeEns 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';

    mapExt.DoWay = 'PopBranches';
    mapExt.AttrOfOper = ctrlID;
    mapExt.Doc = '0';
    mapExt.Tag = '';
    mapExt.Tag1 = '';
    mapExt.Tag2 = 'SELECT No,Name, ParentNo FROM Port_Dept';
    mapExt.H = '500';
    mapExt.W = '600';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.AtPara = '@ShowModel=1@OpenPopType=1@PopSelectType=1@SearchTip=@BtnLab=查找@Title=';
    mapExt.ShowModel = '1';
    mapExt.PopSelectType = '1';
    mapExt.OpenPopType = '1';
    mapExt.BtnLab = '查找';
    //查询.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.TreeDB', 'SFTable', mapExt.Tag2);
    mapExt.Tag2 = '';
    mapExt.SetPara('IsUpdate', 1);
    await mapExt.Insert();
    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mypk);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  async Pop_Group_Stas(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    //新建字段-字段附件.
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    const mypk = frmID + '_' + ctrlID;
    mapAttr.MyPK = mypk;
    if (await mapAttr.IsExits()) {
      alert('改控件ID已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID;
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    await mapAttr.Insert();
    mapAttr.setPKVal(mypk + 'T');
    //插入一条对应的T字段
    if ((await mapAttr.RetrieveFromDBSources()) == 0) {
      mapAttr.MyPK = mapAttr.MyPK + 'T';
      mapAttr.KeyOfEn = mapAttr.KeyOfEn + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      mapAttr.UIVisible = false;
      mapAttr.UIIsEnable = false;
      await mapAttr.Insert();
    }

    // 设置MapExt. PopTreeEns 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';

    mapExt.DoWay = 'PopGroupList';
    mapExt.AttrOfOper = ctrlID;
    mapExt.Doc = '0';
    mapExt.Tag = '';
    mapExt.Tag1 = 'SELECT No,Name FROM Port_StationType ORDER BY Idx';
    mapExt.Tag2 = 'SELECT No,Name,FK_StationType FROM Port_Station ORDER BY Idx';
    mapExt.Tag3 = 'SELECT No,Name FROM Port_Emp WHERE FK_Dept=~@Key~';
    mapExt.H = '500';
    mapExt.W = '600';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.AtPara = '@BtnLab=查找@OpenPopType=1@PopSelectType=1@IsEnter=0@ShowModel=1@Title=@ShowCol=3';
    mapExt.ShowModel = '1';
    mapExt.PopSelectType = '1';
    mapExt.OpenPopType = '1';
    mapExt.BtnLab = '查找';

    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Group', 'SFTable', mapExt.Tag1);
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Dtl', 'SFTable', mapExt.Tag2);
    mapExt.Tag1 = '';
    mapExt.Tag2 = '';
    mapExt.Tag3 = '';
    mapExt.SetPara('IsUpdate', 1);
    await mapExt.Insert();
    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mypk);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  async Pop_Table_Emps(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    //新建字段-字段附件.
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    const mypk = frmID + '_' + ctrlID;
    mapAttr.MyPK = mypk;
    if (await mapAttr.IsExits()) {
      alert('改控件ID[' + ctrlID + ']已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID;
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.UIContralType = 0;
    mapAttr.Icon = 'icon-people';
    await mapAttr.Insert();
    mapAttr.setPKVal(mypk + 'T');
    //插入一条对应的T字段
    if ((await mapAttr.RetrieveFromDBSources()) == 0) {
      mapAttr.MyPK = mapAttr.MyPK + 'T';
      mapAttr.KeyOfEn = mapAttr.KeyOfEn + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      mapAttr.UIVisible = false;
      mapAttr.UIIsEnable = false;
      await mapAttr.Insert();
    }

    // 设置MapExt. PopTreeEns 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';

    mapExt.DoWay = 'PopTable';
    mapExt.AttrOfOper = ctrlID;
    mapExt.Doc = '0';
    mapExt.Tag = 'No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件';
    mapExt.Tag1 = '$Para=FK_Dept#Label=部门#ListSQL=Select No,Name FROM Port_Dept';
    mapExt.Tag2 = `SELECT No,Name,Email,Tel FROM Port_Emp WHERE (Name LIKE '%@Key%' OR No LIKE '%@Key%' or Email LIKE  '%@Key%' or Tel like  '%@Key%' )`;
    mapExt.Tag3 = `SELECT COUNT(no) FROM Port_Emp WHERE (Name LIKE '%@Key%' OR No LIKE '%@Key%' or Email LIKE  '%@Key%' or Tel like  '%@Key%' )`;
    mapExt.H = '500';
    mapExt.W = '900';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.AtPara = '@ShowModel=0@OpenPopType=1@PopSelectType=1@SearchTip=请输入人员ID,名称@BtnLab=查找@Title=选择人员';
    mapExt.ShowModel = '1';
    mapExt.PopSelectType = '1';
    mapExt.OpenPopType = '1';
    mapExt.BtnLab = '查找';
    await mapExt.Insert();

    //设置mapExt的属性.
    mapAttr.SetPara('ExtEnName', 'TS.MapExt.PopTableSearch');
    mapAttr.SetPara('ExtEnPKVal', mapExt.MyPK);
    mapAttr.SetPara('ExtType', 'Pop');

    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mypk);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  async Pop_TreeEns_Station2Emp(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    //新建字段-字段附件.
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    const mypk = frmID + '_' + ctrlID;
    mapAttr.MyPK = mypk;
    if (await mapAttr.IsExits()) {
      alert('改控件ID已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID;
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.UIContralType = 0;
    mapAttr.Icon = 'icon-people';
    await mapAttr.Insert();
    mapAttr.setPKVal(mypk + 'T');
    //插入一条对应的T字段
    if ((await mapAttr.RetrieveFromDBSources()) == 0) {
      mapAttr.MyPK = mapAttr.MyPK + 'T';
      mapAttr.KeyOfEn = mapAttr.KeyOfEn + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      mapAttr.UIVisible = false;
      mapAttr.UIIsEnable = false;
      await mapAttr.Insert();
    }

    // 设置MapExt. PopTreeEns 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';

    mapExt.DoWay = 'PopBranchesAndLeaf';
    mapExt.AttrOfOper = ctrlID;
    mapExt.Doc = '0';
    mapExt.Tag = 'No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件';
    mapExt.Tag1 = 'SELECT No,Name FROM Port_Emp WHERE No like ~%@Key%~ OR Name like ~%@Key%~';

    const treeSQL = `
    SELECT   No, Name, '0' as ParentNo FROM Port_StationType
       UNION
    SELECT  No,Name, FK_StationType as  ParentNo FROM Port_Station 
    `;
    mapExt.Tag2 = treeSQL;
    const dtlSQL = `
    SELECT A.No,A.Name FROM Port_Emp A, Port_DeptEmpStation B  WHERE A.No=b.FK_Emp and B.FK_Station='@Key'
    `;
    mapExt.Tag3 = dtlSQL;

    mapExt.H = '500';
    mapExt.W = '600';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.AtPara = '@ShowModel=0@OpenPopType=1@PopSelectType=1@SearchTip=请输入人员ID,名称@BtnLab=查找@Title=选择人员';
    mapExt.ShowModel = '1';
    mapExt.PopSelectType = '1';
    mapExt.OpenPopType = '1';
    mapExt.BtnLab = '查找';
   
    //设置mapExt的属性.
    mapAttr.SetPara('ExtEnName', 'TS.MapExt.PopTreeEns');
    mapAttr.SetPara('ExtEnPKVal', mapExt.MyPK);
    mapAttr.SetPara('ExtType', 'Pop');

    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.TreeSearch', 'SFTable', mapExt.Tag1);
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Tree', 'SFTable', mapExt.Tag2);
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Dtl', 'SFTable', mapExt.Tag3);
    mapExt.Tag1 = '';
    mapExt.Tag2 = '';
    mapExt.Tag3 = '';
    mapExt.SetPara('IsUpdate', 1);
    await mapExt.Insert();

    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mypk);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  async Pop_TreeEns_DeptStation2Emp(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    //新建字段-字段附件.
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    const mypk = frmID + '_' + ctrlID;
    mapAttr.MyPK = mypk;
    if (await mapAttr.IsExits()) {
      alert('改控件ID已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID;
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.UIContralType = 0;
    mapAttr.Icon = 'icon-people';
    await mapAttr.Insert();
    mapAttr.setPKVal(mypk + 'T');
    //插入一条对应的T字段
    if ((await mapAttr.RetrieveFromDBSources()) == 0) {
      mapAttr.MyPK = mapAttr.MyPK + 'T';
      mapAttr.KeyOfEn = mapAttr.KeyOfEn + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      mapAttr.UIVisible = false;
      mapAttr.UIIsEnable = false;
      await mapAttr.Insert();
    }

    // 设置MapExt. PopTreeEns 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';

    mapExt.DoWay = 'PopBranchesAndLeaf';
    mapExt.AttrOfOper = ctrlID;
    mapExt.Doc = '0';
    mapExt.Tag = 'No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件';
    mapExt.Tag1 = 'SELECT No,Name FROM Port_Emp WHERE No like ~%@Key%~ OR Name like ~%@Key%~';

    const treeSQL = `
    SELECT No,Name,ParentNo from Port_Dept
     UNION 
    SELECT 'Station' No,'岗位' Name, '0' as ParentNo FROM Port_Emp WHERE No='admin'
     UNION
    SELECT   No, Name, 'Station' as ParentNo FROM Port_StationType
   UNION
     SELECT  No,Name, FK_StationType as  ParentNo FROM Port_Station 
    `;
    mapExt.Tag2 = treeSQL;

    const dtlSQL = `
    SELECT No,Name FROM Port_Emp WHERE FK_Dept='@Key' 
      UNION
    SELECT A.No,A.Name FROM Port_Emp A, Port_DeptEmpStation B  WHERE A.No=b.FK_Emp and B.FK_Station='@Key'
    `;
    mapExt.Tag3 = dtlSQL;

    mapExt.H = '500';
    mapExt.W = '600';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.AtPara = '@ShowModel=0@OpenPopType=1@PopSelectType=1@SearchTip=请输入人员ID,名称@BtnLab=查找@Title=选择人员';
    mapExt.ShowModel = '1';
    mapExt.PopSelectType = '1';
    mapExt.OpenPopType = '1';
    mapExt.BtnLab = '查找';
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.TreeSearch', 'SFTable', mapExt.Tag1);
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Tree', 'SFTable', mapExt.Tag2);
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Dtl', 'SFTable', mapExt.Tag3);
    mapExt.Tag1 = '';
    mapExt.Tag2 = '';
    mapExt.Tag3 = '';
    mapExt.SetPara('IsUpdate', 1);
    await mapExt.Insert();
    //设置mapExt的属性.
    mapAttr.SetPara('ExtEnName', 'TS.MapExt.PopTreeEns');
    mapAttr.SetPara('ExtEnPKVal', mapExt.MyPK);
    mapAttr.SetPara('ExtType', 'Pop');
    await mapExt.Update();

    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', mypk);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  async Pop_TreeEns_Dept2Emp(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    //新建字段-字段附件.

    const ctrlID = tb2;
    const mypk = frmID + '_' + ctrlID;

    // 设置MapExt. PopTreeEns 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + '_Pop';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'Pop';
    mapExt.ExtType = 'Pop';
    mapExt.DoWay = 'PopBranchesAndLeaf';
    mapExt.AttrOfOper = ctrlID;
    mapExt.Doc = '0';
    mapExt.Tag = 'No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件';
    const Tag1 = 'SELECT No,Name FROM Port_Emp WHERE No like ~%@Key%~ OR Name like ~%@Key%~';
    const Tag2 = 'SELECT No,Name, ParentNo FROM Port_Dept';
    const Tag3 = 'SELECT No,Name FROM Port_Emp WHERE FK_Dept=~@Key~';
    mapExt.H = '500';
    mapExt.W = '600';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.AtPara = '@ShowModel=0@OpenPopType=1@PopSelectType=1@SearchTip=请输入人员ID,名称@BtnLab=查找@Title=选择人员';
    mapExt.ShowModel = '1';
    mapExt.PopSelectType = '1';
    mapExt.OpenPopType = '1';
    mapExt.BtnLab = '查找';
    mapExt.Tag1 = '';
    mapExt.Tag2 = '';
    mapExt.Tag3 = '';
    mapExt.SetPara('IsUpdate', 1);
    await mapExt.Delete();
    await mapExt.Insert();

    const mapAttr = new MapAttr();
    mapAttr.MyPK = mypk;
    if (await mapAttr.IsExits()) {
      alert('此控件ID已经存在,请重新输入');
      return;
    }
    mapAttr.KeyOfEn = ctrlID;
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.UIContralType = 0;
    mapAttr.Icon = 'icon-people';
    //设置mapExt的属性.
    mapAttr.SetPara('ExtEnName', 'TS.MapExt.PopTreeEns');
    mapAttr.SetPara('ExtEnPKVal', mapExt.MyPK);
    mapAttr.SetPara('ExtType', 'Pop');
    await mapAttr.Insert();
    mapAttr.setPKVal(mypk + 'T');
    //插入一条对应的T字段
    if ((await mapAttr.RetrieveFromDBSources()) == 0) {
      mapAttr.MyPK = mapAttr.MyPK + 'T';
      mapAttr.KeyOfEn = mapAttr.KeyOfEn + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      mapAttr.UIVisible = false;
      mapAttr.UIIsEnable = false;
      mapAttr.SetPara('EnName', 'TS.FrmUI.MapAttrString');
      await mapAttr.Insert();
    }
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.TreeSearch', 'SFTable', Tag1);
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Tree', 'SFTable', Tag2);
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + ctrlID, 'Pop.Dtl', 'SFTable', Tag3);
    //转向.
    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.FrmUI.MapAttrString', mypk));
  }
  async XiaoJi(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    const idx = 90;
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    mapAttr.MyPK = frmID + '_' + ctrlID;
    mapAttr.KeyOfEn = ctrlID;
    if (await mapAttr.IsExits()) {
      alert('该控件ID[' + ctrlID + ']已经存在');
      return;
    }
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.MyDataType = DataType.AppString;
    mapAttr.Idx = 0 + idx;
    await mapAttr.Insert();

    mapAttr.KeyOfEn = ctrlID + 'Unit';
    mapAttr.Name = '单价';
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.MyDataType = DataType.AppMoney;
    mapAttr.Idx = 1 + idx;
    await mapAttr.Insert();

    //数量.
    mapAttr.KeyOfEn = ctrlID + 'Num';
    mapAttr.Name = '数量';
    mapAttr.Idx = 2 + idx;
    mapAttr.MyDataType = DataType.AppInt;
    await mapAttr.Insert();

    //数量.
    mapAttr.KeyOfEn = ctrlID + 'Sum';
    mapAttr.Name = '小计';
    mapAttr.Idx = 3 + idx;
    mapAttr.MyDataType = DataType.AppMoney;
    await mapAttr.Insert();

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + 'Sum_AutoFull';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'AutoFull';
    mapExt.ExtType = 'AutoFull';
    mapExt.DoWay = '1';
    mapExt.AttrOfOper = ctrlID + 'Sum';
    mapExt.Doc = '';
    mapExt.Tag = '@' + ctrlID + 'Unit*@' + ctrlID + 'Num';
    mapExt.Tag1 = '1';
    await mapExt.Insert();
  }
  SQLInput(_frmID: any, _sortNo: string, _tb1: string, _tb2: string) {
    throw new Error('Method not implemented.');
  }
  static DictInput(_frmID: any, _fromFrmID: any, _sortNo: string, _tb1: string, _tb2: string) {
    throw new Error('Method not implemented.');
  }
  //构成人员信息.
  async InputEmp(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    // const gf = new GroupFields();
    // gf.Lab = '人员信息';
    // gf.FrmID = frmID;
    // await gf.Insert();
    const idx = 90;
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    mapAttr.MyPK = frmID + '_' + ctrlID + 'Emp';
    if (await mapAttr.IsExits()) {
      alert('改控件ID[' + ctrlID + ']已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID + 'Emp';
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.Idx = 0 + idx;
    await mapAttr.Insert();

    //创建电话.
    mapAttr.KeyOfEn = ctrlID + 'Name';
    mapAttr.Name = '姓名';
    mapAttr.Idx = 1 + idx;
    await mapAttr.Insert();

    //创建电话.
    mapAttr.KeyOfEn = ctrlID + 'Tel';
    mapAttr.Name = '电话';
    mapAttr.Idx = 2 + idx;
    await mapAttr.Insert();

    //创建邮件.
    mapAttr.KeyOfEn = ctrlID + 'Email';
    mapAttr.Name = '邮件';
    mapAttr.Idx = 3 + idx;
    await mapAttr.Insert();

    // 设置MapExt. TBFullCtrl 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + 'Emp_TBFullCtrl';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'TBFullCtrl';
    mapExt.ExtType = 'TBFullCtrl';
    mapExt.DoWay = 'Simple';
    mapExt.AttrOfOper = ctrlID + 'Emp';
    mapExt.Doc = '';
    const Tag4 = 'SELECT No,Name From Port_Emp WHERE No like ~%@Key%~ OR Name like ~%@Key%~';
    mapExt.Tag5 = 'Self';
    const Tag6 = 'SELECT  Name as ' + ctrlID + 'Name, Email as ' + ctrlID + 'Email,Tel as ' + ctrlID + 'Tel From Port_Emp WHERE No=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    mapExt.Tag4 = '';
    mapExt.Tag6 = '';
    mapExt.SetPara('IsUpdate', 1);
    await mapExt.Delete();
    await mapExt.Insert();
    //查询.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapExt.AttrOfOper, 'TBFullCtrl', 'SFTable', Tag4);

    //填充.
    await GloGenerDBSrc.InitGenerDBSrc_BySQL('Frm', frmID + '_' + mapExt.AttrOfOper, 'FullDataBody', 'Search', Tag6);
    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', frmID + '_' + mapExt.AttrOfOper);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  async JLDeptEmp(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    const mapAttr = new MapAttr();
    const ctrlID = tb2;
    mapAttr.MyPK = frmID + '_' + ctrlID + 'Dept';
    if (await mapAttr.IsExits()) {
      alert('改控件ID已经存在');
      return;
    }
    mapAttr.KeyOfEn = ctrlID + 'Dept';
    mapAttr.Name = tb1;
    mapAttr.GroupID = _sortNo;
    mapAttr.FK_MapData = frmID;
    mapAttr.MyDataType = 1;
    mapAttr.UIContralType = UIContralType.DDL;
    mapAttr.LGType = FieldTypeS.Normal;
    mapAttr.UIBindKey = 'Blank';
    await mapAttr.Insert();

    mapAttr.KeyOfEn = ctrlID + 'DeptT';
    mapAttr.Name = tb1 + 'T';
    mapAttr.UIContralType = UIContralType.TB;
    mapAttr.UIBindKey = '';
    mapAttr.UIVisible = 0;
    await mapAttr.Insert();

    //创建人员.
    mapAttr.KeyOfEn = ctrlID + 'Emp';
    mapAttr.Name = '人员';
    mapAttr.UIVisible = 1;
    mapAttr.UIContralType = UIContralType.DDL;
    mapAttr.UIBindKey = 'Blank';
    await mapAttr.Insert();

    mapAttr.KeyOfEn = ctrlID + 'EmpT';
    mapAttr.Name = '人员T';
    mapAttr.UIContralType = UIContralType.TB;
    mapAttr.UIBindKey = '';
    mapAttr.UIVisible = 0;
    await mapAttr.Insert();

    // 设置MapExt. AutoFullDLL 模式.
    const mapExt = new MapExt();
    mapExt.MyPK = frmID + '_' + ctrlID + 'Dept_AutoFullDLL';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'AutoFullDLL';
    mapExt.ExtType = 'AutoFullDLL';
    mapExt.DoWay = '1';
    mapExt.AttrOfOper = ctrlID + 'Dept';
    mapExt.Doc = 'SELECT No,Name From Port_Dept';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    await mapExt.Insert();

    //ActiveDDL
    mapExt.MyPK = frmID + '_' + ctrlID + 'Dept_ActiveDDL';
    mapExt.FK_MapData = frmID;
    mapExt.ExtModel = 'ActiveDDL';
    mapExt.ExtType = 'ActiveDDL';

    mapExt.DoWay = '1';
    mapExt.AttrOfOper = ctrlID + 'Dept';
    mapExt.AttrsOfActive = ctrlID + 'Emp';
    mapExt.Doc = 'SELECT No,Name From Port_Emp WHERE FK_Dept=~@Key~';
    mapExt.DBType = '0';
    mapExt.FK_DBSrc = 'local';
    await mapExt.Insert();

    //转向.
    const url = GloComm.UrlEn('TS.FrmUI.MapAttrSFSQL', frmID + '_' + ctrlID + 'Dept');
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  async DTFromToDD(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    const mapAttr = new MapAttr();
    mapAttr.FK_MapData = frmID;
    mapAttr.KeyOfEn = tb2 + 'From';
    mapAttr.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn;
    mapAttr.GroupID = _sortNo;
    mapAttr.Idx = 99;

    if (await mapAttr.IsExits()) {
      alert('改控件ID[' + tb2 + ']已经存在.');
      return;
    }
    mapAttr.Name = tb1 + '从';
    mapAttr.MyDataType = DataType.AppDate;
    await mapAttr.Insert();

    //设置扩展: 不能输入历史日期.
    const mapExt = new MapExt();
    mapExt.MyPK = mapAttr.MyPK + '_DateFieldInputRole';
    mapExt.FK_MapData = mapAttr.FK_MapData;
    mapExt.DoWay = 1;
    mapExt.ExtType = 'DateFieldInputRole';
    mapExt.ExtModel = 'DateFieldInputRole';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    await mapExt.Insert();

    //设置扩展，不能输入历史日期.
    mapAttr.KeyOfEn = tb2 + 'To';
    mapAttr.Name = '到';
    mapAttr.MyDataType = DataType.AppDate;
    mapAttr.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn;
    mapAttr.Idx = 100;
    await mapAttr.Insert();

    //设置扩展: 大于等于日期从.
    mapExt.MyPK = mapAttr.MyPK + '_DateFieldInputRole';
    mapExt.FK_MapData = mapAttr.FK_MapData;
    mapExt.DoWay = 2;
    mapExt.Tag = 'GTE';
    mapExt.ExtType = 'DateFieldInputRole';
    mapExt.ExtModel = 'DateFieldInputRole';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Tag1 = tb2 + 'From';
    await mapExt.Insert();

    mapAttr.KeyOfEn = tb2 + 'Days';
    mapAttr.Name = '天数';
    mapAttr.MyDataType = DataType.AppInt;
    mapAttr.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn;
    mapAttr.Idx = 101;
    mapAttr.UIIsEnable = false;
    mapAttr.UIWidth = 50;
    await mapAttr.Insert();

    //设置扩展: 两个日期差.
    mapExt.MyPK = mapAttr.MyPK + '_ReqDays';
    mapExt.FK_MapData = mapAttr.FK_MapData;
    mapExt.DoWay = 1;
    mapExt.Tag = '0';
    mapExt.ExtType = 'ReqDays';
    mapExt.ExtModel = 'ReqDays';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Doc = tb2 + 'From';
    mapExt.DocT = tb1 + '日期从';
    mapExt.Tag1 = tb2 + 'To';
    mapExt.Tag1T = tb1 + '到';
    mapExt.Tag2 = 'ReqDays';

    await mapExt.Insert();
    return new GPNReturnObj(GPNReturnType.Message, '创建成功，请点击刷新按钮。');
  }

  async DTFromToHH(frmID: any, _sortNo: string, tb1: string, tb2: string) {
    const mapAttr = new MapAttr();
    mapAttr.FK_MapData = frmID;
    mapAttr.KeyOfEn = tb2 + 'From';
    mapAttr.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn;
    mapAttr.GroupID = _sortNo;
    mapAttr.Idx = 99;

    if (await mapAttr.IsExits()) {
      alert('改控件ID[' + tb2 + ']已经存在.');
      return;
    }
    mapAttr.Name = tb1 + '从';
    mapAttr.MyDataType = DataType.AppDateTime;
    await mapAttr.Insert();

    //设置扩展: 不能输入历史日期.
    const mapExt = new MapExt();
    mapExt.MyPK = mapAttr.MyPK + '_DateFieldInputRole';
    mapExt.FK_MapData = mapAttr.FK_MapData;
    mapExt.DoWay = 1;
    mapExt.Tag = '0';
    mapExt.ExtType = 'DateFieldInputRole';
    mapExt.ExtModel = 'DateFieldInputRole';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    await mapExt.Insert();

    //设置扩展，不能输入历史日期.
    mapAttr.KeyOfEn = tb2 + 'To';
    mapAttr.Name = '到';
    mapAttr.MyDataType = DataType.AppDateTime;
    mapAttr.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn;
    mapAttr.Idx = 100;
    await mapAttr.Insert();

    //设置扩展: 大于等于日期从.
    mapExt.MyPK = mapAttr.MyPK + '_DateFieldInputRole';
    mapExt.FK_MapData = mapAttr.FK_MapData;
    mapExt.DoWay = 2;
    mapExt.Tag = 'GTE';
    mapExt.ExtType = 'DateFieldInputRole';
    mapExt.ExtModel = 'DateFieldInputRole';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Tag1 = tb2 + 'From';
    await mapExt.Insert();

    mapAttr.KeyOfEn = tb2 + 'Days';
    mapAttr.Name = '天数';
    mapAttr.MyDataType = DataType.AppFloat;
    mapAttr.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn;
    mapAttr.Idx = 101;
    mapAttr.UIIsEnable = false;
    mapAttr.UIWidth = 50;
    await mapAttr.Insert();

    //设置扩展: 两个日期差.
    mapExt.MyPK = mapAttr.MyPK + '_ReqDays';
    mapExt.FK_MapData = mapAttr.FK_MapData;
    mapExt.DoWay = 1;
    mapExt.ExtType = 'ReqTimes';
    mapExt.ExtModel = 'ReqDays';
    mapExt.AttrOfOper = mapAttr.KeyOfEn;
    mapExt.Doc = tb2 + 'From';
    mapExt.DocT = tb1 + '日期从';
    mapExt.Tag1 = tb2 + 'To';
    mapExt.Tag1T = tb1 + '到';
    mapExt.Tag = '0';
    mapExt.Tag2 = 'ReqTimes';

    mapExt.Tag3 = '08:30';
    mapExt.Tag4 = '17:30';

    await mapExt.Insert();
    return new GPNReturnObj(GPNReturnType.Message, '创建成功，请点击刷新按钮。');
  }

  // 新建string枚举
  public readonly Pop_TreeEns_Dept2Emp_Desc = `
  #### 帮助
  - 左树右表模式的人员选择器.
  #### 数据存储.
  - 数据存在Sys_MapExt的扩展属性里.
    `;
  public readonly DTFromToDesc = `
    #### 帮助
    - 用于创建日期从到，天数的组合字段。
    - 比如:请假日期从、到、请假天数.  
    - 系统自动创建, QingJiaFrom,QingJiaTo, QingJiaDays 三个字段, 
    - 自动设置三者字段的关系.
      `;

  public readonly XiaoJiDesc = `
      #### 帮助
      - 用于创建 xxx名称、单价、数量、小计三个字段.
      - 比如:配件、单价、数量、小计.
      - 系统自动创建, PeiJian、PeiJianUnit、PeiJianNum、PeiJianSum 4个字段, 
        `;

  public readonly CityDesc = `
    #### 帮助
    - 创建一个文本框的字段，存储人员编号。
    - 附加创建：电话、邮件字段。
    - 让其可以使用文本框自动完成模式的填充.
    #### 数据存储.
    - 数据存在Sys_MapExt的扩展属性里.
    
      `;
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
