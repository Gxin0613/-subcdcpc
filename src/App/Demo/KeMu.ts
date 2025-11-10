/// 科目 属性
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

// 科目
export class KeMu extends EntityNoName {
  constructor(no?: string) {
    super('TS.Demo.KeMu');
    if (!!no) {
      this.setPKVal(no);
    }
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
    const map = new Map('Demo_KeMu', '科目');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }

  protected override beforeInsert(): Promise<boolean> {
    //if (!this.No) this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

// 科目s
export class KeMus extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new KeMu();
  }
  constructor() {
    super();
  }
}
