import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { DiQu } from './Dict/DiQu';

/**
 * 媒体管理
 */
export class MeiTi extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.AD.MeiTi');
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
    const map = new Map('AD_MeiTi', '媒体');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;

    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 40);
    map.AddTBString('Name', null, '名称', true, false, 0, 100, 100);
    map.AddDDLSysEnum('MTLX', 0, '媒体类型', true, true, 'MTLX', '@0=互联网@1=户外@2=广播@3=电视@4=报纸');

    map.AddTBString('EmpNo', null, '负责人', true, true, 0, 100, 100);
    map.AddTBString('EmpName', null, '名称', true, true, 0, 100, 100);
    map.AddDDLEntities('DiQu', null, '地区', new DiQu(), true, null, false);

    map.AddTBInt('ShiChang', 0, '总时长', true, true, false);
    map.AddTBInt('WeiFaSC', 0, '违法长', true, true, false);

    map.AddTBInt('AllNum', 0, '播放总量(次)', true, true, false);
    map.AddTBInt('WGNum', 0, '违规总量(次)', true, true, false);
    map.AddTBDecimal('LV', 0, '违规率', true, true, false);

    map.AddSearchAttr('DiQu');
    map.AddSearchAttr('MTLX');
    //   map.AddTBDate('RDT', null, '创建日期', true, true);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeDelete(): Promise<boolean> {
    return Promise.resolve(true);
  }
  override async beforeInsert(): Promise<boolean> {
    //   this.MyPK = DBAccess.GenerGUID();
    // this.RDT =' DataType.CurrentDate';
    return Promise.resolve(true);
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
  protected override afterUpdate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  override async afterInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 媒体管理s
 */
export class MeiTis extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MeiTi();
  }
  constructor() {
    super();
  }
}
