import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 集合方法
export class RecReadonly extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.RecReadonly');
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
    const map = new Map('Frm_DBRole', '数据权限');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 300, 10);
    //DBList=记录查询权限, RecReadonly=记录只读权限, RedDelete记录删除权限.
    map.AddTBString('DBRole', null, '规则', false, false, 0, 300, 10);

    map.AddTBString('MarkID', null, '权限标记', true, true, 0, 50, 100, true);
    map.AddTBString('MarkName', null, '权限标记', true, true, 0, 50, 120, true);
    map.AddTBString('Docs', null, '控制内容', true, true, 0, 50, 120, true);

    //是否启用？
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
}

//集合方法s
export class RecReadonlys extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new RecReadonly();
  }
  constructor() {
    super();
  }
}
