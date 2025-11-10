import { GPENodeBatchRole1 } from './GPENodeBatchRole1';
import { GPENodeBatchRole2 } from './GPENodeBatchRole2';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr } from '/@/WF/TSClass/Node';

export class GPE_BatchRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_BatchRole');
    this.PageTitle = '批量审核';
  }
  Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.BatchRole; //对应的字段，要编辑的字段.
    this.AddGroup('A', '节点表单批处理'); //增加分组.
    this.Blank('0', '不使用批处理', this.Desc0);
    this.AddEntity('1', '审核组件模式批处理', new GPENodeBatchRole1(), this.Desc1);
    this.AddEntity('2', '字段分组模式批处理', new GPENodeBatchRole2(), this.Desc2);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
  
   - 默认为不处理。
   - 批处理有两种模式：1 审核组件的批处理，2.审核分组的批处理。
   - 审核组件的批处理：是当前节点启用了审核组件，审核意见的时候。
   - 审核分组的批处理：是采用经典表单设计模式，设计的审核分组，用户填写意见是填写的审核分组。

 `;
  public readonly Desc1 = `

  #### 说明

   - 仅仅对当前节点启用了审批组件(或者签批组件)有效.
   - 审核组件的信息会记录到审核信息表里面.
   - 通过设置批量审批属性可以灵活的满足不同的客户需求.
   
  #### 运行效果图
  
  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRole.png "屏幕截图.png")

  #### 流程案例图
  - 减刑假释流程
  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRoleFlow.png "屏幕截图.png")
  - 批次减刑流程
  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRoleFlow1.png "屏幕截图.png")

  
  #### 配置说明

  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRoleFlow2.png "屏幕截图.png")

 `;
  public readonly Desc2 = `
  #### 帮助
  - 对于节点表单有效.
  - 建议使用审核组件.
  #### 其它 
  - 该功能在2022.10以后的版本取消了.
  `;
}
