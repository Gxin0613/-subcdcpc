import { FrmTransferCustom } from './FrmTransferCustom';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FrmTransfer extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmTransfer');
    this.PageTitle = '流转自定义';
  }
  Init() {
    this.entity = new FrmTransferCustom(); //对应的类.
    this.KeyOfEn = 'FTCSta'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '组件状态'); //增FrmTransferCustom加分组.
    this.Blank('0', '禁用', this.Desc0);
    this.Blank('1', '只读', this.Desc1);
    // this.Blank('2', '可设置人员', this.Desc1);
    this.AddEntity('2', '可定义', new FrmTransferCustom(), this.Desc2);
  }

  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = ` 
  #### 帮助
  - 流转自定义 定义: 在流程运行过程中，可以对节点进行动态编排，我们把这样的行为，称为流转自定义.
  - 比如：一个项目申报有n个工序，整体流程中，头部与尾部节点固定，根据项目类型不同，需要选择不同的工序. 
  - 游离态节点定义: 一个节点是一道工序，这道工序在一个流程中.

  #### 流程图
  - 这是一个项目申报流程，中间的工序节点是可以被选择的，可以动态组合.
  -![输入图片说明](./resource/WF/Admin/AttrNode/FrmTransfer/Img/FrmTransferFlow.png "屏幕截图.png")  

  #### 流转自定义-(工序控制图)

  - 可以为每个工序设置操作人员. 
  - 可以调整工序顺序.
  - 可以增加或者减少工序(节点). 
  
 #### 其他说明
  - 工序的节点，都是游离态节点.
  - 流程测试案例 027. 如下图.
  -![输入图片说明](./resource/WF/Admin/AttrNode/FrmTransfer/Img/FrmTransferFlow2.png "屏幕截图.png")  
  `;

  public readonly Desc1 = ` 
  #### 帮助
  - 只读状态下，仅仅可以查看工序，不能对工序进行编排.
  `;
  public readonly Desc2 = ` 
  #### 帮助
  - 可以动态编排工序.
  - 可以调整顺序.
  - 可以设置工序上的操作人员.
  #### 组件工作图
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmTransfer/Img/FrmTransfer.png "屏幕截图.png") 
....`;
}
