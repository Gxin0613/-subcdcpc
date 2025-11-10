import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 用户日志
export class UserLog extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Self.UserLog');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Sys_UserLogT', '用户日志');

    map.AddMyPK();

    map.AddTBString('EmpNo', null, '用户账号', true, true, 0, 30, 20);
    map.AddTBString('EmpName', null, '用户名', true, true, 0, 30, 20);
    map.AddTBString('RDT', null, '记录日期', true, true, 0, 20, 20);
    map.AddTBString('IP', null, 'IP', true, true, 0, 200, 20);
    map.AddTBString('Locatinon', null, '位置', true, true, 0, 200, 100);
    map.AddTBString('Brower', null, '浏览器', true, true, 0, 100, 100);
    map.AddTBString('OS', null, '操作系统', true, true, 0, 100, 100);
    map.AddTBString('LogFlag', null, '标识', true, true, 0, 300, 20);
    map.AddTBStringDoc('Docs', null, '说明', true, true, true);
    this._enMap = map;
    return this._enMap;
  }
}

//班级s
export class UserLogs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new UserLog();
  }

  constructor() {
    super();
    this.OrderBy = `RDT desc`; // 声明查询排序字段
  }
}
