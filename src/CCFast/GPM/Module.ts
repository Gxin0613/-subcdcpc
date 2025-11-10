import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import DBAccess from '/@/utils/gener/DBAccess';
import { PCenters } from './PCenter/PCenter';
import { PowerCenterAttr } from '../GPM/CCMenu/PowerCenter';
import { MenuAttr, Menus } from '../GPM/CCMenu/Menu';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';

/// 模块
export class Module extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.GPM.Module', 'BP.CCFast.CCMenu.Module');
    if (!!pkVal) this.No = pkVal;
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
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('GPM_Module', '模块');

    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 100);
    map.AddTBString('Name', null, '名称', true, false, 0, 300, 300);
    map.AddTBString('ParentNo', null, '父节点编号', true, false, 0, 300, 300);
    map.SetHelperAlert('ParentNo', '对于独立系统需要显示树结构的模式有效，默认为系统下的节点，第一级目录.');

    map.AddBoolean('IsEnable', true, '是否可用', true, true, false);
    map.AddTBString('Icon', null, 'Icon', true, false, 0, 500, 120, true);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);
    //
    map.AddTBInt('ChildDisplayModel', 0, '菜单显示模式', true, false);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 20);
    map.AddTBString('SystemNo', null, '隶属系统', false, false, 0, 300, 20);

    map.AddRM_DtlBatch('菜单Batch', new Menus(), MenuAttr.ModuleNo, '', '', 'icon-drop', '');
    map.AddRM_DtlSearch('菜单Search', new Menus(), MenuAttr.ModuleNo, '', '', '', 'icon-drop', true, '');
    map.AddRM_DtlSearch('权限', new PCenters(), `${PowerCenterAttr.CtrlPKVal}&CtrlObj=Module`, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    // @zhoupeng 这里不要用随机数，不好记，考虑换成拼音之类的
    this.No = DBAccess.GenerGUID();
    this.Idx = 100;
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) this.OrgNo = WebUser.OrgNo;
    return true;
  }
}

/**
 * 模块s
 */
export class Modules extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Module();
  }
  constructor() {
    super();
  }
}
