import { MapExt } from '../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FieldFormat extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FieldFormat');
    this.PageTitle = '字段格式';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = 'DoWay'; //要修改的字段.
    //初始化数据.
    await this.entity.InitDataForMapAttr('FieldFormat', this.GetRequestVal('PKVal'), 'None');

    //增加子页面.
    this.AddGroup('A', '字段格式'); //增加分组.
    this.Blank('None', '不启用', this.Desc0);
    this.Blank('Tel', '电话-启动电话链接(移动端)', this.Desc0);
    this.Blank('Email', '邮件-启动邮件程序', this.Desc0);
    this.Blank('Addr', '地址-打开导航', this.Desc0);
    this.Blank('Calendar', '事件-加入到日历', this.Desc0);
    this.Blank('KeyWords', '关键字输入', this.Desc0);
  }
  public AfterSave(_pageID: string, _pageVal: any) {}
  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {}
  public readonly Desc0 = ` 
  #### 定义
  - 字段格式是指输入的格式与呈现的格式.
  - 输入格式: 在文本输入的时候,用特定的风格固定的格式. 比如:身份证格式、关键字格式。
  - 呈现格式: 在只读的模式下,呈现出来的样式,比如:电话、邮件、地址、事件点击以后能够呈现出来的效果.
  - 电话格式:移动端点击的时候直接启动电话.
  - 邮件: 点击的时候启动邮件程序.
  - 地址:移动端点击的时候弹出地址导航。
  - 事件:弹出日历.
  - 关键字: 输入的时候呈现 气泡文字.
   `;
}
