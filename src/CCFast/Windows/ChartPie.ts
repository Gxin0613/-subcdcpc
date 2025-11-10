import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { WindowTemplateAttr } from './Admin/WindowTemplate';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { Jump } from '/@/CCFast/Windows/Jump';
import { GPE_GenerDBSrcSearch } from '../GenerDBSrc/GPE_GenerDBSrcSearch';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
/// 饼图
export class ChartPie extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.ChartPie');
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
    const map = new Map('GPM_WindowTemplate', '饼图');
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
    map.AddBoolean('IsPie', true, '饼图', true, false);

    // map.AddGroupAttr('数据源(废)');
    // map.AddDDLEntities(WindowTemplateAttr.DBSrc, null, '数据源', new SFDBSrc(), true);
    // //map.AddDDLSysEnum(WindowTemplateAttr.DBType, 0, '类型', true, true, 'WindowsDBType', '@0=数据库查询SQL@1=执行Url返回Json@2=执行\\DataUser\\JSLab\\Windows.js的函数.');
    // map.AddTBStringDoc(WindowTemplateAttr.Docs, null, '表达式', true, false, true);
    // map.AddTBString(WindowTemplateAttr.C0Ens, null, '维度0数据', true, false, 0, 200, 20, true);

    const url1 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@No', '&MarkID=Main');
    map.AddLink('C3Ens', '设置-数据源', url1, false, GPNReturnType.OpenUrlByDrawer50, '', 'icon-settings');

    map.AddGroupAttr('刷新频率');
    map.AddTBInt('RefreshM', 0, '分钟', true, false);
    map.AddTBInt('RefreshS', 0, '秒', true, false);

    map.AddGroupAttr('明细设置');
    const lab = new Jump();
    map.AddAttrs(lab._enMap.attrs); // 增加一个集合
    map.loaders = [...map.loaders, ...lab._enMap.loaders];

    // map.AddGroupAttr('数据源');
    // map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '数据源', '');

    this._enMap = map;

    return this._enMap;
  }
}
