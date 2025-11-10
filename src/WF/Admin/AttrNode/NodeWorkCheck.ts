import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from '../../TSClass/Node';
import { GloWF } from '../GloWF';

/// <summary>
/// 附件类型
/// </summary>
export enum FWCAth {
  /// <summary>
  /// 使用附件
  /// </summary>
  None,
  /// <summary>
  /// 多附件
  /// </summary>
  MinAth,
  /// <summary>
  /// 单附件
  /// </summary>
  SingerAth,
  /// <summary>
  /// 图片附件
  /// </summary>
  ImgAth,
}
/// <summary>
/// 类型
/// </summary>
export enum FWCType {
  /// <summary>
  /// 审核组件
  /// </summary>
  Check,
  /// <summary>
  /// 日志组件
  /// </summary>
  DailyLog,
  /// <summary>
  /// 周报
  /// </summary>
  WeekLog,
  /// <summary>
  /// 月报
  /// </summary>
  MonthLog,
}
/// <summary>
/// 显示格式
/// </summary>
export enum FrmWorkShowModel {
  /// <summary>
  /// 表格
  /// </summary>
  Table,
  /// <summary>
  /// 自由显示
  /// </summary>
  Free,
}
/// <summary>
/// 显示控制方式
/// </summary>
export enum SFShowCtrl {
  /// <summary>
  /// 所有的子线程都可以看到
  /// </summary>
  All,
  /// <summary>
  /// 仅仅查看我自己的
  /// </summary>
  MySelf,
}

/// <summary>
/// 审核组件状态
/// </summary>
export enum FrmWorkCheckSta {
  /// <summary>
  /// 不可用
  /// </summary>
  Disable,
  /// <summary>
  /// 可用
  /// </summary>
  Enable,
  /// <summary>
  /// 只读
  /// </summary>
  Readonly,
}
/// <summary>
/// 协作模式下操作员显示顺序
/// </summary>
export enum FWCOrderModel {
  /// <summary>
  /// 按审批时间先后排序
  /// </summary>
  RDT = 0,
  /// <summary>
  /// 按照接受人员列表先后顺序(官职大小)
  /// </summary>
  SqlAccepter = 1,
}

export class NodeWorkCheckAttr extends EntityNoNameAttr {
  /// <summary>
  /// 经典表单审核标签
  /// </summary>
  public static readonly FWCLab = 'FWCLab';
  /// <summary>
  /// 是否可以审批
  /// </summary>
  public static readonly FWCSta = 'FWCSta';

  /// <summary>
  /// H
  /// </summary>
  public static readonly FWC_H = 'FWC_H';

  /// <summary>
  /// 应用类型
  /// </summary>
  public static readonly FWCType = 'FWCType';
  /// <summary>
  /// 附件
  /// </summary>
  public static readonly FWCAth = 'FWCAth';
  /// <summary>
  /// 显示方式.
  /// </summary>
  public static readonly FWCShowModel = 'FWCShowModel';
  /// <summary>
  /// 轨迹图是否显示?
  /// </summary>
  public static readonly FWCTrackEnable = 'FWCTrackEnable';
  /// <summary>
  /// 历史审核信息是否显示?
  /// </summary>
  public static readonly FWCListEnable = 'FWCListEnable';
  /// <summary>
  /// 是否显示所有的步骤？
  /// </summary>
  public static readonly FWCIsShowAllStep = 'FWCIsShowAllStep';
  /// <summary>
  /// 默认审核信息
  /// </summary>
  public static readonly FWCDefInfo = 'FWCDefInfo';
  /// <summary>
  /// 节点意见名称
  /// </summary>
  public static readonly FWCNodeName = 'FWCNodeName';
  /// <summary>
  /// 是否可以重新编辑审核时间？
  /// </summary>
  public static readonly IsChangeFWCTime = 'IsChangeFWCTime';
  /// <summary>
  /// 如果用户未审核是否按照默认意见填充？
  /// </summary>
  public static readonly FWCIsFullInfo = 'FWCIsFullInfo';
  /// <summary>
  /// 操作名词(审核，审定，审阅，批示)
  /// </summary>
  public static readonly FWCOpLabel = 'FWCOpLabel';
  /// <summary>
  /// 操作人是否显示数字签名
  /// </summary>
  public static readonly SigantureEnabel = 'SigantureEnabel';
  /// <summary>
  /// 操作字段
  /// </summary>
  public static readonly FWCFields = 'FWCFields';
  /// <summary>
  /// 自定短语
  /// </summary>
  public static readonly FWCNewDuanYu = 'FWCNewDuanYu';
  /// <summary>
  /// 是否显示未审核的轨迹
  /// </summary>
  public static readonly FWCIsShowTruck = 'FWCIsShowTruck';
  /// <summary>
  /// 是否显示退回信息
  /// </summary>
  public static readonly FWCIsShowReturnMsg = 'FWCIsShowReturnMsg';
  /// <summary>
  /// 协作模式下操作员显示顺序
  /// </summary>
  public static readonly FWCOrderModel = 'FWCOrderModel';
  /// <summary>
  /// 审核意见显示模式()
  /// </summary>
  public static readonly FWCMsgShow = 'FWCMsgShow';
  /// <summary>
  /// 审核意见版本号控制
  /// </summary>
  public static readonly FWCVer = 'FWCVer';
  /// <summary>
  /// 签批字段
  /// </summary>
  public static readonly CheckField = 'CheckField';
  /// <summary>
  /// 编号对应的字段
  /// </summary>
  public static readonly BillNoField = 'BillNoField';
  /// <summary>
  /// 审核意见立场 不同意、不通过、同意、赞成
  /// </summary>
  public static readonly FWCView = 'FWCView';
}

/// <summary>
/// 审核组件
/// </summary>
export class NodeWorkCheck extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Template.NodeWorkCheck', 'BP.WF.Template.NodeWorkCheck');
    if (!!pkval) {
      this.NodeID = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '审核组件');

    // #region 基本设置
    map.AddGroupAttr('基本设置');
    map.AddTBIntPK(NodeAttr.NodeID, 0, '节点ID');
    map.AddTBString(NodeAttr.Name, null, '节点名称', true, true, 0, 100, 10);
    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCSta, 0, '审核组件状态', true, true, NodeWorkCheckAttr.FWCSta, '@0=禁用@1=启用@2=只读');

    map.AddTBString(NodeWorkCheckAttr.FWCLab, '审核信息', '显示标签', true, false, 0, 100, 10, true);

    //map.AddDDLSysEnum(NodeWorkCheckAttr.FWCVer, 1, '审核意见保存规则', true, true, NodeWorkCheckAttr.FWCVer, '@0=1个节点1个人保留1个意见@1=保留节点历史意见(默认)');
    map.AddDDLSysEnum('FWCType', 0, '审核组件', true, true, 'FWCType', '@0=审核组件@1=日志组件@2=周报组件@3=月报组件');
    map.AddDDLSysEnum('FWCShowModel', 2, '工作模式', true, true, 'FWCShowModel', '@0=审核组件@1=轨迹模式@2=轨迹时间轴模式');
    map.AddDDLSysEnum('FWCTimeModel', 0, '时序模式', true, true, 'FWCTimeModel', '@0=倒序@1=正序');

    map.AddTBString(NodeWorkCheckAttr.FWCNodeName, null, '节点意见名称', true, false, 0, 100, 10);

    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCAth, 0, '附件上传', true, true, NodeWorkCheckAttr.FWCAth, '@0=不启用@1=多附件@2=单附件(暂不支持)@3=图片附件(暂不支持)');
    map.SetHelperAlert(NodeWorkCheckAttr.FWCAth, '在审核期间，是否启用上传附件？启用什么样的附件？注意：附件的属性在节点表单里配置。'); //使用alert的方式显示帮助信息.

    map.AddTBString(NodeWorkCheckAttr.FWCOpLabel, '审核', '操作名词(审核/审阅/批示)', true, false, 0, 50, 10);
    map.AddTBString(NodeWorkCheckAttr.FWCDefInfo, '', '默认审核信息', true, false, 0, 50, 10);

    const str = '@0=不签名@1=图片签名@2=写字板@3=电子签名@4=电子盖章@5=电子签名+盖章';
    map.AddDDLSysEnum('SigantureEnabel', 0, '签名方式', true, true, null, str);
    map.SetHelperUrl(NodeWorkCheckAttr.SigantureEnabel, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5415110&doc_id=31094');

    map.AddBoolean(NodeWorkCheckAttr.IsChangeFWCTime, true, '是否可以重新编辑审核时间？', true, true, true);
    map.AddBoolean(NodeWorkCheckAttr.FWCIsFullInfo, false, '如果用户未审核是否按照默认意见填充？', true, true, true);
    //map.AddBoolean("WhetherStamp ", false, "是否启用盖章？", true, true, false);
    map.AddTBString(NodeWorkCheckAttr.FWCFields, null, '审批格式字段', true, false, 0, 50, 10, true);
    //map.AddTBString(NodeWorkCheckAttr.FWCNewDuanYu, null, "自定义常用短语(使用@分隔)", true, false, 0, 100, 10, true);
    //增加如下字段是为了查询与排序的需要.
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', false, false, 0, 5, 10);
    map.AddTBInt(NodeAttr.Step, 0, '步骤', false, false);

    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCVer, 1, '审核意见保存规则', true, true, NodeWorkCheckAttr.FWCVer, '@0=1个节点1个人保留1个意见@1=保留节点历史意见(默认)');
    map.AddDDLSysEnum('TimeShowRole', 1, '审批时间显示规则', true, true, 'TimeShowRole', '@0=仅日期@1=日期时间');

    //签批字段解决关联字段或者极简模式查询不到结果的修改
    map.AddTBString(NodeAttr.NodeFrmID, null, '节点表单ID', false, true, 0, 50, 10);
    //const sql = "SELECT KeyOfEn AS No,Name From Sys_MapAttr Where UIContralType=14 AND (FK_MapData='ND@NodeID' OR FK_MapData='@NodeFrmID' )";
    map.AddDDLSQL(NodeWorkCheckAttr.CheckField, null, '签批字段', GloWF.SQLOfNodeWorkCheckField(), true);
    // map.AddTBString(NodeWorkCheckAttr.CheckField, null, "签批字段", true, false, 0, 50, 10, false);

    map.AddTBString(NodeWorkCheckAttr.FWCView, null, '审核意见立场', true, false, 0, 200, 200, true);
    map.SetHelperUrl(NodeWorkCheckAttr.FWCView, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=13899543&doc_id=31094');

    //#region 外观设置.
    map.AddGroupAttr('外观设置');
    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCShowModel, 2, '显示方式', true, true, NodeWorkCheckAttr.FWCShowModel, '@0=表格方式@1=自由模式@2=轨迹时间轴模式'); //此属性暂时没有用.
    //协作模式下审核人显示顺序. add for yantai zongheng.
    map.AddTBFloat(NodeWorkCheckAttr.FWC_H, 300, '高度(0=100%)', true, false);
    map.AddBoolean(NodeWorkCheckAttr.FWCTrackEnable, true, '轨迹图是否显示？', true, true, false);
    map.AddBoolean(NodeWorkCheckAttr.FWCListEnable, true, '历史审核信息是否显示？(否,仅出现意见框)', true, true, true);
    map.AddBoolean(NodeWorkCheckAttr.FWCIsShowTruck, false, '是否显示未审核的轨迹？', true, true, true);
    //map.AddBoolean(NodeWorkCheckAttr.FWCIsShowReturnMsg, false, '是否显示退回信息？', true, true, true);

    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCIsShowReturnMsg, 0, '退回信息', true, true, NodeWorkCheckAttr.FWCIsShowReturnMsg, '@0=不显示@1=显示给退回人@2=显示所有人'); //此属性暂时没有用.

    map.AddGroupAttr('协作模式');
    const str1 = '@0=按审批时间先后排序@1=按照接受人员列表先后顺序(官职大小)';
    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCOrderModel, 0, '操作员显示顺序', true, true, null, str1, null, true);
    map.AddBoolean(NodeWorkCheckAttr.FWCIsShowAllStep, false, '在轨迹表里是否显示所有的步骤？', true, true);
    //for tianye , 多人审核的时候，不让其看到其他人的意见.
    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCMsgShow, 0, '审核意见显示方式', true, true, NodeWorkCheckAttr.FWCMsgShow, '@0=都显示@1=仅显示自己的意见');
    //#endregion 外观
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 审核组件s
 */
export class NodeWorkChecks extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeWorkCheck();
  }
  constructor() {
    super();
  }
}
