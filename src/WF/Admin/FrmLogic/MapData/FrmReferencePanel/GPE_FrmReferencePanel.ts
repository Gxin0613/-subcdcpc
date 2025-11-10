import { MapExt, MapExtAttr } from '../../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FrmReferencePanel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmReferencePanel');
    this.PageTitle = '参考面板';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段.
    //多选.
    await this.entity.InitDataForMapData('FrmReferencePanel', this.GetRequestVal('PKVal'), 'None');

    this.AddGroup('A', '静态展示'); //增加分组.
    this.Blank('None', '禁用', this.Desc0);
    this.SingleTextArea('Html', '静态Html脚本', MapExtAttr.Doc, '请输入html内容', this.Desc1);
    this.SingleTB('Url', '静态框架Url', MapExtAttr.Doc, this.Desc1, '请输入url.');
    this.AddGroup('B', '动态展示'); //增加分组.
    this.SingleTB('ActiveUrl', '动态Url', MapExtAttr.Doc, this.Desc1, '请输入url.');
    this.SingleTB('ActiveHtml', '动态Html脚本', MapExtAttr.Doc, this.Desc1, '请输入html内容.');
  }

  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }

  public AfterSave(pageID: string) {
    if (pageID == '0') {
    }
    //throw new Error("Method not implemented.");
  }

  public readonly Desc0 = `
  #### 帮助
   - 用户在录入表单的时候，需要参考一些数据，这些数据在其他系统里，为了方便客户能查看到这些数据，就可以需要使用这个自定义面板。
   - 参考面板就是为了获取其他系统与当前表单相关联的数据而设计的。
  `;

  public readonly Desc1 = `
  #### 帮助
   - 输入HTML内容
  `;
}
