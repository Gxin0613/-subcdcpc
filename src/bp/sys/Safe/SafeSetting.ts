import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { DBSafes } from './DBSafe';
import { EnTables } from './EnTable';

// 人员
export class SafeSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.SafeSetting');
    if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS && no?.includes('_') == false) no = WebUser.OrgNo + '_' + no;
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
    const map = new Map('WF_Emp', '数据安全');
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', true, true, 1, 3, 50);

    map.AddRM_DtlSearch('数据表', new EnTables(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=DBList');

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
