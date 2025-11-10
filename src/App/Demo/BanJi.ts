import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';

// 班级
export class BanJi extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.BanJi');
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
      uac.IsInsert = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_BanJi', '班级');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddTBString('BZR', null, '班主任', true, false, 0, 50, 200);
    map.AddTBString('Tel', null, '电话', true, false, 0, 50, 200);
    map.AddTBString('Addr', null, '地址', true, false, 0, 50, 200);
    // map.AddTBString('Add32r', null, '地32323址', true, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }
}

//班级s
export class BanJis extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new BanJi();
  }
  constructor() {
    super();
  }
}
