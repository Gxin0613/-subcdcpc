import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';
import { GloWF } from '/@/WF/Admin/GloWF';
import { Dept } from '/@/bp/port/Dept';

// 员工
export class HREmp extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.HREmp');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    if (WebUser.No === 'admin') {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    } else {
      uac.IsUpdate = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_HREmp', '员工');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 4, 120);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddTBString('Tel', null, '电话', true, false, 0, 50, 200);
    map.AddDDLEntities('DeptNo', null, '部门', new Dept(), true);
    map.AddTBString('Tel', null, '电话', true, false, 0, 50, 200);
    map.AddTBString('Email', null, '邮件', true, false, 0, 50, 200);
    map.AddTBString('Leader', null, '直接主管', true, false, 0, 50, 50, true);
    map.SetPopTreeEns(
      'Leader',
      GloWF.srcDeptLazily,
      '@WebUser.DeptNo',
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey.toString(),
      false,
      '500px',
      '800px',
      '选择人员',
      'icon-people',
      '1',
      true,
      true,
    );

    this._enMap = map;
    return this._enMap;
  }
}

//员工s
export class HREmps extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new HREmp();
  }
  constructor() {
    super();
  }
}
