import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { NodeAttr, Node } from '/@/WF/TSClass/Node';

export class GPE_AdvSetting extends PageBaseGroupEdit {
  constructor() {
    super('GPE_AdvSetting');
    this.PageTitle = '发送阻塞高级设置';
  }
  Init() {
    this.entity = new Node(); // new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.BlockModel; //对应的字段.

    //this.AddGroup('A', '阻塞信息提示'); //增加分组.
    this.SingleTextArea('4', '阻塞信息', 'BlockAlert', this.Desc1, '请输入阻塞后的信息提示...');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc1 = `
  #### 帮助
   - 发送阻塞，就是让当前节点不能向下运动的规则。
   - 如果满足一定的条件，就不能让其向下运动。
   - 不向下运行的时候根据配置的内容提示。
`;
}
