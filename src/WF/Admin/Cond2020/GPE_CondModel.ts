import { GloComm } from '../../Comm/GloComm';
import { Node, NodeAttr } from '../../TSClass/Node';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPE_CondModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_CondModel');
    this.PageTitle = '转向规则';
  }
  Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = 'CondModel'; //要编辑的字段.
    this.Icon = 'icon-directions';
    this.Btns = [{ pageNo: '0', list: ['优先级'] }];

    //增加子页面.
    this.AddGroup('A', '自动计算'); //增加分组.
    this.Blank('0', '由连接线条件控制', this.Desc0);

    this.AddGroup('B', '主观选择'); //增加分组.
    this.SingleCheckBox('2', '下拉框模式', '退回节点是否现在工具栏?', NodeAttr.IsShowReturnNodeInToolbar, this.Desc1); //,'退回节点是否现在工具栏'
    this.SingleCheckBox('3', '按钮模式', '退回节点是否现在工具栏?', NodeAttr.IsShowReturnNodeInToolbar, this.Desc3); //'退回节点是否现在工具栏'
    this.Blank('1', ' 发送后手工选择到达节点与接受人', this.Desc2);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (btnName == '优先级') {
      const pkval = this.RefPKVal;
      //  Map map=new Map();
      // map.AddRM_DtlSearch('到达节点', new Directions(), DirectionAttr.Node, '帮助', '', 'ToNode,ToNodeName', 'icon-drop', true, '&Node=' + pkval);
      const url = GloComm.UrlEn('TS.WF.Template.NodeDir', this.entity.NodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
      return;
    }
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc0 = ` 
  #### 帮助
   - 该模式需要为每一跟连接线设置方向条件。
   - ccbpm在发送的时候会检查这些条件,如果条件成立就转向这个节点。
   - 该模式是让ccbpm自动为您计算要发送到的节点。
  #### 效果图
   - ![输入图片说明](./resource/WF/Admin/Img/CondModel0.png "屏幕截图.png")
   - 请在右边要到达的节点设置方向条件。
   `;

  public readonly Desc1 = `
  #### 帮助
   - 视频教程: https://drive.weixin.qq.com/s?k=AOsAZQczAAYgmfqbFS
   - 用户发送的时候，在发送按钮旁边有一个下拉框，该下拉框是ccbpm为您计算出来的可以发送到的节点。
   - 由操作者来决定要发送到那个节点上去。
   - 如果您选择的节点的接收人规则是由上一步发送人员来选择的，系统就会弹出接受人按钮。
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/Img/CondModel1.png "屏幕截图.png") 
  
  `;

  public readonly Desc2 = `
  #### 帮助
   - 该模式多用于分合流节点。
   - 在异表单的合流节点上配置该模式，合流节点的操作员发送后，就转到该页面上，选择到达的节点。

   #### 图例
   - ![输入图片说明](./resource/WF/Admin/Img/CondModel2.png "屏幕截图.png") 
   - 也可以用于协作模式下的节点,到达的节点是需要最后一个人审核,由最后一个人选择到达的节点与接受人。
  `;

  public readonly Desc3 = `
  #### 帮助
   - 用户发送的时候，在发送按钮有选择按钮，是ccbpm为您计算出来的可以发送到的节点。
   - 是由操作者来决定要发送到那个节点上去。
   - 如果您选择的节点的接收人规则是由上一步发送人员来选择的，系统就会弹出接受人按钮。 
  
  `;
}
