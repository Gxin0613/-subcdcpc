import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { DataType } from '/@/bp/en/DataType';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
/// 日历数据源
export class CalendarDBSrc extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CalendarDBSrc');
    if (!!pkVal) this.setPKVal(pkVal);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('OA_CalendarDBSrc', '日历数据源');
    map.AddGroupAttr('基础信息');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 10, false);
    map.AddTBString('Name', null, '标题', true, false, 0, 300, 10, false);
    // map.AddTBString('Icon', null, '标签', true, false, 0, 300, 10, true);

    map.AddTBString('LabColor', '#000000', '标签颜色', true, false, 0, 100, 10, false);

    map.AddTBString('DBSrcNo', null, '数据源No', true, false, 0, 100, 10);
    map.AddTBString('DBSrcName', null, '数据源Name', true, false, 0, 100, 10);

    map.AddTBString('SearchNo', null, 'SearchNo', true, false, 0, 100, 10);
    map.AddTBString('SearchName', null, 'SearchName', true, false, 0, 100, 10);

    map.AddBoolean('IsEnable', true, '是否启用?', true, true);

    //  map.AddGroupAttr('记录信息');
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
 * 日历数据源 s
 */
export class CalendarDBSrcs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new CalendarDBSrc();
  }

  constructor() {
    super();
  }
}
