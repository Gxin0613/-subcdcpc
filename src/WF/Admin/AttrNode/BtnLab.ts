import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from '/@/WF/TSClass/Node';
import { GloComm } from '../../Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
//属性列表
export class BtnAttr extends EntityNoNameAttr {
  /// Name
  public static override readonly Name = 'Name';

  public static readonly RollbackLab = 'RollbackLab';
  public static readonly RollbackEnable = 'RollbackEnable';

  /// 节点ID
  public static readonly NodeID = 'NodeID';

  /// 发送标签
  public static readonly SendLab = 'SendLab';

  /// 子线程按钮是否启用
  public static readonly ThreadEnable = 'ThreadEnable';

  /// 是否可以删除（已经发出去的）子线程.
  public static readonly ThreadIsCanDel = 'ThreadIsCanDel';

  /// 是否可以增加子线程.

  public static readonly ThreadIsCanAdd = 'ThreadIsCanAdd';

  //合流点是否可以增加子线程
  public static readonly ThreadIsCanAddOfHL = 'ThreadIsCanAddOfHL';

  /// 是否可以移交

  public static readonly ThreadIsCanShift = 'ThreadIsCanShift';

  /// 子线程标签

  public static readonly ThreadLab = 'ThreadLab';

  /// 子流程标签

  public static readonly SubFlowLab = 'SubFlowLab';

  /// 子流程删除规则.

  public static readonly SubFlowCtrlRole = 'SubFlowCtrlRole';

  /// 可否启用

  public static readonly SubFlowEnable = 'SubFlowEnable';

  /// 保存是否启用

  public static readonly SaveEnable = 'SaveEnable';

  /// 跳转规则

  public static readonly JumpWayLab = 'JumpWayLab';

  /// 保存标签

  public static readonly SaveLab = 'SaveLab';

  /// 退回是否启用

  public static readonly ReturnRole = 'ReturnRole';

  /// 退回标签

  public static readonly ReturnLab = 'ReturnLab';

  /// 退回的信息填写字段

  public static readonly ReturnField = 'ReturnField';

  /// 打印单据标签

  public static readonly PrintDocLab = 'PrintDocLab';

  /// 打印单据是否启用

  public static readonly PrintDocEnable = 'PrintDocEnable';
  public static readonly PrintDocMyView = 'PrintDocMyView';
  public static readonly PrintDocMyCC = 'PrintDocMyCC';

  /// 移交是否启用

  public static readonly ShiftEnable = 'ShiftEnable';

  /// 移交标签

  public static readonly ShiftLab = 'ShiftLab';

  /// 作废是否启用
  public static readonly CanCelEnable = 'CanCelEnable';

  /// 作废标签
  public static readonly CanCelLab = 'CanCelLab';
  /// 查询标签

  public static readonly SearchLab = 'SearchLab';

  /// 查询是否可用

  public static readonly SearchEnable = 'SearchEnable';

  /// 轨迹

  public static readonly TrackLab = 'TrackLab';

  /// 轨迹是否启用

  public static readonly TrackEnable = 'TrackEnable';

  /// 抄送

  public static readonly CCLab = 'CCLab';

  /// 抄送规则

  public static readonly CCRole = 'CCRole';

  /// 二维码

  public static readonly QRCodeLab = 'QRCodeLab';

  /// 二维码规则

  public static readonly QRCodeRole = 'QRCodeRole';

  /// 删除

  public static readonly DelLab = 'DelLab';

  /// 删除是否启用

  public static readonly DelEnable = 'DelEnable';

  /// 结束流程

  public static readonly EndFlowLab = 'EndFlowLab';

  /// 结束流程

  public static readonly EndFlowEnable = 'EndFlowEnable';

  /// 发送按钮

  public static readonly SendJS = 'SendJS';

  /// 挂起

  public static readonly HungLab = 'HungLab';

  /// 是否启用挂起

  public static readonly HungEnable = 'HungEnable';

  /// 查看父流程

  public static readonly ShowParentFormLab = 'ShowParentFormLab';

  /// 是否启用查看父流程

  public static readonly ShowParentFormEnable = 'ShowParentFormEnable';

  /// 数据批阅标签

  public static readonly FrmDBRemarkLab = 'FrmDBRemarkLab';

  /// 数据批阅

  public static readonly FrmDBRemarkEnable = 'FrmDBRemarkEnable';

  /// 审核

  public static readonly WorkCheckLab = 'WorkCheckLab';

  /// 审核是否可用

  public static readonly WorkCheckEnable = 'WorkCheckEnable';

  /// 批处理

  public static readonly BatchLab = 'BatchLab';

  /// 批处理是否可用

  public static readonly BatchEnable = 'BatchEnable';

  /// 加签

  public static readonly AskforLab = 'AskforLab';

  /// 加签标签

  public static readonly AskforEnable = 'AskforEnable';

  /// 会签标签

  public static readonly HuiQianLab = 'HuiQianLab';

  /// 会签规则

  public static readonly HuiQianRole = 'HuiQianRole';

  /// 协作模式被加签的人处理规则

  // public static readonly IsCanAddHuiQianer = "IsCanAddHuiQianer";

  /// 会签组长模式

  public static readonly HuiQianLeaderRole = 'HuiQianLeaderRole';

  /// 加组长标签

  public static readonly AddLeaderLab = 'AddLeaderLab';

  /// 是否启用

  public static readonly AddLeaderEnable = 'AddLeaderEnable';

  /// 流转自定义 TransferCustomLab

  public static readonly TCLab = 'TCLab';

  /// 是否启用-流转自定义

  public static readonly TCEnable = 'TCEnable';

  /// 公文

  public static readonly WebOfficeLab = 'WebOffice';

  /// 公文标签

  public static readonly WebOfficeEnable = 'WebOfficeEnable';

  /// 节点时限规则

  public static readonly CHRole = 'CHRole';

  /// 节点时限lab

  public static readonly CHLab = 'CHLab';

  /// 重要性

  public static readonly PRILab = 'PRILab';

  /// 是否启用-重要性

  public static readonly PRIEnable = 'PRIEnable';

  /// 关注

  public static readonly FocusLab = 'FocusLab';

  /// 是否启用-关注

  public static readonly FocusEnable = 'FocusEnable';

  /// 确认

  public static readonly ConfirmLab = 'ConfirmLab';

  /// 是否启用确认

  public static readonly ConfirmEnable = 'ConfirmEnable';

  /// 打印html

  public static readonly PrintHtmlLab = 'PrintHtmlLab';

  /// 打印html

  public static readonly PrintHtmlEnable = 'PrintHtmlEnable';

  /// 显示在抄送?

  public static readonly PrintHtmlMyView = 'PrintHtmlMyView';

  /// 显示在查看器?

  public static readonly PrintHtmlMyCC = 'PrintHtmlMyCC';

  /// 打印pdf

  public static readonly PrintPDFLab = 'PrintPDFLab';

  /// 打印pdf

  public static readonly PrintPDFEnable = 'PrintPDFEnable';
  public static readonly PrintPDFMyView = 'PrintPDFMyView';
  public static readonly PrintPDFMyCC = 'PrintPDFMyCC';

  /// 打印pdf规则

  public static readonly PrintPDFModle = 'PrintPDFModle';

  /// 水印设置规则

  public static readonly ShuiYinModle = 'ShuiYinModle';

  /// 打包下载

  public static readonly PrintZipLab = 'PrintZipLab';

  /// 是否启用打包下载

  public static readonly PrintZipEnable = 'PrintZipEnable';
  public static readonly PrintZipMyView = 'PrintZipMyView';
  public static readonly PrintZipMyCC = 'PrintZipMyCC';

  /// 分配

  public static readonly AllotLab = 'AllotLab';

  /// 分配启用

  public static readonly AllotEnable = 'AllotEnable';

  /// 选择接受人

  public static readonly SelectAccepterLab = 'SelectAccepterLab';

  /// 是否启用选择接受人

  public static readonly SelectAccepterEnable = 'SelectAccepterEnable';

  /// 备注

  public static readonly NoteLab = 'NoteLab';

  //备注是否可用

  public static readonly NoteEnable = 'NoteEnable';

  /// 帮助按钮

  public static readonly HelpLab = 'HelpLab';

  /// 提示方式.

  public static readonly HelpRole = 'HelpRole';

  /// 下一条

  public static readonly NextLab = 'NextLab';

  /// 获得规则

  public static readonly NextRole = 'NextRole';

  /// 公文标签

  public static readonly OfficeBtnLab = 'OfficeBtnLab';

  /// 公文标签接受人

  public static readonly OfficeBtnEnable = 'OfficeBtnEnable';

  /// 文件类型.

  public static readonly OfficeFileType = 'OfficeFileType';

  /// 显示位置

  public static readonly OfficeBtnLocal = 'OfficeBtnLocal';
  public static readonly DocLeftWord = 'DocLeftWord';
  public static readonly DocRightWord = 'DocRightWord';

  /// 工作方式

  public static readonly WebOfficeFrmModel = 'WebOfficeFrmModel';

  /// 列表

  public static readonly ListLab = 'ListLab';

  /// 是否启用-列表

  public static readonly ListEnable = 'ListEnable';

  /// 数据版本的控制

  public static readonly FrmDBVerLab = 'FrmDBVerLab';
  public static readonly FrmDBVerEnable = 'FrmDBVerEnable';
  public static readonly FrmDBVerMyView = 'FrmDBVerMyView';
  public static readonly FrmDBVerMyCC = 'FrmDBVerMyCC';

  /// 小纸条

  public static readonly ScripLab = 'ScripLab';
  public static readonly ScripRole = 'ScripRole';

  /// 评论

  public static readonly FlowBBSLab = 'FlowBBSLab';
  public static readonly FlowBBSRole = 'FlowBBSRole';

  /// 即时通讯

  public static readonly IMLab = 'IMLab';
  public static readonly IMEnable = 'IMEnable';

  /// 是否启用催办
  public static readonly PressLab = 'PressLab';
  public static readonly PressEnable = 'PressEnable';
}

export class BtnLab extends EntityNodeID {
  constructor(nodeID?: number) {
    // super("bp.demo.BtnLab","TS.Demo.BPFramework.BtnLab");
    super('TS.AttrNode.BtnLab');
    if (!!nodeID) this.NodeID = nodeID;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '按钮权限');

    map.AddGroupAttr('按钮权限');
    map.AddTBIntPK(NodeAttr.NodeID, 0, '节点ID');
    map.AddTBString(BtnAttr.Name, '', '节点名称', true, true, 0, 200, 10);

    // #region  功能按钮状态
    map.AddTBString('AiLab', 'AI辅助审核', 'AI辅助审核', true, false, 0, 50, 10);
    map.AddBoolean('AiAssistant', false, '是否启用', true, true);

    // map.AddDDLSysEnum('AiSta', 0, '启用规则', true, true, 'AiType', '@0=不启用@1=启用');

    map.AddTBString(BtnAttr.SendLab, '发送', '发送标签', true, false, 0, 50, 10, true);
    map.SetHelperUrl(BtnAttr.SendLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3577079&doc_id=31094');
    map.AddTBString(BtnAttr.SendJS, '', '按钮JS函数', false, false, 0, 999, 10);
    //map.SetHelperBaidu(BtnAttr.SendJS, "ccflow 发送前数据完整性判断"); //增加帮助.
    map.SetHelperUrl(BtnAttr.SendJS, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3577079&doc_id=31094');

    map.AddTBString('DelayedSendLab', '延期发送', '延期发送', true, false, 0, 50, 10);
    map.AddBoolean('DelayedSendEnable', false, '是否启用', true, true);
    map.SetHelperUrl('DelayedSendLab', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8413317&doc_id=31094');

    map.AddTBString(BtnAttr.SaveLab, '保存', '保存标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.SaveEnable, true, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.SaveLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3577137&doc_id=31094'); //增加帮助

    map.AddTBString(BtnAttr.QRCodeLab, '二维码', '二维码标签', true, false, 0, 50, 10);
    map.SetHelperUrl(BtnAttr.QRCodeLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=4275245&doc_id=31094'); //增加帮助.

    map.AddDDLSysEnum(BtnAttr.QRCodeRole, 0, '二维码规则', true, true, BtnAttr.QRCodeRole, '@0=无@1=查看流程表单-无需权限@2=查看流程表单-需要登录@3=外部账户协作模式处理工作');

    map.AddTBString(BtnAttr.CCLab, '抄送', '抄送标签', true, false, 0, 50, 10);
    const cfg = '@0=不启用@1=启用手工抄送';
    map.AddDDLSysEnum(NodeAttr.CCRole, 0, '抄送规则', true, true, NodeAttr.CCRole, cfg);

    // add 2014-04-05.
    //  map.AddDDLSysEnum(NodeAttr.CCWriteTo, 0, "抄送写入规则",
    //true, true, NodeAttr.CCWriteTo, "@0=写入抄送列表@1=写入待办@2=写入待办与抄送列表", true);
    //  map.SetHelperUrl(NodeAttr.CCWriteTo, "http://ccbpm.mydoc.io/?v=5404&t=17976"); //增加帮助.

    map.AddTBString(BtnAttr.ShiftLab, '移交', '移交标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.ShiftEnable, false, '是否启用', true, true);

    map.SetHelperUrl(BtnAttr.ShiftLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979829&doc_id=31094');
    //if (SystemConfig.CustomNo == 'TianYu') {
    map.AddTBString(BtnAttr.CanCelLab, '作废', '作废标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.CanCelEnable, false, '是否启用', true, true);
    // }

    map.AddTBString(BtnAttr.DelLab, '删除', '删除标签', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.DelEnable, 0, '删除规则', true, true, BtnAttr.DelEnable);
    map.SetHelperUrl(BtnAttr.DelEnable, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979834&doc_id=31094'); //增加帮助.

    map.AddTBString(BtnAttr.EndFlowLab, '结束流程', '结束流程标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.EndFlowEnable, false, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.EndFlowEnable, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979861&doc_id=31094'); //增加帮助

    map.AddTBString('FixFlow', '冻结', '冻结标签', true, false, 0, 50, 10);
    map.AddBoolean('FixEnable', false, '是否启用', true, true);
    //map.SetHelperUrl('FixEnable', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979861&doc_id=31094'); //增加帮助

    map.AddTBString(BtnAttr.ShowParentFormLab, '查看父流程', '查看父流程标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.ShowParentFormEnable, false, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.ShowParentFormLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979871&doc_id=31094'); //增加帮助

    //map.AddTBString(BtnAttr.OfficeBtnLab, "公文主文件", "公文标签", true, false, 0, 50, 10);
    //map.AddBoolean(BtnAttr.OfficeBtnEnable, false, "是否启用", true, true);
    //map.AddBoolean(BtnAttr.PrintDocEnable, false, "是否启用", true, true);
    //map.AddTBString(BtnAttr.AthLab, "附件", "附件标签", true, false, 0, 50, 10);
    //map.AddDDLSysEnum(NodeAttr.FJOpen, 0, this.ToE("FJOpen", "附件权限"), true, true,
    //NodeAttr.FJOpen, "@0=关闭附件@1=操作员@2=工作ID@3=流程ID");

    map.AddTBString(BtnAttr.TrackLab, '轨迹', '轨迹标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.TrackEnable, true, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.TrackLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3579860&doc_id=31094'); //增加帮助

    //map.SetHelperUrl(BtnAttr.TrackLab, this[SYS_CCFLOW, "轨迹"]); //增加帮助
    //map.SetHelperUrl(BtnAttr.TrackLab, "http://ccbpm.mydoc.io/?v=5404&t=24369");

    map.AddTBString(BtnAttr.HungLab, '挂起', '挂起标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.HungEnable, false, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.HungLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5169441&doc_id=31094'); //增加帮助.

    //      map.AddTBString(BtnAttr.SelectAccepterLab, "接受人", "接受人标签", true, false, 0, 50, 10);
    //      map.AddDDLSysEnum(BtnAttr.SelectAccepterEnable, 0, "工作方式",
    //true, true, BtnAttr.SelectAccepterEnable);
    //      map.SetHelperUrl(BtnAttr.SelectAccepterLab, "http://ccbpm.mydoc.io/?v=5404&t=16256"); //增加帮助

    map.AddTBString(BtnAttr.SearchLab, '查询', '查询标签', true, false, 0, 50, 10, false);
    map.AddBoolean(BtnAttr.SearchEnable, false, '是否启用', true, true);
    //map.SetHelperUrl(BtnAttr.SearchLab, this[SYS_CCFLOW, "查询"]); //增加帮助
    map.SetHelperUrl(BtnAttr.SearchLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979975&doc_id=31094');

    //map.AddTBString(BtnAttr.WorkCheckLab, "审核", "审核标签", true, false, 0, 50, 10);
    //map.AddBoolean(BtnAttr.WorkCheckEnable, false, "是否启用", true, true);

    //map.AddTBString(BtnAttr.BatchLab, "批处理", "批处理标签", true, false, 0, 50, 10);
    //map.AddBoolean(BtnAttr.BatchEnable, false, "是否启用", true, true);
    //map.SetHelperUrl(BtnAttr.BatchLab, "http://ccbpm.mydoc.io/?v=5404&t=17920"); //增加帮助
    //功能暂时取消
    //map.AddTBString(BtnAttr.AskforLab, "加签", "加签标签", true, false, 0, 50, 10);
    //map.AddBoolean(BtnAttr.AskforEnable, false, "是否启用", true, true);
    //map.SetHelperUrl(BtnAttr.AskforLab, "http://ccbpm.mydoc.io/?v=5404&t=16258");

    // add by 周朋 2014-11-21. 让用户可以自己定义流转.
    map.AddTBString(BtnAttr.TCLab, '流转自定义', '流转自定义', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.TCEnable, 0, '启用规则', true, true, BtnAttr.TCEnable, '@0=禁用@1=只读@2=可定义', null, false);
    map.SetHelperUrl(BtnAttr.TCLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3938664&doc_id=31094');

    //  map.AddTBString('FrmBillLab', '单据', '单据', true, false, 0, 50, 10);
    //  map.AddDDLSysEnum('FrmBillEnable', 0, '启用规则', true, true, BtnAttr.TCEnable, '@0=禁用@1=启用', null, false);
    //map.SetHelperUrl(BtnAttr.TCLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3938664&doc_id=31094');

    map.AddTBString(BtnAttr.FrmDBVerLab, '数据版本', '数据版本', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.FrmDBVerEnable, false, '(数据版本)是否启用', true, true);
    map.SetHelperUrl(BtnAttr.FrmDBVerEnable, 'https://docs.qq.com/doc/DRFVORWF3R0ZIV1h5');

    map.AddBoolean(BtnAttr.FrmDBVerMyView, false, '(数据版本)显示在查看器工具栏?', true, true);
    map.AddBoolean(BtnAttr.FrmDBVerMyCC, false, '(数据版本)显示在抄送工具栏?', true, true);

    map.AddTBString(BtnAttr.FrmDBRemarkLab, '数据批阅', '数据批阅', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.FrmDBRemarkEnable, 0, '数据批阅', true, true, BtnAttr.FrmDBRemarkEnable, '@0=禁用@1=可编辑@2=不可编辑', null, false);

    //map.AddTBString(BtnAttr.AskforLab, "执行", "加签标签", true, false, 0, 50, 10);
    //map.AddBoolean(BtnAttr.AskforEnable, false, "是否启用", true, true);
    //map.SetHelperUrl(BtnAttr.AskforLab, this[SYS_CCFLOW, "加签"]); //增加帮助

    // 删除了这个模式,让表单方案进行控制了,保留这两个字段以兼容.
    //  map.AddTBString(BtnAttr.WebOfficeLab, "公文", "文档标签", false, false, 0, 50, 10);
    // map.AddTBInt(BtnAttr.WebOfficeEnable, 0, "文档启用方式", false, false);

    //cut bye zhoupeng.
    //map.AddTBString(BtnAttr.WebOfficeLab, "公文", "文档标签", true, false, 0, 50, 10);
    //map.AddDDLSysEnum(BtnAttr.WebOfficeEnable, 0, "文档启用方式", true, true, BtnAttr.WebOfficeEnable,
    //  "@0=不启用@1=按钮方式@2=标签页置后方式@3=标签页置前方式");//edited by liuxc,2016-01-18,from xc
    //map.SetHelperUrl(BtnAttr.WebOfficeLab, "http://ccbpm.mydoc.io/?v=5404&t=17993");

    // add by 周朋 2015-08-06. 重要性.
    map.AddTBString(BtnAttr.PRILab, '重要性', '重要性', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.PRIEnable, 0, '重要性规则', true, true, BtnAttr.PRIEnable, '@0=不启用@1=只读@2=编辑');
    //map.AddBoolean(BtnAttr.PRIEnable, false, "是否启用", true, true);
    map.SetHelperUrl(BtnAttr.PRILab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979978&doc_id=31094');

    // add by 周朋 2015-08-06. 节点时限.
    map.AddTBString(BtnAttr.CHLab, '节点时限', '节点时限', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.CHRole, 0, '时限规则', true, true, BtnAttr.CHRole, '@0=禁用@1=启用@2=只读@3=启用并可以调整流程应完成时间');
    map.SetHelperUrl(BtnAttr.CHLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979979&doc_id=31094');

    map.AddTBString(BtnAttr.RollbackLab, '回滚', '回滚', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.RollbackEnable, true, '是否启用', true, true);
    map.SetHelperAlert(BtnAttr.RollbackLab, '流程结束后是否在查看器上显示回滚操作?');

    // add 2017.5.4  邀请其他人参与当前的工作.  2024.03.09 去掉用加签替换掉.
    //  map.AddTBString(BtnAttr.AllotLab, '分配', '分配标签', true, false, 0, 50, 10);
    // map.AddBoolean(BtnAttr.AllotEnable, false, '是否启用', true, true);
    // map.SetHelperUrl(BtnAttr.AllotLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979980&doc_id=31094');

    // add by 周朋 2015-12-24. 节点时限.
    map.AddTBString(BtnAttr.FocusLab, '关注', '关注', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.FocusEnable, false, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.FocusLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979981&doc_id=31094');

    // add 2017.5.4 确认就是告诉发送人，我接受这件工作了.
    map.AddTBString(BtnAttr.ConfirmLab, '确认', '确认标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.ConfirmEnable, false, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.ConfirmLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979983&doc_id=31094');

    // add 2019.3.10 增加List.
    map.AddTBString(BtnAttr.ListLab, '列表', '列表标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.ListEnable, true, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.ListLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979983&doc_id=31094');

    // 批量审核
    map.AddTBString(BtnAttr.BatchLab, '批量审核', '批量审核标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.BatchEnable, false, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.BatchLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979986&doc_id=31094');

    //备注 流程不流转，设置备注信息提醒已处理人员当前流程运行情况
    map.AddTBString(BtnAttr.NoteLab, '备注', '备注标签', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.NoteEnable, 0, '启用规则', true, true, BtnAttr.NoteEnable, '@0=禁用@1=启用@2=只读');
    map.SetHelperUrl(BtnAttr.NoteLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979987&doc_id=31094');

    //for 周大福.
    map.AddTBString(BtnAttr.HelpLab, '帮助', '帮助标签', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.HelpRole, 0, '帮助显示规则', true, true, BtnAttr.HelpRole, '@0=禁用@1=启用@2=强制提示@3=选择性提示');
    map.SetHelperUrl(BtnAttr.HelpLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979989&doc_id=31094');

    //新增时间2022-03-14
    map.AddTBString(BtnAttr.ScripLab, '小纸条', '小纸条标签', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.ScripRole, 0, '小纸条显示规则', true, true, BtnAttr.ScripRole, '@0=禁用@1=按钮启用@2=发送启用', null, false);

    map.AddTBString(BtnAttr.FlowBBSLab, '评论', '评论标签', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.FlowBBSRole, 0, '评论规则', true, true, BtnAttr.FlowBBSRole, '@0=禁用@1=启用@2=只读');
    //即时通讯 现在获取不到飞鸽的相关的API,不能增加该功能，暂时注释去掉
    //map.AddTBString(BtnAttr.IMLab, '即时通讯', '即时通讯标签', true, false, 0, 50, 10);
    //map.AddDDLSysEnum(BtnAttr.IMEnable, 0, '即时通讯规则', true, true, BtnAttr.IMEnable, '@0=禁用@1=启用');

    map.AddTBString(BtnAttr.NextLab, '下一条', '下一条', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.NextRole, 0, '获得规则', true, true, BtnAttr.NextRole, '@0=禁用@1=相同节点@2=相同流程@3=相同的人@4=不限流程', null);
    map.SetHelperUrl(BtnAttr.NextLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979990&doc_id=31094');

    // 合流节点的: 不常用的功能移动到这里.
    map.AddTBString(BtnAttr.ThreadLab, '子线程', '子线程标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.ThreadEnable, false, '是否启用', true, true);
    map.SetHelperUrl(BtnAttr.ThreadLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3577139&doc_id=31094'); //增加帮助

    map.AddDDLSysEnum(NodeAttr.ThreadKillRole, 0, '子线程删除方式', true, true, NodeAttr.ThreadKillRole, '@0=不能删除@1=手工删除@2=自动删除', null);
    map.SetHelperUrl(BtnAttr.ThreadLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3579441&doc_id=31094'); //增加帮助

    //跳转.
    map.AddTBString(BtnAttr.JumpWayLab, '跳转', '跳转标签', true, false, 0, 50, 10);
    map.SetHelperUrl(BtnAttr.JumpWayLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3980001&doc_id=31094'); //增加帮助.

    map.AddDDLSysEnum(NodeAttr.JumpWay, 0, '跳转规则', true, true, NodeAttr.JumpWay);
    map.AddTBString(NodeAttr.JumpToNodes, null, '可跳转的节点', true, false, 0, 200, 10, true);

    // 催办
    map.AddTBString(BtnAttr.PressLab, '催办', '催办', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.PressEnable, true, '是否启用', true, true);
    map.SetHelperAlert(BtnAttr.PressLab, '是否在在途的流程查看器上显示催办按钮？');

    map.AddTBString('ChangeDeptLab', '切换部门', '切换部门标签', true, false, 0, 50, 10);
    map.AddBoolean('ChangeDeptEnable', false, '是否启用切换组织/部门', true, true);

    map.AddTBString('SubmitSF', '提交身份', '提交身份按钮', true, false, 0, 50, 10);
    map.AddDDLSysEnum('SubmitSFEnable', 0, '提交身份', true, true, BtnAttr.FlowBBSRole, '@0=禁用@1=部门身份@2=部门与角色身份');

    map.AddTBString('TZWorkerLab', '调整未来处理人', '调整未来处理人', true, false, 0, 50, 10);
    map.AddBoolean('TZWorkerEnable', false, '是否启用', true, true);

    map.AddDDLSysEnum('TZWorkerRole', 0, '调整规则', true, true, BtnAttr.NextRole, '@0=不允许调整@1=可移除计算的处理人@2=不可移除计算的处理人', null, true);
    map.SetHelperUrl('TZWorkerRole', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8412091&doc_id=31094');

    map.AddTBString('PreplaceWokerLab', '预置处理人', '预置处理人', true, false, 0, 20, 10);
    map.AddDDLSysEnum('PreplaceWokerEnable', 2, '规则', true, true, 'PreplaceWokerEnable', '@0=不启用@1=单独启用@2=发送前打开@3=发送于单独启用', null);

    //map.AddBoolean('SubmitSFEnable', false, '是否启用提交身份?', true, true);
    //  scrip
    // #endregion  功能按钮状态
    map.AddGroupAttr('退回');
    //#region 退回处理.
    map.AddTBString(BtnAttr.ReturnLab, '退回', '退回标签', true, false, 0, 50, 10);

    const returnRole = '@0=不能退回@1=只能退回上一个节点@2=可以退回任意节点@3=退回指定的节点@4=只能退回开始节点';
    map.AddDDLSysEnum(NodeAttr.ReturnRole, 0, '退回规则', true, true, NodeAttr.ReturnRole, returnRole);
    map.AddTBString(NodeAttr.ReturnNodes, null, '可退回到的节点', true, false, 0, 200, 50, true);

    map.SetHelperUrl(NodeAttr.ReturnRole, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3579467&doc_id=31094'); //增加帮助.
    map.AddTBString(NodeAttr.ReturnAlert, null, '被退回后信息提示', true, false, 0, 999, 10, true);

    //  map.AddBoolean(NodeAttr.IsBackTracking, false, "是否可以原路返回(启用退回功能才有效)", true, true, false);

    map.AddDDLSysEnum(NodeAttr.IsBackTracking, 0, '是否可以原路返回', true, true, NodeAttr.IsBackTracking, '@0=不允许原路返回@1=由退回人决定@2=强制原路返回');

    map.SetHelperUrl(NodeAttr.IsBackTracking, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3579850&doc_id=31094'); //增加帮助.
    map.AddBoolean(NodeAttr.IsBackResetAccepter, false, '原路返回后是否自动计算接收人.', true, true, false);
    map.SetHelperAlert(NodeAttr.IsBackResetAccepter, '退回到此节点后，是否重新计算接受人，还是直接发送给退回人。');

    map.AddDDLSysEnum(
      NodeAttr.IsKillEtcThread,
      0,
      '子线程退回删除规则',
      true,
      true,
      NodeAttr.IsKillEtcThread,
      '@0=不删除其它的子线程@1=删除其它的子线程@2=由子线程退回人决定是否删除',
    );
    map.SetHelperAlert(NodeAttr.IsKillEtcThread, '子线程退回到分流节点时，是否允许将其他子线程也退回到分流节点。');

    map.AddBoolean(NodeAttr.ReturnCHEnable, false, '是否启用退回考核规则', true, true);
    map.SetHelperUrl(NodeAttr.ReturnCHEnable, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3980009&doc_id=31094'); //增加帮助.
    map.AddBoolean(NodeAttr.IsUploadAth, false, '退回时是否需要上传附件.', true, true);
    map.AddLink('ReturnFile','退回附件属性',GloComm.UrlEn('TS.FrmUI.FrmAttachmentExt','{NodeID}_AthReturn'),false,GPNReturnType.OpenUrlByModal,'启用附件点保存后再设置属性');
    map.AddDDLSysEnum(
      NodeAttr.ReturnOneNodeRole,
      0,
      '单节点退回规则',
      true,
      true,
      NodeAttr.ReturnOneNodeRole,
      '@0=不启用@1=按照[退回信息填写字段]作为退回意见直接退回@2=按照[审核组件]填写的信息作为退回意见直接退回',
      null,
      false,
    );
    //map.AddTBString(NodeAttr.RetunFieldsLable, "退回扩展字段", "退回扩展字段", true, false, 0, 50, 20);
    map.AddTBString(BtnAttr.ReturnField, '', '退回信息填写字段', true, false, 0, 50, 10);
    map.SetHelperUrl(BtnAttr.ReturnField, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3579852&doc_id=31094'); //增加帮助.

    map.AddDDLSysEnum('TeamReturnRole', 0, '退回到协作节点规则', true, true, 'TeamReturnRole', '@0=删除其他人员痕迹@1=不删除其他人员痕迹');
    // map.SetHelperAlert(NodeAttr.IsKillEtcThread, '子线程退回到分流节点时，是否允许将其他子线程也退回到分流节点。');

    map.AddTBString('TeamReturner', '', '协作退回人', true, false, 0, 200, 10);
    const help2 = `
    #### 帮助.
    1. 在协作模式下部分人员可以退回。
    2. 比如：当前节点有n个人处理，但是这n个人中只有遇到zhangsan、lisi作为接收人时可以执行退回操作，其他人不能。
    3. 配置格式：人员ID1,人员ID2, 比如：zhangsan,lisi,
    `;
    map.SetHelperUrl('TeamReturner', help2); //增加帮助.

    map.AddTBString(NodeAttr.ReturnReasonsItems, null, '退回原因', true, false, 0, 999, 10, true);
    //#endregion 退回处理.

    //#region 打印.
    map.AddGroupAttr('打印');

    // add 2017.9.1 for 天业集团.
    map.AddTBString(BtnAttr.PrintHtmlLab, '打印Html', '打印Html标签', true, false, 0, 50, 10);
    map.AddBoolean(BtnAttr.PrintHtmlEnable, false, '(打印Html)是否启用', true, true);
    map.SetHelperUrl(BtnAttr.PrintHtmlLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979893&doc_id=31094'); //增加帮助
    // add 2020.5.25 for 交投集团.
    map.AddBoolean(BtnAttr.PrintHtmlMyView, false, '(打印Html)显示在查看器工具栏?', true, true);
    map.AddBoolean(BtnAttr.PrintHtmlMyCC, false, '(打印Html)显示在抄送工具栏?', true, true);

    // add 2017.9.1 for 天业集团.
    map.AddTBString(BtnAttr.PrintPDFLab, '打印pdf', '打印pdf标签', true, false, 0, 50, 10, false);
    // map.AddBoolean(BtnAttr.PrintPDFEnable, false, '(打印pdf)是否启用', true, true);
    map.AddDDLSysEnum('PrintPDFEnable', 0, '打印方式', true, true, 'PrintPDFEnable', '@0=不启用@1=启用(不限次数)@2=启用(仅打印1次)解析中');
    map.SetHelperUrl(BtnAttr.PrintPDFLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979894&doc_id=31094'); //增加帮助

    // add 2020.5.25 for 交投集团.
    map.AddBoolean(BtnAttr.PrintPDFMyView, false, '(打印pdf)显示在查看器工具栏?', true, true, false);
    map.AddBoolean(BtnAttr.PrintPDFMyCC, false, '(打印pdf)显示在抄送工具栏?', true, true, false);
    map.AddBoolean('PrintPDFAndBBSEnable', false, '(打印pdf)是否打印评论', true, true);

    map.AddDDLSysEnum(BtnAttr.PrintPDFModle, 0, 'PDF打印规则', true, true, BtnAttr.PrintPDFModle, '@0=全部打印@1=单个表单打印(针对树形表单)', null, false);
    map.AddTBString(BtnAttr.ShuiYinModle, null, 'PDF水印内容', true, false, 20, 100, 100);
    map.SetHelperUrl(BtnAttr.ShuiYinModle, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=4055911&doc_id=31094'); //增加帮助

    map.AddTBString(BtnAttr.PrintZipLab, '打包下载', '打包下载zip标签', true, false, 0, 50, 10, false);
    map.AddBoolean(BtnAttr.PrintZipEnable, false, '(打包下载zip)是否启用', true, true);
    map.SetHelperUrl(BtnAttr.PrintZipLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979897&doc_id=31094'); //增加帮助

    // add 2020.5.25 for 交投集团.
    map.AddBoolean(BtnAttr.PrintZipMyView, false, '(打包下载zip)显示在查看器工具栏?', true, true);
    map.AddBoolean(BtnAttr.PrintZipMyCC, false, '(打包下载zip)显示在抄送工具栏?', true, true);

    map.AddTBString(BtnAttr.PrintDocLab, '打印', '自定义打印标签', true, false, 0, 50, 10);
    map.SetHelperAlert(BtnAttr.PrintDocLab, '请在节点表单里面配置要打印的模板，设置表单=》表单属性=》打印模板。'); //增加帮助
    map.AddBoolean(BtnAttr.PrintDocEnable, false, '是否启用', true, true);
    //map.SetHelperUrl(BtnAttr.PrintDocEnable, "http://ccbpm.mydoc.io/?v=5404&t=17979"); //增加帮助
    //map.SetHelperUrl(BtnAttr.BatchLab, "https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3979986&doc_id=31094");
    //#endregion

    map.AddGroupAttr('公文');
    // #region 公文相关.
    map.AddTBString(BtnAttr.OfficeBtnLab, '打开公文', '公文标签', true, false, 0, 50, 10, false);
    map.SetHelperUrl(BtnAttr.OfficeBtnLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=10668915&doc_id=31094'); //增加帮助
    map.AddDDLSysEnum(BtnAttr.OfficeBtnEnable, 0, '文件状态', true, true, BtnAttr.OfficeBtnEnable, '@0=不可用@1=可编辑@2=只读');
    map.SetHelperUrl(BtnAttr.OfficeBtnEnable, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=10670218&doc_id=31094'); //增加帮助
    //map.AddDDLSysEnum(BtnAttr.OfficeFileType, 0, '文件类型', true, true, BtnAttr.OfficeFileType, '@0=office文件@1=WPS文件@2=混合模式@3=OnlyOffice在线文件');
    //map.SetHelperUrl(BtnAttr.OfficeFileType, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=10670324&doc_id=31094'); //增加帮助
    map.AddDDLSysEnum(BtnAttr.OfficeBtnLocal, 0, '按钮位置', true, true, BtnAttr.OfficeBtnLocal, '@0=工具栏上@1=在表单中显示', '', true);
    map.AddTBString('OfficeTrackLab', '公文版本', '公文版本', true, false, 0, 50, 10);
    map.SetHelperAlert('OfficeTrackLab', '查看公文的历史版本(每个节点在发送成功后会将当前公文版本进行备份).');
    map.AddBoolean('OfficeTrackEnalbe', false, '是否启用', true, true);

    map.AddTBString('DownVSTOLab', '下载VSTO插件', '下载VSTO插件', true, false, 0, 50, 10);
    map.SetHelperAlert('DownVSTOLab', '一套在windows环境下用于处理office中word和excel文件的执行程序');
    map.AddBoolean('DownVSTOEnable', false, '是否启用', true, true);

    map.AddTBString('KKViewLab', 'KK在线预览', 'KK在线预览', true, false, 0, 50, 10);
    map.SetHelperAlert('KKViewLab', '使用KKFile在线预览工具在线查看公文文件');
    map.AddBoolean('KKViewEnable', false, '是否启用', true, true);

    map.AddTBString('DownGovLab', '下载公文正文(word)', '下载公文正文(word)', true, false, 0, 50, 10);
    map.SetHelperAlert('DownGovLab', '将当前流程实例最新公文文件进行下载查看');
    map.AddBoolean('DownGovEnable', false, '是否启用', true, true);

    //map.AddTBString('DownGovPDFLab', '下载公文正文(pdf)', '下载公文正文(pdf)', true, false, 0, 50, 10);
    //map.SetHelperAlert('DownGovPDFLab', '将当前流程实例最新公文文件进行下载查看');
    //map.AddBoolean('DownGovPDFEnable', false, '是否启用', true, true);

    //#region 会签按钮.
    //map.AddMapLoader(function (this) {
    //  const nodeId = this.GetValByKey('NodeID');
    // if (nodeId.toString().endsWith('01')) {
    //   return;
    // }
    map.AddGroupAttr('会加签');
    map.AddTBString(BtnAttr.HuiQianLab, '会签', '标签', true, false, 0, 50, 10);
    map.AddDDLSysEnum(BtnAttr.HuiQianRole, 0, '邀请模式', true, true, BtnAttr.HuiQianRole, '@0=不启用@1=后加签:协作(同事)模式@4=前加签:主持人(组长)模式');
    map.SetHelperUrl(BtnAttr.HuiQianLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8369495&doc_id=31094');
    //map.AddDDLSysEnum(BtnAttr.IsCanAddHuiQianer, 0, "协作模式被加签的人处理规则", true, true, BtnAttr.IsCanAddHuiQianer,
    //   "0=不允许增加其他协作人@1=允许增加协作人", false);
    map.AddTBString(BtnAttr.AddLeaderLab, '加主持人', '加主持人', true, false, 0, 50, 10);
    map.SetHelperUrl(BtnAttr.HuiQianLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5462947&doc_id=31094');

    map.AddBoolean(BtnAttr.AddLeaderEnable, false, '是否启用', true, true);
    map.AddDDLSysEnum(BtnAttr.HuiQianLeaderRole, 0, '主持会签规则', true, true, BtnAttr.HuiQianLeaderRole, '@0=只有一个主持@1=最后一个主持人发送@2=任意主持人可以发送');
    map.SetHelperUrl(BtnAttr.HuiQianLab, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5794199&doc_id=31094');
    //});
    // #endregion

    this._enMap = map;
    return this._enMap;
  }
}

//班级s
export class BtnLabs extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new BtnLab();
  }
  constructor() {
    super();
  }
}
