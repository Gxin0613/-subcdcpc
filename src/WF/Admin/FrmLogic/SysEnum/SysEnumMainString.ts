import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';
import { SysEnumMainAttr } from './SysEnumMain';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';

// 枚举
export class SysEnumMainString extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SysEnumMainString');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    if (WebUser.IsAdmin == true) {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
      return uac;
    }
    uac.IsView = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_EnumMain', '枚举值String');
    map.AddTBStringPK(SysEnumMainAttr.No, null, '编号', true, true, 1, 190, 150);
    map.AddTBString(SysEnumMainAttr.Name, null, '名称', true, false, 0, 200, 200);
    if (SystemConfig.CCBPMRunModel == CCBPMRunModel.GroupInc) map.AddBoolean('IsShare', true, '是否共享给其他组织?', true, true);

    map.AddTBString(SysEnumMainAttr.CfgVal, null, '配置信息', false, false, 0, 1500, 400);
    //枚举值.
    map.AddTBString(SysEnumMainAttr.EnumKey, null, 'EnumKey', false, false, 0, 40, 150);

    for (let index = 0; index < 30; index++) {
      map.AddTBString('Idx' + index, null, '枚举键', true, false, 0, 100, 400, true);
      map.AddTBString('Val' + index, null, '枚举值', true, false, 0, 100, 400);
    }

    this._enMap = map;
    return this._enMap;
  }
}
