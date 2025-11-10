import { GenerAskFrm } from './GenerAskFrm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_Welcome extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_Welcome');
    this.PageTitle = '欢迎词';
  }

  public Init() {
    this.entity = new GenerAskFrm(); //对应的类.
    this.KeyOfEn = 'WelcomeModel'; //要编辑的字段.
    this.AddGroup('A', '欢迎词');
    this.Blank('0', '无欢迎词,直接进入', '直接进入askFrm.');
    this.SingleTextArea('1', '欢迎词信息', 'WelcomeDoc', '请输入欢迎的信息', this.Desc0);
    this.SingleRichTxt('2', '接受协议', 'WelcomeDoc', '请输入协议内容', this.Desc1);
    this.SingleRichTxt('3', '需要支付费用', 'WelcomeDoc', '请输入欢迎的信息', this.HelpUn);
  }

  public readonly Desc0 = `
  #### 帮助
  - 用户保存后，提示的信息.
  - 比如: 欢迎您参与调查.
  #### 效果图
  - 
 `;

  public readonly Desc1 = `
  #### 帮助
  - 需要接受协议才能进入.
  #### 效果图
  - 
 `;
}
