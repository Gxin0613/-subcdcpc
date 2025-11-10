import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
// 人员
export class SelfCheck extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.SelfCheck');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '自定义审核');

    map.AddTBStringPK('No', null, '账号', false, false, 1, 3, 50);
    map.AddBoolean('IsLoadHistory', true, '是否装在历史设置?', true, true, true);

    map.AddTBAtParas(4000);
    map.ParaFields = ',IsLoadHistory,';

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
