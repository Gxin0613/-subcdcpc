import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GPE_HideMethod } from './GPE_HideMethod';
import { GPE_HideAttr } from './GPE_HideAttr';
import WebUser from '../web/WebUser';

/// <summary>
/// En组件展现设置
/// </summary>
export class EnOnlyCfg extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.User.EnOnlyCfg');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_EnCfg', '隐藏设置项');

    map.AddGroupAttr('基本设置');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 60);

    map.AddMapLoader(() => {
      const no = this.No;
      const systemClsNameSpace = ['TS.WF', 'TS.Sys', 'TS.CCBill', 'TS.User', 'TS.Port', 'TS.CCFast', 'TS.GPM'];
      if (systemClsNameSpace.some((cls) => no.startsWith(cls)) && WebUser.IsAdmin) {
        map.AddGroupMethod('隐藏设置项');
        map.AddRM_GPEByOptions({ en: new GPE_HideAttr(), paramsStr: '&KeyOfEn=MHideAttrModel&SaveToAttr=MHideAttrs' });
        map.AddRM_GPEByOptions({ en: new GPE_HideMethod(), paramsStr: '&KeyOfEn=MHideMethodModel&SaveToAttr=MHideMethods' });
        return;
      }
    });

    this._enMap = map;
    return this._enMap;
  }
}
