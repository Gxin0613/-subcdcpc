import { DBSafe } from './DBSafe';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_DBSafe extends PageBaseGroupNew {
  constructor() {
    super('GPN_DBSafe');
    this.ForEntityClassID = 'TS.Sys.DBSafe';
    this.PageTitle = '数据安全策略';
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public async Init() {
    const dbRole = this.RequestVal('DBRole');
    // alert(dbRole);
    //  if (!dbRole) dbRole = 'DBRole'; //新建权限.
    if (dbRole == 'DBList') {
      this.AddGroup('A', '通用控制'); //增加分组.
      this.AddBlank('None', '不控制(默认)', this.None);
      //  const help = `#### 根据RecNo计算. `;
      this.AddBlank('SelfOnly', '只能查看自己创建的数据,RecNo,FK_Emp关键字段计算', this.SelfOnly_DBList);
      this.AddBlank('DeptOnly', '本部门的人员可以查看本部门的数据,DeptNo', this.DeptOnly_DBList);
      this.AddBlank('DeptLeader', '部门负责人可以查看本部门的数据', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位下的人员可以查看全部数据', this.None);

      this.AddBlank('ByDepts', '指定部门下的人员可以查看数据全部数据', this.None);
      this.AddBlank('ByEmps', '指定人员可以查看数据全部数据', this.None);
      this.TextArea('ByExp', '按表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');
      this.AddIcon('icon-feed', 'ByExp');
      this.AddBlank('Adminer', '管理员admin可以查看数据全部数据', this.None);

      this.AddGroup('B', '集团组织模式'); //增加分组.
      //本组织的不控制.
      this.AddBlank('OrgOnly', '本组织的人员可以查看本组织数据(默认)', this.None);
      this.AddBlank('Admin2', '二级管理员可以查看本组织的全部数据', this.None);
      this.AddBlank('POrg', '可以查看本组织以及下1级组织数据', this.None);
      this.AddBlank('NOrg', '可以被直线父级组织所看到', this.NOrg);
    }

    //新建权限.
    if (dbRole == 'RecNew') {
      this.AddGroup('A', '新建规则'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以新建)', this.None);
      this.AddBlank('ByStations', '指定的岗位可以新建', this.None);
      this.AddBlank('ByDepts', '指定的部门可以新建', this.None);
      this.AddBlank('ByEmps', ' 指定的人员可以新建', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以新建', this.None);
      this.AddBlank('Adminer', '管理员可以新建', this.None);
      this.AddBlank('Admin2', '二级管理员可以新建', this.None);
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
      this.TextArea('ByExp', '按照SQL表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');

      this.AddGroup('B', '集团模式'); //增加分组.
      this.AddBlank('ByOrg', '可以删除本组织的数据', this.None);
      // this.AddBlank('DeleteByFlag', '启用逻辑删除', this.DeleteByFlag);
    }

    //数据修改权限.
    if (dbRole == 'RecJuggle') {
      this.AddGroup('A', '数据篡改(归档后修改特定字段)'); //增加分组.
      this.AddBlank('None', '不能篡改', this.None);
      this.AddBlank('SelfOnly', '创建人可以篡改', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以篡改本部门的数据', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以篡改所有数据', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以篡改所有数据.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以篡改所有数据.', this.None);
      this.AddBlank('Adminer', '管理员可以篡改', this.None);
      this.AddBlank('Admin2', '二级管理员可以篡改', this.None);
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
      this.TextArea('ByExp', '按照SQL表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');
    }
    //增加icon.
    this.AddIcon('None', 'icon-drop');
    this.AddIcon('SelfOnly', 'icon-user');
    this.AddIcon('ByEmps', 'icon-user-follow');
    this.AddIcon('ByDepts', 'icon-people');
    this.AddIcon('ByStations', 'icon-people');
    this.AddIcon('DeptLeader', 'icon-user-following');
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    const frmID = this.RequestVal('RefPKVal');
    const dbRole = this.RequestVal('DBRole');
    // if (!!dbRole) dbRole = 'DBList';
    //执行创建.
    const en = new DBSafe();
    en.MyPK = frmID + '_' + pageNo + '_' + dbRole;

    if ((await en.RetrieveFromDBSources()) == 1) {
      alert('该选项【' + en.MyPK + '】已经存在,请点击修改.');
      return;
    }
    en.FrmID = frmID;
    en.TableName = frmID;
    en.MarkID = pageNo;
    en.DBRole = dbRole;
    en.MarkName = this.GetPageName(pageNo);
    en.Docs = '无';

    //设置编辑模式.
    let enName = 'TS.Sys.DBSafe';
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

  //只能查询自己创建的数据
  public readonly SelfOnly_DBList = `
  #### 帮助
  - 只能查询自己创建的数据.
  - 创建记录的字段:EmpNo,RecNo,FK_Emp,StarterNo,CreaterNo 
  - 只能按照关键字段与WebUser.No查询.
`;

  //只能查询本部门的数据.
  public readonly DeptOnly_DBList = `
#### 帮助
- 只能查询本部门的数据.
- 创建记录的字段:FK_Dept,DeptNo,CreateDeptNo.
- 当前字段里包含: 字段时只能按照这个字段与WebUser.DeptNo.
`;

  public readonly DeleteByFlag = `
  #### 帮助
  - 默认为物理删除.
  - 逻辑删除: 删除Frm_GenerBill, Frm_GenerWorker, 并且把单据的表Bill_XXXX 的BillState 设置为-1
  - 逻辑删除不删除真实的数据.
`;

  public readonly DeptLeader = `
  #### 帮助
  - 部门负责人的数据存储在:  Port_Dept.Leader字段
`;
  public readonly NOrg = `
#### 帮助
- 直线上级组织的人员可以看到.
- 基于当前登录人员的帐号所在组织确定他有多少直线组织集合,如下SQL表达式.
- SELECT No FROM Port_Org WHERE TreeNos LIKE '%,@WebUser.Org,%'
- 如果数据列表有错误，请检查单据表的OrgNo字段数据是否正确,完整, 可以带入如下sql验证:
- SELECT * FROM BillTable WHERE OrgNo IN (SELECT No FROM Port_Org WHERE TreeNos LIKE '%,@WebUser.Org,%')
#### 其他
- 该表达式与其他表达式形成互斥关系.
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
