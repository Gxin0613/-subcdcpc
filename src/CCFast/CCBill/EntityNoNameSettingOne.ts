import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GloComm } from '/@/WF/Comm/GloComm';
import { FrameworkExt } from '/@/CommExt/FrameworkExt';
// 实体
export class EntityNoNameSettingOne extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.EntityNoNameSettingOne');
    if (!!no) this.setPKVal(no);
  }

  override GetRefExt() {
    return new FrameworkExt(this);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '实体');
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 3, 50);
    map.AddGroupMethod('基本信息');
    // //vu.Bill
    map.AddMapLoader(() => {
      map.AddRM_UrlTabOpen('列表', GloComm.UrlSearchEntityNoName(this.No) + '&IsHideDesign=1', 'icon-list');
      map.AddRM_UrlTabOpen('分析', GloComm.UrlGroupEntityNoName(this.No) + '&IsHideDesign=1', 'icon-chart');
      map.AddRM_UrlTabOpen('报表', GloComm.UrlRptEntityNoName(this.No) + '&IsHideDesign=1', 'icon-docs');
      map.AddRM_UrlTabOpen('大屏', GloComm.UrlWhiteScreenViewer('FrmEntityNoName' + this.No, this.No), 'icon-film');
    });

    this._enMap = map;
    return this._enMap;
  }
}
