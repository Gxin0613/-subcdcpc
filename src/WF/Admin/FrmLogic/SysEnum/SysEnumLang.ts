import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';

// 枚举
export class SysEnumLang extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Sys.SysEnumLang');
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map(GloWF.SysEnum(), '枚举');

    map.AddMyPK();
    map.AddTBString('EnumKey', null, '枚举值', false, false, 1, 100, 100);
    map.AddTBString('StrKey', null, '值', false, false, 1, 100, 100);
    map.AddTBString('Lab', null, '标签', true, false, 1, 300, 200);
    map.AddLang(); //增加
    map.AddTBString('RefPK', null, 'RefPK', false, false, 0, 50, 8);
    this._enMap = map;
    return this._enMap;
  }
}

//枚举s
export class SysEnumLangs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SysEnumLang();
  }

  constructor() {
    super();
  }
}
