import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';

// 集合方法
export class DBRoleDept extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.DBRoleDept');
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
    const map = new Map('Frm_DBRole', '部门权限');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString('DBRole', 'DBList', '规则', false, false, 0, 300, 10);

    map.AddTBString('MarkID', null, '权限标记', true, true, 0, 50, 60, true);
    map.AddTBString('MarkName', null, '权限标记', true, true, 0, 50, 60, true);

    map.AddTBString('Docs', null, '部门', true, false, 0, 5000, 10, true, null);
    map.SetPopTree('Docs', GloWF.srcDepts, GloWF.srcDeptRoot, true, '600px', '500px', '选择部门', 'icon-people');
    //map.AddTBString('Stats', null, '岗位编号', true);
    //是否启用？
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
}

//集合方法s
export class DBRoleDepts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new DBRoleDept();
  }
  constructor() {
    super();
  }
}
