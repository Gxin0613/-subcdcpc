import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { MapDtlAttr } from './MapDtl';
import { MapAttrLangs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttrLang';

// 从表
export class MapDtlLang extends EntityNoName {
  constructor(no?: string) {
    super('TS.Frm.MapDtlLang');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapDtl', '明细');
    map.AddTBStringPK(MapDtlAttr.No, null, '编号', false, false, 1, 100, 150);
    map.AddTBString(MapDtlAttr.Name, null, '中文', true, false, 1, 200, 150);
    map.AddLang();
    map.AddTBString(MapDtlAttr.FK_MapData, null, '主表', false, false, 0, 100, 20);
    map.AddRM_DtlBatch('字段', new MapAttrLangs(), 'FK_MapData', '', '', 'icon-drop', 'UIVisible=1');

    this._enMap = map;
    return this._enMap;
  }
}

//从表s
export class MapDtlLangs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MapDtlLang();
  }
  constructor() {
    super();
  }
}
