import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

export enum ChartModel {
  Table = 'Table',
  HtmlVar = 'HtmlVar',
  HtmlDtls = 'HtmlDtls', //多方块
  Html = 'Html',
  ChartLine = 'ChartLine',
  ChartLineAdv = 'ChartLineAdv', // 高级折线图
  ChartChina = 'ChartChina',
  ChartPie = 'ChartPie',
  ChartRate = 'ChartRate',
  ChartRing = 'ChartRing',
  ChartZZT = 'ChartZZT',
  NativeEcharts = 'NativeEcharts',
  URL = 'URL', // 展示用户配置的URL
  ChartRadar = 'ChartRadar', //雷达图
  ChartRose = 'ChartRose', //南丁格尔玫瑰图
  VueComponent = 'VueComponent',
}

/// 信息块 属性
export class WindowTemplateAttr extends EntityNoNameAttr {
  /// <summary>
  /// 信息块类型
  /// </summary>
  public static readonly Icon = 'Icon';
  /// <summary>
  /// 顺序
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// 标题
  /// </summary>
  public static readonly Docs = 'Docs';
  /// <summary>
  /// 要弃用了
  /// </summary>
  public static readonly WinDocType = 'WinDocType';
  /// <summary>
  /// 模式
  /// </summary>
  public static readonly WinDocModel = 'WinDocModel';
  /// <summary>
  /// tag1
  /// </summary>
  public static readonly ColSpan = 'ColSpan';
  public static readonly RowSpan = 'RowSpan';
  public static readonly WindowHeight = 'WindowHeight';
  /// <summary>
  /// Tag2
  /// </summary>
  public static readonly MoreLinkModel = 'MoreLinkModel';
  /// <summary>
  /// PopW
  /// </summary>
  public static readonly PopW = 'PopW';
  public static readonly PopH = 'PopH';
  /// <summary>
  /// 风格，比如Tab风格, table风格等.
  /// </summary>
  public static readonly Style = 'Style';
  /// <summary>
  /// 是否可删除
  /// </summary>
  public static readonly IsDel = 'IsDel';
  /// <summary>
  /// 控制方式
  /// </summary>
  public static readonly CtrlWay = 'CtrlWay';
  /// <summary>
  /// 打开方式
  /// </summary>
  public static readonly OpenWay = 'OpenWay';
  /// <summary>
  /// 更多标签
  /// </summary>
  public static readonly MoreLab = 'MoreLab';
  /// <summary>
  /// MoreUrl
  /// </summary>
  public static readonly MoreUrl = 'MoreUrl';
  /// <summary>
  /// 产生时间
  /// </summary>
  public static readonly DocGenerRDT = 'DocGenerRDT';
  /// <summary>
  /// 是否独占一行
  /// </summary>
  public static readonly IsEnable = 'IsEnable';
  /// <summary>
  /// 组织编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// 页面ID.
  /// </summary>
  public static readonly PageID = 'PageID';

  public static readonly DefaultChart = 'DefaultChart';

  //维度:数据源.
  public static readonly C0Ens = 'C0Ens';
  public static readonly C1Ens = 'C1Ens';
  public static readonly C2Ens = 'C2Ens';
  public static readonly C3Ens = 'C3Ens';

  // 数据源
  public static readonly DBType = 'DBType';
  public static readonly DBSrc = 'DBSrc';
  public static readonly DBExp0 = 'DBExp0';
  public static readonly DBExp1 = 'DBExp1';
  public static readonly DBExp2 = 'DBExp2';

  /// <summary>
  /// 显示类型
  /// </summary>
  public static readonly WindowsShowType = 'WindowsShowType';
  //#endregion 数据源

  // #region 百分比扇形图
  public static readonly LabOfFZ = 'LabOfFZ';
  public static readonly SQLOfFZ = 'SQLOfFZ';
  public static readonly LabOfFM = 'LabOfFM';
  public static readonly SQLOfFM = 'SQLOfFM';
  public static readonly LabOfRate = 'LabOfRate';
  //#endregion 百分比扇形图
}

/// 信息块
export class WindowTemplate extends EntityNoName {
  /// 组织编号
  get OrgNo() {
    return this.GetValStringByKey(WindowTemplateAttr.OrgNo);
  }

  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.WindowTemplate');
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
    const map = new Map('GPM_WindowTemplate', '信息块');

    //#region 基本信息.
    map.AddTBStringPK(WindowTemplateAttr.No, null, '编号', true, true, 1, 40, 100);
    map.AddTBString(WindowTemplateAttr.Name, null, '标题', true, false, 0, 300, 20, true);

    map.AddTBInt(WindowTemplateAttr.ColSpan, 1, '占的列数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.ColSpan, '画布按照4列划分布局，输入的输在在1=4之间.');

    map.AddTBInt(WindowTemplateAttr.RowSpan, 1, '占的行数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.RowSpan, '换算高度为360px * rowspan');

    map.AddTBFloat('WindowHeight', 360, '窗口高度', true, false);
    map.SetHelperAlert('WindowHeight', '窗口高度，单位为px， 如果配置了高度，则RowSpan不生效');

    map.AddTBFloat('H', 100, '占的列数', true, false);
    map.AddTBFloat('W', 200, '占的列数', true, false);
    map.AddTBFloat('X', 200, '占的列数', true, false);
    map.AddTBFloat('Y', 200, '占的列数', true, false);

    map.AddTBString(WindowTemplateAttr.WinDocModel, null, '内容类型', true, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.Icon, null, 'Icon', true, false, 0, 100, 20, true);
    map.AddTBString(WindowTemplateAttr.PageID, null, '页面ID', true, true, 0, 100, 20, false);
    // #endregion 基本信息.

    // map.AddDDLSysEnum(WindowTemplateAttr.ColSpan, 1, "占的列数", true, true, WindowTemplateAttr.ColSpan,
    //  "@1=1列@2=2列@3=覆盖新窗口");

    // #region 更多的信息定义.
    map.AddTBString(WindowTemplateAttr.MoreLab, null, '更多标签', false, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.MoreUrl, null, '更多链接', false, false, 0, 300, 20, true);
    map.AddDDLSysEnum(WindowTemplateAttr.MoreLinkModel, 0, '打开方式', false, false, WindowTemplateAttr.MoreLinkModel, '@0=新窗口@1=本窗口@2=覆盖新窗口');
    map.AddTBInt(WindowTemplateAttr.PopW, 500, 'Pop宽度', false, true);
    map.AddTBInt(WindowTemplateAttr.PopH, 400, 'Pop高度', false, true);
    //#endregion 更多的信息定义.

    // #region 内容定义.
    map.AddTBString(WindowTemplateAttr.MoreUrl, null, '更多链接', false, false, 0, 300, 20, true);

    //  #endregion 内容定义.

    //  #region 权限定义.
    // 0=Html , 1=SQL列表
    //  map.AddTBInt(WindowTemplateAttr.WinDocModel, 0, "内容类型", false, true);
    // map.AddTBString(WindowTemplateAttr.Docs, null, "内容", true, false, 0, 4000, 20);
    // #endregion 权限定义.

    //  #region 其他
    map.AddTBInt(WindowTemplateAttr.Idx, 0, '默认的排序', false, false);
    map.AddBoolean(WindowTemplateAttr.IsDel, true, '用户是否可删除', false, false);
    map.AddBoolean(WindowTemplateAttr.IsEnable, false, '是否禁用?', false, false);
    map.AddTBString(WindowTemplateAttr.OrgNo, null, 'OrgNo', false, false, 0, 50, 20);
    //   #endregion 其他

    //   #region 扇形图
    map.AddTBString(WindowTemplateAttr.LabOfFZ, null, '分子标签', true, false, 0, 100, 20);
    map.AddTBStringDoc(WindowTemplateAttr.SQLOfFZ, null, '分子表达式', true, false, true);

    map.AddTBString(WindowTemplateAttr.LabOfFM, null, '分母标签', true, false, 0, 100, 20);
    map.AddTBStringDoc(WindowTemplateAttr.SQLOfFM, null, '分子表达式', true, false, true);
    map.AddTBString(WindowTemplateAttr.LabOfRate, null, '率标签', true, false, 0, 100, 20);
    //  #endregion 扇形图

    map.AddTBString(WindowTemplateAttr.C0Ens, null, '维度0数据', true, false, 0, 200, 20, true);
    map.AddTBString(WindowTemplateAttr.C1Ens, null, '维度1数据', true, false, 0, 200, 20, true);
    map.AddTBString(WindowTemplateAttr.C2Ens, null, '维度2数据', true, false, 0, 200, 20, true);
    map.AddTBString(WindowTemplateAttr.C3Ens, null, '维度3数据', true, false, 0, 200, 20, true);

    //  #region 多图形展示.
    map.AddBoolean('IsPie', false, '饼图?', true, true);
    map.AddBoolean('IsLine', false, '折线图?', true, true);
    map.AddBoolean('IsZZT', false, '柱状图?', true, true);
    map.AddBoolean('IsRing', false, '显示环形图?', true, true);
    //      map.AddBoolean("IsRate", false, "百分比扇形图?", true, true);
    map.AddDDLSysEnum(WindowTemplateAttr.DefaultChart, 0, '默认显示图形', true, true, WindowTemplateAttr.DefaultChart, '@0=饼图@1=折线图@2=柱状图@3=显示环形图');

    map.AddTBString('Tag1', null, 'Tag1', true, false, 0, 500, 20);

    //数据源相关.
    map.AddTBInt('DBSrcModel', 0, '数据源模式?', true, true);
    map.AddTBString(WindowTemplateAttr.DBSrc, 'local', '数据源', false, false, 0, 300, 20, true);
    map.AddTBStringDoc(WindowTemplateAttr.Docs, null, '表达式', true, false, true);

    map.AddGroupAttr('刷新频率');
    map.AddTBInt('RefreshM', 0, '分钟', true, false);
    map.AddTBInt('RefreshS', 0, '秒', true, false);

    // #endregion 多图形展示.
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 信息块s
 */
export class WindowTemplates extends EntitiesNoName {
  get GetNewEntity(): WindowTemplate {
    return new WindowTemplate();
  }

  constructor() {
    super();
  }
}
