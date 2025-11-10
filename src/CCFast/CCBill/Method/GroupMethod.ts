import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import DBAccess from '/@/utils/gener/DBAccess';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

// 方法分组
export class GroupMethod extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.GroupMethod');
    this.setPKVal(no);
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
    const map = new Map('Frm_GroupMethod', '方法分组');
    map.AddTBStringPK('No', null, '编号', false, false, 0, 150, 150);
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 200, 150);
    map.AddTBString('Name', null, '标签', true, false, 0, 500, 500, true);
    map.AddTBString('Icon', null, 'Icon', true, true, 0, 200, 200, true);
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 40, 20, true);
    map.AddTBInt('Idx', 0, '序号', true, false);
    map.AddTBAtParas(3000);
    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    if (!this.No) this.No = DBAccess.GenerGUID(); // = '2021-09-01';
    if (!this.Icon) this.Icon = 'icon-folder';
    if (!this.Idx) this.Idx = 100;
    return Promise.resolve(true);
  }
}

//方法分组 s
export class GroupMethods extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new GroupMethod();
  }
  constructor() {
    super();
  }
}
