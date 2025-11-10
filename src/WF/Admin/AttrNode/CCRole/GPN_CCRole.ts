import { GloWF } from '../../GloWF';
import { CCRole } from './CCRole';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_CCRole extends PageBaseGroupNew {
  constructor() {
    super('GPN_CCRole');
    this.ForEntityClassID = 'TS.AttrNode.CCRole';
    this.PageTitle = '新建抄送规则';
  }

  public Init() {
    //能让从表新建的时候打开当前GPN,而不是 En.vue?EnName=TS.AttrNode.CCRole
    //增加子页面.
    this.AddGroup('A', '请选择规则'); //增加分组.
    //按人员计算.
    this.SelectItemsByTreeEns('1', '按人员计算', this.Docs1, true, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '', true);
    //按角色计算.
    this.SelectItemsByGroupList('2', '按角色计算', this.Docs1, true, GloWF.srcStationTypes, GloWF.srcStations);
    //按部门计算.
    this.SelectItemsByTree('3', '按部门计算', this.Docs1, true, GloWF.srcDepts, GloWF.srcDeptRoot);
    //按SQL计算.
    this.TextSQL('4', '按SQL计算', this.BySQL, '查询SQL', `SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo' `, '输入的SQL返回人员集合具有No,Name两个列.');
    this.TextBox1_Name('0', '按表单字段计算', this.ByField, '表单字段', '', '请输入节点表单的字段名.');
    this.AddBlank('5', '按接受人规则计算', this.Desc5);
    this.SelectItemsByTree('6', '抄送给指定部门负责人', this.Docs1, true, GloWF.srcDepts, GloWF.srcDeptRoot);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const nodeID = this.RefPKVal;
    //执行创建.
    const en = new CCRole();
    en.NodeID = nodeID;
    en.CCRoleExcType = pageNo;
    en.EnIDs = tb1;
    en.Tag2 = tb2;
    en.EnIDsT = tb2;
    en.FlowNo = this.RequestVal('FlowNo');
    let enName = '';
    //设置不同的示例，让其打开的时候,能够不同类型的编辑.
    if (pageNo === '0') enName = 'TS.AttrNode.CCRoleByField';
    if (pageNo === '1') enName = 'TS.MapExt.CCRoleByEmp';
    if (pageNo === '2') enName = 'TS.AttrNode.CCRoleByStation';
    if (pageNo === '3') enName = 'TS.AttrNode.CCRoleByDept';
    if (pageNo === '6') enName = 'TS.AttrNode.CCRoleByDept'; //抄送指定部门的负责人.

    if (pageNo === '4') {
      enName = 'TS.AttrNode.CCRoleBySQL';
      en.DBSrc = tb1;
      en.Tag1 = tb2;
    }
    if (pageNo === '5') {
      enName = 'TS.AttrNode.CCRoleByDeliveryWay';
      en.MyPK = this.RefPKVal;
      en.Tag1 = '设置接受人规则.';
      if ((await en.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Message, 'err@该规则已经存在,只允许有一个规则.');

      en.SetPara('EnName', enName);
      await en.Insert();
      return;
    }

    en.SetPara('EnName', enName);
    await en.Insert();

    //转入到url.
    const url = GloComm.UrlEn(enName, en.MyPK);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  // 按表单字段计算
  public readonly ByField = `
  #### 帮助
  - 按照节点表单的字段作为抄送人.
  - 通常是在节点表单上加一个字段,这个字段存储的是人员账号，多个人员使用逗号分开.
  #### 实例
  - 填写表单的字段ID ：ChaoSong
`;

  //按人员计算
  public readonly Docs1 = `
  #### 帮助
  - 自动抄送给要绑定的人员.
`;
  //按接受人规则计算
  public readonly Desc5 = `
  #### 帮助
  - 绑定节点的接收人规则.
  - 请点击设置接受人规则.
`;
  //按角色计算
  public readonly BySQL = `
  #### 帮助
  - 按SQL计算抄送人员.
  - 有一个规则
  #### DEMO
  - 抄送本部门的人员.
  - SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo';
  
`;
}
