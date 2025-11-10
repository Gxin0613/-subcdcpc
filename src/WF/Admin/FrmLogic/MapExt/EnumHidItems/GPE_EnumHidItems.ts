import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapExt, MapExtAttr } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { EnumHidItem } from './EnumHidItem';

export class GPE_EnumHidItems extends PageBaseGroupEdit {
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
    super('GPE_EnumHidItems');
    this.PageTitle = '点击事件隐藏选项';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段.

    // //初始化数据.
    // await this.entity.InitDataForMapAttr('EnumHidItems', this.GetRequestVal('PKVal'));
    // this.Btns = '落值填充';
    // this.Btns = [
    //   { pageNo: 'Simple', list: ['填充'] },
    //   { pageNo: 'Table', list: ['填充'] },
    //   { pageNo: 'SimpleSFTable', list: ['填充', '字典维护'] },
    //   { pageNo: 'TableSFTable', list: ['填充', '字典维护'] },
    // ];

    //给他初始化数据.
    await this.entity.InitDataForMapAttr('EnumHidItems', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '点击事件隐藏选项'); //增加分组.
    this.Blank('0', '禁用', this.Desc0);
    this.AddEntity('1', '启用', new EnumHidItem(), this.Desc1);
  }

  public readonly Desc0 = `
  #### 帮助
  - 禁用：不启用.
  `;
  public readonly Desc1 = `
  #### 说明
   - 设置格式
   - @0=1,2,3
   - @1=4,5
   - 标识当选项是0的时候,枚举值隐藏1,2,3 当选项=1的时候，隐藏4,5.
   #### 枚举值
   - 请打开枚举库查看, 对应的IntKey.
   - 也可以通过,select * from sys_enum WHERE EnumKey='xxxxx' 查看 枚举的键值.
  `;
}
