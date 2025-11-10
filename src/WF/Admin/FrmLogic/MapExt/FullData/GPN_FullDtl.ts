import { GloWF } from '../../../GloWF';
import { MapExt } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_FullDtl extends PageBaseGroupNew {
  constructor() {
    super('GPN_FullDtl');
    this.ForEntityClassID = 'TS.MapExt.FullDtl';
    this.PageTitle = '选择从表';
  }

  public async Init() {
    //获得DtlSearch 新建时传来的参数.
    const pkVal = this.RequestVal('RefPKVal');
    const mapExt = new MapExt(pkVal);
    await mapExt.Retrieve();

    //增加子页面.
    this.AddGroup('A', '选择从表'); //增加分组.
    this.SelectItemsByList('SelectDtl', '选择从表', this.Docs1, false, GloWF.SQLOfDtls(mapExt.FK_MapData));
  }
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  // 经典表单说明
  public readonly Docs1 = `
  #### 帮助 
   - 选择您要填充的从表.
  `;

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    if (pageNo === 'SelectDtl') {
      //获取外部DtlSearch传来的参数.
      const pkVal = this.RequestVal('RefPKVal');
      const en = new MapExt(pkVal);
      await en.Retrieve();

      const mapExtDtl = new MapExt();
      mapExtDtl.MyPK = en.MyPK + '_' + tb1;
      if ((await mapExtDtl.IsExits()) == true) {
        alert('从表已存在,您可以删除掉重新创建..');
        return null;
      }

      mapExtDtl.FK_MapData = en.FK_MapData;
      mapExtDtl.AttrOfOper = en.AttrOfOper;
      mapExtDtl.ExtModel = 'FullDataDtl';
      mapExtDtl.ExtType = 'FullDataDtl';
      mapExtDtl.RefPKVal = en.MyPK; //从表的关联pk.
      mapExtDtl.Tag1 = tb1; // this.RequestVal('tb1', 'SelectDtl'); //从表表单ID
      mapExtDtl.Tag2 = _tb2; //this.RequestVal('tb2', 'SelectDtl'); //从表表单名称.

      mapExtDtl.SetPara('EnName', 'TS.MapExt.FullDtl2025');
      mapExtDtl.DoWay = 'DB2025';
      await mapExtDtl.DirectInsert();

      const url = GloComm.UrlEn(mapExtDtl.GetParaString('EnName', ''), mapExtDtl.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }
}
