import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrcAttr } from './SFDBSrc';
import BSEntity from '/@/utils/gener/BSEntity';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import { SFTables } from '../SFTable/SFTable';
import { SFSearchs } from '../SFSearch/SFSearch';
import { SFProcs } from '../SFProc/SFProc';
import { GPN_SFTableSQL } from '../SFTable/db/GPN_SFTableSQL';
import { SysEnumMains } from '../SysEnum/SysEnumMain';

// 数据源
export class SFDBSrcLocal extends EntityNoName {
  constructor(no?: string) {
    super('TS.Sys.SFDBSrcLocal');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Sys_SFDBSrc', '本机数据源');
    map.AddTBStringPK(SFDBSrcAttr.No, null, '编号', true, true, 1, 20, 20);
    map.AddTBString(SFDBSrcAttr.Name, null, '名称', true, false, 0, 30, 20);

    // 注意:这里不要加维护信息，所有维护信息在 TreeEns_DBSrc进行, 避免不一致.

    this._enMap = map;
    return this._enMap;
  }
}
