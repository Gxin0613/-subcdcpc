import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { SFDBSrc } from './FrmLogic/SFDBSrc/SFDBSrc';
import { SFTable } from './FrmLogic/SFTable/SFTable';
import { SFSearch } from './FrmLogic/SFSearch/SFSearch';
import { SFProc } from './FrmLogic/SFProc/SFProc';
import { SysEnumMain } from './FrmLogic/SysEnum/SysEnumMain';

// 人员
export class Setting extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.Setting');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_Emp', '系统设置');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', true, true, 1, 3, 50);
    map.AddTBString('Name', null, '名称', false, false, 0, 50, 200);

    map.AddRM_Search(new SFDBSrc(), 'icon-disc');
    map.AddRM_Search(new SFTable(), 'icon-notebook');
    map.AddRM_Search(new SFSearch(), 'icon-grid');
    map.AddRM_Search(new SFProc(), 'icon-energy');
    map.AddRM_Search(new SysEnumMain(), 'icon-list');

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
