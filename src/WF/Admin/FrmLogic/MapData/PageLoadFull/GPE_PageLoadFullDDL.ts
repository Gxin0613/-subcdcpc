import { MapExt, MapExtAttr } from '../../MapExt';
import { MENoNameP0 } from '../../MapExt/SFTable/MENoNameP0';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPE_PageLoadFullDDL extends PageBaseGroupEdit {
  constructor() {
    super('GPE_PageLoadFullDDL');
    this.PageTitle = '装载填充';
    // this.AddEntity("1", "设置填充", new PageLoadFullEn1());
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    this.Btns = [{ pageNo: '2', list: ['字典维护'] }];

    //给他初始化数据.
    await this.entity.InitDataForMapAttr('PageLoadFullDDL', this.GetRequestVal('PKVal'), '0');

    this.AddGroup('A', '装载填充'); //增加分组.
    this.Blank('0', '不设置(默认)', this.Desc0);
    this.SingleTBSQL('1', '自定义填充', MapExtAttr.Doc, this.Desc1);
    this.AddEntity('2', '绑定字典填充', new MENoNameP0(), this.Desc1);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }

    if (btnName == '字典维护') {
      const url = GloComm.UrlSearch('TS.FrmUI.SFTable');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
  }

  public AfterSave(pageID: string) {
    if (pageID == '0') {
    }
    //throw new Error("Method not implemented.");
  }

  public readonly Desc0 = `
 
  #### 帮助
   - 不设置(默认)：不对主表数据进行填充。
   - 设置下拉框填充：返回一个数据源用来填充下拉框，该行里必须有No,Name两个字段 No就是下拉框的值，Name就是下拉框的标签。
  
  `;

  public readonly Desc1 = `
  #### 帮助
   - 填充下拉框的SQL。
   - 返回一个数据源用来填充下拉框，该行里必须有No,Name两个字段 No就是下拉框的值，Name就是下拉框的标签。
   - 实例(选择的人员的角色下拉框)： SELECT B.FK_Station AS No, A.Name FROM Port_Station A, Port_DeptEmpStation B WHERE B.FK_Emp='@Key' AND B.Station=A.No
   - @Key 系统约定的选择的编号。
  `;
}
