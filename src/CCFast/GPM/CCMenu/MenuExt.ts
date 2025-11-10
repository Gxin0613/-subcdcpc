import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from './PowerCenter';
import { MenuAttr } from './Menu';

/// 菜单
export class MenuExt extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.GPM.MenuExt', 'BP.CCFast.CCMenu.Menu');
    if (!!pkVal) {
      this.No = pkVal;
    }
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
    const map = new Map('GPM_Menu', '菜单');

    map.AddTBStringPK(MenuAttr.No, null, '编号', false, false, 1, 90, 50);
    map.AddTBString(MenuAttr.Icon, null, 'Icon', true, false, 0, 50, 50, true);
    map.AddTBString(MenuAttr.Name, null, '名称', true, false, 0, 300, 200, true);
    map.AddTBString(MenuAttr.MenuModel, null, '菜单模式', true, true, 0, 50, 200);
    map.AddTBString(MenuAttr.Mark, null, '标记', true, false, 0, 300, 200, false);
    map.AddTBString(MenuAttr.Tag1, null, 'Tag1', true, false, 0, 300, 200, false);

    map.AddDDLStringEnum(
      MenuAttr.IframeOpenType,
      'inner',
      '打开方式(仅支持iframe)',
      '@inner=内嵌@outer=外部',
      true,
      'iframe打开方式，可以为项目内打开或者新窗口打开,<p style="color:red">仅当链接为url时有效<p>',
    );
    // @0=系统根目录@1=系统类别@2=系统.
    // map.AddDDLSysEnum(MenuAttr.OpenWay, 1, '打开方式', true, true, MenuAttr.OpenWay, '@0=新窗口@1=本窗口@2=覆盖新窗口');
    map.AddTBString(MenuAttr.UrlExt, null, '路由地址', true, false, 0, 500, 200, true, '路由地址(可携带URL参数)');
    map.AddTBString(MenuAttr.UrlPath, null, 'PC端路径', true, false, 0, 500, 200, true, '解析路由的PC端工程内Vue文件路径');
    map.AddTBString(MenuAttr.MobileUrlExt, null, '手机端路径', true, false, 0, 500, 200, true, '解析路由的手机端工程内Vue文件路径');
    map.AddBoolean(MenuAttr.IsEnable, true, '是否启用?', true, true);
    map.AddBoolean(MenuAttr.EnableCache, true, '是否启用页面缓存', true, true, true, '启用页面缓存可以保证tab页面数据不刷新，但是可能加重浏览器内存压力。');

    //隐藏字段.
    map.AddTBString(MenuAttr.OrgNo, null, 'OrgNo', false, false, 0, 50, 20);
    map.AddTBInt(MenuAttr.Idx, 0, '序号', false, false);

    map.AddGroupMethod('通用设置');
    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    //如果是信息管理.
    if (this.MenuModel === 'Info') {
      map.AddRM_UrlTabOpen('类别管理', '/src/WF/Comm/Search.vue?EnsName=TS.CCOA.CCInfo.InfoType', 'icon-drop');
      map.AddRM_UrlTabOpen('信息列表', '/src/WF/Comm/Search.vue?EnsName=TS.CCOA.CCInfo.Info', 'icon-drop');
    }

    this._enMap = map;
    return this._enMap;
  }
}
