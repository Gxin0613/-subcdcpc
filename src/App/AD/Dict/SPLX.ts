import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
/**
 * 商品类型
 */
export class SPLX extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.AD.SPLX');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    if (WebUser.No == 'admin') {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    } else {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('AD_SPLX', '商品类型');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 300);
    map.AddTBStringDoc('BeiZhu', null, '其他相关信息', true, false, true);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeDelete(): Promise<boolean> {
    return Promise.resolve(true);
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
  protected override afterUpdate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  override async afterInsert(): Promise<boolean> {
    // this.BirthDT = '2021-09-01';
    return Promise.resolve(true);
  }
}

/**
 * 商品类型s
 */
export class SPLXs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SPLX();
  }
  constructor() {
    super();
  }
}
