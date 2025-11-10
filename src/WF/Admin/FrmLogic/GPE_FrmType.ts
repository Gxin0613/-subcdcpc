import { MapData, MapDataAttr } from './MapData';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FrmType extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmType');
    this.PageTitle = '表单工作模式';
  }
  Init() {
    this.entity = new MapData(); //对应的类.
    this.KeyOfEn = MapDataAttr.FrmType; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '表单工作模式'); //增加分组.
    this.Blank('0', '经典表单', this.FoolForm);
    this.Blank('10', '章节表单', this.zhangjie);
    this.Blank('6', 'VSTO表单Excel', this.VSTO);
    this.Blank('61', 'VSTO表单Word', this.VSTO);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
    // throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly zhangjie = `  
  #### 帮助
  - 填报的数据是有规则的大文档，比如合同、项目申报、操作手册等具有目录层次的表单.
  - 这个文档有章、节、内容三部分组成。
  - 节内容支持： 大文本、多字段、附件、图片附件、从表、自定义URL.
  - 内容展示丰富，填写直观方便。
    #### 图例1
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/zhangjie.png "屏幕截图.png")
  -
  `;
  public readonly VSTO = `
  #### 帮助
  - VSTO表单也叫excel表单.
  - VSTO表单可以实现样式复杂的页面需求，通过Excel的展示方式，可以实现复杂的科学计算法。
  - 前端操作依赖于本机的excel系统，从网页上点击启动本机的excel程序，加载表单模版与数据，完成表单的展现。  
  #### 图例1
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/VSTO-Excel.png "表格模式")  
  `;

  public readonly FoolForm = `

  #### 帮助
   - 视频教程: https://drive.weixin.qq.com/s?k=AOsAZQczAAY9NtLjEw
   - 设计方便，界面简洁清晰。
   - 字段的顺序可以通过拖拽实现移动,通过栅栏格来布局界面元素。
   - 可以通过定义文本属性来体现不同控件的展示要求（文本，单选，多选，定位，评分，多附件，地图，身份证识别等）满足表单要求。
 
  #### 图例1
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FoolFrmD.png "屏幕截图.png")
   
  #### 图例2
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FoolFrmD2.png "屏幕截图.png")
   
  `;

  public readonly Developer = `
  #### 帮助
   - 支持编写js,Html模式，使用富文本编辑器开发.
  #### 样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/kaifaze.png "屏幕截图.png")
  `;
}
