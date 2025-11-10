import { GloWF } from '../../../GloWF';
import { MapExt, MapExtAttr } from '../../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { PageLoadFull } from '/@/WF/Admin/FrmLogic/MapData/PageLoadFull/PageLoadFull';

export class GPE_PageLoadFullDtl extends PageBaseGroupEdit {
  constructor() {
    super('GPE_PageLoadFullDtl');
    this.PageTitle = '装载填充从表';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.
    await this.entity.InitDataForMapAttr('PageLoadFullDtl', this.GetRequestVal('PKVal'));

    this.AddGroup('A', '装载填充'); //增加分组.
    this.Blank('None', '不设置(默认)', this.Desc0);
    this.AddEntity('Self', '按SQL填充', new PageLoadFull(), this.Desc1);
    this.SelectItemsByGroupList('SFTable', '按照查询填充', this.HelpUn, false, GloWF.srcDBSrc, GloWF.srcDBSFSearch, 'Doc');

    //this.SingleTBSQL('1', '设置从表填充', MapExtAttr.Doc, this.Desc1);
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
   - 不设置(默认)：不对从表数据进行填充。
   - 设置从表填充：返回一个数据源，该数据源的列，需要与从表的列匹配，对于匹配上的数据自动填充。
  
  `;

  public readonly Desc1 = `
  #### 帮助
   - 填充从表的SQL。
   - 返回一个数据源，该数据源的列，需要与从表的列匹配，对于匹配上的数据自动填充。
   - 实例:SELECT Name as MingCheng, Tel as DianHua, Email FROM WF_EMP
   - MingCheng 是表单的字段名
   - 这个数据源就会清空的方式复制到从表里面去。
  `;
}
