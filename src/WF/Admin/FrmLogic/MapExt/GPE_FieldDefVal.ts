import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapAttrString } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttrString';

export class GPE_FieldDefVal extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FieldDefVal');
    this.PageTitle = '默认值设置';
  }
  async Init() {
    this.entity = new MapAttrString(); //对应的类.
    this.KeyOfEn = 'ExtDefVal'; //对应的字段.

    this.AddGroup('Z', '基础设置'); //增加分组.
    this.Blank('0', '不设置', this.Desc0);

    //增加子页面.
    this.AddGroup('A', '按照登录信息设置'); //增加分组.
    // const sql = "SELECT No,Name FROM Sys_GloVar WHERE GroupKey='DefVal'";
    // this.SelectItemsByList('1', '登录用户信息', '', false, sql, 'DefVal');
    this.Blank('@WebUser.No', '登录人员账号@WebUser.No', this.Desc0);
    this.Blank('@WebUser.Name', '登录人员名称@WebUser.Name', this.Desc0);
    this.Blank('@WebUser.DeptNo', '登录人员部门编号@WebUser.DeptNo', this.Desc0);
    this.Blank('@WebUser.DeptName', '登录人员部门名称@WebUser.DeptName', this.Desc0);
    this.Blank('@WebUser.DeptFullName', '登录人员部门全称@WebUser.DeptFullName', this.Desc0);
    this.Blank('@WebUser.DeptLeader', '部门领导@WebUser.DeptLeader', this.Desc0);
    this.Blank('@WebUser.EmpLeader', '直属领导@WebUser.EmpLeader', this.Desc0);

    this.AddGroup('F', '对集团版有效.'); //增加分组.
    this.Blank('@WebUser.OrgName', '登录人员组织名称@WebUser.OrgName', this.Desc0);
    this.Blank('@WebUser.OrgNo', '登录人员组织@WebUser.OrgNo', this.Desc0);

    this.AddGroup('B', '按年度设置'); //增加分组.
    this.Blank('@FK_ND', '当前年度', this.Desc0);
    this.Blank('@FK_YF', '当前年度', this.Desc0);
    this.Blank('@yyyy年MM月dd日', '当前日期(yyyy年MM月dd日)', this.Desc0);
    this.Blank('@yyyy年MM月dd日HH时mm分', '当前日期(yyyy年MM月dd日HH时mm分)', this.Desc0);
    this.Blank('@yy年MM月dd日', '当前日期(yy年MM月dd日)', this.Desc0);
    this.Blank('@yy年MM月dd日HH时mm分', '当前日期(yy年MM月dd日HH时mm分)', this.Desc0);
    this.AddGroup('C', '直接输入默认值');
    this.SingleTextArea('DefVal', '默认值', 'DefVal', '请输入默认值，值不会被系统替换', '');
    this.AddGroup('D', '高级设置'); //增加分组.
    this.SingleTextArea('SQL', '按SQL计算', 'DefVal', '请输入SQL语句', '');
  }

  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public async AfterSave(_pageID: string, _pageVal: any) {}

  public readonly Desc0 = `
  #### 帮助
   - 默认值是在可编辑的状态下,进入表单后，默认加载的数据值.
  `;
}
