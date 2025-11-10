import { PageBaseGroupNew } from '../bp/UIEntity/PageBaseGroupNew';

export class GPN_StartFlowByImpExcel extends PageBaseGroupNew {
  override Save_TextBox_X(_pageNo?: string, _sortNo?: string, _tb1?: string, _tb2?: string, _tb3?: string) {
    //  throw new Error("Method not implemented.");
  }
  constructor() {
    super('GPN_StartFlowByImpExcel'); //实体的类名，以GPE_开头.
    this.PageTitle = '导入Excel发起流程'; //实体名称.
  }
  public async Init() {
    const flowNo = this.RequestVal('FlowNo');
    //增加子页面分组.
    this.AddGroup('A', '选择方式');
    this.FileUpload('Excel', '上传Excel文件', this.HelpTodo, '请上传符合格式的Excel文件.');
    this.Table('Excel.SelectItems', '选择数据', this.HelpTodo, false, await GenerList('GPN_StartFlow003'));
  }
  public async GenerSorts() {
    return Promise.resolve([]);
  }
  public readonly Imp = `
  #### 帮助
   - 从其他部门的人员里导入人员，放入本部门中.
   - 一个人拥有多个部门.
  `;
  public readonly ImpExcel = `
  #### 帮助
   - 从excel导入数据.
   - 按照ccbpm的excel格式要求.
   - 格式文件位于 .  完善测试该方法.

  `;
}
function GenerList(arg0: string): string | Function | PromiseLike<string | Function> {
  // throw new Error('Function not implemented.');
}
