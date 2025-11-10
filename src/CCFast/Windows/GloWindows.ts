import { WindowTemplateAttr } from './Admin/WindowTemplate';
import { Map } from '/@/bp/en/Map/Map';
import { SFDBSrc } from '../../WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';

export class GloWindows {
  public static StationDBSrcMap(desc: string): Map {
    const map = new Map('GPM_WindowTemplate', desc);
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

    map.AddBoolean('IsPie', false, '饼图?', true, true);
    map.AddBoolean('IsLine', false, '折线图?', true, true);
    map.AddBoolean('IsZZT', false, '柱状图?', true, true);
    map.AddBoolean('IsRing', false, '显示环形图?', true, true);
    map.AddBoolean('IsRate', false, '百分比扇形图?', true, true);
    map.AddDDLSysEnum(WindowTemplateAttr.DefaultChart, 0, '默认显示图形', true, true, WindowTemplateAttr.DefaultChart, '@0=饼图@1=折线图@2=柱状图@3=显示环形图@4=百分比扇形图');

    map.AddGroupAttr('数据源');
    map.AddDDLSysEnum(WindowTemplateAttr.DBType, 0, '数据源类型', true, true, 'WindowsDBType', '@0=数据库查询SQL@1=执行Url返回Json@2=执行DataUserJSLabWindows.js的函数.');
    map.AddTBStringDoc(WindowTemplateAttr.Docs, null, 'SQL内容表达式', true, false, true);
    map.AddTBStringDoc(WindowTemplateAttr.C0Ens, null, '列0外键数据(可选)', true, false, true);
    map.AddTBStringDoc(WindowTemplateAttr.C1Ens, null, '列1外键数据(可选)', true, false, true);
    map.AddTBStringDoc(WindowTemplateAttr.C2Ens, null, '列2外键数据(可选)', true, false, true);
    map.AddTBStringDoc(WindowTemplateAttr.C3Ens, null, '列3外键数据(可选)', true, false, true);
    map.AddDDLEntities(WindowTemplateAttr.DBSrc, null, '数据源', new SFDBSrc(), true);

    map.AddGroupAttr('刷新频率');
    map.AddTBInt('RefreshM', 0, '分钟', true, false);
    map.AddTBInt('RefreshS', 0, '秒', true, false);

    return map;
  }
}
