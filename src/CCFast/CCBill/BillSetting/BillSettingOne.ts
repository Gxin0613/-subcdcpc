import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GL_BillTodolist } from './GL_BillTodolist';
import { GL_BillDraft } from './GL_BillDraft';
import { GL_BillRecent } from './GL_BillRecent';
import { FrameworkExt } from '/@/CommExt/FrameworkExt';
import { GL_BillStart } from './GL_BillStart';
import { GL_BillRuning } from './GL_BillRuning';
// 人员
export class BillSettingOne extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.BillSettingOne');
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
    const map = new Map('Sys_MapData', '单据');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', true, true, 1, 3, 50);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);

    map.AddMapLoader(() => {
      map.AddGroupMethod('单据功能');
      map.AddRM_UrlTabOpen('列表', GloComm.UrlSearchBill(this.No)  + '&IsHideDesign=1', 'icon-list');
      map.AddRM_UrlTabOpen('分析', GloComm.UrlGroupBill(this.No) + '&IsHideDesign=1', 'icon-chart');
      map.AddRM_UrlTabOpen('报表', GloComm.UrlRptBill(this.No) + '&IsHideDesign=1', 'icon-docs');
      map.AddRM_UrlTabOpen('大屏', GloComm.UrlWhiteScreenViewer('FrmBill' + this.No, this.No), 'icon-film');

      map.AddGroupMethod('单据审核');
      map.AddRM_GL(new GL_BillStart(), '发起', 'icon-clock', '&FrmID=' + this.No);
      map.AddRM_GL(new GL_BillDraft(), '草稿', 'icon-doc', '&FrmID=' + this.No);
      map.AddRM_GL(new GL_BillTodolist(), '待办', 'icon-clock', '&FrmID=' + this.No);
      map.AddRM_GL(new GL_BillRuning(), '审核中', 'icon-clock', '&FrmID=' + this.No);
      map.AddRM_GL(new GL_BillRecent(), '近期', 'icon-feed', '&FrmID=' + this.No);
      // map.AddRM_UrlLinkeWinOpen('单据接口', 'http://doc.ccbpm.cn');
    });
    // map.AddGroupMethod('单据API');
    // map.AddRM_UrlLinkeWinOpen('单据接口', 'http://doc.ccbpm.cn');

    // map.AddRM_UrlTabOpen('单据新建', '/src/CCFast/CCBill/SearchBill.vue?FrmID=@No', 'icon-drop');

    // //vu.Bill
    // // map.AddMapLoader(() => {
    // map.AddRM_UrlTabOpen('单据查询', '/src/CCFast/CCBill/SearchBill.vue?FrmID=' + this.No, 'icon-drop');
    // map.AddRM_UrlTabOpen('单据分析', '/src/CCFast/CCBill/GroupBill.vue?FrmID=' + this.No, 'icon-chart');
    // map.AddRM_UrlTabOpen('大屏(开发中)', '/src/CCFast/CCBill/BigScreen.vue?FrmID=' + this.No, 'icon-drop');
    // // });

    // map.AddRM_GL(new GL_BillStart(), '发起', 'icon-paper-plane');
    // map.AddRM_GL(new GL_BillTodolist(), '待办', 'icon-clock');
    // map.AddRM_GL(new GL_BillRecent(), '近期', 'icon-envelope');

    // map.AddRM_Search(new GenerBillExt(), 'icon-list', '', '综合查询');

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
