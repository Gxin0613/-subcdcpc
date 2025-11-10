import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr } from '/@/WF/TSClass/Node';

export class GPE_Sln11 extends PageBaseGroupEdit {
  constructor() {
    super('GPE_Sln11');
    this.PageTitle = '绑定单表单';
  }
  Init() {
    this.Btns = '帮助';
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.NodeFrmID; //要编辑的字段.

    //增加子页面.
    this.AddGroup('A', '绑定单表单'); //增加分组.

    //let str = 'SELECT No,Name FROM Sys_MapData ';
    // str += "  WHERE Sys_MapData.FK_FormTree Is Not Null AND FK_FormTree !='' ";
    //this.SelectItemsByGroupList('FrmID', null, '选择表单', str, true);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
    }
  }

  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageVal === btnName) {
    }
  }
  public readonly FoolForm = `
  #### 说明 
   - 设计方便，界面简洁清晰。
   - 字段的顺序可以通过拖拽实现移动,通过栅栏格来布局界面元素。
   - 可以通过定义文本属性来体现不同控件的展示要求（文本，单选，多选，定位，评分，多附件，地图，身份证识别等）满足表单要求。
 
  #### 图例
 -  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FoolFrmD.png "屏幕截图.png")
   
  #### 样式1
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/shagua.png "屏幕截图.png")

 
  #### 样式2
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/shagua2.png "屏幕截图.png")
   
  `;
}
