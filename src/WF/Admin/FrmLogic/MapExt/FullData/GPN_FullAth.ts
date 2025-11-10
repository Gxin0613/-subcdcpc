import { GloWF } from '../../../GloWF';
import { MapExt } from '../../MapExt';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
export class GPN_FullAth extends PageBaseGroupNew {
  constructor() {
    super('GPN_FullAth');
    this.ForEntityClassID = 'TS.MapExt.FullAth';
    this.PageTitle = '选择附件';
  }

  public async Init() {
    //获得DtlSearch 新建时传来的参数.
    const pkVal = this.RequestVal('RefPKVal');
    const mapExt = new MapExt(pkVal);
    await mapExt.Retrieve();

    //增加子页面.
    this.AddGroup('A', '选择附件'); //增加分组.
    this.SelectItemsByList('SelectAth', '选择附件', this.Docs1, false, GloWF.SQLOfFullAth(mapExt.FK_MapData));
  }
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  // 经典表单说明
  public readonly Docs1 = `
  #### 帮助 
   - 选择您要填充的从表.
  `;
  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    if (pageNo === 'SelectAth') {
      //获取外部DtlSearch传来的参数.
      const pkVal = this.RequestVal('RefPKVal');
      const en = new MapExt(pkVal);
      await en.Retrieve();

      const mapExtAth = new MapExt();
      mapExtAth.MyPK = en.MyPK + '_' + tb1;
      if ((await mapExtAth.IsExits()) == true) {
        return null;
      }

      mapExtAth.FK_MapData = en.FK_MapData;
      mapExtAth.AttrOfOper = en.AttrOfOper;
      mapExtAth.ExtModel = 'FullDataAth';
      mapExtAth.ExtType = 'FullDataAth';
      mapExtAth.RefPKVal = en.MyPK; //从表的关联pk.
      mapExtAth.Tag1 = tb1; // this.RequestVal('tb1', 'SelectAth'); //附件NoOfObj
      mapExtAth.Tag2 = tb2; // this.RequestVal('tb2', 'SelectAth'); //附件名称.

      mapExtAth.SetPara('EnName', 'TS.MapExt.FullAth2025');
      mapExtAth.DoWay = 'DB2025';
      await mapExtAth.DirectInsert();

      const url = GloComm.UrlEn(mapExtAth.GetParaString('EnName', ''), mapExtAth.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }
}
