import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';
import { ShengFen } from './ShengFen';

// 城市
export class City extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.City');
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
    const map = new Map('Demo_City', '城市');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddDDLEntities('ShengFen', null, '省份', new ShengFen(), true);
    map.AddSearchAttr('ShengFen');
    this._enMap = map;
    return this._enMap;
  }
}

//城市s
export class Citys extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new City();
  }
  constructor() {
    super();
  }
}
