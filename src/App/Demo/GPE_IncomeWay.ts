import { Student } from './Student';
import { DataType } from '/@/bp/en/DataType';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_IncomeWay extends PageBaseGroupEdit {
  constructor() {
    //构造方法里要输入类名,我们原则上需要 GPE_ 开头.
    //这个类要注册到 /Comm/UIEntity/ClassFactoryOfGroupPageEdit.ts 下.
    super('GPE_IncomeWay');
    this.PageTitle = '入学方式'; //GPE中文类名
  }
  async Init() {
    this.entity = new Student(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    this.KeyOfEn = 'IncomeWay'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '入学方式'); //增加分组.
    this.Blank('0', '考试入学', this.HelpUn);
    // this.SingleTB('0', '考试入学', 'IncomeExt', this.Desc0, '请输入分数', DataType.AppString);
    this.SingleTB('1', '介绍入学', 'IncomeExt', this.Desc0, '请输入介绍人名称，联系方式', DataType.AppString);
    this.SingleTB('2', '转校生', 'IncomeExt', this.Desc0, '请输入来自学校', DataType.AppString);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 帮助说明，可以图文显示.
`;
}
