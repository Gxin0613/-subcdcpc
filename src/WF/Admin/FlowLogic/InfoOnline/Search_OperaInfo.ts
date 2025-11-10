import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
export class Search_OperaInfo extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Sys.Search_OperaInfo');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('sys_userlogt', '操作日志');
    map.AddMyPK();
    map.AddTBString('EmpNo', null, '账号', true, true, 0, 200, 100);
    map.AddTBString('EmpName', null, '名称', true, true, 0, 200, 100);
    map.AddTBString('LogFlag', null, '操作类型', true, false, 0, 200, 100);
    map.AddTBDateTime('RDT', null, '操作时间', true, false);
    map.AddTBString('LevelText', null, '等级', true, false, 0, 200, 100);
    map.AddTBStringDoc('Docs', null, '操作内容', true, true, true);
    // map.AddTBString('IP', null, 'IP', true, false, 0, 200, 300);
    // map.AddTBString('Locatinon', null, '地区', true, false, 0, 200, 300);
    // map.AddTBString('Brower', null, '浏览器', true, false, 0, 200, 300);
    // map.AddTBString('OS', null, '系统', true, false, 0, 200, 300);
    map.AddHidden('LogFlag','not in',"('登录','访问','退出')")
    this._enMap = map;
    return this._enMap;
  }
}

//自动任务s
export class Search_OperaInfos extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Search_OperaInfo();
  }
  constructor() {
    super();
  }
}
