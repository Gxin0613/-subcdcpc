import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { SFDBSrc } from '../../../WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';

// 数据源实体
export class DBListDBSrc extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.DBListDBSrc');
    if (!!pkval) this.No = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '数据源实体');
    map.CodeStruct = '4';

    // #region 基本属性.
    map.AddTBStringPK(MapDataAttr.No, null, '表单编号', true, true, 1, 190, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, true, 1, 190, 20);
    // #endregion 基本属性.

    // #region 数据源.
    map.AddDDLSysEnum(MapDataAttr.DBType, 0, '数据源类型', true, true, 'DBListDBType', '@0=数据库查询SQL@1=执行Url返回Json@2=执行存储过程');
    map.AddDDLEntities(MapDataAttr.DBSrc, null, '数据源', new SFDBSrc(), true);
    map.SetHelperAlert(MapDataAttr.DBSrc, '您可以在系统管理中新建SQL数据源.');
    //  #endregion 数据源.

    this._enMap = map;
    return this._enMap;
  }
}

//数据源实体s
export class DBListDBSrcs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new DBListDBSrc();
  }
  constructor() {
    super();
  }
}
