import { GloWF } from '../../GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr } from '/@/WF/TSClass/Node';

export class GPE_FrmPos extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmPos');
    this.PageTitle = '表单引用';
   // this.Btns = '帮助';
  }

  Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = 'NodeFrmRef'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '引用位置'); //增加分组.
    this.Blank('0', '当前节点表单', this.DescCurrentFrm);
    this.SelectItemsByList('1', '引用其他节点表单', this.DescEtc, false, GloWF.sqlNodeFrmList, NodeAttr.NodeFrmID);
    // this.Blank('2', '与上一个节点相同', this.DescPri);
  }
  public async AfterSave(pageID: string, pageVal: any) {
    //   alert(this.RefPKVal);
    //  alert(this.PKVal + '' + pageID);
    if (pageID === '0') {
      const nd = new Node();
      nd.NodeID = this.PKVal;
      await nd.Retrieve();
      nd.NodeFrmID = '';
      // if (pageID === '1') nd.NodeFrmID = 'ND' + nd.NodeFrmID;
      await nd.Update();
    }

    // if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly DescCurrentFrm = `
  #### 说明
   - 是使用当前节点的表单.
  `;

  public readonly DescEtc = `
  #### 帮助
   - 支持编写js,Html模式，使用富文本编辑器开发.
  #### 样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/kaifaze.png "屏幕截图.png")
  
  `;

  public readonly DescPri = `
  #### 帮助
   - 支持编写js,Html模式，使用富文本编辑器开发.
  #### 样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/kaifaze.png "屏幕截图.png")
  
  `;
}
