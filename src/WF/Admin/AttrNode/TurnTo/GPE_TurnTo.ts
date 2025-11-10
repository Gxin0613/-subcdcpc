import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr } from '/@/WF/TSClass/Node';

export class GPE_TurnTo extends PageBaseGroupEdit {
  constructor() {
    super('GPE_TurnTo');
    this.PageTitle = '发送后转向';
  }
  Init() {
    this.entity = new Node(); //对应的类.
    this.Icon = 'icon-directions';
    // this.KeyOfEn = 'TurnToDeal'; //对应的字段.
    this.KeyOfEn = NodeAttr.TurnToDeal; //对应的字段，，该字段必须存在 this.entity里面.
    this.AddGroup('A', '+转向规则'); //增加分组.
    this.Blank('0', '提示ccflow默认信息', this.Desc0);
    this.SingleTB('1', '提示指定信息', NodeAttr.TurnToDealDoc, this.Desc1, '请输入提示信息');
    this.SingleTB('2', '转向指定的URL', NodeAttr.TurnToDealDoc, this.Desc2, '请输入转向URL');
    this.Blank('3', '发送完毕就关闭，不提示任何信息', this.Desc3);
    this.Blank('5', '发送完毕提示信息，点击关闭按钮后跳转到MyView', this.Desc5);
    // this.Blank('4', '按照设置的条件转向', this.Desc4);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 默认为不设置，按照机器自动生成的语言提示，这是标准的信息提示。
   - 比如：您的当前的工作已经处理完成。下一步工作自动启动，已经提交给xxx处理。 
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/AttrNode/TurnTo/Img/Turn.png "屏幕截图.png")
 `;

  public readonly Desc1 = `
  #### 帮助
   - 按照您定义的信息格式，提示给已经操作完成的用户。
   - 比如：您的申请已经发送至XXX 进行审批。 
   - 该自定义信息支持ccbpm的表达式，具体可参考右侧帮助文档。
   - 发送后系统变量如下:
   - 您可以设置为: 当前工作提交给:【 @VarAcceptersName 】处理。
   - 例如：您的请假申请单，已经提交给 @VarAcceptersName ，提交到： @VarToNodeName , 请假了@QingJiaTianTianShu天。
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/AttrNode/TurnTo/Img/TurnTo.png "屏幕截图.png")
`;

  public readonly Desc2 = `
  #### 帮助
   - 按照您定义的url转向，可处理较为复杂的业务逻辑处理。
   - 比如：URL为MyFlow.htm页面或www.baidu.com。
   - 该URL支持ccbpm参数形式，具体传值参考右侧帮助。
   - 启动子流程实例: /WF/MyFlow.htm?FK_Flow=003&PFlowNo=002
  `;
  //直接关闭
  public readonly Desc3 = `
  #### 帮助
  - 发送成功后直接关闭
  `;

  // public readonly Desc4 = `
  // #### 帮助
  //  - 按照设置的条件转向
  //  - 该功能将要取消
  // `;

  public readonly Desc5 = `
#### 帮助
 - 发送完毕ccflow默认提示信息，点击关闭按钮后转到MyView，即当前流程的查看页面。
#### 效果图
![输入图片说明](./resource/WF/Admin/AttrNode/TurnTo/Img/PCClosePage.png "屏幕截图.png")
![输入图片说明](./resource/WF/Admin/AttrNode/TurnTo/Img/PCMyView.png "屏幕截图.png")
![输入图片说明](./resource/WF/Admin/AttrNode/TurnTo/Img/MobileClosePage.png "屏幕截图.png")
![输入图片说明](./resource/WF/Admin/AttrNode/TurnTo/Img/MobileMyView.png "屏幕截图.png")
`;
}
