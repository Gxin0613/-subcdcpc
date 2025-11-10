import { FrmEntityNoName } from './FrmEntityNoName';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { DataType } from '/@/bp/en/DataType';

export class GPE_NoGenerModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_NoGenerModel');
    this.PageTitle = '编号生成模式';
  }
  Init() {
    this.entity = new FrmEntityNoName(); //对应的类.
    this.KeyOfEn = 'NoGenerModel'; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '编号生成模式'); //增加分组.
    this.SingleTB('0', '按照自增长的序号生成', 'BillNoFormat', this.Desc0, '请输入文字2-9', DataType.AppString);
    this.Blank('1', '根据实体名称生成拼音作为编号', this.Desc2); //PinYin ，ExpStatic ExpAuto
    this.SingleTB('2', '按表达式(静态)生成', 'BillNoFormat', this.Desc1, '请输入表达式,参考帮助.', DataType.AppString);
    this.SingleTB('3', '按表达式(动态)生成', 'BillNoFormat', this.Desc1, '请输入表达式,参考帮助.', DataType.AppString);
    this.Blank('4', '按GUID生成', '');
    //this.SingleTB('ExpAuto.Field', '选择字段', 'BillNoFormat', this.Desc1, '请输入表达式,参考帮助.', DataType.AppString);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
    // throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = `
  #### 帮助
  - 默认为4, 既生成编号为 0001、0002、0003、0004
  - 输入3, 既生成编号为 001、002、003、004
  - 请输入字符串, 2-9.
  - 编号自动生成,用户不能修改编号.
  `;
  public readonly Desc1 = `
  #### 按表达式生成
  - 比如: CC-{LSH4} , 则生成, CC-0001,CC-0002,CC-0003,CC-0004
  - CC-{YYYY}-{MM}-{LSH4} , 则生成: CC-2024-09-0001、CC-2024-09-0002、CC-2024-09-0003
  - CC-@WebUser.No-{LSH4} , 则生成: CC-zhangsan-0001、CC-zhangsan-0002、CC-zhangsan-0003
  - CC-@WebUser.DeptNo-{LSH4} , 则生成: CC-005-0001、CC-005-0002、CC-005-0003
  - CC-@WebUser.OrgNo-{LSH4} , 则生成: CC-MyOrgNo-0001、CC-MyOrgNo-0002、CC-MyOrgNo-0003
  `;
  public readonly Desc2 = `
  #### 帮助
  - 新建实体的时候首先,弹窗输入实体的名字,然后根据名字的拼音生成编号.
  - 生成的编号,用户可以自定义.
  `;
}
