import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import DBAccess from '/@/utils/gener/DBAccess';
import { PCenters } from './PCenter/PCenter';
import { PowerCenterAttr } from '../GPM/CCMenu/PowerCenter';
import { PG_Module2Menu } from './PG_Module2Menu';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { FrameworkExt } from '/@/CommExt/FrameworkExt';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
/// 系统
export class SystemAlone extends EntityNoName {
  constructor(pkVal?: string) {
    // super('TS.GPM.SystemAlone', 'BP.CCFast.CCMenu.SystemAlone');
    super('TS.GPM.SystemAlone');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }

  override GetRefExt() {
    return new FrameworkExt(this);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('GPM_System', '独立系统');

    map.AddTBStringPK('No', null, '系统编号', true, true, 2, 100, 100);
    map.AddTBString('Name', null, '系统名称', true, false, 0, 300, 150);
    map.AddTBString('Icon', null, '图标', true, false, 0, 50, 150, true);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 50, 20);
    map.AddBoolean('IsEnable', true, '启用?', true, true, false);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);
    map.AddTBAtParas(4000); //参数.

    map.AddGroupMethod('基本设置');
    map.AddRM_PG(new PG_Module2Menu(), 'icon-book-open');
    map.AddRM_DtlSearch('应用权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '&CtrlObj=System', 'icon-energy', true);

    const rmDel = new RefMethod();
    rmDel.Title = '删除应用';
    rmDel.ClassMethod = 'DeleteIt';
    rmDel.RefMethodType = RefMethodType.Func;
    rmDel.Icon = 'icon-logout';
    map.AddRefMethod(rmDel);

    this._enMap = map;
    return this._enMap;
  }
  public async DeleteIt() {
    await this.Delete();
    return '删除成功.';
  }

  public ExpTemplate() {
    return '未实现.';
  }

  override async beforeInsert(): Promise<boolean> {
    if (!!this.No) this.No = DBAccess.GenerGUID();
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) this.OrgNo = WebUser.OrgNo;
    return true;
  }
}
