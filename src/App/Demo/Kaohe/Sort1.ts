import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';

// 考核大类
export class Sort1 extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.Sort1');
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
    const map = new Map('Demo_Sort1', '考核大类');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
}

//考核大类s
export class Sort1s extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Sort1();
  }
  constructor() {
    super();
  }
}
