import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 集合方法
export class DBRoleExp extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.DBRoleExp');
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

    map.AddTBString('Docs', null, '表达式', true, false, 0, 500, 10, true, null);
    map.SetHelperAlert('Docs', "请输入表达式，例如1:  xxx='@WebUser.No'  ，例如2:  xxx='@WebUser.No'  AND YY='abc'  ");

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
