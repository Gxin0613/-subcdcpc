import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { WinDocModel } from './WinDocModel';
import { WindowTemplate } from './WindowTemplate';
import { HtmlVarDtl } from '../HtmlVarDtl';
import { GloComm } from '/@/WF/Comm/GloComm';
import { SSODtl } from '../SSODtl';
import { GloWF } from '/@/WF/Admin/GloWF';
import { getAppEnvConfig } from '/@/utils/env';
import { t } from '/@/hooks/web/useI18n';
import { GloGenerDBSrc } from '../../GenerDBSrc/GloGenerDBSrc';
export class GPN_Windows extends PageBaseGroupNew {
  constructor() {
    super('GPN_Windows');
    this.PageTitle = '新建窗体常规向导';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('A', '文字类型');
    this.TextArea(WinDocModel.Html, '文本', this.HelpHtml, '标题', '我的文本');
    this.AddIcon('icon-doc', 'Html');

    this.TextBox1_Name(WinDocModel.HtmlVar, '变量文本-单数值模式', this.HelpUn, '文本内容', '流程统计');
    this.AddIcon('icon-fire', 'HtmlVar');

    // this.TextBox1_Name(WinDocModel.HtmlVarGroup, '变量文本-分组模式(开发中)', this.Desc100, '文本内容', '');
    // this.AddIcon('icon-cursor', 'HtmlVarGroup');

    this.TextBox1_Name('SSO', '单点登录/连接', this.Desc100, '文本内容', '单点登录/连接');
    this.AddIcon('icon-link', 'SSO');

    this.AddGroup('B', '图形');
    this.TextBox1_Name(WinDocModel.ChartLine, '折线图', this.Desc4, '输入标签', '折线图1');
    this.AddIcon('icon-graph', 'ChartLine');

    this.TextBox1_Name(WinDocModel.ChartPie, '饼状图', this.Desc4, '输入标签', '饼状图1');
    this.AddIcon('icon-pie-chart', 'ChartPie');

    this.TextBox1_Name(WinDocModel.ChartZZT, '柱状图', this.Desc4, '输入标签', '柱状图1');
    this.AddIcon('icon-chart', 'ChartZZT');

    this.TextBox1_Name(WinDocModel.ChartRate, '百分比扇形图', this.Desc4, '输入标签', '百分比扇形图1');
    this.AddIcon('icon-speedometer', 'ChartRate');

    this.TextBox1_Name(WinDocModel.ChartRing, '环形图', this.Desc4, '输入标签', '环形图1');
    this.AddIcon('icon-pie-chart', 'ChartRing');

    this.TextBox1_Name(WinDocModel.ChartRose, '玫瑰图', this.Desc4, '输入标签', '玫瑰图1');
    this.AddIcon('icon-pie-chart', 'ChartRose');

    this.TextBox1_Name(WinDocModel.ChartLineAdv, '高级折线图', this.Desc4, '输入标签', '高级折线图1');
    this.AddIcon('icon-graph', 'ChartLineAdv');

    this.TextBox1_Name(WinDocModel.ChartRadar, '雷达图', this.Desc4, '输入标签', '雷达图1');
    this.AddIcon('icon-graph', 'ChartRadar');

    // this.TextBox1_Name(WinDocModel.ChartChina, '中国地图', this.Desc100, '输入标签', '中国地图1');

    this.AddGroup('C', '列表');
    this.TextBox1_Name(WinDocModel.Table, '简单表格', this.DescTable, '输入标签', '简单表格1');
    this.AddIcon('icon-book-open', 'Table');

    this.TextBox1_Name(WinDocModel.Tab, '标签页(开发中)', this.Desc100, '输入标签', '标签页1');
    this.TextBox2_NameNo(WinDocModel.iFrame, '框架模式(beta)', this.Desc100, '', '链接', '输入标签', '我的框架');

    this.AddGroup('D', '预置-公共组件');
    this.AddBlank('YZ_Weather', '天气预报', this.YZ_Weather, 'icon-location-pin');
    this.AddBlank('YZ_System', '系统菜单', this.HelpTodo, 'icon-anchor');
    this.AddBlank('YZ_FlowDataTodolist', '待办事项', this.YZ_FlowDataTodolist, 'icon-drop');

    this.AddGroup('E', '预置-全体流程组件');
    this.AddBlank('YZ_Todolist', '待办', this.YZ_Todolist, 'icon-bell');
    this.AddBlank('YZ_MovementFlow', '流程动态', this.YZ_Flow, 'icon-drop');
    this.SelectItemsByGroupList('YZ_OneFlow', '单个流程', this.HelpTodo, false, GloWF.srcFlowSorts, GloWF.srcFlows, false);
  }
  public async GenerSorts() {
    // const ens = new Modules();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
    return [];
  }

  /**
   *重写保存方法实现业务逻辑
   * @author zhoupeng
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @param pageID
   * @param sortNo 分类编号
   * @param tb1
   * @param tb2
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const fromPageID = this.RequestVal('PageID');

    //插入预置的信息.
    if (pageID.includes('YZ_') == true) {
      const en = new WindowTemplate();
      en.DBSrc = 'local';
      en.PageID = fromPageID;
      en.Name = tb2;
      en.Title = tb2;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Docs = '内置窗口：' + pageID;
      en.Icon = 'icon-basket-loaded';
      en.ColSpan = 2;
      if (pageID == 'YZ_OneFlow') {
        en.Name = tb2;
        en.Docs = tb1;
      }
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCFast.Windows.YZWindow', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    const ccbpmRunModel = 0;
    // 修复默认的错误SQL为,部门-人员数关系图.
    const defaultSQL = 'SELECT b.Name as No, Count(*) as ~数量~ FROM Port_Emp a, Port_Dept b WHERE a.FK_Dept=b.No GROUP By b.Name  ';
    //折线图，柱状图. 高级折线图. 雷达图
    if (pageID === WinDocModel.ChartLine || pageID === WinDocModel.ChartZZT || pageID === WinDocModel.ChartLineAdv || pageID === WinDocModel.ChartRadar) {
      const en = new WindowTemplate();
      en.DBSrc = 'local';
      en.PageID = fromPageID;
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-fire';
      // en.Docs = defaultSQL;
      // en.C0Ens = 'SELECT No,Name FROM Port_Dept ';
      await en.Insert();

      //初始化数据.
      await GloGenerDBSrc.InitGenerDBSrc_BySQL('Rpt', en.No, 'Main', 'Search', defaultSQL);

      const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //饼图. 环形图. 玫瑰图
    if (pageID === WinDocModel.ChartPie || pageID === WinDocModel.ChartRing || pageID === WinDocModel.ChartRose) {
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.DBSrc = 'local';
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-fire';
      //  en.Docs = defaultSQL;
      //   en.C0Ens = 'SELECT No,Name FROM Port_Dept ';
      await en.Insert();

      //初始化数据.
      await GloGenerDBSrc.InitGenerDBSrc_BySQL('Rpt', en.No, 'Main', 'Search', defaultSQL);

      const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    // // 获取用户登录状态
    // const user = useUserStore();
    // const WebUser = user.WebUser;
    //自定义URL菜单
    if (pageID === WinDocModel.Html) {
      const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();

      let intdocs = '';
      intdocs += `<b>欢迎使用${VITE_GLOB_SX_TITLE}轻量级BI.</b>`;
      intdocs += '<ul>';
      intdocs += `<li> 1. ${VITE_GLOB_SX_TITLE}轻量级BI可以实现一般的，常用的查询分析功能。 </li>`;
      intdocs += '<li> 2. 支持多种图标展示。 </li>';
      intdocs += '<li> 3. 支持变量文本输出，支持自定义的html代码的输出。 </li>';
      intdocs += '<li> 4. 简单易用，容易操作，需要有一定的SQL基础知识，就可以完成。 </li>';
      intdocs += '</ul>';
      //更新节点表单类型.
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.DBSrc = 'local';
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-fire';
      en.Docs = intdocs;
      await en.Insert();
      //if (pageNo === '4') url = '/@/WF/Comm/En.vue?EnName=TS.MapExt.CCRoleBySQL&PKVal=' + en.MyPK;
      const url = GloComm.UrlEn('TS.CCFast.Windows.Html', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //变量文本-单数值模式
    if (pageID === WinDocModel.HtmlVar) {
      // const en = new BSEntity('BP.CCFast.Portal.WindowTemplate');
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.DBSrc = 'local';
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-fire';
      await en.Insert();

      //从表信息.
      const enDtl = new HtmlVarDtl();
      enDtl.DBSrc = 'local';
      enDtl.RefPK = en.No;
      enDtl.Name = '待办';
      enDtl.Exp0 = "SELECT COUNT(*) AS Num FROM WF_GenerWorkerList WHERE FK_Emp='@WebUser.No' AND IsPass=0";
      enDtl.FontColor = 'Yellow';
      await enDtl.Insert();

      const enDtl1 = new HtmlVarDtl();
      enDtl1.RefPK = en.No;
      enDtl1.DBSrc = 'local';

      enDtl1.Name = '在途';
      enDtl1.Exp0 = "SELECT COUNT(*) AS Num FROM WF_GenerWorkerList WHERE FK_Emp='@WebUser.No' AND IsPass=1";
      enDtl1.FontColor = 'Blue';
      await enDtl1.Insert();

      const enDtl2 = new HtmlVarDtl();
      enDtl2.DBSrc = 'local';
      enDtl2.RefPK = en.No;
      enDtl2.Name = '退回';
      enDtl2.Exp0 =
        "SELECT COUNT(A.WorkID) AS Num FROM  WF_GenerWorkFlow A,  WF_GenerWorkerList B WHERE B.FK_Emp='@WebUser.No' AND B.IsPass=0 AND A.WorkID=B.WorkID AND A.WFState=5 ";
      enDtl2.FontColor = 'Red';
      await enDtl2.Insert();

      const enDtl3 = new HtmlVarDtl();
      enDtl3.DBSrc = 'local';
      enDtl3.RefPK = en.No;
      enDtl3.Name = '已完成';
      enDtl3.Exp0 = "SELECT COUNT(WorkID) AS Num FROM  WF_GenerWorkFlow  WHERE Emps LIKE '@WebUser.No' AND WFState=3";
      enDtl3.FontColor = '#8c531b';
      await enDtl3.Insert();

      const url = GloComm.UrlEn('TS.CCFast.Windows.HtmlVar', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //单指标
    if (pageID === WinDocModel.HtmlDtls) {
      // const en = new BSEntity('BP.CCFast.Portal.WindowTemplate');
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.DBSrc = 'local';
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-fire';
      await en.Insert();

      //从表信息.
      const enDtl = new HtmlVarDtl();
      enDtl.DBSrc = 'local';
      enDtl.RefPK = en.No;
      enDtl.Name = '待办';
      enDtl.Exp0 = "SELECT COUNT(*) AS Num FROM WF_GenerWorkerList WHERE FK_Emp='@WebUser.No' AND IsPass=0";
      enDtl.FontColor = 'Yellow';
      await enDtl.Insert();

      const enDtl1 = new HtmlVarDtl();
      enDtl1.RefPK = en.No;
      enDtl1.DBSrc = 'local';

      enDtl1.Name = '在途';
      enDtl1.Exp0 = "SELECT COUNT(*) AS Num FROM WF_GenerWorkerList WHERE FK_Emp='@WebUser.No' AND IsPass=1";
      enDtl1.FontColor = 'Blue';
      await enDtl1.Insert();

      const enDtl2 = new HtmlVarDtl();
      enDtl2.DBSrc = 'local';
      enDtl2.RefPK = en.No;
      enDtl2.Name = '退回';
      enDtl2.Exp0 =
        "SELECT COUNT(A.WorkID) AS Num FROM  WF_GenerWorkFlow A,  WF_GenerWorkerList B WHERE B.FK_Emp='@WebUser.No' AND B.IsPass=0 AND A.WorkID=B.WorkID AND A.WFState=5 ";
      enDtl2.FontColor = 'Red';
      await enDtl2.Insert();

      const enDtl3 = new HtmlVarDtl();
      enDtl3.DBSrc = 'local';
      enDtl3.RefPK = en.No;
      enDtl3.Name = '已完成';
      enDtl3.Exp0 = "SELECT COUNT(WorkID) AS Num FROM  WF_GenerWorkFlow  WHERE Emps LIKE '@WebUser.No' AND WFState=3";
      enDtl3.FontColor = '#8c531b';
      await enDtl3.Insert();

      const url = GloComm.UrlEn('TS.CCFast.Windows.HtmlVar', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //变量文本-单数值模式
    if (pageID === WinDocModel.SSO) {
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.ColSpan = 4;
      en.DBSrc = 'local';
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-link';
      await en.Insert();

      //从表信息.
      const enDtl = new SSODtl();
      enDtl.RefPK = en.No;
      enDtl.Name = 'OA系统';
      enDtl.Icon = 'icon-speech';
      await enDtl.Insert();

      const enDtl1 = new SSODtl();
      enDtl1.RefPK = en.No;
      enDtl1.Name = 'BPM系统';
      enDtl1.Icon = 'icon-diamond';

      await enDtl1.Insert();

      const enDtl2 = new SSODtl();
      enDtl2.RefPK = en.No;
      enDtl2.Name = 'ERP系统';
      enDtl2.Icon = 'icon-briefcase';
      await enDtl2.Insert();

      const enDtl3 = new SSODtl();
      enDtl3.RefPK = en.No;
      enDtl3.Name = 'CRM系统';
      enDtl3.Icon = 'icon-chart';
      await enDtl3.Insert();

      const url = GloComm.UrlEn('TS.CCFast.Windows.SSO', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //率图 ChartRate
    if (pageID == WinDocModel.ChartRate) {
      //更新节点表单类型.
      const en = new WindowTemplate();
      en.DBSrc = 'local';
      en.PageID = fromPageID;
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-fire';
      // todo 此处文档sql来源未知
      // en.Docs = sql;
      // en = new BSEntity('BP.CCFast.Portal.WindowTemplate', en.No);
      en.ColSpan = 2;

      //处理分子.
      en.LabOfFZ = '退回数';
      let sql = '';
      if (ccbpmRunModel == 0) sql = "SELECT Count(*) as '退回数' FROM WF_GenerWorkFlow WHERE WFState=5  ";
      else sql = "SELECT Count(*) as '退回数' FROM WF_GenerWorkFlow WHERE WFState=5 AND OrgNo='@WebUser.OrgNo'  ";
      en.SQLOfFZ = sql;

      //分母.
      en.LabOfFM = '运行数';
      if (ccbpmRunModel == 0) sql = "SELECT Count(*) as '退回数' FROM WF_GenerWorkFlow WHERE WFState!=5  ";
      else sql = "SELECT Count(*) as '退回数' FROM WF_GenerWorkFlow WHERE WFState!=5 AND OrgNo='@WebUser.OrgNo'  ";
      en.SQLOfFM = sql;
      en.LabOfRate = '退回率';
      await en.Insert();

      const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //中国地图
    if (pageID === WinDocModel.ChartChina) {
      //更新节点表单类型.
      const en = new WindowTemplate();
      en.DBSrc = 'local';
      en.PageID = fromPageID;
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-chart';
      let sql = '';
      if (ccbpmRunModel == 0) sql = "SELECT FlowName as '流程名称', Count(*) as '流程数' FROM WF_GenerWorkFlow WHERE WFState >1 GROUP BY FlowName ";
      else sql = `SELECT FlowName as '流程名称', Count(*) as '流程数' FROM WF_GenerWorkFlow WHERE WFState >1 AND OrgNo='@WebUser.OrgNo'  GROUP BY FlowName `;
      en.Docs = sql;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //简单表格
    if (pageID === WinDocModel.Table) {
      //更新节点表单类型.
      const en = new WindowTemplate();
      en.DBSrc = 'local';
      en.PageID = fromPageID;
      en.Name = tb1;
      en.ColSpan = 2;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-grid';

      let sql = '';
      if (ccbpmRunModel == 0) sql = "SELECT FlowName as '流程名称', Count(*) as '流程数' FROM WF_GenerWorkFlow WHERE WFState >1 GROUP BY FlowName ";
      else sql = `SELECT FlowName as '流程名称', Count(*) as '流程数' FROM WF_GenerWorkFlow WHERE WFState >1 AND OrgNo='@WebUser.OrgNo'  GROUP BY FlowName `;
      en.Docs = sql;
      await en.Insert();

      const url = GloComm.UrlEn('TS.CCFast.Windows.Win' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //标签页
    if (pageID === WinDocModel.Tab) {
      //更新节点表单类型.
      const en = new WindowTemplate();
      en.DBSrc = 'local';
      en.PageID = fromPageID;
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-info';
      en.ColSpan = 2;
      await en.Insert();

      //从表信息.
      let enDtl = new BSEntity('BP.CCFast.Portal.WindowExt.TabDtl');
      enDtl.RefPK = en.No;
      enDtl.Name = '待办';
      enDtl.Exp0 = `SELECT NodeName AS '节点名', COUNT(*) as '数量' FROM WF_GenerWorkerList WHERE FK_Emp='@WebUser.No' AND IsPass=0 GROUP BY NodeName`;
      enDtl.FontColor = 'Yellow';
      enDtl.WindowsShowType = 0; //饼图
      await enDtl.Insert();

      enDtl = new BSEntity('BP.CCFast.Portal.WindowExt.TabDtl');
      enDtl.RefPK = en.No;
      enDtl.Name = '在途';
      enDtl.Exp0 = `SELECT NodeName AS '节点名', COUNT(*) as '数量' FROM WF_GenerWorkerList WHERE FK_Emp='@WebUser.No' AND IsPass=1 GROUP BY NodeName`;
      enDtl.FontColor = 'Blue';
      enDtl.WindowsShowType = 1; //折线图
      await enDtl.Insert();

      enDtl = new BSEntity('BP.CCFast.Portal.WindowExt.TabDtl');
      enDtl.RefPK = en.No;
      enDtl.Name = '退回';
      enDtl.Exp0 = `SELECT FlowName AS '流程名', COUNT(*) as '数量' FROM  WF_GenerWorkFlow A,  WF_GenerWorkerList B WHERE B.FK_Emp='@WebUser.No' AND B.IsPass=0 AND A.WorkID=B.WorkID AND A.WFState=5  GROUP BY FlowName`;
      enDtl.FontColor = 'Red';
      enDtl.WindowsShowType = 2; //柱状图
      await enDtl.Insert();

      enDtl = new BSEntity('BP.CCFast.Portal.WindowExt.TabDtl');
      enDtl.RefPK = en.No;
      enDtl.Name = '已完成';
      enDtl.Exp0 = `SELECT FlowName AS '流程名', COUNT(*) as '数量'  FROM  WF_GenerWorkFlow  WHERE Emps LIKE '@WebUser.No' AND WFState=3  GROUP BY FlowName`;
      enDtl.FontColor = '#8c531b';
      enDtl.WindowsShowType = 3; //表格
      await enDtl.Insert();

      const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //框架模式(beta)
    if (pageID === WinDocModel.iFrame) {
      //更新节点表单类型.
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.Name = tb1;
      en.WinDocModel = pageID; //窗口内容模式.
      en.Icon = 'icon-fire';
      en.Docs = tb2;
      en.ColSpan = 2;
      await en.Insert();

      const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    if (pageID === 'YZ_FlowDataTodolist') {
      const en = new WindowTemplate();
      en.Name = t('home.datav.flowtodolist');
      en.ColSpan = 4;
      en.WinDocModel = pageID; //流程动态.
      en.Icon = 'icon-location-pin';
      en.Docs = tb2;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    alert('没有判断的PageID:' + pageID);
  }
  public readonly YZ_Todolist = `
  ### 预置
  - 待办：
  - 包含流程、抄送、退回、预期、移交等各种类型的待办操作.
  `;
  public readonly YZ_FlowDataTodolist = `
  ### 预置
  - 待办事项：
  - 统计所有待办分组，以及每个分组的待办数量.
  `;

  public readonly Desc100 = `
  ### 帮助暂未开放
  `;
  public readonly Desc4 = `
  #### 帮助
   - 饼、柱、折线图是用图形的直观形式展示数量的发展趋势。
   - 可以通过SQL语句来查看各流程占比。
  - ![输入图片说明](./resource/CCFast/Windows/Admin/Img/LineChart.png "屏幕截图")
  暂未开放`;
  public readonly YZ_Flow = `
  ### 帮助
  - 流程动态：
  - 该组件是个性化，不可编辑，关于流程基本信息状态，待办人，节点名称，时间等.
  `;
  public readonly YZ_Weather = `
  ### 天气预报
  - 天气预报：
  - 该组件是个性化，不可编辑，关于当地未来五天的天气数据.
  `;
  public readonly HelpHtml = `
  ### 文本类型
  - 文本类型
  - 创建一个文本大屏，可编辑，用文字表达自己的需求，观点等.
  `;
  public readonly DescTable = `
  ### 简单表格
  - 简单表格
  - 可以通过SQL语句来查，查询出来的结果以表格的形式呈现出来.
  `;
}
