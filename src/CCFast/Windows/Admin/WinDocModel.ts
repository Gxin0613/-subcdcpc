/// 信息块 属性
export class WinDocModel {
  /// <summary>
  /// Html
  /// </summary>
  public static readonly Html = 'Html';
  /// <summary>
  /// 文本变量
  /// </summary>
  public static readonly HtmlVar = 'HtmlVar';
  public static readonly HtmlDtls = 'HtmlDtls'; //单指标
  public static readonly SSO = 'SSO'; //单点登录.
  public static readonly HtmlVarGroup = 'HtmlVarGroup';
  /// <summary>
  /// 系统内置
  /// </summary>
  public static readonly System = 'System';
  /// <summary>
  /// SQL列表
  /// </summary>
  public static readonly Table = 'Table';
  /// <summary>
  /// 折线图
  /// </summary>
  public static readonly ChartChina = 'ChartChina';
  /// <summary>
  /// 柱状图
  /// </summary>
  public static readonly ChartLine = 'ChartLine';
  /// <summary>
  /// 饼图
  /// </summary>
  public static readonly ChartPie = 'ChartPie';
  /// <summary>
  /// 扇形图
  /// </summary>
  public static readonly ChartRate = 'ChartRate';
  /// <summary>
  /// 环形图
  /// </summary>
  public static readonly ChartRing = 'ChartRing';
  public static readonly ChartZZT = 'ChartZZT';
  /// <summary>
  /// 雷达图
  /// </summary>
  public static readonly ChartRadar = 'ChartRadar';
  /// <summary>
  /// 高级折线图
  /// </summary>
  public static readonly ChartLineAdv = 'ChartLineAdv';
  /// <summary>
  /// 南丁格尔玫瑰图
  /// </summary>
  public static readonly ChartRose = 'ChartRose';
  public static readonly NativeEcharts = 'NativeEcharts';
  /// <summary>
  /// 标签页
  /// </summary>
  public static readonly Tab = 'Tab';
  public static readonly iFrame = 'iFrame';
}
/// 窗口类别.
const WindowCategory = {
  GenerChart: '通用图表',
  Flow: '流程',
  Billl: '单据',
  EntityNoName: '实体',
  Portal: '门户类',
};
/// 窗口定义.
export const WindowsDef = [
  // 通用图表 ****************************************************************************
  {
    type: WinDocModel.ChartLine,
    name: '折线图',
    category: WindowCategory.GenerChart,
    icon: 'icon-drop',
  },
  {
    type: WinDocModel.ChartPie,
    name: '丙状图',
    category: WindowCategory.GenerChart,
    icon: 'icon-pie-chart',
  },
  {
    type: WinDocModel.ChartZZT,
    name: '柱状图',
    category: WindowCategory.GenerChart,
    icon: 'icon-playlist',
  },
  {
    type: WinDocModel.ChartLineAdv,
    name: '高级折线图',
    category: WindowCategory.GenerChart,
    icon: 'icon-organization',
  },
  {
    type: WinDocModel.ChartLineAdv,
    name: '通用列表',
    category: WindowCategory.GenerChart,
    icon: 'icon-list',
  },
  // 流程相关 ****************************************************************************
  {
    type: WinDocModel.ChartLineAdv,
    name: '待办',
    category: WindowCategory.Flow,
    icon: 'icon-list',
  },
  {
    type: WinDocModel.ChartLineAdv,
    name: '在途',
    category: WindowCategory.Flow,
    icon: 'icon-list',
  },
];
