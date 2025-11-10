import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr } from '/@/WF/TSClass/Node';

export class GPE_CCWriteRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_CCWriteRole');
    this.PageTitle = '抄送写入规则';
  }
  Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.CCWriteTo; // 'BlockModel'; //要编辑的字段.

    this.AddGroup('A', '+抄送写入规则'); //增加分组.
    this.Blank('0', '写入抄送列表', this.Desc0);
    this.Blank('1', '写入待办', this.Desc1);
    this.Blank('2', '写入待办+抄送列表', this.Desc2);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc0 = `
  #### 说明
  - 显示在抄送列表.
  - 抄送是一个单独功能页面.
  #### 关于待办的分类
  - 待办有如下类别: 发送的、退回的、抄送的、移交的、加签的
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/AttrNode/CCRole/Img/cc.png "屏幕截图")
 `;
  public readonly Desc1 = `
  #### 说明
  - 出现了抄送的工作让其与待办放在一起,待办理表里也可以查看抄送信息.
  #### 关于待办的分类
  - 待办有如下类别: 发送的、退回的、抄送的、移交的、加签的
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/AttrNode/CCRole/Img/todolist.png "屏幕截图")
 `;
  public readonly Desc2 = `
  #### 说明
  - 抄送的信息显示在待办与抄送列表都存在.
  #### 关于待办的分类
  - 待办有如下类别: 发送的、退回的、抄送的、移交的、加签的
  `;
}
