import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';
import { createMethods, createMethodsGroup } from './RoleUtils';

// 集合方法
export class DBRoleShowMethodsDept extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.DBRoleShowMethodsDept');
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
    const map = new Map('Frm_DBRole', '部门数据权限');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString('DBRole', 'DBList', '规则', false, false, 0, 300, 10);

    map.AddTBString('MarkID', null, '权限标记', true, true, 0, 50, 60, true);
    map.AddTBString('MarkName', null, '权限标记', true, true, 0, 50, 60, true);

    map.AddTBString('Docs', null, '部门', true, false, 0, 5000, 10, true, null);
    map.SetPopTree('Docs', GloWF.srcDepts, GloWF.srcDeptRoot, true, '800px', '500px', '选择角色', 'icon-people');

    map.AddTBString('Objs', null, '方法', true, false, 0, 5000, 10, true, null);
    map.SetPopGroupList('Objs', 'GenerGroups', 'GenerMethods', true, '800px', '1000px', '要显示的字段', 'icon-people');
    //是否启用？
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
  public async GenerGroups() {
    return await createMethodsGroup(this.FrmID);
  }
  public async GenerMethods() {
    return await createMethods(this.FrmID);
  }
}
