import { EChartsOption } from 'echarts';
import { ChartModel, WindowTemplate, WindowTemplates } from '/@/CCFast/Windows/Admin/WindowTemplate';
import { HtmlVarDtl, HtmlVarDtls } from '/@/CCFast/Windows/HtmlVarDtl';
import DBAccess from '/@/utils/gener/DBAccess';
import { getRequestParams } from '/@/utils/request/decode';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
//大屏
export abstract class DataVBase {
  private chartList: WindowTemplates = new WindowTemplates();
  private dtlList: HtmlVarDtls = new HtmlVarDtls();
  public get ChartList() {
    return this.chartList;
  }
  public get DtlList() {
    return this.dtlList;
  }
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */
  public RequestVal(key: string) {
    return this._params[key] || getRequestParams(key);
  }

  private _params = {};

  public SetParams(record: Recordable) {
    this._params = record;
  }

  //百分比扇形图
  public ChartRate() {}

  /**
   * 增加静态文本.
   * @param title 标题
   * @param colSpan 跨度
   * @param icon icon
   * @param exp 内容.
   * @returns
   */
  public AddHtml(title: string, colSpan: number, icon: string, exp: string, rowSpan = 1) {
    const en = new WindowTemplate();
    en.Title = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.Icon = icon;
    en.Docs = exp;
    en.WinDocModel = ChartModel.Html;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  public AddVueComponent(fileSrc: string, title: string, colSpan: number, icon: string, rowSpan = 1, params = {}) {
    const en = new WindowTemplate();
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.Icon = icon;
    en.Docs = fileSrc;
    en.WinDocModel = ChartModel.VueComponent;
    en.No = DBAccess.GenerGUID();
    en.Params = params;
    this.chartList.push(en);
  }
  /**
   * 增加URL.
   * @param title 标题
   * @param colSpan 跨度
   * @param icon icon
   * @param exp 内容.
   * @returns
   */
  public AddURL(title: string, colSpan: number, icon: string, url: string, rowSpan = 1) {
    const en = new WindowTemplate();
    en.Title = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.Icon = icon;
    en.Docs = url;
    en.WinDocModel = ChartModel.URL;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }
  public currID = null;

  /**
   * 多文本方块输出
   * @param option 配置
   */
  public AddHtmlDtls(
    option: Partial<{
      title: string;
      colSpan: number;
      rowSpan?: number;
      icon: string;
      decimal?: number;
      children?: { icon: string; title: string; exp?: string; fontColor?: string; docs: string; leftText: string; rightText: string }[];
    }>,
  ) {
    const en = new WindowTemplate();
    const { title, colSpan, icon, rowSpan = 1, children, decimal } = option;
    const id = DBAccess.GenerGUID();
    en.No = id;
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.Decimal = decimal;
    en.Icon = icon;
    en.WinDocModel = ChartModel.HtmlDtls;
    en.DBDtls = children; //数据源对象.

    if (Array.isArray(children) && children.length > 0) {
      for (const item of children) {
        this.AddHtmlVarDtl({ dbSrc: 'local', exp: item.exp, name: item.title, refPKVal: id, fontColor: item.fontColor, icon: item.icon });
      }
    }
    this.chartList.push(en);
  }

  public AddHtmlVar(
    option: Partial<{
      title: string;
      colSpan: number;
      rowSpan?: number;
      icon: string;
      decimal?: number;
      children?: { title: string; exp: string; fontColor: string; icon: string }[];
    }>,
  ) {
    const en = new WindowTemplate();
    const { title, colSpan, icon, rowSpan = 1, children, decimal } = option;
    const id = DBAccess.GenerGUID();
    en.No = id;
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.Decimal = decimal;
    en.Icon = icon;
    en.WinDocModel = ChartModel.HtmlVar;
    en.DBDtls = children;
    if (Array.isArray(children) && children.length > 0) {
      for (const item of children) {
        this.AddHtmlVarDtl({ dbSrc: 'local', exp: this.queryFirstV(item.exp), name: item.title, refPKVal: id, fontColor: item.fontColor, icon: item.icon });
      }
    }
    this.chartList.push(en);
  }
  private queryFirstV(exps) {
    let expstr;
    if (exps.length > 0) {
      expstr = Object.values(exps[0])[0];
    } else {
      expstr = '';
    }
    return expstr;
  }
  private AddHtmlVarDtl(
    option: Partial<{
      dbSrc: string;
      name: string;
      exp: string;
      refPKVal: string;
      fontColor: string;
      icon: string;
    }>,
  ) {
    const enDtl = new HtmlVarDtl();
    enDtl.DBSrc = option.dbSrc;
    enDtl.RefPK = option.refPKVal;
    enDtl.Name = option.name;
    enDtl.Exp0 = option.exp;
    enDtl.FontColor = option.fontColor;
    enDtl.MyPK = DBAccess.GenerGUID();
    enDtl.Icon = option.icon;
    this.dtlList.push(enDtl);
  }

  public AddSelf(mark: string, title: string, icon: string, colSpan: number, rowSpan: number, docs = '') {
    const en = new WindowTemplate();
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.WinDocModel = mark; //流程动态.
    en.Icon = icon;
    en.Docs = docs;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  /**
   * 自定义组件-写在前面的一段话
   */
  public Self_Know() {
    this.AddSelf('Know', t('home.datav.know'), 'icon-emotsmile', 4, 1);
  }

  /**
   * 自定义组件-天气预报
   */
  public Self_Weather() {
    this.AddSelf('Weather', t('home.datav.weatherforecast'), 'icon-location-pin', 2, 1);
  }

  /**
   * 我的流程:从 WF_Comm_EmpBigScreen.Self_MovementFlow_My 获取数据.
   */
  public Self_MovementFlowMy() {
    this.AddSelf('MovementFlow', t('home.datav.myworkflowupdates'), 'icon-feed', 2, 1);
  }

  /**
   * 管理员流程动态
   * @param flowNo 指定流程编号,可以为空,就是全局的.
   */
  public Self_MovementFlowAdmin() {
    this.AddSelf('MovementFlow', t('home.datav.overallworkflowupdates'), 'icon-feed', 2, 1);
  }

  // 流程指标
  public Self_FlowZhiBiaoAdmin() {
    this.AddSelf('Self_FlowZhiBiaoAdmin', t('home.datav.orgprome'), 'icon-location-pin', 2, 1);
  }
  public Self_FlowZhiBiaoEmp() {
    this.AddSelf('Self_FlowZhiBiaoEmp', t('home.datav.myworkme'), 'icon-location-pin', 2, 1);
  }

  //待办事项rpt
  public Self_FlowTodolist() {
    this.AddSelf('Self_FlowDataTodolist', t('home.datav.flowtodolist'), 'icon-location-pin', 4, 0.5);
  }
  // 待办
  public Self_TodolistAdmin() {
    this.AddSelf('Self_FlowDataTodo', t('home.datav.orgdata'), 'icon-location-pin', 1, 1);
  }
  public Self_MyTodolist() {
    this.AddSelf('Self_FlowDataTodoEmp', t('home.datav.myflowtododata'), 'icon-location-pin', 1, 1);
  }

  //运行中
  public Self_RuningAdmin() {
    this.AddSelf('Self_FlowDataRuning', t('home.datav.orgrunningdata'), 'icon-location-pin', 1, 1);
  }
  public Self_MyRuning() {
    this.AddSelf('Self_FlowDataRuningEmp', t('home.datav.myflowrunningdata'), 'icon-location-pin', 1, 1);
  }
  //发起
  public Self_StartAdmin() {
    this.AddSelf('Self_FlowDataStart', t('home.datav.orgstartdata'), 'icon-location-pin', 1, 1);
  }
  public Self_MyStart() {
    this.AddSelf('Self_FlowDataStartEmp', t('home.datav.myflowstartdata'), 'icon-location-pin', 1, 1);
  }

  //完成
  public Self_CompleteAdmin() {
    this.AddSelf('Self_FlowDataComplete', t('home.datav.orgcomdata'), 'icon-location-pin', 1, 1);
  }
  public Self_MyComplete() {
    this.AddSelf('Self_FlowDataCompleteEmp', t('home.datav.myflowcomdata'), 'icon-location-pin', 1, 1);
  }

  /**
   * 饼图
   * @param title 标题
   * @param colSpan 跨的列数
   * @param icon icon
   * @param exp 数据表达式SQL, 或者json.
   * @param col0Exp 维度1表达式.
   * @returns None.
   */
  public AddChartPie(option: {
    title: string; // 标题
    colSpan: number;
    rowSpan?: number; // 跨行
    icon: string; // 图标
    exp: string; // 数据源表达式,返回两列
    col0Exp?: string; // 维度1表达式.
  }) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan = 1, icon, exp, col0Exp } = option;
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.WinDocModel = ChartModel.ChartPie; //窗口内容模式.
    en.Icon = icon;
    en.Docs = exp;
    en.C0Ens = col0Exp; //维度1数据源.
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }
  /**
   * 环形图
   * @param option title: string; colSpan: string; icon: string; exp: string
   */
  public AddChartRing(option: {
    title: string; // 标题
    colSpan: number;
    rowSpan?: number; // 跨行
    icon: string; // 图标
    exp: string; // 数据源表达式,返回两列
    col0Exp?: string; // 维度1表达式.
  }) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan = 1, icon, exp, col0Exp } = option;
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.WinDocModel = ChartModel.ChartRing; //窗口内容模式.
    en.Icon = icon;
    en.Docs = exp;
    en.C0Ens = col0Exp; //维度1数据源.
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  /**
   * 雷达图
   * @param option title: string; colSpan: string; icon: string; exp: string
   */
  public AddChartRadar(option: {
    title: string; // 标题
    colSpan: number;
    rowSpan?: number; // 跨行
    icon: string; // 图标
    exp: string; // 数据源表达式,返回两列
    col0Exp?: string; // 维度1表达式.
  }) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan = 1, icon, exp, col0Exp } = option;
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.WinDocModel = ChartModel.ChartRadar; //窗口内容模式.
    en.Icon = icon;
    en.Docs = exp;
    en.C0Ens = col0Exp; //维度1数据源.
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }
  /**
   * //南丁格尔玫瑰图
   * @param option title: string; colSpan: string; icon: string; exp: string
   */
  public AddChartRose(option: Partial<{ title: string; rowSpan: number; colSpan: number; icon: string; exp: string }>) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan, icon, exp } = option;
    en.Name = title;
    en.ColSpan = colSpan;
    en.WinDocModel = ChartModel.ChartRose; //窗口内容模式.
    en.Icon = icon;
    en.RowSpan = rowSpan;
    en.Docs = exp;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  /**
   * 折线图
   * @param option title: string; colSpan: string; icon: string; exp: string
   */
  public AddChartLine(option: Partial<{ title: string; rowSpan: number; colSpan: number; icon: string; exp: string }>) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan, icon, exp } = option;
    en.Name = title;
    en.ColSpan = colSpan;
    en.WinDocModel = ChartModel.ChartLine; //窗口内容模式.
    en.Icon = icon;
    en.RowSpan = rowSpan;
    en.Docs = exp;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  /**
   * 高级折线图,有面积阴影的图形
   * @param option title: string; colSpan: string; icon: string; exp: string
   */
  public AddChartLineAdv(option: Partial<{ title: string; rowSpan: number; colSpan: number; icon: string; exp: string }>) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan, icon, exp } = option;
    en.Name = title;
    en.ColSpan = colSpan;
    en.WinDocModel = ChartModel.ChartLineAdv; //高级折线图.
    en.Icon = icon;
    en.RowSpan = rowSpan;
    en.Docs = exp;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  /**
   * 柱状图
   * @param option title: string; colSpan: string; icon: string; exp: string
   */
  public AddChartZZT(option: Partial<{ title: string; colSpan: number; rowSpan: number; icon: string; exp: string; col0Exp: string }>) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan, icon, exp, col0Exp } = option;
    en.Name = title;
    en.WinDocModel = ChartModel.ChartZZT; //窗口内容模式.
    en.Icon = icon;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.Docs = exp;
    en.Col0Exp = col0Exp;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  /**
   * 原生ECharts
   * @param title 标题
   * @param option EChartsOption
   */
  public AddNativeEChartsOption(option: { title: string; colSpan: number; rowSpan?: number; icon: string; echartsOption: EChartsOption }) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan = 1, icon, echartsOption } = option;
    en.Name = title;
    en.WinDocModel = ChartModel.NativeEcharts;
    en.No = DBAccess.GenerGUID();
    en.Icon = icon;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.Docs = JSON.stringify(echartsOption);
    this.chartList.push(en);
  }

  /**
   * 表格
   * @param option title: string; colSpan: string; icon: string; exp: string
   */
  public AddTable(option: Partial<{ title: string; colSpan: number; rowSpan: number; icon: string; exp: string }>) {
    const en = new WindowTemplate();
    const { title, colSpan, rowSpan = 1, icon, exp } = option;
    en.Name = title;
    en.ColSpan = colSpan;
    en.RowSpan = rowSpan;
    en.WinDocModel = ChartModel.Table; //窗口内容模式.
    en.Icon = icon;
    en.Docs = exp;
    en.No = DBAccess.GenerGUID();
    this.chartList.push(en);
  }

  /**
   *  添加完成率
   */
  // public AddChartRate(option: { title: string; colSpan: string; icon: string; exp: string }) {
  //   const en = new WindowTemplate();
  //   const { title, colSpan, icon, exp } = option;
  //   en.Name = title;
  //   en.ColSpan = colSpan;
  //   en.WinDocModel = ChartModel.ChartRate; //窗口内容模式.
  //   en.Icon = icon;
  //   en.ColSpan = colSpan;
  //   en.Docs = exp;
  //   this.chartList.push(en);
  // }

  // public AddChartChina(option: { title: string; colSpan: string; icon: string; exp: string }) {
  //   const en = new WindowTemplate();
  //   const { title, colSpan, icon, exp } = option;
  //   en.Name = title;
  //   en.ColSpan = colSpan;
  //   en.WinDocModel = ChartModel.ChartChina; //窗口内容模式.
  //   en.Icon = icon;
  //   en.ColSpan = colSpan;
  //   en.Docs = exp;
  //   this.chartList.push(en);
  // }

  public PageTitle: string | null = '大屏'; //页面标题.
  public ClassID?: string; //实体类ID比如: TreeEn_XXXX.
  public IsEnMove: boolean | null = false; //实体是否可以移动?

  /**
   * @param clsId 类名
   */
  protected constructor(clsId: string) {
    // if (clsId) this.classID = clsId
    this.ClassID = clsId;
  }
  //初始化数据.
  public async Init() {}
}
