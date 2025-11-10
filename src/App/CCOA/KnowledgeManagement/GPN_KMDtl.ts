import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_KMDtl extends PageBaseGroupNew {
  constructor() {
    super('GPN_KMDtl'); //实体的类名，以GPE_开头.
    this.PageTitle = '新建知识'; //实体名称.
    // this.classID=''
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '知识类别');
    this.TextBox2_NameNo('Docs', '文章', this.HelpUn, '', '登录账号', '人员名称', '');
    this.FileUpload('ImpExcel', '文档附件', '请上传符合格式的Excel文件.', this.ImpExcel);
  }
  public async GenerSorts() {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {}

  public readonly Imp = `
  #### 帮助
   - 从其他部门的人员里导入人员，放入本部门中.
   - 一个人拥有多个部门.
  `;
  public readonly ImpExcel = `
  #### 帮助
   - 从excel导入数据.
   - 按照ccbpm的excel格式要求.
   - 格式文件位于 . 完善测试该方法.
  `;
}
