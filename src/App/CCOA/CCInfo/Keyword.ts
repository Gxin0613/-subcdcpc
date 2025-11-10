import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { KeywordType } from './KeywordType';

/// 类型
export class Keyword extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CCInfo.Keyword');
    if (!!pkVal) this.setPKVal(pkVal);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('OA_Keyword', '关键字');
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 100);
    map.AddTBString('Name', null, '名称', true, false, 0, 300, 300);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);
    map.AddDDLEntities('WType', null, '类型', new KeywordType(), true);
    map.AddSearchAttr('WType');

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 类型s
 */
export class Keywords extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Keyword();
  }
  constructor() {
    super();
  }
}
