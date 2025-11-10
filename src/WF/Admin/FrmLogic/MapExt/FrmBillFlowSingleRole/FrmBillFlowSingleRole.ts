import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';

/// <summary>
/// 绑定函数
/// </summary>
export class FrmBillFlowSingleRole extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FrmBillFlowSingleRole');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_DBRole', '单据单次流程规则');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 300, 200);
    map.AddTBString('DBRole', null, '规则', false, false, 0, 300, 200);
    map.AddTBString('MarkID', null, '权限标记', true, true, 0, 50, 100, true);
    map.AddTBString('MarkName', null, '标记名称', true, true, 0, 50, 200, true);
    map.AddTBString('Docs', null, '控制内容', true, true, 0, 50, 120, true);

    map.AddTBString('RefPKVal', null, 'RefPKVal', true, true, 0, 50, 120, true);

    //是否启用？
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    map.AddTBAtParas(300);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 绑定函数s
 */
export class FrmBillFlowSingleRoles extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmBillFlowSingleRole();
  }
  constructor() {
    super();
  }
}
