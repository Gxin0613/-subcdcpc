import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 集合方法
export class DBRole extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.DBRole');
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
    map.AddTBString('Docs', null, '控制内容1', false, false, 0, 5000, 120, true);

    map.AddTBString('DocsT', null, '控制内容1', true, true, 0, 5000, 120, true);
    map.AddTBString('ObjsT', null, '控制内容2', true, true, 0, 5000, 120, true);

    //是否启用？
    map.AddBoolean('IsEnable', true, '启用?', true, true, true);
    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
}

//集合方法s
export class DBRoles extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new DBRole();
  }
  constructor() {
    super();
  }
}
