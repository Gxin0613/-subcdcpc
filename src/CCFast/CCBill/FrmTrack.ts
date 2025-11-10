import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';

/// 日志
export class FrmTrack extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCBill.FrmTrack');
    if (!!pkVal) this.setPKVal(pkVal);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }
  public override get EnMap() {
    const map = new Map('Frm_Track', '表单轨迹表');

    map.AddMyPK(); //组合主键.
    map.AddTBString('FrmID', null, '表单ID', true, false, 0, 50, 200);
    map.AddTBString('FrmName', null, '表单名称(可以为空)', true, false, 0, 200, 200);
    // map.AddTBInt('ActionType, 0, '类型', true, false);
    map.AddTBString('ActionType', null, '类型', true, false, 0, 30, 100);
    map.AddTBString('ActionTypeText', null, '类型(名称)', true, false, 0, 30, 100);
    //  map.AddTBInt('WorkID, 0, '工作ID/OID', true, false);
    map.AddTBString('WorkID', null, '工作ID/OID', true, false, 0, 100, 100);
    map.AddTBString('Msg', null, '消息', true, false, 0, 300, 3000);
    map.AddTBString('Rec', null, '记录人', true, false, 0, 200, 100);
    map.AddTBString('RecName', null, '名称', true, false, 0, 200, 100);
    map.AddTBDateTime('RDT', null, '记录日期时间', true, false);
    map.AddTBString('DeptNo', null, '部门编号', true, false, 0, 200, 100);
    map.AddTBString('DeptName', null, '名称', true, false, 0, 200, 100);
    map.AddTBAtParas(3999); //参数.

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 日志s
 */
export class FrmTracks extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmTrack();
  }
  constructor() {
    super();
  }
}
