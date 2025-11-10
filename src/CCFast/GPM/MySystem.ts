import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import DBAccess from '/@/utils/gener/DBAccess';
import { PCenters } from './PCenter/PCenter';
import { PowerCenterAttr } from '../GPM/CCMenu/PowerCenter';
import { PG_Module2Menu } from './PG_Module2Menu';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { FrameworkExt } from '/@/CommExt/FrameworkExt';
import { ModuleLangs } from './ModuleLang';
import { MapFrmFool } from '/@/WF/Admin/FrmLogic/MapData/MapFrmFool';
import { MenuLangs } from './CCMenu/MenuLang';
import { MySystemLangs } from './MySystemLang';
import { message } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { inRange } from 'lodash';

const { t } = useI18n();
/// 系统
export class MySystem extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.GPM.MySystem');
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
    const map = new Map('GPM_System', '系统');

    map.AddTBStringPK('No', null, '系统编号', true, true, 2, 100, 100);
    map.AddTBString('Name', null, '系统名称', true, false, 0, 300, 150);
    map.AddTBString('Icon', null, '图标', true, false, 0, 50, 150, true);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 50, 20);
    map.AddBoolean('IsEnable', true, '启用?', true, true, false);
    map.AddDDLSysEnum('SystemType', 0, '系统类型', true, true, 'SystemType', '@0=应用系统@1=跳转系统@2=门户@3=独立系统');
    const help = `
    #### 说明
    1. 对跳转系统有效。
    2. 地址格式为: http://xxxx.xxx.xx:9000/xxx.vue
    3. 系统会自动增加上当前登录者的信息，使用get模式，格式为:http://xxxx.xxx.xx:9000/xxx.vue?Token=xxxx&UserNo=xxxx
    `;
    map.AddTBString('SkipUrl', null, '要跳转的url', true, false, 0, 50, 20, true, help);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);
    map.AddTBString('FK_Stations', null, '角色ids', false, true, 0, 200, 30); //@?
    map.AddTBAtParas(4000); //参数.

    //map.AddDDLSysEnum('ShareOrgSln', 0, '组织共享方案', true, true, 'ShareOrgSln', '@0=不共享@1=所有组织@2=指定的组织@3=指定组织指定的角色');
    map.AddDDLSysEnum('ShareOrgSln', 0, '组织共享方案', true, true, 'ShareOrgSln', '@0=不共享@1=按照系统权限设置');

    map.AddTBString('AppNo', null, '应用编号', true, false, 0, 50, 20);
    const helpAppNo = `
    #### 应用编号
    - 多个系统组成一个应用,该名称是应用编号.
    - 改变编号应用于访问打开系统的时候,对菜单进行过滤.
    - http://xxx.ccbpm.cn/Home.vue?AppNo=xxxx&Token=xxxxx&UserNo=xxxx
    - 标识：1. 菜单仅仅显示有AppNo的系统.  2. 系统图标显示  /public/AppNo.png
    `;
    map.SetHelperAlert('AppNo', helpAppNo);
    map.AddHidden('Name', '!=', '业务流程');

    map.AddGroupMethod('基本设置');
    map.AddRM_PG(new PG_Module2Menu(), 'icon-book-open');

    map.AddRM_DtlSearch('应用权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '&CtrlObj=System', 'icon-energy', true);

    const rm = new RefMethod();
    rm.Title = '导出应用模板';
    rm.ClassMethod = 'ExpTemplate';
    rm.RefMethodType = RefMethodType.Func;
    rm.Icon = 'icon-logout';
    // map.AddRefMethod(rm);

    const rmLogin = new RefMethod();
    rmLogin.Title = '独立登录';
    rmLogin.ClassMethod = 'LoginIt';
    rmLogin.RefMethodType = RefMethodType.Func;
    rmLogin.Icon = 'icon-logout';
    map.AddRefMethod(rmLogin);

    const rmDel = new RefMethod();
    rmDel.Title = '删除应用';
    rmDel.ClassMethod = 'DeleteIt';
    rmDel.RefMethodType = RefMethodType.Func;
    rmDel.Icon = 'icon-close';
    map.AddRefMethod(rmDel);

    map.AddGroupMethod('多语言', 'icon-globe');
    map.AddRM_DtlBatch('模块', new ModuleLangs(), 'SystemNo', '', '', 'icon-drop', '');
    map.AddRM_DtlBatch('菜单', new MenuLangs(), 'SystemNo', '', '', 'icon-drop', '&OrderBy=Idx');
    map.AddRM_En('系统', 'TS.GPM.MySystemLang', '@No');

    const rm2 = new RefMethod();
    rm2.Title = '自动翻译';
    rm2.ClassMethod = 'SysLange';
    rm2.Icon = 'icon-check';
    rm2.RefMethodType = RefMethodType.Func;
    rm2.HisMap.AddTBString('SysNo', 'En', '请输入要翻译的语言编号en英语,ft繁体,ja日本, 默认为en', true, false, 0, 100, 100, true, '');
    map.AddRefMethod(rm2);
    this._enMap = map;
    return this._enMap;
  }

  public async SysLange(lang: string) {
    lang = lang.toUpperCase();

    //翻译分组.
    const gfEns = new ModuleLangs();
    await gfEns.Retrieve('SystemNo', this.No);
    await MapFrmFool.SysLange_Ens(gfEns, lang, '模块');
    message.info('开始翻译-模块...');

    //翻译分组.
    const menus = new MenuLangs();
    await menus.Retrieve('SystemNo', this.No);
    await MapFrmFool.SysLange_Ens(menus, lang, '菜单');
    message.info('开始翻译-菜单...');

    //翻译分组.
    const systemps = new MySystemLangs();
    await systemps.Retrieve('No', this.No);
    await MapFrmFool.SysLange_Ens(systemps, lang, '系统名称');
    message.info('开始翻译-系统...');

    return '执行成功';
  }

  public LoginIt() {
    const url = 'http://ccflow.org/';
    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
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

    this.Idx = 1000;
    return true;
  }
}
/**
 * 系统s
 */
export class MySystems extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MySystem();
  }
  constructor() {
    super();
  }
}
