import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GenerBillExt } from '/@/CCFast/CCBill/GenerBillExt';
import { GL_BillStart } from './GL_BillStart';
import { GL_BillTodolist } from './GL_BillTodolist';
import { GL_BillRecent } from './GL_BillRecent';
import { GL_DictStart } from '../GL_DictStart';
import { useI18n } from '/@/hooks/web/useI18n';
import { GL_BillFocus } from '../GL_BillFocus';
const { t } = useI18n();
// 人员
export class BillSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.BillSetting');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('WF_Emp', '我的单据');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', false, false, 1, 3, 50);
    // map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);

    // map.AddGroupMethod('单据'); //单据
    map.AddGroupMethod('单据处理'); //单据

    map.AddRM_GL(new GL_BillStart(), '发起', 'icon-paper-plane');
    map.AddRM_GL(new GL_BillTodolist(), '待办', 'icon-clock');
    map.AddRM_GL(new GL_BillRecent(), '近期', 'icon-envelope');
    map.AddRM_GL(new GL_BillFocus(), '收藏', 'icon-star');

    map.AddGroupMethod('查询分析'); //单据
    map.AddRM_Search(new GenerBillExt(), 'icon-list', '', '查询'); //综合查询.
    map.AddRM_Group(new GenerBillExt(), 'icon-graph', '', '分析');

    map.AddGroupMethod('实体'); //实体.
    map.AddRM_GL(new GL_DictStart(), '实体', 'icon-rocket');

    // map.AddMapLoader(() => {
    //   map.AddGroupMethod('查询分析');
    //   map.AddRM_UrlTabOpen('查询', GloComm.UrlSearchBill(this。), 'icon-list');
    //   map.AddRM_UrlTabOpen('分析', GloComm.UrlGroupBill(this.No), 'icon-chart');
    //   map.AddRM_UrlTabOpen('大屏', GloComm.UrlWhiteScreenViewer('FrmBill' + this.No), 'icon-film');
    //   map.AddRM_UrlTabOpen('报表', GloComm.UrlRptBill(this.No), 'icon-docs');
    // });

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
