import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { DBRole } from '/@/CCFast/CCBill/DBRole/DBRole';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_DBFlowRole extends PageBaseGroupNew {
  constructor() {
    super('GPN_DBFlowRole');
    this.ForEntityClassID = 'TS.CCBill.DBRole';
    this.PageTitle = '数据权限规则';
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public async Init() {
    this.AddGroup('A', '数据权限规则'); //增加分组.
    // this.AddBlank('None', '不控制(默认)', this.None);
    this.AddBlank('SelfOnly', '只能查看自己创建的流程', this.None);
    this.AddIcon('SelfOnly', 'icon-user');

    this.AddBlank('DeptOnly', '本部门的人员可以查看本部门的流程', this.None);
    this.AddIcon('ByEmps', 'icon-user-follow');

    this.AddBlank('DeptLeader', '部门负责人可以查看本部门的里流程', this.DeptLeader);
    this.AddIcon('DeptLeader', 'icon-user-following');

    this.AddBlank('ByStations', '指定岗位下的人员可以查看全部流程', this.None);
    this.AddIcon('ByStations', 'icon-people');

    this.AddBlank('ByDepts', '指定部门下的人员可以查看编辑数据全部流程', this.None);
    this.AddIcon('ByDepts', 'icon-people');

    this.AddBlank('ByEmps', '指定人员可以查看编辑数据全部流程', this.None);

    //增加icon.
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const frmID = this.RequestVal('RefPKVal');
    let dbRole = this.RequestVal('DBRole');
    if (!!dbRole) dbRole = 'DBList';

    //执行创建.
    const en = new DBRole();
    en.MyPK = frmID + '_' + pageNo + '_' + dbRole;

    alert(en.MyPK);

    if ((await en.RetrieveFromDBSources()) == 1) {
      alert('该选项已经存在,请点击修改.');
      return;
    }
    en.FrmID = frmID;
    en.MarkID = pageNo;
    en.DBRole = 'DBList';
    en.MarkName = this.GetPageName(pageNo);
    en.Docs = '无';

    //设置编辑模式.
    let enName = 'TS.CCBill.DBRole';
    if (pageNo == 'ByStations') enName = 'TS.CCBill.DBRoleStation';
    if (pageNo == 'ByDepts') enName = 'TS.CCBill.DBRoleDept';
    if (pageNo == 'ByEmps') enName = 'TS.CCBill.DBRoleEmp';

    en.SetPara('EnName', enName);
    await en.Insert();

    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enName, en.MyPK));
  }
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
