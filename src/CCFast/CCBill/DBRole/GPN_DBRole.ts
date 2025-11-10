import { DBRole } from './DBRole';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import DBAccess from '/@/utils/gener/DBAccess';
import { GloComm } from '/@/WF/Comm/GloComm';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import { message } from 'ant-design-vue';

export class GPN_DBRole extends PageBaseGroupNew {
  constructor() {
    super('GPN_DBRole');
    this.ForEntityClassID = 'TS.CCBill.DBRole';
    this.PageTitle = '数据权限规则';
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public async Init() {
    const dbRole = this.RequestVal('DBRole');

    if (dbRole == 'FlowRptDBList') {
      this.AddGroup('A', '通用控制'); //增加分组.
      this.AddBlank('None', '查询所有(默认)', this.None);
      this.AddBlank('SelfOnly', '只能查看自己发起的流程', this.None);
      this.AddBlank('DeptOnly', '本部门的人员可以查看本部门发起的流程', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以查看本部门发起的流程', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位下的人员可以查看全部流程', this.None);

      this.AddBlank('ByDepts', '指定部门下的人员可以查看数据全部流程', this.None);
      this.AddBlank('ByEmps', '指定人员可以查看数据全部流程', this.None);
      this.TextArea('ByExp', '按表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');
      this.AddIcon('icon-feed', 'ByExp');
      this.AddBlank('Adminer', '管理员admin可以查看数据全部流程', this.None);

      this.AddGroup('B', '集团组织模式'); //增加分组.
      //本组织的不控制.
      this.AddBlank('OrgOnly', '本组织的人员可以查看本组织流程(默认)', this.None);
      this.AddBlank('Admin2', '二级管理员可以查看本组织的全部流程', this.None);
      this.AddBlank('POrg', '可以查看本组织以及下1级组织流程', this.None);
      this.AddBlank('NOrg', '可以被直线父级组织所看到', this.NOrg);
    }

    // alert(dbRole);
    //  if (!dbRole) dbRole = 'DBRole'; //新建权限.
    if (dbRole == 'DBList') {
      this.AddGroup('A', '通用控制'); //增加分组.
      this.AddBlank('None', '不控制(默认)', this.None);
      this.AddBlank('SelfOnly', '只能查看自己创建的数据', this.None);
      this.AddBlank('DeptOnly', '本部门的人员可以查看本部门的数据', this.None);
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
      this.AddBlank('Adminer', '管理员可以新建', this.None);
      this.AddBlank('Admin2', '二级管理员可以新建', this.None);
      this.TextArea('ByExp', '按照SQL表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');
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
      this.AddBlank('DeleteByFlag', '启用逻辑删除', this.DeleteByFlag);
      this.TextArea('ByExp', '按照SQL表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');
    }

    //提交审核权限.
    if (dbRole == 'SubmitCheck') {
      this.AddGroup('A', '提交审核'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以提交)', this.None);
      this.AddBlank('SelfOnly', '只能提交自己创建的(默认)', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以提交本部门的数据', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以提交所有数据', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以提交所有数据.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以提交所有数据.', this.None);
      this.AddBlank('Adminer', '管理员可以提交', this.None);
      this.AddBlank('Admin2', '二级管理员可以提交', this.None);
      this.TextArea('ByExp', '按照SQL表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');
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
      const frm = this.RequestVal('Frm') || '';
      if (frm === 'Entity') this.TextArea('ByExp', '按照SQL表达式计算', this.None, '输入表达式:', '', '请点帮助信息如何填写...');
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
      this.AddBlank('Adminer', '管理员可以导入', this.None);
      this.AddBlank('Admin2', '二级管理员可以导入', this.None);
      this.AddBlank('DisMobile', '移动端禁用导入', this.None);
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

    //篡改规则.
    if (dbRole == 'RecJuggle') {
      this.AddGroup('A', '篡改规则'); //增加分组.
      this.AddBlank('None', '不控制(任何人都可以篡改数据)', this.None);
      this.AddBlank('SelfOnly', '自己创建的可以篡改', this.None);
      this.AddBlank('DeptLeader', '部门负责人可以篡改本部门的数据', this.DeptLeader);
      this.AddBlank('ByStations', '指定岗位的人员可以篡改所有数据', this.None);
      this.AddBlank('ByDepts', '指定部门的人员可以篡改所有数据.', this.None);
      this.AddBlank('ByEmps', ' 指定人员可以篡改所有数据.', this.None);
      this.AddBlank('Adminer', '管理员可以篡改数据', this.None);
      this.AddBlank('Admin2', '二级管理员可以篡改数据', this.None);
    }

    //字段显示控制.
    if (dbRole == 'ShowAttrs' || dbRole == 'ShowMethod') {
      this.AddGroup('A', '字段显示规则'); //增加分组.
      this.AddBlank('None', '不控制(显示全部)', this.None);
      this.AddBlank('ByStations', '按岗位控制', this.None);
      this.AddBlank('ByDepts', '按部门控制.', this.None);
      this.AddBlank('ByEmps', ' 按人员控制.', this.None);
      this.AddBlank('Adminer', 'Admin可以查看全部', this.None);
      this.AddBlank('Admin2', '按二级管理员控制', this.None);
    }

    if (dbRole != 'ShowAttrs') {
      //增加icon.
      this.AddIcon('icon-drop', 'None');
      this.AddIcon('icon-user', 'SelfOnly');
      this.AddIcon('icon-user-follow', 'ByEmps');
      this.AddIcon('icon-people', 'ByDepts');
      this.AddIcon('icon-people', 'ByStations');
      this.AddIcon('icon-user-following', 'DeptLeader');
    }
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const frmID = this.RequestVal('RefPKVal');
    const dbRole = this.RequestVal('DBRole');
    const frmPage = this.RequestVal('Frm') || '';
    //如果是高代码的设置
    if (frmPage === 'Entity' && (dbRole === 'RecDelete' || dbRole === 'RecSave')) {
      const en = await ClassFactory.GetEn(frmID);
      const attrs = en._enMap.attrs;
      if (pageNo === 'SelfOnly') {
        //获取当前的Entity
        if (attrs.filter((attr) => attr.Key === 'RecNo' || attr.Key === 'Starter' || attr.Key === 'FlowStarter').length === 0) {
          return '不存在创建人员的系统字段,不能配置该规则';
        }
      }
      if (pageNo === 'DeptLeader') {
        //获取当前的Entity
        if (attrs.filter((attr) => attr.Key === 'DeptNo').length === 0) {
          return '不存在部门系统字段,不能配置该规则';
        }
      }
    }
    // if (!!dbRole) dbRole = 'DBList';
    //执行创建.
    const en = new DBRole();
    en.MyPK = DBAccess.GenerGUID(); // frmID + '_' + pageNo + '_' + dbRole;

    if ((await en.RetrieveFromDBSources()) == 1) {
      alert('该选项【' + en.MyPK + '】已经存在,请点击修改.');
      return;
    }
    en.FrmID = frmID;
    en.MarkID = pageNo;
    en.DBRole = dbRole;
    en.MarkName = this.GetPageName(pageNo);
    en.Docs = '';

    //设置编辑模式.
    let enName = 'TS.CCBill.DBRole';
    if (pageNo == 'ByStations') enName = 'TS.CCBill.DBRoleStation';
    if (pageNo == 'ByDepts') enName = 'TS.CCBill.DBRoleDept';
    if (pageNo == 'ByEmps') enName = 'TS.CCBill.DBRoleEmp';
    if (pageNo == 'ByExp') {
      enName = 'TS.CCBill.DBRoleExp';
      en.Docs = tb1;
    }

    if (dbRole == 'ShowAttrs') {
      if (pageNo == 'ByStations') enName = 'TS.CCBill.DBRoleShowAttrsStation';
      if (pageNo == 'ByDepts') enName = 'TS.CCBill.DBRoleShowAttrsDept';
      if (pageNo == 'ByEmps') enName = 'TS.CCBill.DBRoleShowAttrsEmp';
      if (pageNo == 'Adminer') enName = 'TS.CCBill.DBRoleShowAttrsAdmin';
      if (pageNo == 'Admin2') enName = 'TS.CCBill.DBRoleShowAttrsAdmin2';
    }
    if (dbRole == 'ShowMethod') {
      if (pageNo == 'ByStations') enName = 'TS.CCBill.DBRoleShowMethodsStation';
      if (pageNo == 'ByDepts') enName = 'TS.CCBill.DBRoleShowMethodsDept';
      if (pageNo == 'ByEmps') enName = 'TS.CCBill.DBRoleShowMethodsEmp';
      if (pageNo == 'Admin2') enName = 'TS.CCBill.DBRoleShowMethodsAdmin2';
      if (pageNo == 'Adminer') enName = 'TS.CCBill.DBRoleShowAttrsAdmin';
    }

    en.SetPara('EnName', enName);
    await en.Insert();

    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enName, en.MyPK));
  }

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
