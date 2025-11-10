import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
/// 文件
export class FileDtl extends EntityMyPK {
  constructor(pkVal?: number) {
    super('TS.CCOA.NetDisk.FileDtl');
    if (!!pkVal) {
      this.setPKVal(pkVal);
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('OA_NetDiskFile', '文件');
      map.AddTBStringPK('MyPK', null, '编号', false, false, 0, 50, 10);
  //  map.AddTBIntPKOID();
    map.AddTBString('Name', null, '名称', true, false, 0, 500, 10, true);
    map.AddTBString('TreeNo', null, '目录编号', true, false, 0, 500, 10, true);
    map.AddTBDateTime('RDT', null, '记录时间', false, false);
    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddMyFile('我的文件');
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 文件 s
 */
export class FileDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FileDtl();
  }
  constructor() {
    super();
  }
}
