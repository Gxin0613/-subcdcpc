import { MapExt } from '../../MapExt';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GloWF } from '../../../GloWF';

export class GPN_FullDataDDL extends PageBaseGroupNew {
  constructor() {
    super('GPN_FullDataDDL');
    this.ForEntityClassID = 'TS.MapExt.FullDataDDL';
    this.PageTitle = '选择下拉框';
  }

  public async Init() {
    this.PageTitle = '选择下拉框';
    //获取外部DtlSearch传来的参数.
    const pkVal = this.RequestVal('RefPKVal');
    const mapExt = new MapExt(pkVal);
    await mapExt.Retrieve();
    this.AddGroup('A', '选择下拉框'); //增加分组.
    //const sql = `SELECT KeyOfEn as No,Name  FROM Sys_mapAttr WHERE FK_MapData='` + mapExt.FK_MapData + "' AND ( UIContralType=1 or UIContralType=2) ";
    this.SelectItemsByList('SelectDDL', '选择下拉框', this.Docs1, false, GloWF.SQLOfSelectDDL(mapExt.FK_MapData));
    //this.SelectItemsByList('SelectDDL.FullWay', '选择方式', this.Docs1, false, DataType.TurnEnumStrToAttr('@2=新版数据源2025@0=自定义模式(废)@1=绑定字典表(废)'));
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  // 经典表单说明
  public readonly Docs1 = `
  #### 帮助 
   - 当选择的值变化后，需要填充从表的数据源.
        `;

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    if (pageNo === 'SelectDDL') {
      //获取外部DtlSearch传来的参数.
      const pkVal = this.RequestVal('RefPKVal');
      const en = new MapExt(pkVal);
      await en.Retrieve();

      const mapExtDDL = new MapExt();
      mapExtDDL.MyPK = en.MyPK + '_' + tb1;
      if ((await mapExtDDL.IsExits()) == true) {
        alert('填充的下拉框已存在,您可以删除掉重新创建..');
        return null;
      }

      mapExtDDL.FK_MapData = en.FK_MapData;
      mapExtDDL.AttrOfOper = en.AttrOfOper;
      mapExtDDL.ExtModel = 'FullDataDDL';
      mapExtDDL.ExtType = 'FullDataDDL';
      mapExtDDL.RefPKVal = en.MyPK; //从表的关联pk.
      mapExtDDL.Tag1 = tb1; // this.RequestVal('tb1', 'SelectDDL'); //从表表单ID
      mapExtDDL.Tag2 = tb2; // this.RequestVal('tb2', 'SelectDDL'); //从表表单名称.
      mapExtDDL.SetPara('EnName', 'TS.MapExt.FullDDL2025');
      await mapExtDDL.DirectInsert();

      const url = GloComm.UrlEn(mapExtDDL.GetParaString('EnName', ''), mapExtDDL.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }
}
