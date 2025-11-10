import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GL_AskFrmStart } from './GL_AskFrmStart';
import { GL_AskFrmRuning } from './GL_AskFrmRuning';
import { FrameworkExt } from '/@/CommExt/FrameworkExt';
import { GL_AskFrmHistory } from './GL_AskFrmHistory';
import { GL_AskFrmPublic } from './GL_AskFrmPublic';
// 人员
export class AskFrmSettingOne extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.AskFrmSettingOne');
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
    const map = new Map('Sys_MapData', '活动');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', true, true, 1, 3, 50);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);

    map.AddMapLoader(() => {
      // map.AddGroupMethod('单据功能');
      // map.AddRM_UrlTabOpen('列表', GloComm.UrlSearchAskFrm(this.No), 'icon-list');
      // map.AddRM_UrlTabOpen('分析', GloComm.UrlGroupAskFrm(this.No), 'icon-chart');
      // map.AddRM_UrlTabOpen('报表', GloComm.UrlRptAskFrm(this.No), 'icon-docs');
      // map.AddRM_UrlTabOpen('大屏', GloComm.UrlWhiteScreenViewer('FrmAskFrm' + this.No, this.No), 'icon-film');
      map.AddGroupMethod('活动');
      map.AddRM_GL(new GL_AskFrmStart(), '发起', 'icon-clock', '&FrmID=' + this.No);
      // map.AddRM_GL(new GL_AskFrmDraft(), '草稿', 'icon-doc', '&FrmID=' + this.No);
      map.AddRM_GL(new GL_AskFrmRuning(), '进行中', 'icon-clock', '&FrmID=' + this.No);
      map.AddRM_GL(new GL_AskFrmHistory(), '历史活动', 'icon-feed', '&FrmID=' + this.No);
      map.AddRM_GL(new GL_AskFrmPublic(), '公共活动', 'icon-fire', '&FrmID=' + this.No);

      // map.AddRM_UrlLinkeWinOpen('单据接口', 'http://doc.ccbpm.cn');
    });
    // map.AddGroupMethod('单据API');
    // map.AddRM_UrlLinkeWinOpen('单据接口', 'http://doc.ccbpm.cn');
    // map.AddRM_UrlTabOpen('单据新建', '/src/CCFast/CCAskFrm/SearchAskFrm.vue?FrmID=@No', 'icon-drop');
    // //vu.AskFrm
    // // map.AddMapLoader(() => {
    // map.AddRM_UrlTabOpen('单据查询', '/src/CCFast/CCAskFrm/SearchAskFrm.vue?FrmID=' + this.No, 'icon-drop');
    // map.AddRM_UrlTabOpen('单据分析', '/src/CCFast/CCAskFrm/GroupAskFrm.vue?FrmID=' + this.No, 'icon-chart');
    // map.AddRM_UrlTabOpen('大屏(开发中)', '/src/CCFast/CCAskFrm/BigScreen.vue?FrmID=' + this.No, 'icon-drop');
    // // });
    // map.AddRM_GL(new GL_AskFrmStart(), '发起', 'icon-paper-plane');
    // map.AddRM_GL(new GL_AskFrmTodolist(), '待办', 'icon-clock');
    // map.AddRM_GL(new GL_AskFrmRecent(), '近期', 'icon-envelope');

    // map.AddRM_Search(new GenerAskFrmExt(), 'icon-list', '', '综合查询');

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
