import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';

// 集合方法
export class DBRoleEmp extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.DBRoleEmp');
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
    const map = new Map('Frm_DBRole', '人员权限');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString('DBRole', 'DBList', '规则', false, false, 0, 300, 10);

    map.AddTBString('MarkID', null, '权限标记', true, true, 0, 50, 60, true);
    map.AddTBString('MarkName', null, '权限标记', true, true, 0, 50, 60, true);

    map.AddTBString('Docs', null, '人员', true, false, 0, 5000, 10, true, null);
    map.SetPopTreeEns(
      'Docs',
      GloWF.srcDeptLazily,
      GloWF.srcDeptRoot,
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '400px',
      '选择人员',
      'icon-people',
      '1',
      true,
      true,
    );

    //是否启用？
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
}

//集合方法s
export class DBRoleEmps extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new DBRoleEmp();
  }
  constructor() {
    super();
  }
}
