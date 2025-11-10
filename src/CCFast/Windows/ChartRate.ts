import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { WindowTemplateAttr } from './Admin/WindowTemplate';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { GPE_GenerDBSrcSearch } from '../GenerDBSrc/GPE_GenerDBSrcSearch';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
/// 百分比扇形图
export class ChartRate extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.ChartRate');
    if (!!pkVal) {
      this.setPKVal(pkVal);
    }
  }
  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('GPM_WindowTemplate', '百分比扇形图');
    map.GroupBarShowModel = 0;
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK(WindowTemplateAttr.No, null, '编号', true, true, 1, 40, 200);
    map.AddTBInt(WindowTemplateAttr.ColSpan, 1, '占的列数', true, false);
    map.AddTBInt(WindowTemplateAttr.RowSpan, 1, '占的行数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.RowSpan, '换算高度为360px * rowspan');

    map.AddTBString(WindowTemplateAttr.Name, null, '标题', true, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.Icon, null, 'Icon', true, false, 0, 100, 20, true);

    map.AddTBString(WindowTemplateAttr.MoreLab, null, '更多标签', true, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.MoreUrl, null, '更多链接', true, false, 0, 300, 20, true);
    const help = `
    #### 帮助
    - url链接可以配置外链，以http:// 或者 https:// 开头
      外链可以为任意互联网地址 - 例如ccflow官网: http://ccflow.org
    - url链接也可以配置系统内部的链接， 以self://开头
      系统内部链接可以配置系统工作地址 - 例如打开编号001的流程: self://WF/MyFlow?FK_Flow=001 
    `;
    map.SetHelperAlert(WindowTemplateAttr.MoreUrl, help);
    map.AddDDLSysEnum(WindowTemplateAttr.MoreLinkModel, 0, '打开方式', true, true, WindowTemplateAttr.MoreLinkModel, '@0=新窗口@1=本窗口@2=覆盖新窗口');

    // //   #region 扇形图
    // map.AddTBStringDoc(WindowTemplateAttr.SQLOfFZ, null, '分子表达式', true, false, true);
    // map.AddTBStringDoc(WindowTemplateAttr.SQLOfFM, null, '分母表达式', true, false, true);
    // map.AddTBString(WindowTemplateAttr.LabOfRate, null, '率标签', true, false, 0, 100, 20);

    map.AddTBString(WindowTemplateAttr.LabOfFZ, null, '分子标签', true, false, 0, 100, 20);
    const url1 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@No', '&MarkID=FZ');
    map.AddLink('SQLOfFZ', '设置-分子表达式', url1, false, GPNReturnType.OpenUrlByDrawer50, '', 'icon-settings');

    map.AddTBString(WindowTemplateAttr.LabOfFM, null, '分母标签', true, false, 0, 100, 20);
    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@No', '&MarkID=FM');
    map.AddLink('SQLOfFM', '设置-分母表达式', url, false, GPNReturnType.OpenUrlByDrawer50, '', 'icon-settings');
    map.AddTBString(WindowTemplateAttr.LabOfRate, null, '率标签', true, false, 0, 100, 20);

    map.AddGroupAttr('刷新频率');
    map.AddTBInt('RefreshM', 0, '分钟', true, false);
    map.AddTBInt('RefreshS', 0, '秒', true, false);
    map.AddGroupAttr('明细设置');
    map.AddTBStringDoc('DtlExp', null, '分子明细', true, false, true);
    map.AddTBStringDoc('DtlFMExp', null, '分母明细', true, false, true);
    map.AddTBStringDoc('DtlColNames', null, '列名对应', true, false, true);
    map.SetHelperAlert('DtlColNames', 'Key1=值1,key2=值2');
    const dtlOpenWay = '@0=抽屉50%@1=抽屉70%@2=抽屉90%@3=弹窗打开@4=新窗口打开';
    map.AddDDLSysEnum('DtlOpenWay', 0, '打开方式', true, true, 'DtlOpenWay', dtlOpenWay);
    map.AddTBInt('DtlW', 500, '宽度', true, false);
    map.AddTBInt('DtlH', 300, '高度', true, false);

    // map.AddGroupAttr('数据源');
    // map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '数据源', '');
    this._enMap = map;

    return this._enMap;
  }
}
