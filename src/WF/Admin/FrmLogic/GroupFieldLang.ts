import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesOID, EntityOID } from '/@/bp/en/EntityOID';
import { GroupFieldAttr } from './GroupField';

// SQL模板属性
export class GroupFieldLang extends EntityOID {
  constructor(pkval?: number) {
    super('TS.FrmUI.GroupFieldLang');
    if (!!pkval) this.OID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_GroupField', '分组容器');

    map.AddTBIntPKOID();
    map.AddTBString(GroupFieldAttr.Lab, null, '中文', true, false, 0, 500, 150, false);
    map.AddLang();
    map.AddTBString(GroupFieldAttr.FrmID, null, '表单ID', false, false, 0, 200, 20);

    this._enMap = map;
    return this._enMap;
  }
}

// 表单注册s
export class GroupFieldLangs extends EntitiesOID {
  get GetNewEntity(): EntityOID {
    return new GroupFieldLang();
  }
  constructor() {
    super();
  }
}
