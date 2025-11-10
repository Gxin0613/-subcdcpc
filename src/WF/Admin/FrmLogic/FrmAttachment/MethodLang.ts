import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';

// 方法
export class MethodLang extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.FrmUI.MethodLang');
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_Method', '方法');

    map.AddTBStringPK('No', null, '编号', false, false, 0, 150, 150);
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 200, 150);
    map.AddTBString('Name', null, '标签', true, false, 0, 500, 500, true);
    map.AddLang();

    this._enMap = map;
    return this._enMap;
  }
}

//方法s
export class MethodLangs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MethodLang();
  }
  constructor() {
    super();
  }
}
