import { TBFullCtrl1 } from './TBFullCtrl1';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { TBFullCtrl2 } from './TBFullCtrl2';
import { MapExt, MapExtAttr } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MENoNameP1 } from '../SFTable/MENoNameP1';

export class GPE_TBFullCtrl extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (btnName == '字典维护') {
      const url = GloComm.UrlSearch('TS.FrmUI.SFTable');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnName === '落值填充' || btnName === '填充') {
      const url = GloComm.UrlEn('TS.MapExt.FullData', this.entity?.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
      // const url = '/#/WF/Comm/En?EnName=TS.MapExt.FullData&PKVal=' +;
      //return url;
    }
  }
  constructor() {
    super('GPE_TBFullCtrl');
    this.PageTitle = '文本框自动完成';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段.

    //初始化数据.
    await this.entity.InitDataForMapAttr('TBFullCtrl', this.GetRequestVal('PKVal'), 'None');
    // this.Btns = '落值填充';

    this.Btns = [
      { pageNo: 'Simple', list: ['填充'] },
      { pageNo: 'Table', list: ['填充'] },
      {
        pageNo: 'SimpleSFTable',
        list: ['填充', '字典维护'],
      },
      {
        pageNo: 'TableSFTable',
        list: ['填充', '字典维护'],
      },
    ];

    //给他初始化数据.
    await this.entity.InitDataForMapAttr('TBFullCtrl', this.GetRequestVal('PKVal'), 'None');

    //增加子页面.
    this.AddGroup('A', '文本框自动完成'); //增加分组.
    this.AddEntity('Simple', '简洁模式', new TBFullCtrl1(), this.Desc1);

    this.AddEntity('Table', '表格模式', new TBFullCtrl2(), this.Desc2);

    this.AddEntity('SimpleSFTable', '简洁模式(字典表)', new MENoNameP1(), this.Desc1);
    this.AddEntity('TableSFTable', '表格模式(字典表)', new MENoNameP1(), this.Desc2);
    this.Blank('None', '禁用', this.Desc0);
  }

  public readonly Desc0 = `
  #### 帮助
  - 禁用：不启用.
  - 文本框的自动完成，就是在文本框输入的时候，输入特定的关键字就可以搜索到要填写的内容.
  - 比如：人员输入、药品输入.
  - 分为：简洁模式与表格模式两种.
  #### 效果图
   - 简洁模式 
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/TBFullCtrl/Simple.png "屏幕截图.png")

  #### 效果图
   -  表格模式
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/TBFullCtrl/Simple1.png "屏幕截图.png")

  `;
  public readonly Desc1 = `
  #### 帮助
   - 填充SQL帮助
   1. 设置一个查询的SQL语句，该SQL必须包含 No, Name 列, 用与展示快速补全的部分。
   1. 该SQL必须包含 @Key 关键字，@Key 输入文本框的值.
   1. SQL返回的列与其他字段名称保持一致，就可以完成控件数据的自动填充。
   1. 比如: SELECT No,Name FROM WF_Emp WHERE No LIKE '%@Key%'
   1. 为防止URL编码规定like的第一个%写成[%],如果like '%@Key%' 写成'[%]@Key%'
   - 填充Url帮助
   1. 设置URL，返回的必须是json格式。
   1. 比如: /App/Handler.ashx?DoType=Emps&Key=@Key
   1. @Key 是输入的关键字

  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/TBFullCtrl/SimplePeizhi.png "配置说明")

  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/TBFullCtrl/Simple.png "配置说明")
  `;
  public readonly Desc2 = `
  #### 帮助
   - 填充SQL帮助
  1. 设置一个查询的SQL语句，该SQL必须包含 No, Name 列, 用与展示快速补全的部分。
  1. 该SQL必须包含 @Key 关键字，@Key 输入文本框的值.
  1. SQL返回的列与其他字段名称保持一致，就可以完成控件数据的自动填充。
  1. 比如:SELECT No,Name,Name as CaoZuoYuanMingCheng,Tel as DianHua,Email,FK_Dept FROM WF_Emp WHERE No LIKE '%@Key%'
  1. 为防止URL编码规定like的第一个%写成[%],如果like '%@Key%' 写成'[%]@Key%'

  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/TBFullCtrl/SimplePeizhi1.png "配置说明")
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/TBFullCtrl/Simple1.png "配置说明")
  `;
}
