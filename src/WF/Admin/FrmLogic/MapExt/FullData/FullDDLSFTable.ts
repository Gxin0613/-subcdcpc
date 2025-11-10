import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFColumnSlns } from '../../SFSearch/SFColumnSln';
import { SFSearch } from '../../SFSearch/SFSearch';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GloWF } from '../../../GloWF';
/// <summary>
/// 填充从表
/// </summary>
export class FullDDLSFTable extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullDDLSFTable');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '填充从表');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '从表ID', false, false, 0, 150, 150, false);

    map.AddTBString(MapExtAttr.Tag1, null, '外键ID', true, true, 0, 150, 150, false);
    map.AddTBString(MapExtAttr.Tag2, null, '外键名称', true, true, 0, 150, 150, false);

    //const sql = `SELECT No, Name FROM Sys_SFTable WHERE IsPara=1 or IsPara=0 `;
    map.AddDDLSQL('Doc', null, '查询(1个参数)', GloWF.SQLOfFullDDL, true, null, true);
    // map.AddTBString(MapExtAttr.Doc, null, '表达式', true, true, 0, 10, 300, true, this.help);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const search = new SFSearch();
    search.No = this.Doc;
    const num = await search.RetrieveFromDBSources();
    if (num == 0) return Promise.resolve(true);
    await search.AddSln(this.MyPK, this.Tag1);

    return Promise.resolve(true);
  }
  public readonly help = `
  #### 帮助
  - 输入一个数据源，返回一个数据集合，列名与从表的列名对应就可以自动填充.
  `;
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 填充从表s
 */
export class FullDtlSFTables extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FullDtlSFTable();
  }
  constructor() {
    super();
  }
}
