import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
export class DataFrom {
  public static readonly CondByFrm = '0'; //节点表单条件
  public static readonly StandAloneFrm = '1'; //独立表单
  public static readonly CondStation = '2'; //按角色
  public static readonly CondDept = '3'; //按部门
  public static readonly CondBySQL = '4'; //按SQL
  public static readonly CondBySQLTemplate = '5'; //按SQL模板
  public static readonly CondByPara = '6'; //按参数
  public static readonly CondByUrl = '7'; //按url计算.
  public static readonly CondByWebApi = '8'; //按照webapi计算.
  public static readonly CondByWorkCheck = '9'; //按审核组件立场.
  public static readonly Operator = '100'; //操作符.
}
export class GPN_NewFrmEle extends PageBaseGroupNew {
  constructor() {
    super('GPN_NewFrmEle');
    this.PageTitle = '新建表单元素';
  }

  public async Init() {
    //增加子页面.
    this.AddGroup('A', '新建元素');
    this.AddBlank('AA', '字段', '');
    this.AddBlank('BB', '从表', '');
    this.AddBlank('CC', '附件', '');
    this.AddBlank('DD', '自定义页面', '');
    this.AddBlank('EE', '嵌入表单', '');
    // this.AddGroup('B', '新建下级');
    // this.AddBlank('AA', '新建字段', '');
    // this.AddBlank('BB', '新建从表', '');
    // this.AddBlank('BB', '新建附件', '');
  }

  //重写保存方法实现业务逻辑.
  // @ts-ignore
  /**
   *
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3 第3个文本框的值
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {}

  public readonly CondByWorkCheck = `
  #### 帮助
  - 审核组件立场.
  `;
  //不需要分组,就返回空.
  GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    //  return null;
  }
}
