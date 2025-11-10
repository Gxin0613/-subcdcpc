import { MapExt, MapExtAttr } from '../../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FastInput extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FastInput');
    this.PageTitle = '快速录入';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = 'DoWay'; //要修改的字段.
    //初始化数据.
    await this.entity.InitDataForMapAttr('FastInput', this.GetRequestVal('PKVal'), '0');

    //增加子页面.
    this.AddGroup('A', '快速录入'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    this.SingleTextArea('1', '启用快速录入', MapExtAttr.Doc, '@同意', this.Desc1);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc0 = ` 

  #### 帮助
  - 快速录入是为了解决重复数据相同内容的填写。
  - 能够减轻输入人员的劳动，并大幅度提高使用体验。
  - 快速录入是对用户可能要输入的内容，预先存储到数据库中，在用户录入的时候进行选择。
  - 比如：审核意见、 法律法规、请假原因
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/FastInput/Img/FastInput.png "屏幕截图.png")

   `;

  public readonly Desc1 = ` 
  #### 帮助
   - 快速输入内容，多行用@分开。
  #### 配置图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/FastInput/Img/FastInputPeizhi.png "屏幕截图.png")
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/FastInput/Img/FastInput.png "屏幕截图.png")

  
   `;
}
