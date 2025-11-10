import { GenerAskFrm } from './GenerAskFrm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_SaveAfterTodo extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_SaveAfterTodo');
    this.PageTitle = '保存后做什么?';
  }

  Init() {
    this.entity = new GenerAskFrm(); //对应的类.
    this.KeyOfEn = 'SaveAfterTodo'; //要编辑的字段.
    this.AddGroup('A', '处理方式');
    this.SingleRichTxt('0', '提示信息', 'SaveAfterDoc', '请输入提示的信息', this.Desc0);
  }

  public readonly Desc0 = `
  #### 帮助
  - 用户保存后，提示的信息.
  - 比如: 感谢您的参与!!!
  #### 效果图
  - 
 `;
}
