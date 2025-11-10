import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { NodeAttr, Node } from '/@/WF/TSClass/Node';

export class GPE_CancelRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_CancelRole');
    this.PageTitle = '撤销规则';
  }
  Init() {
    this.entity = new Node(); // new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.CancelRole; //对应的字段.

    this.AddGroup('A', '+撤销规则'); //增加分组.
    this.Blank('0', '上一步可以撤销', this.Desc0);
    this.Blank('1', '不能撤销', this.Desc0);
    this.Blank('2', '上一步与开始节点可以撤销', this.Desc0);
    this.Blank('3', '指定的节点可以撤销', this.Desc0);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 无
`;
}
