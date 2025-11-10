import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { LinkAttr } from '../ReadOnlyLink/LinkAttr';

export class GPE_FieldNameLink extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FieldNameLink');
    this.PageTitle = '字段名链接';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //初始化数据.
    await this.entity.InitDataForMapAttr('FieldNameLink', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '字段名链接'); //增加分组.
    this.Blank('0', '禁用', this.Desc0);
    this.SingleTextArea('HelpInfo', '弹出帮助信息', MapExtAttr.Doc, '请按照格式输入内容', this.HelpInfo);
    this.SingleTextArea('HelpSQL', '弹出SQL查询', MapExtAttr.Doc, '请按照格式输入内容', this.HelpInfo);

    this.SingleTB('UrlRightOpen', '侧滑弹出url', MapExtAttr.Doc, this.UrlRightOpen, '请输入url');
    this.AddEntity('UrlOpen', '模态弹窗', new LinkAttr(), this.UrlRightOpen, '');
    this.AddEntity('UrlWinOpen', '新窗口弹出url', new LinkAttr(), this.UrlRightOpen, '');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
  - 定义: 对输入的字段进行详尽的描述，文字特别多，就需要此功能.
  - 比如: 项目申报流程中，对项目的预期效益进行描述.
  #### 效果图
  - 暂无
  `;
  public readonly HelpInfo = `
  #### 帮助 
  - 请输入该字段的详细描述信息.
  - 支持markdown 语法, 支持html.
  #### 图例
  - 暂无
  #### 运行图
  - 暂无
  `;
  public readonly UrlRightOpen = `
  #### 帮助 
  - 请输入该字段的详细描述信息.
  - 格式: http://11.112.11.2/xx.do?DoType=xx&JinE=@JinE&BianHao=@BillNo
  - 解析后的格式: http://11.112.11.2/xx.do?DoType=xx&JinE=123.99&BianHao=100-02
  - 解析说明, @BillNo,@JinE 就是字段名. 解析的时候，会把字段名替换掉.
  #### 图例
  - 暂无
  #### 运行图
  - 暂无
  `;
}
