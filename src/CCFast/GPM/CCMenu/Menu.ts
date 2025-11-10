import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import DBAccess from '/@/utils/gener/DBAccess';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from './PowerCenter';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { DataType } from '/@/bp/en/DataType';
import { GloWF } from '/@/WF/Admin/GloWF';

/// 菜单 属性
export class MenuAttr extends EntityNoNameAttr {
  /// 系统

  public static readonly ModuleNo = 'ModuleNo';

  /// 系统编号

  public static readonly SystemNo = 'SystemNo';

  /// 图片
  public static readonly WorkType = 'WorkType';

  /// 连接
  public static readonly Url = 'Url';

  /// 连接（pc）
  public static readonly UrlExt = 'UrlExt';
  public static readonly UrlPath = 'UrlPath';
  public static readonly path = 'path';
  public static readonly Alias = 'Alias';
  // public static readonly WrapInLayout = 'WrapInLayout';

  /// 连接（移动端）
  public static readonly MobileUrlExt = 'MobileUrlExt';

  /// iframe 打开方式
  public static readonly IframeOpenType = 'IframeOpenType';

  /// 是否启用
  public static readonly IsEnable = 'IsEnable';

  /// 打开方式
  public static readonly OpenWay = 'OpenWay';

  /// 标记
  public static readonly Mark = 'Mark';
  //内容
  public static readonly Docs = 'Docs';

  /// 扩展1
  public static readonly Tag0 = 'Tag0';
  public static readonly Tag1 = 'Tag1';

  /// 扩展2
  public static readonly Tag2 = 'Tag2';

  /// 扩展3
  public static readonly Tag3 = 'Tag3';
  public static readonly Tag4 = 'Tag4';
  public static readonly Tag5 = 'Tag5';
  public static readonly Tag6 = 'Tag6';

  /// 扩展2
  public static readonly MenuModel = 'MenuModel';

  /// 列表模式
  public static readonly ListModel = 'ListModel';

  /// 组织编号
  public static readonly OrgNo = 'OrgNo';

  /// 图标
  public static readonly Icon = 'Icon';

  /// 标题
  public static readonly Title = 'Title';
  public static readonly FrmID = 'FrmID';
  public static readonly FlowNo = 'FlowNo';

  /// 风格:比如Tab,的风格.
  public static readonly Style = 'Style';
  public static readonly TagInt1 = 'TagInt1';
  public static readonly TagInt2 = 'TagInt2';
  public static readonly TagInt3 = 'TagInt3';
  public static readonly Idx = 'Idx';
  public static readonly EnName = 'EnName';

  // 是否启用页面缓存
  public static readonly EnableCache = 'EnableCache';
}

/// 菜单
export class Menu extends EntityNoName {
  public InitMenuEns(enName: string, menuName: string, paras = '&1=1', icon = 'icon-drop') {
    if (paras == '') paras = '&x=' + DBAccess.GenerGUID();
    this.Name = menuName;
    this.UrlExt = 'x?EnName=' + enName + paras;
    this.UrlPath = '/@/WF/Comm/Ens.vue';
    this.MenuModel = 'FixedUrl'; //类型为.
    this.Mark = 'FixedUrl'; //类型为.
    this.Alias = DBAccess.GenerGUID();
    this.SetPara('EnName', 'TS.GPM.MenuGenerPage');
    this.Icon = icon;
  }
  public InitMenuSearch(enName: string, menuName: string, paras = '', icon = 'icon-drop') {
    if (paras == '') paras = '&x=' + DBAccess.GenerGUID();
    this.Name = menuName;
    this.UrlExt = 'x?EnName=' + enName + paras;
    this.UrlPath = '/@/WF/Comm/Search.vue';
    this.MenuModel = 'FixedUrl'; //类型为.
    this.Mark = 'FixedUrl'; //类型为.
    this.Alias = DBAccess.GenerGUID();
    this.SetPara('EnName', 'TS.GPM.MenuGenerPage');
    this.Icon = icon;
  }
  public InitMenu(enName: string, menuName: string, icon = 'icon-drop') {
    if (enName.startsWith('TreeEns_') == true) {
      this.Name = menuName;
      this.UrlExt = '/WF/Comm/TreeEns?EnName=' + enName + '&1=' + DBAccess.GenerGUID(); //通用列表.
      this.UrlPath = '/@/WF/Comm/TreeEns.vue';
      this.MenuModel = 'FixedUrl'; //类型为.
      this.Mark = 'FixedUrl'; //类型为.
      this.Icon = icon; //'icon-playlist';
      this.Alias = DBAccess.GenerGUID();
      return;
    }
    if (enName.startsWith('GL_') == true) {
      this.Name = menuName;
      this.UrlExt = '/WF/Comm/GenerList?EnName=' + enName + '&1=' + DBAccess.GenerGUID(); //通用列表.
      this.UrlPath = '/@/WF/views/GenerList.vue';
      this.MenuModel = 'FixedUrl'; //类型为.
      this.Mark = 'FixedUrl'; //类型为.
      this.Icon = icon; //'icon-playlist';
      this.Alias = DBAccess.GenerGUID();
      return;
    }
  }
  constructor(pkVal?: string) {
    super('TS.GPM.Menu', 'BP.CCFast.CCMenu.Menu');
    if (!!pkVal) {
      this.setPKVal(pkVal);
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
    map.AddTBString(MenuAttr.Name, null, '名称', true, false, 0, 300, 200, true);
    map.AddTBString(MenuAttr.MenuModel, null, '菜单模式', true, true, 0, 50, 200);

    // map.AddTBString(MenuAttr.Mark, null, '标记', true, false, 0, 300, 200, false);
    map.AddTBString(MenuAttr.Tag1, null, 'Tag1', true, false, 0, 300, 200, false);
    map.AddTBString(MenuAttr.FrmID, null, 'FrmID', false, false, 0, 300, 200, false);
    map.AddTBString(MenuAttr.FlowNo, null, 'FlowNo', false, false, 0, 300, 200, false);

    // @0=系统根目录@1=系统类别@2=系统.
    // map.AddDDLSysEnum(MenuAttr.OpenWay, 1, '打开方式', true, true, MenuAttr.OpenWay, '@0=新窗口@1=本窗口@2=覆盖新窗口');
    let PCLinkHelpDocs = '如果是菜单对应的是Vue组件，需要配置此项和Vue文件地址，此项可以自定义，但是需要携带url参数';
    PCLinkHelpDocs += `
例如/StudentSearch?EnName=TS.Demo.Student`;
    PCLinkHelpDocs += `
也支持url连接，以http/https开头，例如https://www.baidu.com`;
    map.AddTBString(MenuAttr.UrlExt, null, '路由配置', true, false, 0, 350, 200, false, PCLinkHelpDocs);
    map.AddTBString(
      MenuAttr.UrlPath,
      null,
      'Vue文件路径',
      true,
      false,
      0,
      150,
      200,
      false,
      `此项需要配置连接对应的vue文件地址，仅支持/src/下文件
例如:/src/WF/Comm/Search.vue`,
    );
    map.AddTBString(MenuAttr.path, null, 'path', false, false, 0, 50, 50);
    map.AddTBString(MenuAttr.Alias, null, '别名', false, false, 0, 500, 300);
    // map.AddBoolean(MenuAttr.WrapInLayout, true, '是否嵌入布局', true, false);

    // map.AddTBString(MenuAttr.MobileUrlExt, null, '移动端连接', true, false, 0, 500, 200, true);
    map.AddDDLStringEnum(
      MenuAttr.IframeOpenType,
      'inner',
      'iframe打开方式',
      '@inner=内嵌@outer=外部',
      true,
      'iframe打开方式，可以为项目内打开或者新窗口打开,<p style="color:red">仅当链接为url时有效<p>',
    );
    map.AddBoolean(MenuAttr.IsEnable, true, '是否启用?', true, true);
    map.AddBoolean(MenuAttr.EnableCache, true, '是否启用页面缓存', true, true, true, '启用页面缓存可以保证tab页面数据不刷新，但是可能加重浏览器内存压力。');
    map.AddTBString(MenuAttr.SystemNo, null, 'SystemNo', false, false, 0, 50, 50);

    map.AddTBString(MenuAttr.MobileUrlExt, null, '', false, false, 0, 200, 50);

    map.AddTBString(MenuAttr.Icon, null, 'Icon', true, false, 0, 50, 50, true);

    //隶属模块，可以让用户编辑。
    //map.AddTBString(MenuAttr.ModuleNo, null, "ModuleNo", false, false, 0, 50, 50);

    map.AddDDLSQL(MenuAttr.ModuleNo, null, '隶属模块编号', GloWF.SQLOfModuleNo(), true); //"SELECT No,Name FROM GPM_Module WHERE SystemNo='@SystemNo'"

    map.AddDDLSysEnum(MenuAttr.ListModel, 0, '列表模式', true, true, MenuAttr.ListModel, '@0=编辑模式@1=视图模式');
    let msg = '提示';
    msg += `	
 1. 编辑模式就是可以批量的编辑方式打开数据, 可以批量的表格方式编辑数据.`;
    msg += `	
 2. 视图模式就是查询的模式打开数据..`;
    map.SetHelperAlert(MenuAttr.ListModel, msg);

    //隐藏字段.
    map.AddTBInt(MenuAttr.Idx, 0, '序号', false, false);
    map.AddTBString(MenuAttr.OrgNo, null, 'OrgNo', false, false, 0, 50, 20);
    map.AddTBDateTime('RDT', null, 'RDT', true, false); //记录日期.

    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true, '&CtrlObj=Menu');
    map.AddTBString(MenuAttr.EnName, null, '对应的实体类', false, false, 0, 300, 50);
    map.AddTBAtParas(300);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    if (!this.No) this.No = DBAccess.GenerGUID();
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) this.OrgNo = WebUser.OrgNo;

    this.RDT = DataType.CurrentDateTimes;
    return Promise.resolve(true);
  }

  protected override async afterInsert() {
    localStorage.setItem('lastCreateMenuId', this.No);
    return true;
  }
}

/**
 * 菜单s
 */
export class Menus extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Menu();
  }
  constructor() {
    super();
  }
}
