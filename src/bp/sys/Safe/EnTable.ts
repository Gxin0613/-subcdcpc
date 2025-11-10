import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { CCBPMRunModel } from '../../difference/SystemConfig';
import WebUser from '../../web/WebUser';
import { DBSafes } from './DBSafe';
export class EnTable extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Sys.EnTable');
    if (!!pkval) this.setPKVal(pkval);
  }
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_EnCfg', '数据表');
    map.AddGroupAttr('基本设置');
    map.AddTBStringPK('No', null, '标记', false, false, 1, 100, 60);
    map.AddTBString('TableName', null, '表', true, true, 0, 30, 60, true);
    map.AddTBString('Name', null, '中文名', true, false, 0, 30, 60, true);
    map.AddTBString('FieldOfRec', 'RecNo', '创建人字段', true, false, 0, 30, 60, false);
    map.AddTBString('FieldOfDeptNo', 'DeptNo', '部门字段', true, false, 0, 30, 60, false);
    map.AddTBString('FieldOfOrgNo', 'OrgNo', '组织字段', true, false, 0, 30, 60, false);

    map.AddTBString('OrgNo', null, '隶属组织', true, true, 0, 30, 60);
    map.AddHidden('No', ' LIKE ', 'EnTable_%'); //设置查询.

    map.AddGroupMethod('访问权限');
    map.AddRM_DtlSearch('查询Select', new DBSafes(), 'TableName', '', '', '', 'icon-layers', false, '&DBRole=DBList');
    map.AddRM_DtlSearch('新建Inset', new DBSafes(), 'TableName', '', '', '', 'icon-plus', false, '&DBRole=RecNew');
    map.AddRM_DtlSearch('删除Delete', new DBSafes(), 'TableName', '', '', '', 'icon-close', false, '&DBRole=RecDelete');
    map.AddRM_DtlSearch('更新Update', new DBSafes(), 'TableName', '', '', '', 'icon-energy', false, '&DBRole=RecSave');

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

//角色s
export class EnTables extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new EnTable();
  }
  constructor() {
    super();
  }

  //查询全部
  override async RetrieveAll() {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return await super.RetrieveAll('Idx');
    else return await this.Retrieve('OrgNo', WebUser.OrgNo, 'Idx');
  }
}
