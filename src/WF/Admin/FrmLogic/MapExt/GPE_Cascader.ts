import { MapExt } from '../MapExt';
import { TBCascader } from './TBCascader';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPE_Cascader extends PageBaseGroupEdit {
  constructor() {
    super('GPE_Cascader');
    this.PageTitle = '级联选择器';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = 'DoWay'; //要修改的字段.
    //初始化数据.
    await this.entity.InitDataForMapAttr('Cascader', this.GetRequestVal('PKVal'), 'None');

    //增加子页面.
    this.AddGroup('A', '级联选择器'); //增加分组.
    this.Blank('None', '不启用', this.Desc0);
    this.AddEntity('Cascader3', '启用3级级联', new TBCascader(), this.Desc0);
    this.Btns = [{ pageNo: 'Cascader3', list: ['填充'] }];
  }
  public async AfterSave(_pageID: string, _pageVal: any) {
    if (_pageID != 'None') {
      let pkval = this.GetRequestVal('PKVal');
      if (pkval.endsWith('_Cascader')) pkval = pkval.replace('_Cascader', '');
      const en = new MapAttr();
      const mypk = pkval;
      en.setPKVal(pkval + 'T');
      //插入一条对应的T字段
      if ((await en.RetrieveFromDBSources()) == 0) {
        en.setPKVal(mypk);
        await en.RetrieveFromDBSources();
        en.MyPK = en.MyPK + 'T';
        en.KeyOfEn = en.KeyOfEn + 'T';
        en.Name = en.Name + 'T';
        en.UIVisible = false;
        en.UIIsEnable = false;
        await en.Insert();
      }
    }
    if (_pageID == _pageVal) throw new Error('Method not implemented.');
  }

  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {
    if (_btnName === '落值填充' || _btnName === '填充') {
      const url = GloComm.UrlEn('TS.MapExt.FullData', this.entity?.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
  }
  public readonly Desc0 = ` 
  #### 帮助
  - 用于解决三级级联的关系选择,比如：省份、城市、区县
  - 也可以采用级联的模式.
  - 系统的存储类似于pop的有两个字段，一个字段abc, 影子字段abcT。
  - 字段：abc存储的是编号，格式为: 37-29-23 
  - 字段: abcT存储的是名称，格式为: 山东省-菏泽市-定陶区.  这个字段是隐藏字段,由系统自动增加上的.
  #### 效果图
  - ![级联选择器:效果图.](./resource/WF/CCForm/Cascader.png "级联选择器")
  
   `;
}
