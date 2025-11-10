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

/// 系统
export class SystemPortal extends EntityNoName {
  constructor(pkVal?: string) {
    // super('TS.GPM.MySystem', 'BP.CCFast.CCMenu.MySystem');
    super('TS.GPM.SystemPortal');
    if (!!pkVal) {
      this.No = pkVal;
    }
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
    const map = new Map('GPM_System', '门户');
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 2, 100, 100);
    map.AddTBString('Name', null, '菜单标题', true, false, 0, 300, 150);
    map.AddTBString('Title', null, '主标题', true, false, 0, 300, 150, true);
    map.AddTBString('Icon', null, '图标', true, false, 0, 50, 150, true);
    //  map.AddDDLSysEnum('PageStyle', 0, '页面风格', true, true, 'SystemType', '@0=简洁大方@1=跳转系统');
    map.AddTBStringDoc('Docs', '公司版权所有@2003-2024(该内容在门户页面设置)', '尾部内容', true, false, true);
    map.AddTBInt('Idx', 0, '显示顺序', false, false);
    map.AddBoolean('IsEnable', true, '启用?', true, true, false);
    map.AddTBString('AppNo', null, '应用编号', true, true, 0, 50, 20);
    map.AddTBAtParas(4000); //参数.

    map.AddGroupAttr('气泡显示');
    map.AddBoolean('Todolist_EmpWorks', true, '待办', true, true, false);
    map.AddBoolean('Todolist_Draft', true, '草稿', true, true, false);
    map.AddBoolean('Todolist_Complete', true, '已完成', true, true, false);
    map.AddBoolean('Todolist_ReturnNum', true, '退回', true, true, false);
    map.AddBoolean('Todolist_CCWorks', true, '抄送', true, true, false);
    map.AddBoolean('Todolist_OverWorkNum', true, '逾期', true, true, false);
    map.AddBoolean('Todolist_UnRead', true, '未阅', true, true, false);
    map.AddBoolean('Todolist_HungupNum', true, '挂起', true, true, false);

    map.AddGroupMethod('基本设置');
    map.AddMapLoader(() => {
      map.AddRM_UrlTabOpen('设计门户', `/src/CCFast/components/RptWhite.vue?PageID=${this.PKVal}&edit=1`);
      //   map.AddRM_UrlLinkeWinOpen('预览门户', `/#/portal/rptContent?PageStyle=${this.PageStyle}&PageID=${this.PKVal}&edit=0`);
    });

    map.AddRM_DtlSearch('门户权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '&CtrlObj=System', 'icon-energy', true);

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

/**
 * 系统s
 */
export class SystemPortals extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SystemPortal();
  }
  constructor() {
    super();
  }
}
