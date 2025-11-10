import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import DBAccess from '/@/utils/gener/DBAccess';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';

// 成员
export class EnNoNameDemo extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.EnNoNameDemo');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('En_XueShengTaiZhangCeSh', '低代码多选测试');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 40);
    map.AddTBString('Name', null, '名称', true, false, 0, 100, 100);
    // map.AddTBString('FanKaYuE', null, '饭卡余额', true, false, 0, 100, 100);
    map.AddTBString('fixtype', null, '维修项目', true, false, 0, 150, 150);
    map.AddTBString('DuoXuanCeShi', null, '多选测试', true, false, 0, 150, 150);
    map.SetPopList('DuoXuanCeShi', `select IntKey as No, Lab as Name from sys_enum where EnumKey = 'DuoXuanCeShi'`, true, '500px', '400px', '多选测试');
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 成员s
 */
export class EnNoNameDemos extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new EnNoNameDemo();
  }
  constructor() {
    super();
  }
}
