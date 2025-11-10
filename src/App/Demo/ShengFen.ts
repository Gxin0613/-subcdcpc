import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';

// 省份
export class ShengFen extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.ShengFen');
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
    const map = new Map('Demo_ShengFen', '省份');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
}

//省份s
export class ShengFens extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new ShengFen();
  }
  constructor() {
    super();
  }
}
