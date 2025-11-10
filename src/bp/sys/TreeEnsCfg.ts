import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';

/// <summary>
/// 组件展现设置
/// </summary>
export class TreeEnsCfg extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Sys.TreeEnsCfg');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_EnCfg', '组件展现设置');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 60);
    map.AddTBString('Name', null, '实体名称', true, false, 0, 30, 60, true);
    map.AddTBString('Icon', null, '树的Icon', true, false, 0, 30, 60, true);

    this._enMap = map;
    return this._enMap;
  }
}
