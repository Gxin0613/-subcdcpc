import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import WebUser from '/@/bp/web/WebUser';
import { DataType } from '/@/bp/en/DataType';
/// 日程
export class Schedule extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCOA.Schedule');
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
    const map = new Map('OA_Schedule', '日程');
    map.AddGroupAttr('基础信息');
    map.AddMyPK();
    map.AddBoolean('IsOK', false, '完成?', true, true, false);
    map.AddTBString('Name', null, '标题', true, false, 0, 300, 10, true);

    map.AddTBDate('DTStart', null, '开始时间', true, false);
    map.AddTBDate('DTEnd', null, '结束时间', true, false);

    map.AddTBString('TimeStart', null, 'TimeStart', true, false, 0, 10, 10);
    map.AddTBString('TimeEnd', null, 'TimeEnd', true, false, 0, 10, 10);

    map.AddTBString('ChiXuTime', null, '持续时间', true, false, 0, 10, 10);

    map.AddTBDateTime('DTAlert', null, '提醒时间', true, false);

    map.AddDDLSysEnum('Repeats', 0, '重复', true, false, 'Repeat', '@0=永不@1=每年@2=每月');

    map.AddTBString('Local', null, '位置', true, false, 0, 300, 10, true);
    map.AddTBString('MiaoShu', null, '描述', true, false, 0, 300, 10, true);

    map.AddTBString('NY', null, '隶属年月', false, false, 0, 10, 10);

    map.AddGroupAttr('记录信息');
    map.AddTBString('RecNo', null, '记录人', false, false, 0, 100, 10, true);
    map.AddTBString('RecName', null, '记录人', false, false, 0, 100, 10, true);
    map.AddTBString('RecDeptNo', null, '部门编号', false, false, 0, 100, 10, true);
    map.AddTBString('RecDeptName', null, '部门名称', false, false, 0, 100, 10, true);
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 100, 10);

    map.AddTBDateTime('RDT', null, '记录时间', false, false);
    this._enMap = map;
    return this._enMap;
  }

  protected override beforeInsert() {
    this.RecNo = WebUser.No;
    this.RecName = WebUser.Name;

    this.RecDeptNo = WebUser.DeptNo;
    this.RecDeptName = WebUser.DeptName;
    this.OrgNo = WebUser.OrgNo;
    this.RDT = DataType.CurrentDateTime;
    return Promise.resolve(true);
  }
}
/**
 * 日程 s
 */
export class Schedules extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Schedule();
  }

  constructor() {
    super();
  }
}
