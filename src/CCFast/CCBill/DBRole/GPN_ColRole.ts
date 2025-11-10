import { DBRole } from './DBRole';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_ColRole extends PageBaseGroupNew {
  constructor() {
    super('GPN_ColRole');
    //this.ForEntityClassID = 'TS.CCBill.DBRole';
    this.PageTitle = '数据权限规则';
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public async Init() {
    const dbRole = this.RequestVal('DBRole');
    // alert(dbRole);
    //  if (!dbRole) dbRole = 'DBRole'; //新建权限.
    if (dbRole == 'DBList') {
      this.AddGroup('A', '数据权限规则'); //增加分组.
      // this.AddBlank('None', '不控制(默认)', this.None);
      this.AddBlank('SelfOnly', '只能查看自己创建的数据', this.None);
      this.AddBlank('DeptOnly', '本部门的人员可以查看本部门的数据', this.None);
      this.AddIcon('icon-user-follow', 'DeptOnly');

      this.AddBlank('DeptLeader', '部门负责人可以查看本部门的数据', this.DeptLeader);
      this.AddIcon('icon-user-follow', 'DeptLeader');

      this.AddBlank('ByStations', '指定岗位下的人员可以查看全部数据', this.None);
      this.AddIcon('icon-people', 'ByStations');

      this.AddBlank('ByDepts', '指定部门下的人员可以查看数据全部数据', this.None);
      this.AddBlank('ByEmps', '指定人员可以查看数据全部数据', this.None);
      this.TextArea('ByExp', '按表达式计算', this.HelpByExp, '输入表达式:', '', '请点帮助信息如何填写...');
      this.AddIcon('icon-feed', 'ByExp');

      this.AddBlank('Adminer', '管理员admin可以查看数据全部数据', this.None);
      this.AddBlank('Admin2', '二级管理员可以查看数据全部数据', this.None);
    }

    //新建权限.
    if (dbRole == 'RecNew') {
      this.AddGroup('A', '新建规则'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以新建)', this.None);
      this.AddBlank('ByStations', '指定的岗位可以新建', this.None);
      this.AddBlank('ByDepts', '指定的部门可以新建', this.None);
      this.AddBlank('ByEmps', ' 指定的人员可以新建', this.None);
      this.AddBlank('Adminer', '管理员可以新建', this.None);
      this.AddBlank('Admin2', '二级管理员可以新建', this.None);
      this.AddBlank('Dis', '禁用新建', this.None);
    }

    //删除权限.
    if (dbRole == 'RecDelete') {
      this.AddGroup('A', '删除规则'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以删除)', this.None);
      this.AddBlank('SelfOnly', '只能删除自己创建的', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以删除本部门的数据', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以删除所有数据', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以删除所有数据.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以删除所有数据.', this.None);
      this.AddBlank('Adminer', '管理员可以删除', this.None);
      this.AddBlank('Admin2', '二级管理员可以删除', this.None);
      this.AddBlank('Dis', '禁用删除', this.None);
    }

    //保存权限.
    if (dbRole == 'RecSave') {
      this.AddGroup('A', '保存权限'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以保存)', this.None);
      this.AddBlank('SelfOnly', '只能保存自己创建的', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以保存本部门的数据', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以保存所有数据', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以保存所有数据.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以保存所有数据.', this.None);
      this.AddBlank('Adminer', '管理员可以保存', this.None);
      this.AddBlank('Admin2', '二级管理员可以保存', this.None);
      this.AddBlank('Dis', '禁用保存', this.None);
    }

    //归档规则.
    if (dbRole == 'RecFiling') {
      this.AddGroup('A', '归档规则'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以归档)', this.None);
      this.AddBlank('SelfOnly', '自己创建的可以归档', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以归档本部门的数据', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以归档所有数据', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以归档所有数据.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以归档所有数据.', this.None);
      this.AddBlank('Adminer', '管理员可以归档', this.None);
      this.AddBlank('Admin2', '二级管理员可以归档', this.None);
    }

    //导入权限.
    if (dbRole == 'ImpExcel') {
      this.AddGroup('A', '导入权限'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以导入)', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以导入', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以导入', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以导入.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以导入', this.None);
      this.AddBlank('Adminer', '管理员可以归档', this.None);
      this.AddBlank('Admin2', '二级管理员可以归档', this.None);
    }

    //导出权限.
    if (dbRole == 'ExpExcel') {
      this.AddGroup('A', '导出权限'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以导出)', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以导出', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以导出', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以导出.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以导出', this.None);
      this.AddBlank('Adminer', '管理员可以出', this.None);
      this.AddBlank('Admin2', '二级管理员可以出', this.None);
      this.AddBlank('DisMobile', '移动端禁用导出', this.None);
    }

    //增加icon.
    this.AddIcon('None', 'icon-drop');
    this.AddIcon('SelfOnly', 'icon-user');
    this.AddIcon('ByEmps', 'icon-user-follow');
    this.AddIcon('ByDepts', 'icon-people');
    this.AddIcon('ByStations', 'icon-people');
    this.AddIcon('DeptLeader', 'icon-user-following');
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const frmID = this.RequestVal('RefPKVal');
    const dbRole = this.RequestVal('DBRole');
    // if (!!dbRole) dbRole = 'DBList';
    //执行创建.
    const en = new DBRole();
    en.MyPK = frmID + '_' + pageNo + '_' + dbRole;

    if ((await en.RetrieveFromDBSources()) == 1) {
      alert('该选项【' + en.MyPK + '】已经存在,请点击修改.');
      return;
    }
    en.FrmID = frmID;
    en.MarkID = pageNo;
    en.DBRole = dbRole;
    en.MarkName = this.GetPageName(pageNo);
    en.Docs = '无';

    //设置编辑模式.
    let enName = 'TS.CCBill.DBRole';
    if (pageNo == 'ByStations') enName = 'TS.CCBill.DBRoleStation';
    if (pageNo == 'ByDepts') enName = 'TS.CCBill.DBRoleDept';
    if (pageNo == 'ByEmps') enName = 'TS.CCBill.DBRoleEmp';
    if (pageNo == 'ByExp') {
      enName = 'TS.CCBill.DBRoleExp';
      en.Docs = tb1;
    }

    en.SetPara('EnName', enName);
    await en.Insert();

    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enName, en.MyPK));
  }

  //按表达式计算条件.
  public readonly HelpByExp = `
  #### 帮助
  - 例0:  XB=1 
  - 例1:  XB=1 AND Name LIKE  '%@WebUser.No%' 
  - 例2:  XB=1 AND ZZMM IN (1,2,3,4) 
  - 系统就会把它拼接到 and ( XXXXX )    其中 XXXX 就是你输入的值.
  - 表达式支持系统变量 @WebUser.No,  @WebUser.Name, @WebUser.DeptNo,  @WebUser.OrgNo 等当前用户登录的字段.
`;

  public readonly DeptLeader = `
  #### 帮助
  - 部门负责人的数据存储在:  Port_Dept.Leader字段
`;
  public readonly None = `
  #### 帮助
  - 控制的内容为,列表查看权限控制.
  - 数据权限的控制方式有菜单栏里几种.
  #### 控制解析规则.
  1. 首先判断当前登录人员是否有查看全局的权限?
  1. 其次判断按部门权限.
  1. 最后判断人员权限.
  #### 可以查看全部数据的权限规则
  1. 控制权限数据为 0 条记录.
  1. 按照岗位，部门判断有任何一个条件成立.
`;
}
