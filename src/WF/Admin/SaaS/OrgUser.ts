import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
/// 组织
export class OrgUser extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.SaaS.OrgUser');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_Org', '组织');

    map.AddTBStringPK('No', null, '编号', true, false, 1, 30, 150);
    map.AddTBString('Name', null, '组织名称', true, true, 0, 60, 150, true);
    map.AddTBString('Addr', null, '公司地址', true, true, 0, 60, 150, true);
    map.AddTBString('Tel', null, '联系电话', true, true, 0, 60, 125, true);
    map.AddTBString('CopyRight', null, '版权信息', true, true, 0, 60, 125, true);
    map.AddDDLSysEnum('LoginStyle', 0, '登录风格', true, true, 'LoginStyle', '@0=默认@1=样式2@2=样式3@3=样式4@4=样式5@5=样式6@6=样式7@7=样式8@8=样式9@9=样式10');
    map.AddDDLSysEnum('LoginLayout', 0, '登录布局', true, true, 'LoginLayout', '@0=左@1=中@2=右');

    this._enMap = map;
    return this._enMap;
  }
}
