import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFTableAttr } from './SFTable';

// JS字典表
export class SFTableJS extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableJS');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFTable', 'JS字典表');

    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 200, 20);
    map.AddTBString(SFTableAttr.Name, null, '名称', true, false, 0, 200, 20);

    this._enMap = map;
    return this._enMap;
  }
}

//JS字典表 s
export class SFTableJSs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableJS();
  }
  constructor() {
    super();
  }
}
