import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { NodeAttr } from '/@/WF/TSClass/Node';
import { AccepterRoleBindEmp } from './AccepterRoleBindEmp';
import { AccepterRoleBindDeptStation } from './AccepterRoleBindDeptStation';
import { AccepterRoleBindDept } from './AccepterRoleBindDept';
import { AccepterRoleBindStation } from './AccepterRoleBindStation';
import { SelecterFix } from './SelecterFix';
import { SelecterAttr } from './SelecterFree';
import { GloWF } from '../../GloWF';

export class SelectorModelEnum {
  public static readonly Station = 0;
  public static readonly Dept = 1;
  public static readonly Emp = 2;
  public static readonly SQL = 3;
  public static readonly SQLTemplate = 4;
  public static readonly GenerUserSelecter = 5;
  public static readonly DeptAndStation = 6;
  public static readonly Url = 7;
  public static readonly AccepterOfDeptStationEmp = 8;
  public static readonly AccepterOfDeptStationOfCurrentOper = 9;
  public static readonly TeamOrgOnly = 10;
  public static readonly TeamOnly = 11;
  public static readonly TeamDeptOnly = 12;
  public static readonly ByStationAI = 13;
  public static readonly ByWebAPI = 14;
  public static readonly ByMyDeptEmps = 15;
}

export class GPE_SelectorModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_SelectorModel');
    this.PageTitle = '可选人员范围';
  }
  Init() {
    this.entity = new SelecterFix(); //对应的类.
    this.KeyOfEn = SelecterAttr.SelectorModel; //  'SelectorModel'; //对应的字段.
    // this.Btns = '通用设置';

    //增加子页面.
    this.AddGroup('B', '按组织结构限定范围');
    this.AddEntity(SelectorModelEnum.Station, '按照角色', new AccepterRoleBindStation(), this.ByStation);
    this.AddEntity(SelectorModelEnum.ByStationAI, '按角色智能计算', new AccepterRoleBindStation(), this.ByStationAI);
    this.AddEntity(SelectorModelEnum.DeptAndStation, '按部门与角色的交集', new AccepterRoleBindDeptStation(), this.DeptAndStation);
    this.AddEntity(SelectorModelEnum.Dept, '按绑定的部门计算', new AccepterRoleBindDept(), this.ByBindEmp);
    this.Blank(SelectorModelEnum.ByMyDeptEmps, '只能选择本部门人员', this.ByMyDeptEmps);
    this.AddEntity(SelectorModelEnum.Emp, '只能选择指定的人员', new AccepterRoleBindEmp(), this.Emp);
    this.AddGroup('C', '按自定义SQL限定范围'); //增加分组.
    //this.SingleTBSQL(SelectorModelEnum.SQL, '按SQL计算', NodeAttr.DeliveryParas, this.BySQL);
    this.TextBox2(SelectorModelEnum.SQL, '按SQL计算', SelecterAttr.SelectorP1, '输入部门分组SQL', SelecterAttr.SelectorP2, '输入人员SQL', this.BySQL);

    //const sql = 'SELECT No,Name FROM WF_SQLTemplate WHERE SQLType=5';
    this.SingleDDLSQL(SelectorModelEnum.SQLTemplate, '按SQL模板计算', NodeAttr.DeliveryParas, this.SQLTemplate, GloWF.SQLOfSQLTemplate, false);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly SQLTemplate = `
  #### 帮助
  - 选择已经预制好的SQL语句,查询出来可以选择的人员范围.
  - 这些模板文件都存储在 WF_SQLTemplate ,您可以使用 SELECT No,Name FROM WF_SQLTemplate WHERE SQLType=5 查询出来这些模板.
  - 维护这些模板在表单设计器中维护，也可以手工维护.
  `;

  //按部门与角色的交集  .
  public readonly DeptAndStation = `
  #### 帮助
   - 按选择的部门与角色的交集，显示人员集合。
   - 角色集合下有一些人员，部门下有一些人员，他们的交集，就是要选择的范围.
 
   `;
  //按绑定的人员计算  .
  public readonly Emp = `
  #### 帮助
   -  绑定多少人，就显示多少人。
    `;
  //按本部门人员计算.
  public readonly ByMyDeptEmps = `
  #### 帮助
   - 弹出的人员选择器中，仅仅列出来本部门的人员，包括兼职部门。
   - 关于组织结构表，请参考doc.ccbpm.cn手册.
    `;

  //按角色职能计算.
  public readonly ByStation = `
  #### 帮助
   - 根据选择的角色集合，求出来该集合下的人员集合。
   - 把人员集合列出来，让用户选择。
  `;

  public readonly ByStationAI = `
  #### 帮助

   - 根据当前人员所在部门的集合（一人可能所在多个部门）得到的人员集合,与选择的角色下的人员集合的交集,就是可选择的人员集合.

   `;
  //按绑定的人员计算ByBindEmp

  public readonly ByBindEmp = `
  #### 帮助
   - 按绑定的人员集合，作为选择的对象。     
`;

  //ByAPIUrl, '按照设置的WebAPI接口获取的数据计算'
  public readonly ByAPIUrl = `
#### 帮助
 - 接口返回值类型为String类型, 多个人员用逗号分开.
 - 格式: zhangsan,lisi,wangwu
`;

  //BySQL, '按设置的SQL获取接受人计算'
  public readonly BySQL = `
 
  #### 帮助
   -  SQL分为两部分，部门分组，人员列表SQL
   -  部门S分组SQL 需要返回 No,Name连个列,分别是部门编号,部门名称.
   -  部门SQL语句支持ccbpm表达式, 比如：SELECT No,Name FROM Port_Dept.
   -  该人员SQL是需要返回No,Name,FK_Dept 三个列，分别是人员编号,人员名称，部门编码 返回的数据必须按照顺序来。
   -  人员SQL语句支持ccbpm表达式, 比如：SELECT No,Name,FK_Dept FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
   -  比如：SELECT No,Name,FK_Dept FROM Port_Emp WHERE FK_Dept='@MyFieldName' MyFieldName 可以是节点表单字段.
   -  如果通过api接口发起流程，可以传入系统参数 SELECT No,Name,FK_Dept FROM Port_Emp WHERE FK_Dept='@MySysPara' .
   -  如何传入系统参数：请参考流程属性，流程二开，调用： Flow_SaveParas(workid, paras) 的方法.
   #### 总结表达式分为三类.
   - 登录信息:  @WebUser.No, @WebUser.DeptNo ，@WebUser.OrgNo
   - 节点表单字段: @MyFieldName.
   - 系统传来的参数:  通过调用API. 调用： Flow_SaveParas(workid, paras) 的方法.
  #### 其他.
   -  什么是ccbpm表达式，请百度：ccbpm 表达式。
   -  注意：1. 区分大小写。2. 顺序不能变化, No,Name 
`;
}
