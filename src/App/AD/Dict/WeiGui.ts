import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';

// 违规条款
export class WeiGui extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.AD.WeiGui');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    if (WebUser.No === 'admin') {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    } else {
      uac.IsUpdate = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('AD_WeiGui', '违规条款');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 30, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddTBString('YiJu', null, '依据', true, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }
}

//违规条款s
export class WeiGuis extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new WeiGui();
  }
  constructor() {
    super();
  }
}
