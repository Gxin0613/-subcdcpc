import { message } from 'ant-design-vue';
import { PCenter } from './PCenter';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import DBAccess from '/@/utils/gener/DBAccess';
import { GloWF } from '/@/WF/Admin/GloWF';
import { AuthType } from '/@/bp/auth/AuthType';
import WebUser from '/@/bp/web/WebUser';

export class GPN_PCenter extends PageBaseGroupNew {
  constructor() {
    super('GPN_PCenter');
    this.ForEntityClassID = 'TS.GPM.PCenter';
    this.PageTitle = '新建权限';
  }
  public Init() {
    this.AddGroup('A', '本组织权限'); //增加分组.
    this.AddBlank(AuthType.Anyone, '所有人(本组织)', this.Docs0);
    this.AddBlank(AuthType.Adminer, '管理员', this.Docs1);
    this.AddBlank(AuthType.AdminerAndAdmin2, '管理员、二级管理员', this.Docs2);

    //按人员计算.
    this.SelectItemsByTreeEns(AuthType.Emps, '按人员计算', this.Docs3, true, GloWF.srcDeptLazily, '0', GloWF.srcEmpLazily, '', true, GloWF.srcEmpSearchKey, true);

    //按角色计算.
    this.SelectItemsByGroupList(AuthType.Stations, '按角色计算', this.Docs4, true, GloWF.srcStationTypes, GloWF.srcStations);

    //按部门计算.
    this.SelectItemsByTree(AuthType.Depts, '按部门计算', this.Docs5, true, GloWF.srcDeptLazily, '0', true, '', true);

    //按emp计算. test
    // const srcList = 'SELECT No,Name FROM Port_Emp ';
    // this.SelectItemsByList('Emps', '人员列表SelectItemsByList', this.Docs1, true, srcList);
    //按SQL计算.
    this.TextBox1_Name(AuthType.SQL, '按SQL计算', this.Docs6, '查询SQL', `SELECT Count(*) FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo' `, '输入的SQL返回');
    const ctrlObj = this.RequestVal('CtrlObj');
    if (ctrlObj != 'MyView') {
      this.AddGroup('B', '高级权限'); //增加分组.
      this.AddBlank(AuthType.AnyOrgs, '所有组织', this.HelpUn);
      this.SelectItemsByList(AuthType.SpecOrgs, '指定组织所有人员', this.Docs4, true, GloWF.srcOrgs);
      this.SelectItemsByGroupList(AuthType.SpecOrgStations, '指定组织的指定岗位', this.HelpTodo, true, GloWF.srcStationTypes, GloWF.srcStations);
      this.SelectItemsByTree(AuthType.SpecOrgDepts, '指定组织的指定部门', this.Docs5, true, GloWF.srcDeptLazily, '0', true, '', true);
    }
    
    // this.AddBlank('Stations', '按照角色计算', this.Docs0);
    // this.AddBlank('Depts', '按照部门计算', this.Docs0);
    // this.AddBlank('Emps', '按指定的人员计算', this.Docs0);
    // this.AddBlank('Teams', '按照权限组计算', this.Docs0);
    // this.AddBlank('SQL', '按照SQL计算', this.Docs0);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const ctrlPKVal = this.RefPKVal; //('RefPKVal');
    //执行创建.
   // debugger;
    const en = new PCenter();
    en.CtrlObj = this.RequestVal('CtrlObj');
    en.CtrlPKVal = ctrlPKVal;
    en.CtrlModel = pageNo; // AnyOne,Adminer,Depts
    en.CtrlModelT = this.GetPageName(pageNo); //模式名称.
    en.IDs = tb1;
    en.IDsT = tb2;
    en.OrgNo = WebUser.OrgNo; //组织编号.
    en.MyPK = DBAccess.GenerGUID();
    if (pageNo === AuthType.Anyone || pageNo === AuthType.Adminer || pageNo === AuthType.AdminerAndAdmin2 || pageNo === AuthType.AnyOrgs || pageNo === AuthType.SpecOrgs) {
      en.IDs = '无';
      en.IDNames = '无';
      en.MyPK = en.CtrlPKVal + '_' + pageNo;
      if ((await en.IsExits()) == true) {
        // alert('已经存在这个模式.');
        message.info('已经存在这个模式');
        return;
      }
    }
    const AuthControlCls = new Map([
      [AuthType.Emps, 'TS.GPM.PCenterEmp'],
      [AuthType.Depts, 'TS.GPM.PCenterDept'],
      [AuthType.Stations, 'TS.GPM.PCenterStation'],
      [AuthType.SQL, 'TS.GPM.PCenterSQL'],
      [AuthType.SpecOrgStations, 'TS.GPM.SpecOrgStation'],
      [AuthType.SpecOrgs, 'TS.GPM.SpecOrg'],
    ]);
    // let enName = AuthControlCls.get(pageNo) || 'None';
    // if (pageNo === AuthType.Emps) enName = 'TS.GPM.PCenterEmp';
    // if (pageNo === 'Depts') enName = 'TS.GPM.PCenterDept';
    // if (pageNo === 'Stations') enName = 'TS.GPM.PCenterStation';
    // if (pageNo === 'SQL') enName = 'TS.GPM.PCenterSQL';
    en.SetPara('EnName', AuthControlCls.get(pageNo as AuthType) || 'None');
    await en.Insert();
    message.info('创建成功');

    return new GPNReturnObj(GPNReturnType.CloseAndReload);
  }
  // 所有人
  public readonly Docs0 = `
  #### 帮助
  - 所有人都可以有权限。
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Anyone.png "屏幕截图.png") 

`;

  //管理员Adminer
  public readonly Docs1 = `
  #### 帮助
  - 只有管理员有权限。
  #### 配置图
  ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Admin.png "屏幕截图.png") 

  `;
  //管理员、二级管理员
  public readonly Docs2 = `
  #### 帮助
  - 管理员和二级管理员有权限。
  #### 配置图
  ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/AdminerAndAmin2.png "屏幕截图.png") 

  
  `;
  // 按人员计算Emps
  public readonly Docs3 = `
  #### 帮助
  - 按选择的人员赋权。
  #### 配置图
  - ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Emp.png "屏幕截图.png") 
  `;
  // 按角色计算Stations
  public readonly Docs4 = `
  #### 帮助
  - 按选择的角色人员赋权。
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Stations.png "屏幕截图.png") 
  `;
  // 按部门计算
  public readonly Docs5 = `
  #### 帮助
  - 按选择的部门人员赋权。
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Dept.png "屏幕截图.png") 
  `;
  // 按SQL计算
  public readonly Docs6 = `
  #### 帮助
  - 自动抄送给要绑定的人员.1. 输入的SQL是一个查询语句，返回的一行的第一列数据。
  - 该数据大于0 ，就是真(可以拥有此权限)，否则就是假（不能操作此权限）。
  - SQL语句支持ccbpm的表达式，比如：SELECT count(*) FROM Port_Dept WHERE No='@WebUser.DeptNo'。
  #### 说明
  - @WebUser.No 当前登录的人员编号
  - @WebUser.DeptNo 当前登录的部门编号
  - @RDT 是当前日期， 比如：2020-01-01
  - @DateTime 是当前时间， 比如：2020-01-01 10:09
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Sql.png "屏幕截图.png") 
  `;
}
