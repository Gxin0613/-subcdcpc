import { MapExt, MapExtAttr } from '../../MapExt';
import { MultipleChoiceSearchEn1 } from './MultipleChoiceSearchEn1';
import { MultipleChoiceSearchEn12025 } from './MultipleChoiceSearchEn12025';
import { MultipleChoiceSearchEn2 } from './MultipleChoiceSearchEn2';
import { MultipleChoiceSearchEn22025 } from './MultipleChoiceSearchEn22025';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';

export class GPE_MultipleChoiceSearch extends PageBaseGroupEdit {
  constructor() {
    super('GPE_MultipleChoiceSearch');
    this.PageTitle = '搜索选择';
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public async AfterSave(pageID: string, pageVal: any) {
    if (pageID != 'None') {
      let pkval = this.GetRequestVal('PKVal');
      if (pkval.endsWith('_MultipleChoiceSearch')) pkval = pkval.replace('_MultipleChoiceSearch', '');
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
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段.
    //多选.
    await this.entity.InitDataForMapAttr('MultipleChoiceSearch', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '搜索选择'); //增加分组.
    this.AddEntity('1', '搜索选择', new MultipleChoiceSearchEn1(), this.Desc1);
    this.AddEntity('1_2025', '搜索选择2025', new MultipleChoiceSearchEn12025(), this.Desc1);

    this.AddEntity('2', '搜索选择+输入多选', new MultipleChoiceSearchEn2(), this.Desc2);

    this.AddEntity('2_2025', '搜索选择+输入多选2025', new MultipleChoiceSearchEn22025(), this.Desc2);

    this.Blank('0', '不设置', this.Desc0);
  }

  public readonly Desc0 = `
  #### 帮助
   - 在配置页面中配置好数据源，那么录入的时候可以根据录入的关键词，搜素出相关的内容。
  #### 应用场景
   - 比如，申请人，申请原因等；
  #### 搜索选择-效果图
  - 搜索选择
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSearch/Img/MultipleChoiceSearch.png "屏幕截图.png")
  #### 搜索+输入多选-效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSearch/Img/MultipleInputSearch.png "屏幕截图.png")
  `;
  public readonly Desc1 = `
  #### 帮助
   - 搜索选择:选择的范围必须是在数据源中.
   - 可以通过关键字，进行搜索数据源的内容.
  #### 配置图
  
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSearch/Img/MultipleChoiceSearchPeizhi.png "数据源配置")
  #### 效果图
  
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSearch/Img/MultipleChoiceSearch.png "运行效果")
  `;
  public readonly Desc2 = `
  #### 帮助
  - 搜索选择+输入多选:选择的范围是数据源中的，也可以是录入的.
  - 可以通过关键字，进行搜索数据源的内容进行选择也可以输入数据.
  #### 配置图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSearch/Img/MultipleChoiceSearchPeizhi2.png "数据源配置")
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSearch/Img/MultipleInputSearch.png "屏幕截图.png")
  `;
}
