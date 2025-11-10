import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';

// 集合方法
export class RecReadonlySQL extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.RecReadonlySQL');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('Frm_DBRole', '岗位数据权限');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString('MarkID', null, '权限标记', true, true, 0, 50, 60, true);
    map.AddTBString('MarkName', null, '权限标记', true, true, 0, 50, 60, true);

    map.AddTBString('Docs', null, 'SQL表达式', true, false, 0, 500, 10, true, null);
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
}
