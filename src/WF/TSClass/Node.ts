import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';

export class NodeAttr {
  // 节点ID.
  public static readonly NodeID = 'NodeID';
  // 名称.
  public static readonly Name = 'Name';
  public static readonly ThreadKillRole = 'ThreadKillRole';
  //节点类型NodeType
  public static readonly NodeType = 'NodeType';

  /// 节点的流程
  public static readonly FK_Flow = 'FK_Flow';
  public static readonly ReturnRole = 'ReturnRole';
  public static readonly ReturnNodes = 'ReturnNodes';
  public static readonly ReturnAlert = 'ReturnAlert';
  public static readonly IsBackTracking = 'IsBackTracking';
  public static readonly IsBackResetAccepter = 'IsBackResetAccepter';
  public static readonly IsKillEtcThread = 'IsKillEtcThread';
  public static readonly ReturnCHEnable = 'ReturnCHEnable';
  public static readonly ReturnOneNodeRole = 'ReturnOneNodeRole';
  public static readonly ReturnReasonsItems = 'ReturnReasonsItems';
  public static readonly FWCSta = 'FWCSta';
  //表单类型.
  public static readonly FormType = 'FormType';
  public static readonly FormUrl = 'FormUrl';
  public static readonly FormUrlMobile = 'FormUrlMobile';
  /// 操作提示
  public static readonly Tip = 'Tip';

  /// FK_FlowSort
  public static readonly FK_FlowSort = 'FK_FlowSort';

  /// FK_FlowSortT
  public static readonly FK_FlowSortT = 'FK_FlowSortT';

  /// 流程名
  public static readonly FlowName = 'FlowName';

  /// 是否分配工作
  public static readonly IsTask = 'IsTask';

  /// 节点工作类型
  public static readonly NodeWorkType = 'NodeWorkType';
  public static readonly SubThreadType = 'SubThreadType';
  public static readonly USSWorkIDRole = 'USSWorkIDRole';
  public static readonly PassRate = 'PassRate';
  public static readonly WhenNoWorker = 'WhenNoWorker';
  /// x
  public static readonly X = 'X';

  /// y
  public static readonly Y = 'Y';

  /// angle
  public static readonly UIAngle = 'UIAngle';

  /// size
  public static readonly UIWidth = 'UIWidth';
  public static readonly UIHeight = 'UIHeight';

  /// 限期小时
  public static readonly TSpanHour = 'TSpanHour';

  /// 限期天
  public static readonly TimeLimit = 'TimeLimit';

  /// 时间计算方式
  public static readonly TWay = 'TWay';

  /// 逾期提示规则
  public static readonly TAlertRole = 'TAlertRole';

  /// 逾期提示方式
  public static readonly TAlertWay = 'TAlertWay';

  /// 预警小时
  public static readonly WarningDay = 'WarningDay';

  /// 预警提示规则
  public static readonly WAlertRole = 'WAlertRole';

  /// 预警提示方式
  public static readonly WAlertWay = 'WAlertWay';

  /// 扣分
  public static readonly TCent = 'TCent';

  /// 流程步骤
  public static readonly Step = 'Step';

  /// 工作内容
  public static readonly Doc = 'Doc';

  ///  物理表名
  public static readonly PTable = 'PTable';

  /// 签字类型
  public static readonly SignType = 'SignType';

  /// 运行模式
  public static readonly RunModel = 'RunModel';

  /// 谁执行它？

  public static readonly WhoExeIt = 'WhoExeIt';

  /// IsSubFlow
  public static readonly HisSubFlows = 'HisSubFlows';

  /// 超时处理内容
  public static readonly DoOutTime = 'DoOutTime';

  /// 超时处理内容
  public static readonly OutTimeDeal = 'OutTimeDeal';

  /// 执行超时的条件
  public static readonly DoOutTimeCond = 'DoOutTimeCond';

  /// 是否启动自动运行？
  public static readonly AutoRunEnable = 'AutoRunEnable';

  /// 自动运行参数
  public static readonly AutoRunParas = 'AutoRunParas';

  /// 属性
  public static readonly FrmAttr = 'FrmAttr';

  /// 个性化发送信息
  public static readonly TurnToDealDoc = 'TurnToDealDoc';

  /// 访问规则
  public static readonly DeliveryWay = 'DeliveryWay';

  /// 本节点接收人不允许包含上一步发送人
  public static readonly IsExpSender = 'IsExpSender';

  // 是否等待嵌入式表单消息
  public static readonly WaitIframeMsg = 'WaitIframeMsg';

  // 是否允许多人处理（共享表单）
  public static readonly AllowMultipleEditors = 'AllowMultipleEditors';

  /// 焦点字段
  public static readonly FocusField = 'FocusField';

  /// 节点表单ID
  public static readonly NodeFrmID = 'NodeFrmID';

  /// 跳转规则
  public static readonly JumpWay = 'JumpWay';

  /// 可跳转的节点
  public static readonly JumpToNodes = 'JumpToNodes';

  /// 已读回执
  public static readonly ReadReceipts = 'ReadReceipts';

  /// 操送规则
  public static readonly CCRole = 'CCRole';

  /// 保存模式
  public static readonly SaveModel = 'SaveModel';

  /// 方向条件控制规则
  public static readonly CondModel = 'CondModel';
  public static readonly TurnToDeal = 'TurnToDeal';
  /// 抢办发送后处理规则
  public static readonly QiangBanSendAfterRole = 'QiangBanSendAfterRole';

  /// 子流程启动方式
  public static readonly SubFlowStartWay = 'SubFlowStartWay';

  /// 子流程启动参数
  public static readonly SubFlowStartParas = 'SubFlowStartParas';

  /// 是否工作质量考核点
  public static readonly IsEval = 'IsEval';

  /// 撤销规则
  public static readonly CancelRole = 'CancelRole';
  //可撤销的节点
  public static readonly CancelNodes = 'CancelNodes';
  /// 对方已读不能撤销
  public static readonly CancelDisWhenRead = 'CancelDisWhenRead';
  public static readonly IsOpenOver = 'IsOpenOver';
  public static readonly IsResetAccepter = 'IsResetAccepter';

  /// 抄送数据写入规则
  public static readonly CCWriteTo = 'CCWriteTo';
  /// 批处理
  public static readonly BatchRole = 'BatchRole';
  public static readonly CHWay = 'CHWay';
  /// 自动跳转规则-1
  public static readonly AutoJumpRole0 = 'AutoJumpRole0';
  /// 自动跳转规则-2
  public static readonly AutoJumpRole1 = 'AutoJumpRole1';
  /// 自动跳转规则-3
  public static readonly AutoJumpRole2 = 'AutoJumpRole2';
  /// 自动跳转规则-4
  public static readonly AutoJumpRole3 = 'AutoJumpRole3';
  /// 自动跳转规则-3 按照SQL
  public static readonly AutoJumpExp = 'AutoJumpExp';
  /// 跳转事件
  public static readonly SkipTime = 'SkipTime';
  /// 是否是客户执行节点?
  public static readonly IsGuestNode = 'IsGuestNode';
  /// 打印单据方式
  public static readonly PrintDocEnable = 'PrintDocEnable';
  /// icon头像
  public static readonly ICON = 'ICON';

  /// 自定义参数字段
  public static readonly SelfParas = 'SelfParas';

  /// 子流程运行到该节点时，让父流程自动运行到下一步
  public static readonly IsToParentNextNode = 'IsToParentNextNode';

  /// 是否发送草稿子流程？
  public static readonly IsSendDraftSubFlow = 'IsSendDraftSubFlow';

  /// 该节点是否是游离状态
  public static readonly IsYouLiTai = 'IsYouLiTai';
  /// 是否是自动审批返回节点
  public static readonly IsSendBackNode = 'IsSendBackNode';
  /// (当前节点为启动子流程节点时)是否检查所有子流程结束后,该节点才能向下发送?
  public static readonly IsCheckSubFlowOver_del = 'IsCheckSubFlowOver_del';
  /// 手机工作模式
  public static readonly MPhone_WorkModel = 'MPhone_WorkModel';
  /// 手机屏幕模式
  public static readonly MPhone_SrcModel = 'MPhone_SrcModel';
  /// pad工作模式
  public static readonly MPad_WorkModel = 'MPad_WorkModel';
  /// pad屏幕模式
  public static readonly MPad_SrcModel = 'MPad_SrcModel';

  /// 是否计算未来处理人
  public static readonly IsFullSA = 'IsFullSA';

  /// 是否计算未来处理人的处理时间.
  public static readonly IsFullSATime = 'IsFullSATime';

  /// 是否接受未来处理人的消息提醒.
  public static readonly IsFullSAAlert = 'IsFullSAAlert';
  public static readonly RefOneFrmTreeType = 'RefOneFrmTreeType';
  public static readonly TodolistModel = 'TodolistModel';
  public static readonly StartLimitRole = 'StartLimitRole';
  public static readonly DeliveryParas = 'DeliveryParas';
  /// 接收人身份模式
  public static readonly ShenFenModel = 'ShenFenModel';
  public static readonly ShenFenVal = 'ShenFenVal';
  //退回节点是否现在工具栏
  public static readonly IsShowReturnNodeInToolbar = 'IsShowReturnNodeInToolbar';
  // 发送阻塞
  public static readonly BlockModel = 'BlockModel';
  public static readonly BlockExp = 'BlockExp';
  public static readonly IsRM = 'IsRM';
  public static readonly IsUploadAth = 'IsUploadAth';
}

/// <summary>
/// 节点
/// </summary>
export class Node extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Admin.Node', 'BP.WF.Node');
    if (!!pkval) {
      this.NodeID = pkval;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '节点');

    map.AddTBIntPK(NodeAttr.NodeID, 0, '节点ID');
    map.AddTBString(NodeAttr.Name, null, '名称', true, false, 0, 150, 10);
    map.AddTBString(NodeAttr.Tip, null, '操作提示', true, true, 0, 100, 10, false);
    map.AddTBInt(NodeAttr.Step, 0, '步骤', true, false);

    //gpe
    map.AddTBInt(NodeAttr.FormType, 0, '表单方案(类型)', true, false);
    map.AddTBString(NodeAttr.FormUrl, null, 'FormUrl', false, true, 0, 300, 10);
    map.AddTBString(NodeAttr.FormUrlMobile, null, 'FormUrlMobile', false, true, 0, 300, 10);
    map.AddTBString('NodeFrmID', null, 'NodeFrmID', false, true, 0, 300, 10);

    map.AddTBString(NodeAttr.ICON, null, '节点ICON', true, false, 0, 70, 10);
    map.AddTBInt(NodeAttr.NodeWorkType, 0, '节点类型', false, false);
    map.AddTBInt(NodeAttr.SubThreadType, 0, 'SubThreadType', false, false);
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', false, false, 0, 3, 10);
    map.AddTBInt(NodeAttr.IsGuestNode, 0, '是否是客户执行节点', false, false);
    //gpe
    map.AddTBInt(NodeAttr.CondModel, 0, '模式', false, false);
    map.AddTBInt(NodeAttr.NodeType, 0, '节点类型', true, true); //2023.06.
    map.AddTBInt(NodeAttr.IsShowReturnNodeInToolbar, 0, '退回节点是否现在工具栏', false, false);

    // fro gpe 发送后truento
    map.AddTBInt(NodeAttr.TurnToDeal, 0, '发送后转向', false, false);
    map.AddTBString(NodeAttr.TurnToDealDoc, null, '提示信息', false, true, 0, 200, 10);
    // 发送阻塞
    map.AddTBInt(NodeAttr.BlockModel, 0, '发送阻塞', false, false);
    map.AddTBString(NodeAttr.BlockExp, null, '提示信息', false, true, 0, 200, 10);
    map.AddTBString('BlockAlert', null, '被阻塞提示信息', true, false, 0, 100, 10);

    //为铁路局,会签子流程. 增加
    map.AddTBInt(NodeAttr.IsSendDraftSubFlow, 0, '是否发送草稿子流程？', false, false);
    map.AddTBString(NodeAttr.FrmAttr, null, 'FrmAttr', false, true, 0, 300, 10);
    // map.AddDDLSysEnum(NodeAttr.ReturnRole, 0, '退回规则', true, true);

    //for 流程设计器.
    map.AddTBInt(NodeAttr.ReturnRole, 0, '退回规则', false, false);
    map.AddTBInt(NodeAttr.FWCSta, 1, '审核状态', false, false);
    map.AddTBInt(NodeAttr.RunModel, 0, '节点类型', false, false);

    map.AddBoolean(NodeAttr.AllowMultipleEditors, false, '是否允许多人编辑', true, true, true);
    map.SetHelperUrl(NodeAttr.AllowMultipleEditors, '对于需要多人处理的表单，可开启此选项，实现类似腾讯文档共同编辑的效果，需要设置为抢办模式');

    //for GPE
    map.AddTBInt(NodeAttr.TodolistModel, 0, 'TodolistModel', false, false);
    map.AddTBInt(NodeAttr.StartLimitRole, 0, 'StartLimitRole', false, false);
    map.AddTBInt(NodeAttr.BatchRole, 0, 'BatchRole', false, false);
    map.AddTBInt(NodeAttr.CHWay, 0, 'CHWay', false, false);
    map.AddTBInt(NodeAttr.OutTimeDeal, 0, 'OutTimeDeal', false, false);
    map.AddTBInt(NodeAttr.CCWriteTo, 2, 'CCWriteTo', false, false);
    map.AddTBString(NodeAttr.DoOutTime, null, 'FrmAttr', false, true, 0, 300, 10);

    //for GPE, FrmSln
    map.AddTBInt('NodeFrmRef', 0, 'NodeFrmRef', false, false);
    map.AddTBString(NodeAttr.NodeFrmID, null, '节点表单ID', false, true, 0, 300, 10);

    //for todolistModel
    map.AddTBInt('QiangBanSendAfterRole', 0, '抢办处理', false, false);
    map.AddTBInt('GenerWorkerListDelRole', 0, '协作模式删除待办', false, false);
    map.AddTBInt(NodeAttr.CCRole, 0, '抄送规则', true, true);

    //为铁路局,会签子流程. 增加
    map.AddTBInt(NodeAttr.X, 0, 'X坐标', false, false);
    //为铁路局,会签子流程. 增加
    map.AddTBInt(NodeAttr.Y, 0, 'Y坐标', false, false);

    map.AddTBInt(NodeAttr.UIWidth, 140, '宽度', false, false);
    //为铁路局,会签子流程. 增加
    map.AddTBInt(NodeAttr.UIHeight, 30, '高度', false, false);
    map.AddTBInt(NodeAttr.UIAngle, 0, '旋转角度', false, false);

    map.AddTBInt(NodeAttr.CondModel, 0, '条件模式', false, false);
    //#endregion 基本属性.

    // for gpe:ShenFenModel
    map.AddTBInt(NodeAttr.ShenFenModel, 0, '身份规则', false, false);
    map.AddTBString(NodeAttr.ShenFenVal, null, '身份规则-参数', false, true, 0, 300, 10);

    map.AddTBInt(NodeAttr.DeliveryWay, 0, '接收人规则', false, false);
    map.AddTBString(NodeAttr.DeliveryParas, null, '参数', false, true, 0, 300, 10);

    // 是否自动加载选择的人员,用于发送时的判断.
    map.AddTBInt('IsAutoLoadEmps', 1, '是否自动加载选择的人员', false, false);

    map.AddTBInt('XieZuoOverRole', 0, '协作完成规则', false, false);
    map.AddTBInt('XieZuoOverRate', 0, '协作完成阈值', false, false);

    map.AddTBInt('TeamleaderConfirm', 0, '组长确认规则', false, false);
    map.AddTBString('TeamleaderCfmVal', null, '参数', false, true, 0, 300, 10);
    map.AddTBInt(NodeAttr.WaitIframeMsg, 0, '是否等待嵌入式表单消息', false, false);
    map.AddTBAtParas(4000);

    map.ParaFields =
      ',TeamleaderConfirm,TeamleaderCfmVal,XieZuoOverRole,XieZuoOverRate,ShenFenModel,ShenFenVal,QiangBanSendAfterRole,GenerWorkerListDelRole,IsShowReturnNodeInToolbar,';

    this._enMap = map;
    return this._enMap;
  }
}

export class Nodes extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new Node();
  }

  constructor() {
    super();
  }
}
