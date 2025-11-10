import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
// import { Module, Modules } from '../Module';
import { Menu } from '../../GPM/CCMenu/Menu';
import { MenuModel } from '../../GPM/CCMenu/MenuModel';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Func } from '../../CCBill/Sys/Func';
import { message } from 'ant-design-vue';
import { SFTable } from '/@/WF/Admin/FrmLogic/SFTable/SFTable';
import { ClassFactoryBase, useClassFactoryLoader } from '/@/hooks/ens/useClassFactoryLoader';
import DBAccess from '/@/utils/gener/DBAccess';
import { GenerListEn } from '../../CCBill/GenerListEn/GenerListEn';
import { GloComm } from '/@/WF/Comm/GloComm';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import { Flow } from '/@/WF/TSClass/Flow';
import { FlowAdm } from '/@/WF/TSClass/Admin/FlowAdm';
import { FlowDtlView } from '../../CCBill/DBList/FlowDtlView';
import { buildShortUUID } from '/@/utils/uuid';
import { GloWF } from '/@/WF/Admin/GloWF';
import { FrmDtlView } from '../../CCBill/DBList/FrmDtlView';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPN_NewFlow } from '/@/WF/Admin/FlowLogic/GPN_NewFlow';
import { FlowDevModel } from '/@/WF/Admin/EnumLab';
import { FlowSort } from '/@/WF/TSClass/Admin/FlowSort';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { MySystem } from '../MySystem';
import { FrmSort } from '/@/WF/TSClass/Admin/FrmSort';
import GPNMenuExt from './GPNMenuExt';
import { TreeEnsDBView } from '/@/CCFast/CCBill/DBList/TreeEnsDBView';
import { Rpt2DLowCode } from '../../CCBill/Components/Rpt2DLowCode';
import { Rpt3DLowCodeForSQL } from '../../CCBill/Components/Rpt3DLowCodeForSQL';
import { Rpt3DLowCodeForDBSrc } from '../../CCBill/Components/Rpt3DLowCodeForDBSrc';
import { RptPage } from '../../Windows/RptPage/RptPage';
import { GLDBView } from '../../CCBill/DBList/GLDBView';

type FactoryDef = {
  file: string;
  urlPrefix: string;
  MUrlPrefix?: string;
  factory: ClassFactoryBase;
};
let _factory_map: Map<string, FactoryDef> | undefined = undefined;
// mao的key为第一步No
const getFactoryMap = async () => {
  if (_factory_map) {
    return _factory_map;
  }
  _factory_map = new Map([
    [
      'DataV',
      { file: '/@/views/data_visualization/index.vue', urlPrefix: '/WF/Comm/DataV', MUrlPrefix: 'CCMobile/DataV', factory: await useClassFactoryLoader('ClassFactoryOfDataV') },
    ],
    ['TabPage', { file: '/@/components/Tabs/index.vue', urlPrefix: '/WF/Comm/Tabs', MUrlPrefix: 'CCMobile/Tabs', factory: await useClassFactoryLoader('ClassFactoryOfTabs') }],
    ['Rpt2D', { file: '/@/WF/Comm/Rpt2D.vue', urlPrefix: '/WF/Comm/Rpt2D', MUrlPrefix: 'CCMobile/Rpt2D', factory: await useClassFactoryLoader('ClassFactoryOfRpt2D') }],
    ['Rpt3D', { file: '/@/WF/Comm/Rpt3D.vue', urlPrefix: '/WF/Comm/Rpt3D', MUrlPrefix: 'CCMobile/Rpt3D', factory: await useClassFactoryLoader('ClassFactoryOfRpt3D') }],
    ['Search', { file: '/@/WF/Comm/Search.vue', urlPrefix: '/WF/Comm/Search', MUrlPrefix: 'CCMobile/Search', factory: await useClassFactoryLoader('ClassFactory') }],
    ['Group', { file: '/@/WF/Comm/Group.vue', urlPrefix: '/WF/Comm/Group', factory: await useClassFactoryLoader('ClassFactory') }],
    ['Tree', { file: '/@/WF/Comm/Tree.vue', urlPrefix: '/WF/Comm/Tree', factory: await useClassFactoryLoader('ClassFactory') }],
    ['GPN', { file: '/@/WF/Comm/UIEntity/GroupPageNew.vue', urlPrefix: '/WF/Comm/GroupPageNew', factory: await useClassFactoryLoader('ClassFactoryOfGroupPageNew') }],
    ['TreeEns', { file: '/@/WF/Comm/TreeEns.vue', urlPrefix: '/WF/Comm/TreeEns', factory: await useClassFactoryLoader('ClassFactoryOfPageBaseTreeEns') }],
    ['GL', { file: '/@/WF/views/GenerList.vue', urlPrefix: '/WF/Comm/GenerList', factory: await useClassFactoryLoader('ClassFactoryOfGenerList') }],
    ['PG', { file: '/@/WF/Comm/PanelGroup.vue', urlPrefix: '/WF/Comm/PanelGroup', factory: await useClassFactoryLoader('ClassFactoryOfPanelGroup') }],
  ]);
  return _factory_map;
};
export class GPN_Menu extends PageBaseGroupNew {
  constructor() {
    super('GPN_Menu');
    this.PageTitle = '新建菜单';
    this.ForEntityClassID = 'TS.GPM.Menu';
  }

  public async Init() {
    this.AddGroup('A', '流程', '', '公文、请假、订单、物联网流程等.');

    // this.AddBlank('AiFlow', 'AI创建流程', '使用AI根据提示词创建流程.');
    this.TextBox1_Name('JiJian', '极简模式', GPN_NewFlow.JiJian, '流程名称', '我的极简流程');
    this.AddIcon('icon-paper-plane', 'JiJian');
    this.TextBox1_Name('Profession', '专业模式', GPN_NewFlow.Profession, '流程名称', '我的专业流程');
    this.AddIcon('icon-plane', 'Profession');

    this.TextBox1_Name('RefOneFrmTree', '绑定单表单模式', GPN_NewFlow.RefFrm, '流程名称', '我的单表单流程');
    this.SelectItemsByGroupList('RefOneFrmTree.SelectOneFrm', '选择表单', GPN_NewFlow.RefFrm_SelectOneFrm, false, GloWF.srcFrmTree, GloWF.srcBindFrmList);
    this.AddIcon('icon-notebook', 'RefOneFrmTree');

    this.TextBox1_Name('FrmTree', '绑定多表单模式', GPN_NewFlow.FrmTree_SelectFrms, '流程名称', '我的多表单流程');
    this.SelectItemsByGroupList('FrmTree.SelectFrms', '选择表单', GPN_NewFlow.FrmTree_SelectFrms, true, GloWF.srcFrmTree, GloWF.srcBindFrmList);
    this.AddIcon('icon-layers', 'FrmTree');

    const url1 = GloComm.UrlGPN('GPN_ImpFlow', this.SystemNo); // '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_ImpFlow&SortNo=' + treeNodeID;
    // return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    this.AddGoToUrl('FlowImp', '导入流程', url1);
    this.AddIcon('icon-arrow-down-circle', 'FlowImp');
    //this.AddGoToUrl('FlowImp', '导入流程', this.HelpTodo, '请上传流程模板.');
    //  this.TextBox1_Name('Frms', '表单库', GPN_NewFlow.Profession, '流程名称', '我的专业流程');
    //const url = GloComm.UrlTreeEns('TreeEns_FrmSort2Frm', '');
    // this.AddGoToUrl('Frms', '表单库', url);
    // this.AddIcon('icon-paper-plane', 'Frms');

    // const url5 = GloComm.UrlTreeEns('TreeEns_FlowSort2Flow', '');
    // this.AddGoToUrl('Flows', '流程库', url5);
    // this.AddIcon('icon-paper-plane', 'Flows');
    this.SelectItemsByList('LinkFlow', '引入单流程组件', this.HelpNo, false, GPNMenuExt.GenerFlowFunc());
    this.AddIcon('icon-link', 'LinkFlow');
    this.SelectItemsByGroupList('LinkFlow.FlowNo', '选择流程', this.HelpNo, false, GloWF.srcFlowSorts, GloWF.srcFlows, false);

    this.SelectItemsByList('LinkFlowFunc', '引入流程菜单(系统)', this.LinkFlowFunc, false, GPNMenuExt.GenerFlowMenu());
    this.AddIcon('icon-link', 'LinkFlowFunc');

    this.AddGroup('B', '单据', '', '报销单、出库单、出门单，具有单号、标题字段的表单.');
    this.TextBox2_NameNo(MenuModel.Bill, '创建单据', this.DocBill, 'Bill_', '编号', '名称', '维修单');
    this.AddIcon('icon-event', 'Bill');

    this.SelectItemsByList('BillLink', '引入单据组件', this.HelpNo, false, GPNMenuExt.BillFunc());
    this.AddIcon('icon-link', 'BillLink');
    this.SelectItemsByGroupList('BillLink.FrmID', '选择单据', '选择单据', false, GloWF.srcFrmTree, GloWF.srcFrmListOfBill);

    this.FileUpload('BillImp', '导入单据实体模板', this.HelpNo, '请上传单据模板');
    this.AddIcon('icon-cloud-upload', 'BillImp');

    this.AddGroup('C', '实体', '', '资产、学生、车辆，具有编号、名称字段的表单.');
    this.TextBox2_NameNo('EntityNoName', '创建实体', this.DocEntityNoName, 'En_', '编号', '名称', '学生台账');
    this.AddIcon('icon-notebook', 'EntityNoName');

    this.TextBox2_NameNo('EntityTree', '创建树实体(规划中)', this.HelpTodo, 'Tree_', '编号', '名称', '商品类别');
    this.AddIcon('icon-organization', 'EntityTree');

    // this.TextBox2_NameNo(MenuModel.Dict, '创建实体', this.DocDict, 'Dict_', '编号', '名称', '学生台账');
    // this.TextBox2_NameNo(MenuModel.Dict, '创建实体', this.Docs0, '名称', '学生台账');
    //this.AddBlank('DBList', '数据源实体', this.DBList);
    this.SelectItemsByList('EntityNoNameLink', '引入实体组件', this.HelpNo, false, GPNMenuExt.EntityNoNameFunc());
    this.AddIcon('icon-link', 'EntityNoNameLink');

    this.SelectItemsByGroupList('EntityNoNameLink.Ref', '选择实体', '选择要导入的实体', false, GloWF.srcFrmTree, GloWF.srcFrmEntityNoName);
    this.AddIcon('GenerListEn', 'icon-wallet');

    this.SelectItemsByList('SFTable', '字典维护', '把字典维护的连接增加到菜单上.', false, GloWF.SQLSFTableSysDict);
    this.AddIcon('icon-link', 'SFTable');

    this.AddGroup('W', '活动', '', '调查问卷、外部订单、样表、外部用户信息采集.');
    const helpIt = ` 
    ##### 场景
    - 通过分享连接，让外部用户填写表单用于数据采集.
    - 客户调查: 让客户进行完成满意度调查.
    - 客户订单：让客户完成订单的填写，提交到后台审核.
    `;
    this.TextBox2_NameNo('AskBill', '表单(调查表,申报单)', helpIt, 'AskFrm_', '编号', '名称', '信息采集单');
    this.AddIcon('icon-people', 'AskBill');
    this.SelectItemsByList('AskBill.UserType', '用户类型', this.LinkFlowFunc, false, GPNMenuExt.AskFrmUserModel());
    this.SelectItemsByList('AskBill.UserType.DBTime', '采集次数', this.LinkFlowFunc, false, GPNMenuExt.AskFrmDBTime());

    this.TextBox2_NameNo('AskExam', '考卷(样表,试卷,测评.)', this.HelpTodo, 'AskFrm_', '编号', '名称', '考卷测评');
    this.AddIcon('icon-bubbles', 'AskExam');
    this.SelectItemsByList('AskExam.UserType', '用户类型', this.LinkFlowFunc, false, GPNMenuExt.AskFrmUserModel());
    this.SelectItemsByList('AskExam.UserType.DBTime', '采集次数', this.LinkFlowFunc, false, GPNMenuExt.AskFrmDBTime());

    this.TextBox1_Name('AskFlow', '流程(订单,审批.)', this.HelpTodo, '名称', '订单流程', '请输入流程名称，比如活动申报、订单、建议反馈.');
    this.AddIcon('icon-paper-plane', 'AskFlow');
    this.SelectItemsByList('AskFlow.UserType', '用户类型', this.LinkFlowFunc, false, GPNMenuExt.AskFrmUserModel());
    this.SelectItemsByList('AskFlow.UserType.DBTime', '采集次数', this.LinkFlowFunc, false, GPNMenuExt.AskFrmDBTime());
    this.AddHelp('askFrmHelp', '帮助', 'https://docs.qq.com/doc/DRFZyd3NzWW9TV1Fv');

    //增加子页面.
    this.AddGroup('E', '大屏列表', 'icon-chart', '白色、蓝色大屏，各种图形分析.');
    //this.TextBox1_Name(MenuModel.RptWhite, '通用信息窗/大屏(白色风格)', this.DocRptwhite, '页面名称', '统计分析');

    const url = GloComm.UrlGPN('GPN_RptWhite', '', '&SystemNo=' + this.SystemNo + '&SortNo=' + this.SortNo);
    this.AddGoToUrl('RptWhite', '通用信息窗/大屏(白色风格)', url, this.DocRptwhite);
    this.AddIcon('icon-fire', MenuModel.RptWhite);

    this.TextBox1_Name(MenuModel.RptBlue, '信息窗/大屏(蓝色风格)', this.DocRptblue, '大屏名称', '大屏展示');
    this.AddIcon('icon-fire', MenuModel.RptBlue);

    this.TextBox2_NameNo('DBList', '创建数据源列表', this.DBList, 'DB_', '编号', '名称', '人员台账');
    this.TextBox1_Name('GenerListEn', 'GLEn通用列表组件', this.HelpNo, '输入名称', '我的列表', '请输入列表名称.');

    this.AddGroup('J', 'SQL视图', 'icon-eyeglass', '用SQL配置列表、查询、左树右表数据展现.');
    this.TextBox2_NameNo('GLDBView', '不分页视图', this.DBList, 'GL_', '编号', '名称', '人员列表');
    this.AddIcon('icon-eye', 'GLDBView');

    this.TextBox2_NameNo('SearchBillView', '分页视图', this.DBList, 'Search_', '编号', '名称', '员工查询');
    this.TextBox2_NameNo('TreeEnsDBView', '左树右表视图', this.DBList, 'TreeEns_', '编号', '名称', '组织结构');
    this.AddIcon('icon-eyeglass', 'SearchBillView');
    this.AddIcon('icon-organization', 'TreeEnsDBView');

    this.TextBox1_Name('Rpt3DLowCode', '三维交叉报表', this.DocRpt3d, '名称', '三维交叉报表');
    this.SelectItemsByList('Rpt3DLowCode.DBModel', '选择数据源方式', this.HelpTodo, false, GPNMenuExt.DBSrcModelGener());

    this.TextBox1_Name(MenuModel.Rpt2DLowCode, '二维交叉报表', this.DocRpt2d, '名称', '二维交叉报表');
    this.SelectItemsByList('Rpt2DLowCode.DBModel', '选择数据源方式', this.HelpTodo, false, GPNMenuExt.DBSrcModelGener());

    // this.TextBox1_Name(MenuModel.FlowUrl, "内置流程菜单", this.Docs0, "名称", "我的链接");
    // this.TextBox1_Name(MenuModel.Func, '独立功能(方法)页', this.Docs0, '名称', '我的功能');
    // this.TextBox1_Name(MenuModel.DBList, '数据源实体', this.Docs0, '名称', '查询');
    // this.TextBox2_NameNo(MenuModel.DictCopy, '复制实体', this.DictCopy, 'DC_', '编号', '名称', '我的链接');
    //this.TextBox1_Name(MenuModel.Bill, '创建单据(beta)', this.Bill, '名称', '学生缴费单');
    //this.TextBox1_Name(MenuModel.DictRef, '引入实体', this.DictRef, '名称', '我的链接');
    //  this.AddGroup('C', '字典表');
    // this.TextBox2_NameNo(MenuModel.DictTable, '编号名称字典表', this.DictTable, 'DictNoName_', '名称', '编号', '');
    //  this.TextBox2_NameNo(MenuModel.DictTableTree, '树结构字典表', this.DictTableTree, 'DictTree_', '名称', '编号', '');
    this.AddGroup('D', '高代码', '', 'TS全栈配置开发，基于13个页面模式解析，写文档一样编程.');
    this.AddBlank('Entity', 'Entity数据实体', this.Search);
    this.AddTableByOptions({
      no: 'Entity.EnName',
      name: '选择实体',
      columns: GPNMenuExt.TableCols(),
      helpDocs: '选择实体(单选)',
      IsMultiSelect: false,
      srcOfList: await GPNMenuExt.GenerEnsList('Entity'),
    });
    // this.Table('Entity.EnName', '选择实体', this.Search_Ens, false, await GPNMenuExt.GenerEnsList('Entity'));
    this.Table('Entity.EnName.componentName', '组件类型', this.Search_Ens, false, GPNMenuExt.GenerEntitySort());
    this.TextBox2_NameNo('Entity.EnName.componentName.Paras', '路径及参数', this.Search_Ens_Paras, '', '参数', 'URL定义', '');

    this.AddBlank('GPN', 'GPN新建组件', this.GPN);
    this.SelectItemsByList('GPN.Ens', '选择实体', this.GPN_Ens, false, await GPNMenuExt.GenerEnsList('GPN'));
    this.TextBox1_Name('GPN.Ens.Paras', '可选参数', this.GPN_Ens_Paras, '参数', '&1=1');

    this.AddBlank('TreeEns', 'TreeEns树干叶子组件', this.TreeEns);
    this.SelectItemsByList('TreeEns.Ens', '选择实体', this.TreeEns_Ens, false, await GPNMenuExt.GenerEnsList('TreeEns'));
    this.TextBox1_Name('TreeEns.Ens.Paras', '可选参数', this.Search_Ens, '参数', '&1=1');

    this.AddBlank('GL', 'GL通用列表组件', this.TreeEns);
    this.SelectItemsByList('GL.Ens', '选择实体', this.TreeEns_Ens, false, await GPNMenuExt.GenerEnsList('GL'));
    this.TextBox1_Name('GL.Ens.Paras', '可选参数', this.Search_Ens, '参数', '&1=1');

    this.AddBlank('PG', 'PG实体分组展示组件', this.TreeEns);
    this.SelectItemsByList('PG.Ens', '选择实体', this.TreeEns_Ens, false, await GPNMenuExt.GenerEnsList('PG'));
    this.TextBox1_Name('PG.Ens.Paras', '可选参数', this.Search_Ens, '参数', '&1=1');

    this.AddBlank('TabPage', 'Tabs页面', this.TabsEns);
    this.SelectItemsByList('TabPage.Ens', '选择实体', this.TabsEns, false, await GPNMenuExt.GenerEnsList('Tabs'));
    this.TextBox1_Name('TabPage.Ens.Paras', '可选参数', this.TabsEns, '参数', '&1=1');

    this.AddBlank('DataV', 'DataV大屏实体', this.HelpNo);
    this.Table('DataV.Ens', '选择实体', this.DocRptwhite, false, await GPNMenuExt.GenerEnsList('DataV'));
    this.TextBox1_Name('DataV.Ens.Paras', '可选参数', this.DocRptwhite, '参数', '&1=1');

    this.AddBlank('Rpt2D', '2维报表', this.TabsEns);
    this.SelectItemsByList('Rpt2D.Ens', '选择实体', this.TabsEns, false, await GPNMenuExt.GenerEnsList('Rpt2D'));
    this.TextBox1_Name('Rpt2D.Ens.Paras', '可选参数', this.TabsEns, '参数', '&1=1');

    this.AddBlank('Rpt3D', '3维报表', this.TabsEns);
    this.SelectItemsByList('Rpt3D.Ens', '选择实体', this.TabsEns, false, await GPNMenuExt.GenerEnsList('Rpt3D'));
    this.TextBox1_Name('Rpt3D.Ens.Paras', '可选参数', this.TabsEns, '参数', '&1=1');

    this.AddBlank('OpenHelp', '帮助', '#### 帮助地址:  - https://docs.qq.com/doc/DRGZzblhkdWlOZXFG ', 'icon-support');

    this.AddGroup('G', '页面引用');
    this.TextBox3_NameNoNote(MenuModel.SelfUrl, '自定义URL菜单', this.DocSelfUrl, null, '指向文件', '链接标签', 'URL地址', '我的链接');
    this.TextBox1_Name(MenuModel.Tabs, 'Tabs页面容器', this.DocTab, '名称', '我的tab容器页');

    //this.TextBox1_Name('EntityNoName.DictID', '输入实体ID', this.HelpTodo, '实体ID', '', '在表单设计器,实体属性里查看实体ID.');

    this.AddGroup('F', '工具视图');
    this.TextBox2_NameNo('FrmEntityDtlView', '实体从表', this.HelpNo, 'View_', '请输入视图ID', '输入视图名称', '');
    this.SelectItemsByGroupList('FrmEntityDtlView.SelectFrm', '选择实体', '选择实体', false, GloWF.srcFrmTree, GloWF.srcFrmEntityNoName);
    this.SelectItemsByList('FrmEntityDtlView.SelectFrm.Dtl', '选择从表', this.HelpNo, false, () => {
      return GloWF.SQLOfDtls(this.RequestVal('tb1', 'FrmEntityDtlView.SelectFrm')); //`SELECT No, Name FROM Sys_MapDtl WHERE FK_MapData='${this.RequestVal('tb1', 'FrmEntityDtlView.SelectFrm')}' `;
    });

    this.TextBox2_NameNo('FrmBillDtlView', '单据从表', this.HelpNo, 'View_', '请输入视图ID', '输入视图名称', '');
    this.SelectItemsByGroupList('FrmBillDtlView.SelectFrm', '选择实体', '选择实体', false, GloWF.srcFrmTree, GloWF.srcFrmListBill);
    this.SelectItemsByList('FrmBillDtlView.SelectFrm.Dtl', '选择从表', this.HelpNo, false, () => {
      return GloWF.SQLOfDtls(this.RequestVal('tb1', 'FrmBillDtlView.SelectFrm')); //`SELECT No, Name FROM Sys_MapDtl WHERE FK_MapData='${this.RequestVal('tb1', 'FrmBillDtlView.SelectFrm')}' `;
    });

    //流程从表数据源.
    this.TextBox3_NameNoNote('FlowDtlView', '流程从表', this.HelpNo, 'View_', '请输入视图ID', '输入视图名称', '输入流程编号', '流程从表视图');
    this.SelectItemsByList('FlowDtlView.SelectFlowDtl', '选择从表', this.HelpNo, false, () => {
      const frmID = 'ND' + Number.parseInt(this.RequestVal('tb3', 'FlowDtlView')) + '01';
      return GloWF.SQLOfDtls(frmID); //`SELECT No, Name FROM Sys_MapDtl WHERE FK_MapData='${frmID}' `;
    });
    this.AddIcon('FlowDtlView', 'icon-grid');

    //数据源查询从表.
    this.TextBox2_NameNo('DBSrcSearch', '数据源查询', this.DBSrcSearch, 'View_', '请输入视图ID', '输入视图名称', '');
    this.SelectItemsByGroupList('DBSrcSearch.Select', '选择查询', this.HelpTodo, false, GloWF.srcDBSrc, GloWF.srcDBSFSearch);

    this.AddGroup('H', 'OA应用', '', '办公OA常用功能.');
    // this.TextBox1_Name(MenuModel.Task, '任务', this.Task, '名称', '任务');
    this.TextBox1_Name(MenuModel.Info, '信息发布(新闻公告)', this.Info, '名称', '信息发布');
    this.TextBox1_Name('Schedule', '日程', this.Calendar, '名称', '日程');
    this.TextBox1_Name(MenuModel.Calendar, '日历', this.Calendar, '名称', '日历');

    // TreeEns_Message

    this.TextBox1_Name(MenuModel.Notepad, '记事本', this.Notepad, '名称', '记事本');
    // this.TextBox1_Name(MenuModel.KnowledgeManagement, '知识库', this.KnowledgeManagement, '名称', '知识库');
    this.TextBox2_NameNo(MenuModel.KnowledgeManagement, '知识库', this.KnowledgeManagement, 'Knowled_', '知识编号', '名称', '知识库');
    this.TextBox1_Name(MenuModel.WorkRec, '工作日志', this.WorkRec, '名称', '工作日志');
    this.AddBlank('NetDisk', '网盘', this.HelpNo, 'icon-cloud-upload');
    this.AddBlank('Message', '消息/邮件', this.HelpNo, 'icon-bubbles');

    //  this.AddIcon('icon-link', 'book-open');
    this.AddIcon('icon-heart', 'Entity');
    this.AddIcon('icon-fire', 'GPN');
    this.AddIcon('icon-control-pause', 'TreeEns');
    this.AddIcon('icon-cup', 'GL');
    this.AddIcon('icon-layers', 'PG');
    this.AddIcon('icon-link', 'SelfUrl');
    this.AddIcon('icon-doc', 'RptWhite');
    this.AddIcon('icon-drop', 'Tabs');
    this.AddIcon('icon-social-spotify', 'Rpt3D');
    this.AddIcon('icon-feed', 'Info');
    this.AddIcon('icon-doc', 'Notepad');
    this.AddIcon('icon-layers', 'KnowledgeManagement');
    this.AddIcon('icon-film', 'WorkRec');
  }

  get SystemNo() {
    // return 'd242060a-b';
    return this.params.SystemNo || this.RequestVal('SystemNo') || '';
  }
  get SortNo() {
    // return 'd242060a-b';
    return this.params.SortNo || this.RequestVal('SortNo') || '';
  }

  async GenerSorts(_systemNo?: string | undefined): Promise<any[]> {
    return [];
  }

  //重写保存方法实现业务逻辑.
  /**
   *
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID
   * @param sortNo 分类编号
   * @param tb1
   * @param tb2
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    sortNo = this.RequestVal('SortNo');
    if (pageID == 'AiFlow') {
      const url35 = GloComm.UrlGPN('GPN_AIFlow', '&SystemNo=' + this.SystemNo + '&ModelNo=' + sortNo);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url35);
    }
    const en = new Menu();
    en.Icon = 'icon-user';
    en.ModuleNo = sortNo;
    en.ModuleNoT = this.GetSortName(sortNo);
    en.SystemNo = this.SystemNo; //系统编号.
    en.SetPara('EnName', 'TS.GPM.MenuGenerPage'); //设置类名,属性用它//如果是专业或者极简模式.

    if (pageID == 'GLDBView') {
      const md = new GLDBView();
      md.No = tb2;
      md.Name = tb1;
      const num = await md.IsExits();
      if (num == true) {
        alert('ID已经存在');
        return;
      }

      md.FK_FrmSort = sortNo;
      md.SetPara('DBViewSrcModel', 'Search'); //设置模式.

      //配置默认数据
      md.SetValByKey('ExpEn', tb1);
      md.SetPara('ExpName', tb2); //设置数据源.
      await md.Insert();
      const dbEntity = new BSEntity('BP.CCBill.SearchBillView');
      dbEntity.setPK(md.No);
      await dbEntity.Retrieve();
      await dbEntity.DoMethodReturnString('CheckGLGenerList');
      //加入菜单.
      en.MenuModel = 'GLDBView'; //模式.
      en.Name = md.Name;
      en.FrmID = md.No;
      en.No = DBAccess.GenerGUID();
      en.Icon = 'icon-eyeglass';
      en.SetPara('EnName', 'TS.CCBill.GLDBView'); //设置类名,属性用它。
      en.Tag1 = md.No; //存储它的主键.
      en.Alias = 'GLDBView_' + md.No;
      en.UrlPath = '/@/WF/views/GenerList.vue';
      en.UrlExt = '/' + md.No + '?EnName=GL_DBGenerList&displayMode=table&FrmID=' + md.No;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.GLDBView', md.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url, '属性');
    }

    //分页DBView
    if (pageID == 'SearchBillView') {
      const md = new MapData();
      md.No = tb2;
      if ((await md.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Message, 'ID:' + tb2 + '已经存在,请重命名.');
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      handler.AddPara('TB_Name', tb1);
      handler.AddPara('TB_No', tb2);
      handler.AddPara('DDL_DBSrc', 'local');
      handler.AddPara('FK_FrmSort', sortNo);
      handler.AddPara('EntityType', 100); //数据源实体.
      const mydata = await handler.DoMethodReturnString('NewFrmGuide_Create_DBList');
      if (mydata.includes('err@') == true) return new GPNReturnObj(GPNReturnType.Message, mydata);
      //加入菜单.
      en.MenuModel = pageID; //模式.
      en.Name = tb1;
      en.FrmID = tb2;
      en.No = tb2;
      en.Icon = 'icon-eye';
      en.SetPara('EnName', 'TS.CCBill.SearchBillView'); //设置类名,属性用它
      en.Tag1 = tb2; //存储它的主键.
      en.Alias = 'SearchBillView_' + tb2;
      en.UrlPath = '/@/CCFast/CCBill/SearchDBList.vue';
      en.UrlExt = '/' + md.No + '?displayMode=table&FrmID=' + md.No;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.SearchBillView', tb2);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url, '属性');
    }
    //TreeEns
    if (pageID == 'TreeEnsDBView') {
      const md = new TreeEnsDBView();
      md.No = tb2;
      if ((await md.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Message, 'ID:' + tb2 + '已经存在,请重命名.');
      md.Name = tb1;
      md.FK_FrmSort = sortNo;
      //配置默认数据
      md.SetValByKey('ExpList', `SELECT No,Name,ParentNo, ~icon-home~ as Icon From Port_Dept Where ParentNo=~@Key~`);
      md.SetValByKey('ExpEn', 'SELECT No,Name,Email,Tel FROM Port_Emp WHERE FK_Dept=~@Key~');
      md.SetValByKey('Tag0', 'SELECT No,Name,Email,Tel FROM Port_Emp Where No like ~%@Key%~ OR Name like ~%@Key%~');
      md.SetValByKey('Note', 'No=编号,Name=名称,Email=邮件,Tel=电话');
      md.SetValByKey('IsLazy', '1');
      md.SetValByKey('RootNo', '0');
      md.SetPara('Note', 'No=编号,Name=名称,Email=邮件,Tel=电话');
      md.SetPara('IsLazy', '1');
      md.SetPara('RootNo', '0');
      await md.Insert();
      //加入菜单.
      en.MenuModel = pageID; //模式.
      en.Name = tb1;
      en.FrmID = tb2;
      en.No = tb2;
      en.Icon = 'icon-organization';
      en.SetPara('EnName', 'TS.CCBill.TreeEnsDBView'); //设置类名,属性用它
      en.Tag1 = tb2; //存储它的主键.
      en.Alias = 'TreeEnsDBView_' + tb2;
      en.UrlPath = '/@/CCFast/DBView/TreeEnsDBView.vue';
      en.UrlExt = '/' + md.No + '?displayMode=table&FrmID=' + md.No;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.TreeEnsDBView', tb2);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url, '属性');
    }

    if (pageID == 'LinkFlowFunc') {
      console.log('LinkFlowFunc', tb2);
      en.MenuModel = pageID; //模式.  @wanglu.
      en.Name = tb2;
      en.No = DBAccess.GenerGUID();
      en.Icon = 'icon-link';
      en.SetPara('EnName', 'TS.CCBill.GenerListEn'); //设置类名,属性用它
      en.Tag1 = tb1; //存储它的主键.
      en.Alias = sortNo + '_' + tb1;
      if (tb1.startsWith('GL_')) {
        en.UrlPath = '/@/WF/views/GenerList.vue';
        const gl = tb1.replace('GL_', '');
        en.UrlExt = `/WF/GL/${gl}?No=${en.No}`;
      } else if (tb1.startsWith('TreeEns_')) {
        en.UrlPath = '/@/WF/Comm/TreeEns.vue';
        en.UrlExt = `/WF/Comm/TreeEns_${tb1}?EnName=${tb1}&No=${en.No}`;
      } else if (tb1.startsWith('GPN_')) {
        en.UrlPath = '/@/WF/Comm/UIEntity/GroupPageNew.vue';
        en.UrlExt = `/WF/Comm/GroupPageNew_${tb1}?EnName=${tb1}&No=${en.No}`; //@wanglu 我要插入一个GPN怎么写？写好以后提交上来.
      }
      // en.UrlExt = `/WF/Comm/GenerList` + '?EnName=' + tb1;
      //   en.MobileUrlExt = 'self://CCMobile/GenerList?EnName='+tb1+'&EnID=' + gl.No + '&Title=' + gl.Name;
      await en.Insert();
      return new GPNReturnObj(GPNReturnType.Message, '创建成功.');
    }
    if (pageID === 'Schedule') {
      // en.InitMenuEns('TS.CCOA.Schedule', '日程', '', 'icon-notebook');
      // await en.Insert();
      // message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      // return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
      en.Name = tb1;
      en.MenuModel = 'Schedule'; //类型
      en.IsEnable = 1;
      en.Icon = 'icon-notebook';
      en.SetPara('EnName', 'TS.CCOA.Schedule'); //符合readme.md里面的第2个模式.
      en.UrlPath = '/src/App/CCOA/Schedule/Schedule.vue';
      await en.Insert();
      en.UrlExt = '/Schedule' + en.No.substring(0, 6) + '?PageID=' + en.No;
      await en.Update();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    if (pageID === 'Profession' || pageID === 'JiJian' || pageID == 'RefOneFrmTree.SelectOneFrm' || pageID == 'FrmTree.SelectFrms') {
      //获取系统.
      const flowSort = new FlowSort();
      flowSort.No = en.SystemNo;
      if ((await flowSort.IsExits()) == false) {
        let no = 'CCFast';
        if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) no = 'CCFast_' + WebUser.OrgNo;
        flowSort.No = no;
        if ((await flowSort.IsExits()) == false) {
          flowSort.Name = '低代码流程';
          if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) flowSort.ParentNo = '1';
          else flowSort.ParentNo = WebUser.OrgNo;
          flowSort.OrgNo = WebUser.OrgNo;
          await flowSort.Insert();
        }
        flowSort.No = en.SystemNo;

        const system = new MySystem();
        system.No = en.SystemNo;
        await system.Retrieve();
        flowSort.Name = system.Name;
        if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) flowSort.ParentNo = no;
        else flowSort.ParentNo = WebUser.OrgNo;
        flowSort.OrgNo = WebUser.OrgNo;
        await flowSort.Insert();
      }
      let flowName = tb1;
      const FrmUrl = tb2;
      let model = FlowDevModel.Prefessional;
      let flowNo = '';
      en.Icon = this.GetPageIcon(pageID); // 'icon-paper-plane';
      if (pageID == 'JiJian') model = FlowDevModel.JiJian;

      if (pageID == 'RefOneFrmTree.SelectOneFrm') {
        flowName = this.RequestVal('tb1', 'RefOneFrmTree');
        const frmID = tb1;
        const myFlowNo = await GPN_NewFlow.creteFlow(sortNo, FlowDevModel.RefOneFrmTree, flowName, frmID, tb3);
        if (myFlowNo == null) return;
        flowNo = myFlowNo;
        en.Icon = 'icon-bulb';

        // flowName = this.RequestVal('tb1', 'RefOneFrmTree');
        // FrmUrl = this.RequestVal('tb2', 'RefOneFrmTree');
        // model = FlowDevModel.RefOneFrmTree;
      } else if (pageID == 'FrmTree.SelectFrms') {
        flowName = this.RequestVal('tb1', 'FrmTree');
        const frmID = tb1;
        const myFlowNo = await GPN_NewFlow.creteFlow(sortNo, FlowDevModel.FrmTree, flowName, frmID, tb3);
        if (myFlowNo == null) return;
        flowNo = myFlowNo;
        en.Icon = 'icon-bulb';
      } else {
        const flowNo1 = await GPN_NewFlow.creteFlow(flowSort.No, model, flowName, FrmUrl, tb3);
        if (flowNo1 == null) return;
        flowNo = flowNo1;
      }

      //创建菜单.
      en.Name = flowName;
      en.Alias = 'SearchFlow' + flowNo;
      en.UrlPath = '/src/WF/Rpt/SearchFlow.vue?FlowNo=' + flowNo;
      en.UrlExt = `/SearchFlow_${flowNo}?FlowNo=${flowNo}`;
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo;
      en.MenuModel = 'RefFlow'; // 关联流程.
      en.FlowNo = flowNo;
      en.IsEnable = 1;
      en.SetPara('FlowNo', flowNo); //流程编号.
      await en.Insert();
      const url = GloComm.UrlFlowD(flowNo);
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    if (pageID == 'FrmEntityDtlView' || pageID == 'FrmBillDtlView') {
      const md = new FrmDtlView(tb1);
      if ((await md.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Message, '菜单ID:[' + tb1 + ']已经存在');
      md.setPKVal(tb3);
      if ((await md.RetrieveFromDBSources()) == 0) return new GPNReturnObj(GPNReturnType.Message, '表单ID:[' + tb3 + ']不存在.');
    }
    if (pageID == 'FrmEntityDtlView.SelectFrm.Dtl' || pageID == 'FrmBillDtlView.SelectFrm.Dtl') {
      let pagefrom = 'FrmEntityDtlView';
      if (pageID == 'FrmBillDtlView.SelectFrm.Dtl') pagefrom = 'FrmBillDtlView';

      const md = new FrmDtlView();
      md.No = this.RequestVal('tb2', pagefrom);
      md.Name = this.RequestVal('tb1', pagefrom);

      const frmFrmID = this.RequestVal('tb1', pagefrom + '.SelectFrm');
      const frmMD = new MapData(frmFrmID);
      await frmMD.RetrieveFromDBSources();

      md.FrmNo = frmMD.No; //主表表单ID.
      md.FrmName = frmMD.Name;
      md.DtlNo = tb1; //选择的从表.
      md.DtlName = tb2;
      md.PTable = md.No;
      await md.Insert();

      //加入菜单.
      en.MenuModel = pagefrom; //模式.
      en.Name = md.Name;
      en.FrmID = md.No;
      en.No = md.No;
      en.Icon = 'icon-wallet';
      en.SetPara('EnName', 'TS.CCBill.FrmDtlView'); //设置类名,属性用它
      en.Tag1 = tb2; //存储它的主键.
      en.Alias = 'FrmEntityDtlView_' + md.No;
      en.UrlPath = '/@/CCFast/CCBill/SearchDBList.vue'; // 都转化为 数据源解析.
      // en.UrlExt = '/WF/Comm/Search' + '?EnName=' + md.No;
      en.UrlExt = '/FrmDtlView_' + md.No + '?EnName=' + md.No;
      await en.Insert();

      const frmDtlView = new BSEntity('BP.CCBill.FrmDtlView', md.No);
      await frmDtlView.Retrieve();
      frmDtlView.DoMethodReturnString('CheckIt');

      const url = GloComm.UrlEn('TS.CCBill.FrmDtlView', md.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url, '属性');
    }

    if (pageID == 'FlowDtlView') {
      const md = new FrmDtlView(tb1);
      if ((await md.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Message, '菜单ID:[' + tb1 + ']已经存在');

      const flow = new FlowAdm(tb3);
      if ((await flow.IsExits()) == false) return new GPNReturnObj(GPNReturnType.Message, '流程编号错误:' + tb3);
    }

    if (pageID == 'FlowDtlView.SelectFlowDtl') {
      const md = new FlowDtlView();
      md.No = this.RequestVal('tb2', 'FlowDtlView');
      md.Name = this.RequestVal('tb1', 'FlowDtlView');

      const flowNo = this.RequestVal('tb3', 'FlowDtlView');
      const flow = new FlowAdm(flowNo);
      await flow.RetrieveFromDBSources();

      md.FlowNo = flow.No;
      md.DictID = 'ND' + Number.parseInt(flow.No + '01');
      md.DictName = flow.Name;
      md.DictDtlID = tb1;
      md.DictDtlName = tb2;
      await md.Insert();

      //加入菜单.
      en.MenuModel = 'FlowDtlView'; //模式.
      en.Name = md.Name;
      en.FrmID = md.No;
      en.No = md.No;
      en.Icon = 'icon-wallet';
      en.SetPara('EnName', 'TS.CCBill.FlowDtlView'); //设置类名,属性用它
      en.Tag1 = tb2; //存储它的主键.
      en.Alias = 'FlowDtlView_' + md.No;

      en.Name = md.Name;
      en.UrlExt = '/' + md.No + '?displayMode=table&FrmID=' + md.No; // $("#TB_No").val();
      en.UrlPath = '/src/CCFast/CCBill/SearchDict.vue';
      en.FrmID = md.No;
      en.ListModel = 0;
      en.WorkType = '0'; //自定义菜单.

      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.FlowDtlView', md.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url, '属性');
    }

    //如果是通用列表组件.
    if (pageID == 'GenerListEn') {
      en.MenuModel = pageID; //模式.
      en.Name = tb1;
      const gl = new GenerListEn();
      gl.No = DBAccess.GenerGUID();
      gl.Name = tb1;
      await gl.Insert();
      en.No = gl.No;
      en.Icon = 'icon-wallet';
      en.SetPara('EnName', 'TS.CCBill.GenerListEn'); //设置类名,属性用它
      en.Tag1 = gl.No; //存储它的主键.
      en.Alias = sortNo + '_' + gl.No;
      en.UrlPath = '/@/WF/views/GenerList.vue';
      en.UrlExt = `/WF/Comm/GenerList_${gl.No}` + '?EnName=GL_GLEn&EnID=' + gl.No + '&Title=' + gl.Name;
      en.MobileUrlExt = 'self://CCMobile/GenerList?EnName=GL_GLEn&EnID=' + gl.No + '&Title=' + gl.Name;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.GenerListEn', gl.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url, '设计通用列表');
    }

    // @zhoupeng 处理几种固定的创建模式, 如果有新类型，在这里添加即可
    const finishStepsList = [
      'TabPage.Ens.Paras',
      'DataV.Ens.Paras',
      'Rpt2D.Ens.Paras',
      'Rpt3D.Ens.Paras',
      'Entity.EnName.CompentType.Paras',
      'Search.EnName.Paras',
      'GPN.Ens.Paras',
      'TreeEns.Ens.Paras',
      'GL.Ens.Paras',
      'PG.Ens.Paras',
      'Tabs.Ens.Paras',
    ];

    if (finishStepsList.includes(pageID)) {
      const typeName = pageID.split('.')[0];
      const clsTypeName = pageID.split('.')[1];
      const modeInfo = (await getFactoryMap()).get(typeName);
      if (!modeInfo) {
        message.error('抱歉，你输入的类型不存在');
        return new GPNReturnObj(GPNReturnType.DoNothing, null);
      }
      const { file, urlPrefix, MUrlPrefix, factory } = modeInfo;
      const enName = this.RequestVal('tb1', typeName + '.' + clsTypeName);
      const myEntity = await factory.GetEn(enName);
      //更新节点表单类型.
      en.ModuleNo = sortNo;
      en.Name = myEntity?._enMap?.EnDesc || myEntity.PageTitle; //连接名称.
      en.Alias = sortNo + '_' + enName + DBAccess.GenerGUID();
      en.UrlPath = file;
      en.UrlExt = urlPrefix + '?EnName=' + enName + '&' + tb1 + DBAccess.GenerGUID();
      en.SystemNo = this.SystemNo;
      en.MenuModel = MenuModel.FixedUrl; // "SelfUrl"; //类型为.
      if (MUrlPrefix) {
        const joinStr = tb1.trim().startsWith('&') ? '' : '&';
        en.MobileUrlExt = 'self://' + MUrlPrefix + '?EnName=' + enName + joinStr + tb1;
      }
      en.IsEnable = 1;
      en.Icon = this.GetPageIcon(typeName);
      //  en.Icon='drop-';
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    // 分步创建实体
    if (pageID === 'Entity.EnName.componentName.Paras') {
      const filePathPrefix = '/@/WF/Comm/';
      // const urlPrefix = '/WF/Comm/';
      // 第二部获取组件名
      const enName = this.RequestVal('tb1', 'Entity.EnName');
      // 第三步获取组件名
      const componentName = this.RequestVal('tb1', 'Entity.EnName.componentName');
      const factory = await useClassFactoryLoader('ClassFactory');
      const myEntity = await factory.GetEn(enName);
      // 更新节点表单类型.
      en.ModuleNo = sortNo;
      en.Name = myEntity?._enMap?.EnDesc || myEntity.PageTitle; //连接名称.
      en.Alias = sortNo + '_' + enName;
      en.UrlPath = filePathPrefix + componentName + '.vue';
      // en.UrlExt = urlPrefix + componentName + '?EnName=' + enName + '&' + tb1;
      tb1 += ''; // any type convert to string;
      tb1 = tb1.trim(); // trim
      if (tb1.length === 0) {
        const lastDotIdx = enName.lastIndexOf('.');
        tb1 = enName.substring(lastDotIdx) + componentName; // set default name
      }
      en.UrlExt = DBAccess.GenerGUID().substring(5) + '?EnName=' + enName;
      // 处理异常输入
      if (typeof tb2 === 'string' && tb2.trim().length > 0) {
        en.UrlExt = tb1 + '?EnName=' + enName + '&' + tb2.replace(/\?/g, '').replace(/^&+/g, '');
      }
      en.SystemNo = this.SystemNo;
      en.MenuModel = MenuModel.FixedUrl; // "SelfUrl"; //类型为.
      en.IsEnable = 1;

      if (componentName == 'Group') en.Icon = 'icon-pie-chart';
      if (componentName == 'Search') en.Icon = 'icon-magnifier';
      if (componentName == 'SearchRpt') en.Icon = 'icon-credit-card';
      if (componentName == 'Ens') en.Icon = 'icon-pencil';
      if (componentName == 'TabPage') en.Icon = 'icon-wallet';
      if (componentName == 'Tree') en.Icon = 'icon-organization';
      if (componentName == 'En') en.Icon = 'icon-home';
      if (componentName == 'EnOnly') en.Icon = 'icon-home';

      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //自定义url.
    if (pageID === MenuModel.SelfUrl) {
      //更新节点表单类型.
      en.ModuleNo = sortNo;
      en.Name = tb1;
      en.UrlPath = tb2;
      en.UrlExt = tb3;
      en.SystemNo = this.SystemNo;
      en.MenuModel = MenuModel.SelfUrl; // "SelfUrl"; //类型为.
      en.IsEnable = 1;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
      handler.AddPara('name', tb1);
      handler.AddPara('flag', true);
      en.Alias = await handler.DoMethodReturnString('ParseStringToPinyin');
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    if (pageID === 'LinkFlow.FlowNo') {
      const id = this.RequestVal('tb1', 'LinkFlow');
      const flowNo = tb1;

      const flow = new Flow(flowNo);
      await flow.Retrieve();

      en.MenuModel = 'RefFlow'; //引用流程.

      if (id == 'Home') {
        en.Name = '主页:' + flow.Name;
        en.Alias = sortNo + '_GL_CC' + flow.No;
        en.UrlPath = '/src/WF/Comm/En.vue';
        en.UrlExt = `/Flow_Home_${flow.No}?EnName=TS.TSClass.FlowOneSetting&PKVal=${flow.No}`;
      }

      if (id == 'FlowSearch') {
        en.Name = flow.Name + '查询';
        en.Alias = 'SearchFlow' + flow.No;
        en.UrlPath = '/src/WF/Rpt/SearchFlow.vue?FlowNo=' + flow.No;
        en.UrlExt = `/SearchFlow_${flow.No}?FlowNo=${flow.No}`;
        en.Icon = 'icon-magnifier-add';
      }
      if (id == 'FlowGroup') {
        en.Name = flow.Name + '分析';
        en.Icon = 'icon-chart';
        en.Alias = 'FlowGroup' + flow.No;
        en.UrlPath = '/src/WF/Rpt/GroupFlow.vue?FlowNo=' + flow.No;
        en.UrlExt = `/GroupFlow_${flow.No}?FlowNo=${flow.No}`;
      }
      if (id == 'Start') {
        en.Alias = sortNo + '_' + flowNo;
        en.UrlPath = '';
        en.UrlExt = 'self://WF/MyFlow' + '?FlowNo=' + flowNo;
        en.Name = '发起:' + flow.Name;
        en.Icon = 'icon-paper-plane';
        en.MobileUrlExt = `self://CCMobile/MyFlow?FlowNo=${flowNo}&Title=待办&FK_Flow=${flow.No}`;
      }
      if (id == 'Todolist') {
        console.log(flow.Name);
        en.Name = '待办:' + flow.Name;
        en.Alias = sortNo + '_GL_Todolist' + flow.No;
        en.UrlPath = '/@/WF/views/GenerList.vue';
        en.UrlExt = `/WF/Comm/GL_Todolist_${flowNo}?EnName=GL_Todolist&FlowNo=${flow.No}`;
        en.Icon = 'icon-clock';
        en.MobileUrlExt = `self://CCMobile/GenerList?EnName=GL_Todolist&FlowNo=${flowNo}&Title=待办&FK_Flow=${flow.No}`;
      }
      if (id == 'Runing') {
        en.Name = '在途:' + flow.Name;
        en.Alias = sortNo + '_GL_Runing' + flow.No;
        en.UrlPath = '/@/WF/views/GenerList.vue';
        en.UrlExt = `/WF/Comm/GL_Running_${flowNo}?EnName=GL_Runing&FlowNo=${flow.No}`;
        en.Icon = 'icon-hourglass';
        en.MobileUrlExt = `self://CCMobile/GenerList?EnName=GL_Running&FlowNo=${flowNo}&Title=在途&FK_Flow=${flow.No}`;
      }
      if (id == 'Complete') {
        en.Name = '已完成:' + flow.Name;
        en.Alias = sortNo + '_GL_Complete' + flow.No;
        en.UrlPath = '/@/WF/views/GenerList.vue';
        en.UrlExt = `/WF/Comm/GL_Complete_${flowNo}?EnName=GL_Complete&FlowNo=${flow.No}`;
        en.Icon = 'icon-check';
        en.MobileUrlExt = `self://CCMobile/GenerList?EnName=GL_Complete&FlowNo=${flowNo}&Title=已完成&FK_Flow=${flow.No}`;
      }

      if (id == 'DataV') {
        en.Name = '报表' + flow.Name; //@wanglu 这里要调用大屏，连接. 低代码的大屏，默认为: 流程编号.
        en.Alias = sortNo + '_GL_DataV' + flow.No;
        en.UrlPath = '/@/views/data_visualization/index.vue';
        en.UrlExt = `/WF/Comm/DataV?EnName=DataV_OneFlowEmp&FlowNo=${flow.No}&` + this.SystemNo;
        en.Icon = 'icon-check';
        en.MobileUrlExt = `self://CCMobile/DataV?EnName=GL_Complete&FlowNo=${flowNo}&Title=已完成&FK_Flow=${flow.No}`;
        en.MenuModel = 'FixedUrl';
      }

      if (id == 'CC') {
        en.Name = '抄送:' + flow.Name;
        en.Alias = sortNo + 'GL_CC' + flow.No;
        en.UrlPath = '/@/WF/views/GenerList.vue';
        en.UrlExt = `/WF/Comm/GL_CC_${flowNo}?EnName=GL_CC&FlowNo=${flow.No}`;
        en.Icon = 'icon-bag';
        en.MobileUrlExt = `self://CCMobile/GenerList?EnName=GL_CC&FlowNo=${flowNo}&Title=抄送&FK_Flow=${flow.No}`;
      }

      if (id == 'GPN_StartFlowByImpExcel') {
        en.Name = 'Excel发起:' + flow.Name;
        en.Alias = sortNo + 'GPN_StartFlowByImpExcel' + flow.No;
        const gpnFilePath = (await getFactoryMap())?.get('GPN')?.file || '';
        en.UrlPath = gpnFilePath;
        en.UrlExt = `/WF/Comm/GPN_StartFlowByImpExcel_${flow.No}?EnName=GPN_StartFlowByImpExcel&FlowNo=${flow.No}`;
        en.Icon = 'icon-bag';
        // en.MobileUrlExt = `self://CCMobile/GenerList?EnName=GL_CC&FlowNo=${flowNo}&Title=抄送&FK_Flow=${flow.No}`;
      }

      //更新节点表单类型.
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo;
      if (id != 'DataV') en.MenuModel = 'RefFlow'; // 关联流程.
      en.FlowNo = flow.No;
      en.IsEnable = 1;
      en.SetPara('FlowNo', flow.No); //流程编号.
      // const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
      // handler.AddPara('name', en.Name);
      // handler.AddPara('flag', true);
      // en.Alias = await handler.DoMethodReturnString('ParseStringToPinyin');
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === 'EntityNoNameLink.Ref') {
      const id = this.RequestVal('tb1', 'EntityNoNameLink');
      const frmID = tb1;

      const dict = new MapData(frmID);
      await dict.Retrieve();

      if (id == 'Home') {
        en.Name = '主页:' + dict.Name;
        en.Alias = sortNo + '_Dict_Home_' + dict.No;
        en.UrlPath = '/@/WF/Comm/En.vue';
        en.UrlExt = `/Dict_Home_${dict.No}?EnName=TS.CCBill.EntityNoNameSettingOne&PKVal=${dict.No}`;
      }
      if (id == 'Search') {
        en.Name = '列表:' + dict.Name;
        en.Alias = sortNo + '_List_' + dict.No;
        en.UrlPath = '/@/CCFast/CCBill/SearchEntityNoName.vue';
        en.UrlExt = `/NoName_List_${dict.No}?FrmID=${dict.No}`;
      }
      if (id == 'Group') {
        en.Name = '分析:' + dict.Name;
        en.Alias = sortNo + '_Analy_' + dict.No;
        en.UrlPath = '/@/CCFast/CCBill/SearchEntityNoName.vue';
        en.UrlExt = `/NoName_Analy_${dict.No}?FrmID=${dict.No}&displayMode=group`;
      }
      if (id == 'Rpt') {
        en.Name = '报表:' + dict.Name;
        en.Alias = sortNo + '_Rpt_' + dict.No;
        en.UrlPath = '/@/CCFast/CCBill/SearchEntityNoName.vue';
        en.UrlExt = `/NoName_Rpt_${dict.No}?FrmID=${dict.No}&displayMode=rpt`;
      }
      if (id == 'BS') {
        en.Name = '大屏:' + dict.Name;
        en.Alias = sortNo + '_BigScreen_' + dict.No;
        en.UrlPath = '/src/CCFast/Views/RptWhiteMain.vue';
        en.UrlExt = `/NoName_BigScreen_${dict.No}?PageID=FrmEntityNoName${dict.No}`;
      }
      //更新节点表单类型.
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo;
      en.MenuModel = MenuModel.SelfUrl; // "SelfUrl"; //类型为.
      en.IsEnable = 1;
      // const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
      // handler.AddPara('name', en.Name);
      // handler.AddPara('flag', true);
      // en.Alias = await handler.DoMethodReturnString('ParseStringToPinyin');
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    if (pageID === 'BillLink.FrmID') {
      const id = this.RequestVal('tb1', 'BillLink');
      const frmID = tb1;

      const dict = new MapData(frmID);
      await dict.Retrieve();

      if (id == 'Home') {
        en.Name = '主页:' + dict.Name;
        en.Alias = sortNo + '_Dict_Home_' + dict.No;
        en.UrlPath = '/@/WF/Comm/En.vue';
        en.UrlExt = `/Dict_Home_${dict.No}?EnName=TS.CCBill.BillSettingOne&PKVal=${dict.No}`;
      }
      if (id == 'Search') {
        en.Name = '列表:' + dict.Name;
        en.Alias = sortNo + '_List_' + dict.No;
        en.UrlPath = '/@/CCFast/CCBill/SearchBill.vue';
        en.UrlExt = `/Dict_List_${dict.No}?FrmID=${dict.No}`;
      }
      if (id == 'Group') {
        en.Name = '分析:' + dict.Name;
        en.Alias = sortNo + '_Analy_' + dict.No;
        en.UrlPath = '/@/CCFast/CCBill/SearchBill.vue';
        en.UrlExt = `/Dict_Analy_${dict.No}?FrmID=${dict.No}&displayMode=group`;
      }
      if (id == 'Rpt') {
        en.Name = '报表:' + dict.Name;
        en.Alias = sortNo + '_Rpt_' + dict.No;
        en.UrlPath = '/@/CCFast/CCBill/SearchBill.vue';
        en.UrlExt = `/Dict_Rpt_${dict.No}?FrmID=${dict.No}&displayMode=rpt`;
      }
      if (id == 'BS') {
        en.Name = '大屏:' + dict.Name;
        en.Alias = sortNo + '_BigScreen_' + dict.No;
        en.UrlPath = '/src/CCFast/Views/RptWhiteMain.vue';
        en.UrlExt = `/Dict_BigScreen_${dict.No}?PageID=${dict.No}`;
      }
      //更新节点表单类型.
      en.Name = '单据：' + dict.Name;
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo;
      en.MenuModel = MenuModel.SelfUrl; // "SelfUrl"; //类型为.
      en.IsEnable = 1;
      // const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
      // handler.AddPara('name', en.Name);
      // handler.AddPara('flag', true);
      // en.Alias = await handler.DoMethodReturnString('ParseStringToPinyin');
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    if (pageID === 'BillImp') {
      try {
        //获取系统.
        const frmSort = new FrmSort();
        frmSort.No = en.SystemNo;
        if ((await frmSort.IsExits()) == false) {
          let no = 'CCFast';
          if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) no = 'CCFast_' + WebUser.OrgNo;
          frmSort.No = no;
          if ((await frmSort.IsExits()) == false) {
            frmSort.Name = '低代码表单';
            if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) frmSort.ParentNo = '1';
            else frmSort.ParentNo = WebUser.OrgNo || '1';
            frmSort.OrgNo = WebUser.OrgNo;
            await frmSort.Insert();
          }
          frmSort.No = en.SystemNo;

          const system = new MySystem();
          system.No = en.SystemNo;
          await system.Retrieve();
          frmSort.Name = system.Name;
          if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) frmSort.ParentNo = no;
          else frmSort.ParentNo = WebUser.OrgNo || '1';
          frmSort.OrgNo = WebUser.OrgNo;
          await frmSort.Insert();
        }
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Template');
        handler.AddFile(this.UploadFile);
        handler.AddPara('RB_ImpType', 0);
        handler.AddPara('FrmSort', this.SystemNo);
        const data = await handler.DoMethodReturnString('ImpFrmLocal_Done');
        if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
        const result = Array.isArray(data) ? data[0] : data;
        //更新节点表单类型.
        en.Name = result.Name;
        en.UrlExt = result.No + '?displayMode=table&FrmID=' + result.No; // $("#TB_No").val();
        en.UrlPath = '/src/CCFast/CCBill/SearchBill.vue';
        en.FrmID = result.No;
        en.MenuModel = MenuModel.Bill; //类型为
        en.ListModel = 0;
        en.WorkType = '0'; //自定义菜单.
        // en.SetPara('EnName', '');
        en.SetPara('EnName', 'TS.CCBill.FrmBill'); //符合readme.md里面的第3个模式,编辑属性.
        en.SetPara('EnPKVal', result.No); //设置主键.
        en.Icon = this.GetPageIcon('Bill');

        //  en.EnName = 'TS.CCBill.FrmDict';
        await en.Insert();
        //  this.SetHref('/src/WF/Comm/En.vue?EnName=TS.GPM.Menu&No=' + en.No);
        message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
        return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
      } catch (e) {
        return new GPNReturnObj(GPNReturnType.Error, e as string);
      }
    }
    //内置流程.
    if (pageID === MenuModel.StandAloneFlow) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_GPM_CreateMenu');
      handler.AddPara('SortNo', sortNo); //模块的系统编号，也是流程目录的编号
      handler.AddPara('FlowName', tb1);
      handler.AddPara('FlowDevModel', 0); //流程模式.
      handler.AddPara('ModuleNo', sortNo); //模块编号.
      const flowNo = await handler.DoMethodReturnString('StandAloneFlow_Save');
      if (typeof flowNo === 'string' && flowNo.startsWith('err@')) {
        alert(flowNo);
        return;
      }
      //更新节点表单类型.
      en.ModuleNo = sortNo;
      en.Name = tb1;
      en.UrlExt = tb2;
      en.MenuModel = MenuModel.StandAloneFlow; //类型
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
      //this.SetHref('/src/WF/Comm/En.vue?EnName=TS.GPM.Menu&No=' + en.No);
      // return;
    }

    //白色大屏
    if (pageID === 'RptWhite') {
      const url = GloComm.UrlGPN('GPN_RptWhite', '', '');
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);

      // en.Name = tb1;
      // en.MenuModel = MenuModel.RptWhite; //类型
      // en.IsEnable = 1;
      // en.Icon = this.GetPageIcon('RptWhite');
      // en.SetPara('EnName', 'TS.CCFast.Rpt3D'); //符合readme.md里面的第2个模式.
      // en.SetPara('RptModel','RptWhite');
      // en.UrlPath = '/src/CCFast/Views/RptWhiteMain.vue';
      // await en.Insert();
      // en.UrlExt = '/RptWhite' + en.No.substring(0, 6) + '?PageID=' + en.No;
      // await en.Update();
      // message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      // const rptPage = new RptPage();
      // rptPage.No = en.No;
      // rptPage.Name = en.Name;
      // rptPage.RptModel = 'RptWhite';
      // await rptPage.Insert();
      // return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    //其他大屏
    if (pageID === 'FlowRptWhite.BindFlow' || pageID === 'BillRptWhite.BindFrm' || pageID === 'EnRptWhite.BindFrm' || pageID === 'EntityRptWhite.EnName') {
      const subPageID = pageID.substring(0, pageID.indexOf('.'));
      en.Name = this.RequestVal('tb1', subPageID);
      en.MenuModel = MenuModel.RptWhite; //类型
      en.IsEnable = 1;
      en.Icon = this.GetPageIcon('RptWhite');
      en.SetPara('EnName', 'TS.CCFast.Rpt3D'); //符合readme.md里面的第2个模式.
      en.SetPara('RptModel', subPageID);
      en.SetPara('BindNo', tb1);
      en.SetPara('BindName', tb2);
      en.UrlPath = '/src/CCFast/Views/RptWhiteMain.vue';
      await en.Insert();
      en.UrlExt = '/RptWhite' + en.No.substring(0, 6) + '?PageID=' + en.No;
      await en.Update();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      const rptPage = new RptPage(en.No);
      rptPage.Name = en.Name;
      rptPage.RptModel = subPageID;
      if (pageID === 'FlowRptWhite.BindFlow') {
        rptPage.FlowNo = tb1;
        rptPage.FlowName = tb2;
      }
      if (pageID === 'BillRptWhite.BindFrm' || pageID === 'EnRptWhite.BindFrm') {
        rptPage.FrmID = tb1;
        rptPage.FrmName = tb2;
      }
      if (pageID === 'EntityRptWhite.EnName') {
        rptPage.FrmID = tb1;
        rptPage.FrmName = tb2;
      }
      await rptPage.Insert();
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //内置字典维护
    if (pageID === 'SFTable') {
      en.Name = tb2;
      en.MenuModel = 'SFTable'; //类型
      en.IsEnable = 1;
      en.Icon = this.GetPageIcon('SFTable');
      //  en.SetPara('EnName', 'TS.CCFast.Rpt3D'); //符合readme.md里面的第2个模式.
      // /@/WF/Admin/FrmLogic/SFTable/SFTableNoName.vue
      en.Alias = `SFTableNoName_${tb1}_${DBAccess.GenerGUID()}`;

      const sftable = new SFTable(tb1);
      await sftable.RetrieveFromDBSources();

      if (sftable.CodeStruct == 0) en.UrlPath = '/src/WF/Comm/SFTable/SFTableNoName.vue';
      else en.UrlPath = '/src/WF/Comm/SFTable/SFTableTree.vue';
      await en.Insert();
      if (sftable.CodeStruct == 0) en.UrlExt = `/SFTableNoName_${DBAccess.GenerGUID()}?FK_SFTable=${tb1}`;
      else en.UrlExt = `/SFTableTree_${DBAccess.GenerGUID()}?FK_SFTable=${tb1}`;

      await en.Update();

      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //NetDisk 网盘
    if (pageID === MenuModel.NetDisk) {
      en.InitMenu('TreeEns_DirectoryTree2FileDtl', '网盘', this.GetPageIcon('NetDisk'));
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    //NetDisk 邮件
    if (pageID === 'Message') {
      en.InitMenu('TreeEns_Message', '消息/邮件', this.GetPageIcon('Message'));
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //蓝色大屏.
    if (pageID === MenuModel.RptBlue) {
      en.Name = tb1;
      en.Tag1 = buildShortUUID();
      en.MenuModel = MenuModel.RptBlue; //类型
      en.IsEnable = 1;
      en.Icon = this.GetPageIcon('RptBlue');
      en.SetPara('EnName', 'TS.CCFast.RptBlue');
      //只用来可以在菜单中出现，没有实际用
      en.UrlPath = '/src/CCFast/Views/RptBlueMain.vue';
      en.path = '#/chart/home/' + en.Tag1;
      await en.Insert();
      en.UrlExt = '/RptBlue' + en.No.substring(0, 6) + '?PageID=' + en.No;
      await en.Update();
      const handler = new HttpHandler('BP.WF.HttpHandler.Third.Third_GoView');
      handler.AddPara('myPk', en.Tag1);
      const msg = await handler.DoMethodReturnString('CreateProject');
      console.log(msg);
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //Tabs页面容器
    if (pageID === MenuModel.Tabs) {
      en.Name = tb1;
      en.MenuModel = MenuModel.Tabs; //类型
      en.IsEnable = 1;
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    // //3维报表
    if (pageID === 'Rpt3DLowCode.DBModel') {
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo; //系统编号.
      en.Name = this.RequestVal('tb1', 'Rpt3DLowCode');
      en.Icon = this.GetPageIcon('Rpt3DLowCode');
      en.MenuModel = MenuModel.Rpt3DLowCode; //类型
      if (tb1 == 'Self') en.SetPara('EnName', 'TS.CCFast.Rpt3DLowCodeForSQL'); //符合readme.md里面的第2个模式,编辑属性.
      else en.SetPara('EnName', 'TS.CCFast.Rpt3DLowCodeForDBSrc'); //符合readme.md里面的第2个模式,编辑属性.
      await en.Insert();

      en.UrlExt = '/WF/Comm/Rpt3D' + DBAccess.GenerGUID() + '?EnName=Rpt3D_GenerLowCode&RptID=' + en.No; //类型
      en.UrlPath = '/@/WF/Comm/Rpt3D.vue'; //类型
      en.Alias = en.No;
      await en.Update();

      if (tb1 == 'Self') {
        const rpt3D = new Rpt3DLowCodeForSQL();
        rpt3D.No = en.No;
        rpt3D.Name = en.Name;
        rpt3D.RptType = 'Rpt3D';
        rpt3D.DBModel = tb1;
        rpt3D.Init_Default();
        await rpt3D.Insert();
      } else {
        const rpt3D = new Rpt3DLowCodeForDBSrc();
        rpt3D.No = en.No;
        rpt3D.Name = en.Name;
        rpt3D.RptType = 'Rpt3D';
        rpt3D.DBModel = tb1;
        rpt3D.Init_Default();
        await rpt3D.Insert();
      }

      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      // const url = GloComm.UrlEn(en.GetParaString('EnName'), en.No);
      return new GPNReturnObj(GPNReturnType.CloseAndReload);
    }

    // 2维报表
    if (pageID === 'Rpt2DLowCode.DBModel') {
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo; //系统编号.
      en.Name = this.RequestVal('tb1', 'Rpt2DLowCode');
      en.Icon = this.GetPageIcon('Rpt2DLowCode');
      en.MenuModel = MenuModel.Rpt2DLowCode; //类型
      en.SetPara('EnName', 'TS.CCFast.Rpt2DLowCode'); //符合readme.md里面的第2个模式,编辑属性.
      await en.Insert();

      en.UrlExt = '/WF/Comm/Rpt2D' + DBAccess.GenerGUID() + '?EnName=Rpt2D_GenerLowCode&RptID=' + en.No; //类型
      en.UrlPath = '/@/WF/Comm/Rpt2D.vue'; //类型
      en.Alias = en.No;
      await en.Update();

      const rpt2D = new Rpt2DLowCode();
      rpt2D.No = en.No;
      rpt2D.Name = en.Name;
      rpt2D.RptType = 'Rpt2D';
      rpt2D.DBModel = tb1;
      rpt2D.Init_Default();
      await rpt2D.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      // const url = GloComm.UrlEn(en.GetParaString('EnName'), en.No);
      return new GPNReturnObj(GPNReturnType.CloseAndReload);
    }

    if (pageID === MenuModel.FlowUrl) {
      alert('未实现');
      return;
      const en = new Menu();
      en.ModuleNo = sortNo;
      en.Name = tb1;
      en.UrlExt = tb2;
      en.MenuModel = MenuModel.Tabs; //类型
      await en.Insert();
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.Func) {
      const func = new Func();
      func.Name = tb1;
      func.FuncID = tb2;
      await func.Insert();
      //更新节点表单类型.
      en.Name = func.Name;
      en.MenuModel = MenuModel.Func; //独立功能菜单.
      en.Icon = this.GetPageIcon('Func');
      en.UrlExt = func.No;
      en.SetPara('EnName', 'TS.CCFast.Func'); //符合readme.md里面的第3个模式,编辑属性.
      en.SetPara('EnPKVal', func.No); //主键
      en.No = func.No; //这里让功能的主键与菜单的主键保持了一致.

      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //增加目录.
    if (pageID === 'Dict' || pageID === 'EntityNoName' || pageID === 'Bill') {
      //获取系统.
      const frmSort = new FrmSort();
      frmSort.No = en.SystemNo;
      if ((await frmSort.IsExits()) == false) {
        let no = 'CCFast';
        if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) no = 'CCFast_' + WebUser.OrgNo;
        frmSort.No = no;
        if ((await frmSort.IsExits()) == false) {
          frmSort.Name = '低代码表单';
          if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) frmSort.ParentNo = '1';
          else frmSort.ParentNo = WebUser.OrgNo || '1';
          frmSort.OrgNo = WebUser.OrgNo;
          await frmSort.Insert();
        }
        frmSort.No = en.SystemNo;

        const system = new MySystem();
        system.No = en.SystemNo;
        await system.Retrieve();
        frmSort.Name = system.Name;
        if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) frmSort.ParentNo = no;
        else frmSort.ParentNo = WebUser.OrgNo || '1';
        frmSort.OrgNo = WebUser.OrgNo;
        await frmSort.Insert();
      }

      //  // en.ModuleNo = sortNo;
      //  // en.ModuleNoT = this.GetSortName(sortNo);
      //   frmSort.No = en.No;
      //   if ((await frmSort.IsExits()) == false) {
      //     let no = 'CCFast';
      //     const system = new MySystem();
      //     system.No = en.SystemNo;
      //     await system.Retrieve();
      //     frmSort.Name = system.Name;
      //     if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) frmSort.ParentNo = sortNo;
      //     else frmSort.ParentNo = WebUser.OrgNo || '1';
      //     frmSort.OrgNo = WebUser.OrgNo;
      //     await frmSort.Insert();
      //   }
    }
    if (pageID === 'Dict') {
      const myno = tb2;
      const myname = tb1;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      handler.AddPara('TB_No', myno);
      handler.AddPara('TB_Name', myname);
      handler.AddPara('TB_PTable', myno);
      handler.AddPara('FK_FrmSort', en.SystemNo);
      handler.AddPara('EntityType', 2);

      //DDL_FrmTree
      await handler.DoMethodReturnString('NewFrmGuide_Create');
      //更新节点表单类型.
      en.Name = myname;
      en.UrlExt = myno + '?displayMode=table&FrmID=' + myno; // $("#TB_No").val();
      en.UrlPath = '/src/CCFast/CCBill/SearchDict.vue';
      en.FrmID = myno;
      en.MenuModel = MenuModel.Dict; //类型为
      en.ListModel = 0;
      en.WorkType = '0'; //自定义菜单.
      // en.SetPara('EnName', '');
      en.SetPara('EnName', 'TS.CCBill.FrmDict'); //符合readme.md里面的第3个模式,编辑属性.
      en.SetPara('EnPKVal', myno); //设置主键.
      //  en.EnName = 'TS.CCBill.FrmDict';
      await en.Insert();
      //  this.SetHref('/src/WF/Comm/En.vue?EnName=TS.GPM.Menu&No=' + en.No);
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === 'EntityNoName') {
      const myno = tb2;
      const myname = tb1;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      handler.AddPara('TB_No', myno);
      handler.AddPara('TB_Name', myname);
      handler.AddPara('TB_PTable', myno);
      handler.AddPara('EntityType', 5); //FrmEntityNoName
      handler.AddPara('FK_FrmSort', en.SystemNo);
      //DDL_FrmTree
      await handler.DoMethodReturnString('NewFrmGuide_Create');
      //更新节点表单类型.
      en.Name = myname;
      en.UrlExt = myno + '?displayMode=table&FrmID=' + myno; // $("#TB_No").val();
      en.UrlPath = '/src/CCFast/CCBill/SearchEntityNoName.vue';
      en.FrmID = myno;
      en.MenuModel = MenuModel.EntityNoName; //类型为
      en.ListModel = 0;
      en.WorkType = '0'; //自定义菜单.
      // en.SetPara('EnName', '');
      en.SetPara('EnName', 'TS.CCBill.FrmEntityNoName'); //符合readme.md里面的第3个模式,编辑属性.
      en.SetPara('EnPKVal', myno); //设置主键.
      //  en.EnName = 'TS.CCBill.FrmDict';
      await en.Insert();
      //  this.SetHref('/src/WF/Comm/En.vue?EnName=TS.GPM.Menu&No=' + en.No);
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //数据源实体
    if (pageID === MenuModel.DBList) {
      const myno = tb2;
      const myname = tb1;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      // handler.AddFormData();
      // handler.AddUrlData();
      handler.AddPara('TB_No', myno);
      handler.AddPara('TB_Name', myname);
      handler.AddPara('TB_PTable', myno);
      // handler.AddPara('FK_FrmSort', this.SystemNo);
      handler.AddPara('EntityType', 2);
      //DDL_FrmTree
      const data = await handler.DoMethodReturnString('NewFrmGuide_Create_DBList');
      if (typeof data === 'string' && data.startsWith('err@')) {
        message.error(data);
        return;
      }

      //更新节点表单类型.
      en.Name = myname;
      en.UrlExt = myno + `?FrmID=` + myno; // $("#TB_No").val();
      en.UrlPath = '/src/CCFast/CCBill/SearchDBList.vue';
      en.MenuModel = MenuModel.DBList; //类型为
      en.FrmID = myno;
      en.ListModel = 0;
      en.WorkType = '0'; //自定义菜单.
      en.Icon = this.GetPageIcon('DBList');
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      // const url= GloWF.u
      const url = GloComm.UrlEn('TS.CCBill.DBList', myno);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      //this.SetHref('/src/WF/Comm/En.htm?EnName=TS.GPM.Menu&No=' + en.No);
    }

    //复制实体
    if (pageID === MenuModel.DictCopy) {
      alert('未翻译..');
      return;
    }

    //创建单据(beta)
    if (pageID === MenuModel.Bill) {
      const myno = tb2;
      const myname = tb1;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      handler.AddPara('TB_No', myno);
      handler.AddPara('TB_Name', myname);
      handler.AddPara('TB_PTable', myno);
      //  handler.AddPara('FK_FrmSort', this.SystemNo);
      handler.AddPara('EntityType', 1); //单据.
      handler.AddPara('FK_FrmSort', en.SystemNo);
      //DDL_FrmTree
      await handler.DoMethodReturnString('NewFrmGuide_Create');
      //更新节点表单类型.
      en.Name = myname;
      en.UrlExt = myno + '?displayMode=table&FrmID=' + myno; // $("#TB_No").val();
      en.UrlPath = '/src/CCFast/CCBill/SearchBill.vue';
      en.FrmID = myno;
      en.MenuModel = MenuModel.Bill; //类型为
      en.ListModel = 0;
      en.WorkType = '0'; //自定义菜单.
      // en.SetPara('EnName', '');
      en.SetPara('EnName', 'TS.CCBill.FrmBill'); //符合readme.md里面的第3个模式,编辑属性.
      en.SetPara('EnPKVal', myno); //设置主键.
      en.Icon = this.GetPageIcon('Bill');

      //  en.EnName = 'TS.CCBill.FrmDict';
      await en.Insert();
      //  this.SetHref('/src/WF/Comm/En.vue?EnName=TS.GPM.Menu&No=' + en.No);
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID.includes('DBTime') == true && (pageID.includes('AskBill') || pageID.includes('AskFlow') || pageID.includes('AskExam'))) {
      let myno = '';
      let myname = '';
      let userType = '';
      let appType = '';

      if (pageID.includes('AskExam')) myno = this.RequestVal('tb2', 'AskExam');
      if (pageID.includes('AskBill')) myno = this.RequestVal('tb2', 'AskBill');
      if (pageID.includes('AskFlow')) myno = this.RequestVal('tb1', 'AskFlow');

      if (pageID.includes('AskExam')) myname = this.RequestVal('tb1', 'AskExam');
      if (pageID.includes('AskBill')) myname = this.RequestVal('tb1', 'AskBill');
      if (pageID.includes('AskFlow')) myname = this.RequestVal('tb1', 'AskFlow');

      if (pageID.includes('AskExam')) userType = this.RequestVal('tb1', 'AskExam.UserType');
      if (pageID.includes('AskBill')) userType = this.RequestVal('tb1', 'AskBill.UserType');
      if (pageID.includes('AskFlow')) userType = this.RequestVal('tb1', 'AskFlow.UserType');

      if (pageID.includes('AskBill')) appType = 'AskBill';
      if (pageID.includes('AskExam')) appType = 'AskExam';
      if (pageID.includes('AskFlow')) appType = 'AskFlow';

      if (pageID.includes('AskFlow') == false) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
        handler.AddPara('TB_No', myno);
        handler.AddPara('TB_Name', myname);
        handler.AddPara('TB_PTable', myno);
        //handler.AddPara('FK_FrmSort', this.SystemNo);
        if (pageID.includes('AskBill') == true) handler.AddPara('EntityType', 4); //调查问卷.
        else handler.AddPara('EntityType', 6); //考卷量表.

        handler.AddPara('FK_FrmSort', en.SystemNo);

        handler.AddPara('AskFrmApp', appType); //AskBill,AskExam,AskFlow
        handler.AddPara('AskFrmUserType', userType); //用户模式,外部还是内部.
        handler.AddPara('AskFrmDBTime', tb1); //填写次数. 单次还是多次.

        //DDL_FrmTree
        const data = await handler.DoMethodReturnString('NewFrmGuide_Create');
        alert(data);
        if (data.includes('err@') == true) {
          return new GPNReturnObj(GPNReturnType.Close, data);
        }
      }

      if (pageID.includes('AskFlow') == true) {
        //获取系统.
        const flowSort = new FlowSort();
        flowSort.No = en.SystemNo;
        if ((await flowSort.IsExits()) == false) {
          let no = 'CCFast';
          if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) no = 'CCFast_' + WebUser.OrgNo;
          flowSort.No = no;
          if ((await flowSort.IsExits()) == false) {
            flowSort.Name = '低代码流程';
            if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) flowSort.ParentNo = '1';
            else flowSort.ParentNo = WebUser.OrgNo;
            flowSort.OrgNo = WebUser.OrgNo;
            await flowSort.Insert();
          }
          flowSort.No = en.SystemNo;

          const system = new MySystem();
          system.No = en.SystemNo;
          await system.Retrieve();
          flowSort.Name = system.Name;
          if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) flowSort.ParentNo = no;
          else flowSort.ParentNo = WebUser.OrgNo;
          flowSort.OrgNo = WebUser.OrgNo;
          await flowSort.Insert();
        }
        const flowName = this.RequestVal('tb1', 'AskFlow');
        const FrmUrl = tb2;
        let model = FlowDevModel.Prefessional;
        en.Icon = this.GetPageIcon(appType); // 'icon-paper-plane';
        model = FlowDevModel.JiJian;
        const flowNo = await GPN_NewFlow.creteFlow(flowSort.No, model, flowName, FrmUrl, tb3);
        if (flowNo == null) return;

        const flow = new FlowAdm();
        flow.No = flowNo;
        await flow.Retrieve();
        flow.IsCanStart = 0; //设置不能独立发起.
        flow.SetPara('AskFrmDBTime', tb1); //发起次数.
        flow.SetPara('AskFrmUserType', userType); //用户类型.
        await flow.Update(); //植入流程标记.

        //特殊处理表单字段.
        const myhandler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
        myhandler.AddPara('FrmID', 'ND' + parseInt(flowNo) + 'Rpt');
        await myhandler.DoMethodReturnString('CheckAskFrm');

        myhandler.AddPara('FrmID', 'ND' + parseInt(flowNo) + '01');
        await myhandler.DoMethodReturnString('CheckAskFrm');
        //检查隐藏字段.
        myno = flowNo;
      }

      //更新节点表单类型.
      en.Name = myname;
      en.FrmID = myno;
      if (appType === 'AskFlow') en.FlowNo = myno;
      en.MenuModel = 'AskFrm'; //类型为
      en.ListModel = 0;
      en.WorkType = '0'; //自定义菜单.
      // en.SetPara('EnName', '');
      en.SetPara('EnName', 'TS.CCBill.' + appType); //符合readme.md里面的第3个模式,编辑属性.
      en.SetPara('EnPKVal', myno); //设置主键.
      en.SetPara('AskFrmApp', appType);
      en.Icon = this.GetPageIcon('AskFrm');

      en.Tag1 = myno; //存储它的主键.
      en.Alias = 'askFrm_' + myno;
      en.UrlPath = '/@/WF/views/GenerList.vue';
      en.UrlExt = '/' + myno + '?EnName=GL_' + appType + '&displayMode=table&FrmID=' + myno + '&FlowNo=' + myno;
      //  en.EnName = 'TS.CCBill.FrmDict';
      await en.Insert();
      //  this.SetHref('/src/WF/Comm/En.vue?EnName=TS.GPM.Menu&No=' + en.No);
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //引入实体
    if (pageID === MenuModel.DictRef) {
      alert('未翻译..');
      return;
    }

    //创建字典表
    if (pageID === MenuModel.DictTable) {
      const dict = new SFTable(); // new BSEntity("TS.Sys.SFTable");
      dict.No = tb2;
      dict.Name = tb1;

      if (dict.No == tb1 || dict.Name == '') {
        alert('err@名称与编号不能为空.');
        return;
      }

      if (await dict.IsExits()) {
        message.warning('编号已经存在[' + dict.No + ']请使用其他的编号.');
        return;
      }

      //const sfType = GetQueryString("SFType");
      dict.DBSrcType = 'SysDict'; //通用的字典表.
      dict.CodeStruct = 0;
      await dict.Insert();

      //更新节点表单类型.
      en.Name = dict.Name;
      en.UrlExt = dict.No;
      en.MenuModel = MenuModel.DictTable; //字典表.
      en.SystemNo = this.SystemNo; //系统编号.
      en.SetPara('CodeStruct', 0);
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.DictTableTree) {
      const dict = new SFTable();
      dict.No = tb2;
      dict.Name = tb1;
      if (dict.No == tb1 || dict.Name == '') {
        alert('err@名称与编号不能为空.');
        return;
      }

      if (await dict.IsExits()) {
        alert('编号已经存在[' + dict.No + ']请使用其他的编号.');
        return;
      }

      //const sfType = GetQueryString("SFType");
      dict.SrcType = 'SysDict'; //通用的字典表.
      dict.CodeStruct = 1;
      en.SetPara('CodeStruct', 1); //设置
      await dict.Insert();

      //更新节点表单类型.
      en.Name = dict.Name;
      en.UrlExt = dict.No;
      en.MenuModel = MenuModel.DictTableTree; //字典表.
      await en.Insert();

      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.Task) {
      //更新节点表单类型.
      en.Name = tb1;
      en.UrlExt = '/src/CCFast/Task/Task.htm'; //h5版根据这个url打开
      en.UrlPath = en.UrlExt;
      en.MenuModel = 'Task'; //类型为.
      en.Mark = 'Task'; //类型为.
      en.Icon = this.GetPageIcon('Task');
      en.SetPara('EnName', 'TS.GPM.MenuExt'); //设置可编辑的EnName.

      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.Info) {
      const en = new Menu();
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo; //系统编号.
      en.Name = tb1;
      en.Icon = this.GetPageIcon('Info');
      en.InitMenu('GL_InfoList', tb1, this.GetPageIcon('Info'));
      await en.Insert();
      // message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    if (pageID === MenuModel.WorkRec) {
      const en = new Menu();
      en.ModuleNo = sortNo;
      en.SystemNo = this.SystemNo; //系统编号.
      en.Name = tb1;
      en.Icon = this.GetPageIcon('WorkRec');
      en.InitMenuSearch('TS.CCOA.WorkRec', tb1, '', en.Icon);
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === 'Schedule') {
      en.InitMenuEns('TS.CCOA.Schedule', '日程', '&1=1', this.GetPageIcon('Schedule'));
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.Calendar) {
      en.Name = tb1;
      en.MenuModel = 'Calendar'; //类型
      en.IsEnable = 1;
      en.Icon = this.GetPageIcon('Calendar');
      en.SetPara('EnName', 'TS.CCOA.CalendarDBSrc');
      en.UrlPath = '/src/App/CCOA/Calendar/Calendar.vue';
      await en.Insert();
      en.UrlExt = '/Calendar' + en.No.substring(0, 6) + '?PageID=' + en.No;
      await en.Update();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.Notepad) {
      en.InitMenu('TreeEns_Notepad', '记事本', this.GetPageIcon('Notepad'));
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.KnowledgeManagement) {
      const handler = new HttpHandler('BP.CCOA.HttpHandler.CCOA_Knowledge');
      handler.AddPara('KnowledgeNo', tb2);
      await handler.DoMethodReturnJson('Knowledge_IsExits');

      en.Name = tb1;
      en.KnowledgeNo = tb2;
      en.FrmID = tb2;
      en.UrlExt = '/KnowledgeManagement_' + en.KnowledgeNo + '?PageID=' + en.KnowledgeNo;
      en.UrlPath = '/src/CCOA/KnowledgeManagement/Default.vue';
      // en.UrlPath = en.UrlExt;
      en.MenuModel = 'KnowledgeManagement'; //类型为.
      en.Mark = 'KnowledgeManagement'; //类型为.
      en.Icon = 'icon-eyeglass';
      en.Insert();

      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    if (pageID === MenuModel.WorkRec) {
      //更新节点表单类型.
      en.ModuleNo = sortNo;
      en.Name = tb1;
      en.UrlPath = '/src/WF/Comm/Search.vue?EnsName=TS.CCOA.WorkLog.WorkRec&1=1';
      en.MobileUrlExt = '/@/CCMobile/Comm/Search.vue';

      en.UrlExt = '/src/WF/Comm/Search.vue?EnsName=TS.CCOA.WorkLog.WorkRec&1=1';
      en.UrlPath = en.UrlExt;
      en.SystemNo = this.SystemNo;
      en.MenuModel = 'WorkRec';
      en.IsEnable = 1;
      en.Alias = DBAccess.GenerGUID();
      await en.Insert();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);

      // //更新节点表单类型.
      // en.Name = tb1;
      // en.UrlExt = '/src/CCFast/WorkRec/Default.htm';
      // en.MenuModel = 'WorkRec'; //类型为.
      // en.Mark = 'WorkRec'; //类型为.
      // en.Icon = 'icon-doc';
      // en.Insert();
      // message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      // return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }

    //alert('没有判断的PageID:' + pageID);
  }
  //引入流程菜单
  public readonly LinkFlowFunc = `
#### 帮助
- 无
`;

  //组件
  public readonly Components = `
  #### 帮助.
 - 无
  `;

  //组件—查询组件
  public readonly Search = `
  #### 帮助
  1. 查询实体：就是把Entity实体，放入查询组件/Comm/Search.vue 上实现数据的增删改查.
  1. 可以对实体按照关键字、日期时间范围、枚举外键进行查询.
  #### 步骤1. 创建实体
  1. 创建一个实体子类，根据实体特征确定继承路径，请参考 BP.Demo.* /src/bp/demo/*.*
  1. 注意命名空间不要与系统的命名空间重复.
  1. 查询条件，隐藏条件的设置与bp架构的一样.
  #### 步骤2. 注册到ClassFactory
  1. 把改实体注册到 /src/bp/da/ClassFactory 类里面.
  1. 注意Ens、En都要注册.
  1. 请参考：BP.Demo.Student 的写法.
  #### 步骤3. 按照向导创建菜单
  1. 新建菜单，选择模块，按照向导创建菜单.
  1. 测试.
  `;

  //组件-查询组件-选择实体
  public readonly Search_Ens = `
#### 帮助
- 选择一个实体类
#### 找不到您创建的TS实体类?
- 原因1：未注册到 \`/src/bp/da/ClassFactory.ts\`里面去。
- 解决：在文件\`/src/bp/da/ClassFactory.ts\`中加入您创建的TS类。
- 原因2：未使用规范的命名（classId）。
- 解决：使用系统规范的命名，以【TS.Demo.Student】为例，系统固定写法是TS.文件路径.文件名。
`;

  //组件-查询组件-选择实体
  public readonly Search_Ens_Paras = `
#### 帮助
1. 输入参数，可以作为条件的参数，该参数可以为空.
1. 比如: &FK_Dept=@WebUser.DeptNo&SortNo=xxxxx 
1. 更多的参数请参考Search.vue的设计说明.
`;

  //组件—新建组件
  public readonly GPN = `
#### 帮助
- 无
`;

  //组件-新建组件-选择实体
  public readonly GPN_Ens = `
#### 帮助
- 无
`;

  //组件-新建组件-选择实体
  public readonly GPN_Ens_Paras = `
#### 帮助
- 无
`;

  //组件—新建组件
  public readonly TreeEns = `
#### 帮助
- 无
`;

  //组件—Tabs组件
  public readonly TabsEns = `
#### 帮助
- 无
`;

  //组件-新建组件-选择实体
  public readonly TreeEns_Ens = `
#### 帮助
- 无
`;

  public readonly Desc100 = '暂未开放';
  public readonly DocSelfUrl = `
#### 帮助
1. 可以使用相对路径，也可以使用绝对路径。
1. 用户输入的Url:  http://ccbpm.cn/MyUrl.htm
1. 打开的Url: http://ccbpm.cn/MyUrl.htm?UserNo=xxxx&Token=xxxx。

#### 自定义URL菜单 For H5
1. 菜单连接： http://ccbpm.cn/MyUrl.htm   
1. H5链接： /WF/Comm/Search.htm?EnsName=TS.ZS.Projcets 查询
1. H5链接： /WF/Comm/Group.htm?EnsName=TS.ZS.Projcets  分析
1. H5链接： /WF/MyFlow.htm?FK_Flow=001 发起指定的流程. 

#### 自定义URL菜单 For Vue3.x
- <strong>vue3菜单支持<span style="color:red">两种</span>配置</strong>
- <span style="color:red">配置后需要刷新页面</span>
- <strong>方式1：配置打开的vue文件和参数</strong>

  - 此方式本质就是构建vue的路由， 需要填写指向文件和链接
  - 指向文件是系统存在的vue文件， 表示下方链接实际由这个文件来处理
    - /src/WF/Comm/Search.vue
  - URL表示： 通过哪个路径访问上述的vue文件，可自定义，
    - 例如：需要通过上面的Search.vue 实现一个系统字典管理的链接 
    - 需要自定义个路径 /DictManage + 参数EnName=TS.FrmUI.SysEnumMain
    - 完整路径为 /DictManage?EnName=TS.FrmUI.SysEnumMain
    
- <strong>方式2： 配置url链接</strong>
  - <span style="color:red">如果配置url，指向文件填写一个空格即可</span>
  - url链接可以配置外链，以http:// 或者 https:// 开头
    外链可以为任意互联网地址，例如ccflow官网: http://ccflow.org
  - url链接也可以配置系统内部的链接，以self://开头
    系统内部链接可以配置系统工作地址，例如打开编号001的流程: self://WF/MyFlow?FK_Flow=001 

- 常用vue文件地址如下：
  - /src/WF/Comm/Search.vue 查询
  - /src/WF/Comm/Group.vue  分组

- 常用的url如下：
  - self://WF/MyFlow?FK_Flow=xxx 发起id为xxx的流程
        
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/SelfUrl.png "屏幕截图.png")
`;

  public readonly DocAloneflow = `
####  创建独立运行的流程 
  - 创建流程后，系统自动对该流程的相关操作创建到菜单上去。 
  - 比如：发起流程、流程查询、分析。 
`;

  public readonly DocRptwhite = `
####  信息窗/大屏(白色风格) 
  - 信息窗支持数据的图形展示，例如折线图、柱状图、饼图。
  - 支持变量文本输出，支持自定义HTLM代码的输出。
  - 是多种形式的统计分析展示功能。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Windows.png "屏幕截图.png")
`;

  public readonly DocRptblue = `
#### 信息窗/大屏(蓝色风格) 
  - 支持拖拽形式组装大屏窗口。
  - 大屏组件丰富：各种图表、信息、列表、小组件、图标、图片等。
  - 数据支持静态文件上传及接口动态获取的形式。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/blueRPT.jpg "屏幕截图.png")
`;

  public readonly DocTab = `
 #### Tabs页面容器 
  -  定义：每个tab下面都有一个自定义的url。
`;

  public readonly DocRpt3d = `
#### 三维报表 
 - 定义：三维报表是需要指定三个数据源，通过三维关系显示数据。
#### 事例
 - 数据源：SELECT FK_Flow,RunModel,FWCSta,count(*) AS Num FROM wf_node GROUP BY FK_Flow,RunModel,FWCSta
 - 维度1：SELECT No,Name FROM WF_Flow;
 - 维度2：SELECT IntKey AS No, Lab as Name FROM sys_enum WHERE EnumKey='RunModel';
 - 维度3：SELECT IntKey AS No, Lab as Name FROM sys_enum WHERE EnumKey='FWCSta';
 
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Rpt3D.png "屏幕截图.png")
`;

  public readonly DocRpt2d = `
#### 二维报表 
 - 定义：二维报表是需要指定两个数据源，通过二维关系显示数据。
`;

  public readonly DocEntityNoName = `
#### 帮助 
 - 实体是管理对象，比如固定资产、合同、人力学生、项目等.
 - 实体的基础管理就是对它的增、删、改、查. 
 - 对实体的管理包括实体的流程管理、相关功能管理、方法管理三部分.
 - 实体不能绑定到流程节点上，单据与独立表单可以.
 - 通过对外提供url模式的api接口，绑定到菜单里，实体与流程的关系请参考: http://doc.ccbpm.cn
 #### 数据库字段
 - 实体数据存储在数据表里，数据表的字段分为系统字段+业务字段.
 - 比如：编号、名称、创建人、创建日期、创建人部门、创建人组织就是系统字段，实体电话、邮件、地址就是业务字段.
 - No,varchar,主键,实体编号(编号的生成规则可以自定义默认为001,002)
 - Name,varchar,实体名称
 - EntityState,int,枚举类型 -1=删除,0初始化,1=草稿,2=编辑,3=归档
 - RecNo,varchar记录人编号
 - RecName,varchar,记录人名称
 - DeptNo,varchar,记录人部门编号
 - OrgNo,varchar,记录人组织
 #### 示例-车辆管理
 - 实体列表:
 ![实体](./resource/WF/Admin/FrmLogic/EntityType5.png "屏幕截图.png")  
 - 单个记录:
 ![实体](./resource/WF/Admin/FrmLogic/EntityType5_1.png "屏幕截图.png")  
`;

  public readonly DocBill = `
#### 帮助
 - 定义: 单据具有流水性质的数据，比如：报销单、请假单、出差申请单.
 - 单据与流程: 单据可以被流程节点绑定，也可从实体上发起.
 - 基本字段: 制单人Starter、制单日期RDT、单号BillNo、标题Title、状态BillState.
 - 单据编号: 可以自动定义，存储在BillNo字段中.
 - 单据标题: 可以自定义规则.
 - 单据状态: BillState 0=草稿,1=编辑中,2=退回,3=归档.
 - 单据主键: OID 是个自动生成的字段.
 - 发起人: Starter, StarterName.
 - 冗余字段: PWorkID, PFrmID父表单.
 #### 操作界面
 1. 创建一个单据数据存储到 Frm_GenerBill 一份.
 2. 待办：单据管理
 3. 我的单据: 我发起的单据，等待我审批的单据，已经创建的单据.
 4. 发起单据: 我能创建的单据列表.
 5. 单据草稿: 启动的草稿.
 6. 近期单据: 近期发起的单据.
`;

  public readonly DBList = `
#### 数据源实体 
 -  定义：数据源实体就是视图，不能对数据执行：增加、删除、修改操作。
 -  具备实体的其他的功能，可以当作查询所用。
 `;
  public readonly DictCopy = `
#### 复制实体
- 定义：自动启动工作流程，一个流程的开始节点的填写与发起是在特定规则的设置下自动发起的流程。
- 解释：通常模式下的流程启动是手工的启动，就是用户从一个发起列表，点击流程名字，就启动了该流程。但是有的时候，是系统自动发起该流程。
- 应用场景：
  周例会流程，用户希望每个周都要启动例会通知流程，这个启动是让系统自动发起而非人工发起。
`;
  public readonly Bill = this.DictCopy;
  public readonly DictRef = ``;
  public readonly DictTable = `

#### 字典表 
 -  定义：只具有编号,名称两个属性的字典实体，比如：角色类型、系统类别、税种、税目、省份、片区
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/DictTable.png "屏幕截图.png")
`;

  public readonly DictTableTree = `
#### 树结构字典表 
 - 定义：只具有编号,名称,父节点，三个属性的字典实体，比如：部门
`;
  public readonly Task = `
#### 任务 
 - 定义：记录任务参与人，任务时间，紧急程度等事件的记事本。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Task.png "屏幕截图.png")
`;
  public readonly Info = `
#### 信息发布 
 -  定义：可以编辑发布信息，信息以列表的形式展示在页面上。 
 -  也可以定义信息发布类形，比如：会议记要，工作进度，文件传达等.
#### 信息列表图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Info2.png "屏幕截图.png") 
#### 信息编辑
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Info.png "屏幕截图.png") 
#### 信息类型
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Info3.png "屏幕截图.png") 
`;

  public readonly Calendar = ` 
- 定义：可以在日历上显示工作提醒如待办、在途等。 
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Calendar.png "屏幕截图.png")
`;

  public readonly Notepad = `
#### 记事本 
- 定义：是一款在线记事本，可以记录生活、工作、事件。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Notepad.png "屏幕截图.png") 
`;

  public readonly KnowledgeManagement = `
#### 知识库 
- 定义：各种知识的集合，方便了解和查询。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/KnowledgeManagement.png "屏幕截图.png") 
`;
  public readonly DBSrcSearch = `
#### 帮助
- 把数据源查询作为视图的数据。
`;

  public readonly WorkRec = `
#### 工作日志 
- 定义：记录工作的日志。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/WorkRec.png "屏幕截图.png") 
  `;
}
