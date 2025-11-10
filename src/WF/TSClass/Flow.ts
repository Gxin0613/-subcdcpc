/// <summary>
/// 流程 属性
/// </summary>
import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloWF } from '../Admin/GloWF';

export class FlowAttr extends EntityNoNameAttr {
  // 流程路由标识
  public static readonly FlowGroupID = 'FlowGroupID';

  // CCType
  public static readonly CCType = 'CCType';

  // 抄送方式

  public static readonly CCWay = 'CCWay';

  // 流程类别

  public static readonly FK_FlowSort = 'FK_FlowSort';

  // 建立的日期。

  public static readonly CreateDate = 'CreateDate';

  // BillTable

  public static readonly BillTable = 'BillTable';

  // 开始工作节点类型

  public static readonly StartNodeType = 'StartNodeType';

  // StartNodeID

  public static readonly StartNodeID = 'StartNodeID';

  // 能不能流程Num考核。

  public static readonly IsCanNumCheck = 'IsCanNumCheck';

  // 是否显示附件

  public static readonly IsFJ = 'IsFJ';

  // 标题生成规则

  public static readonly TitleRole = 'TitleRole';

  // 生成标题的节点

  public static readonly TitleRoleNodes = 'TitleRoleNodes';

  // 流程类型

  public static readonly FlowType = 'FlowType';

  // 流程运行类型

  public static readonly FlowRunWay = 'FlowRunWay';

  // 工作模式

  public static readonly WorkModel = 'WorkModel';

  // 运行的设置

  public static readonly RunObj = 'RunObj';

  // 是否有Bill

  public static readonly NumOfBill = 'NumOfBill';

  // 明细表数量

  public static readonly NumOfDtl = 'NumOfDtl';

  // 是否可以启动？

  public static readonly IsCanStart = 'IsCanStart';

  // 是否可以在手机里启用?

  public static readonly IsStartInMobile = 'IsStartInMobile';

  // 是否自动计算未来的处理人？

  public static readonly IsFullSA = 'IsFullSA';

  // 类型

  public static readonly FlowAppType = 'FlowAppType';

  // 图像类型

  public static readonly ChartType = 'ChartType';

  // 流程计划完成日期设置规则

  public static readonly SDTOfFlowRole = 'SDTOfFlowRole';
  public static readonly SDTOfFlowRoleSQL = 'SDTOfFlowRoleSQL';

  // 草稿

  public static readonly Draft = 'Draft';

  // 序号

  public static readonly Idx = 'Idx';

  // 参数

  public static readonly Paras = 'Paras';

  // 业务主表

  public static readonly PTable = 'PTable';

  // 表单连接
  public static readonly FrmUrl = 'FrmUrl';

  // 流程标记

  public static readonly FlowMark = 'FlowMark';

  // 流程事件实体

  public static readonly FlowEventEntity = 'FlowEventEntity';

  // 外部客户参与流程规则

  public static readonly GuestFlowRole = 'GuestFlowRole';

  // 单据编号格式

  public static readonly BillNoFormat = 'BillNoFormat';

  //业务主键字段.
  public static readonly BuessPKFields = 'BuessPKFields';

  // 待办字段s

  public static readonly BuessFields = 'BuessFields';
  //高级查询人员设置
  public static readonly AdvEmps = 'AdvEmps';
  // 数据权限控制方式

  public static readonly DRCtrlType = 'DRCtrlType';

  // 是否可以批量发起?

  public static readonly IsBatchStart = 'IsBatchStart';

  // 批量发起填写的字段.

  public static readonly BatchStartFields = 'BatchStartFields';

  // 是否是MD5

  public static readonly IsMD5 = 'IsMD5';

  // 是否是数据加密

  public static readonly IsJM = 'IsJM';

  // 是否启用数据版本控制

  public static readonly IsEnableDBVer = 'IsEnableDBVer';

  public static readonly CCStas = 'CCStas';
  public static readonly Note = 'Note';

  // 运行的SQL

  public static readonly RunSQL = 'RunSQL';

  // 流程轨迹中显示的Tab标签页的控制

  public static readonly IsFrmEnable = 'IsFrmEnable';
  public static readonly IsTruckEnable = 'IsTruckEnable';
  public static readonly IsTimeBaseEnable = 'IsTimeBaseEnable';
  public static readonly IsTableEnable = 'IsTableEnable';
  public static readonly IsOPEnable = 'IsOPEnable';

  // 排序方式
  public static readonly TrackOrderBy = 'TrackOrderBy';

  // 发起限制规则
  public static readonly StartLimitRole = 'StartLimitRole';

  // 规则内容
  public static readonly StartLimitPara = 'StartLimitPara';

  // 规则提示
  public static readonly StartLimitAlert = 'StartLimitAlert';

  // 提示时间
  public static readonly StartLimitWhen = 'StartLimitWhen';

  // 发起前置规则
  public static readonly StartGuideWay = 'StartGuideWay';
  public static readonly BatchListCount = 'BatchListCount';
  // 超链接
  public static readonly StartGuideLink = 'StartGuideLink';

  // 标签
  public static readonly StartGuideLab = 'StartGuideLab';

  // 发起前置参数1
  public static readonly StartGuidePara1 = 'StartGuidePara1';

  // 发起前置参数2
  public static readonly StartGuidePara2 = 'StartGuidePara2';

  // StartGuidePara3
  public static readonly StartGuidePara3 = 'StartGuidePara3';

  // 是否启用开始节点的数据重置？
  public static readonly IsResetData = 'IsResetData';

  // 是否启用导入历史数据按钮?
  public static readonly IsImpHistory = 'IsImpHistory';

  // 是否自动装载上一笔数据？
  public static readonly IsLoadPriData = 'IsLoadPriData';

  // 是否启用数据模版？
  public static readonly IsDBTemplate = 'IsDBTemplate';

  // 系统类别（第2级流程树节点编号）
  public static readonly SysType = 'SysType';

  // 版本号
  public static readonly Ver = 'Ver';

  // 子流程结束时，让父流程自动运行到下一步
  public static readonly IsToParentNextNode = 'IsToParentNextNode';

  // OrgNo
  public static readonly OrgNo = 'OrgNo';

  // 创建日期
  public static readonly RDT = 'RDT';

  // 数据同步方式.
  public static readonly DataDTSWay = 'DataDTSWay';

  // 业务表主键
  public static readonly DTSBTablePK = 'DTSBTablePK';

  // 执行同步时间点
  public static readonly DTSTime = 'DTSTime';

  // 同步格式配置.
  public static readonly DTSSpecNodes = 'DTSSpecNodes';
  //同步数据
  public static readonly DTSWay = 'DTSWay';

  // 发起人可看

  public static readonly PStarter = 'PStarter';

  // 参与人可看

  public static readonly PWorker = 'PWorker';

  // 被抄送人可看

  public static readonly PCCer = 'PCCer';

  // 本部门人可看

  public static readonly PMyDept = 'PMyDept';

  // 直属上级部门可看

  public static readonly PPMyDept = 'PPMyDept';

  // 上级部门可看

  public static readonly PPDept = 'PPDept';

  // 平级部门可看

  public static readonly PSameDept = 'PSameDept';

  // 指定部门可看

  public static readonly PSpecDept = 'PSpecDept';

  // 指定的角色可看

  public static readonly PSpecSta = 'PSpecSta';

  // 指定的权限组可看

  public static readonly PSpecGroup = 'PSpecGroup';

  // 指定的人员可看

  public static readonly PSpecEmp = 'PSpecEmp';

  // 流程发起测试人

  public static readonly Tester = 'Tester';
  public static readonly DesignTime = 'DesignTime';

  //设计模式
  public static readonly FlowDevModel = 'FlowDevModel';
  public static readonly DevModelType = 'DevModelType';
  public static readonly DevModelPara = 'DevModelPara';

  public static readonly CCORShareLab = 'CCORShareLab';
  public static readonly CCORShareEnable = 'CCORShareEnable';

  //表单水印
  public static readonly IsWaterMark = 'IsWaterMark';
  //表单水印展示文本内容
  public static readonly WaterMarkText = 'WaterMarkText';
}

/// <summary>
/// 流程
/// </summary>
export class Flow extends EntityNoName {
  /// 存储表
  get PTable() {
    const val = this.GetValStringByKey(FlowAttr.PTable);
    if (val) return val;
    return 'ND1Rpt';
  }
  set PTable(value: any) {
    this.SetValByKey(FlowAttr.PTable, value);
  }
  get PTableMapDataNo() {
    return 'ND1Rpt';
  }
  /// 单号格式
  get BillNoFormat() {
    return this.GetValStringByKey(FlowAttr.BillNoFormat);
  }

  set BillNoFormat(value: string) {
    this.SetValByKey(FlowAttr.BillNoFormat, value);
  }

  //标题生成规则.
  get TitleRole() {
    return this.GetValStringByKey(FlowAttr.TitleRole);
  }

  set TitleRole(value: any) {
    this.SetValByKey(FlowAttr.TitleRole, value);
  }
  //
  // get FlowDevModel() {
  //   return this.GetParaInt('FlowDevModel');
  // }

  constructor(no?: string) {
    super('TS.WF.Admin.Flow', 'BP.WF.Flow');
    //super('TS.WF.Admin.Flow');

    if (!!no) {
      this.setPKVal(no);
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
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('WF_Flow', '流程模版');

    //处理流程类别.
    //let sql = "SELECT No,Name FROM WF_FlowSort WHERE OrgNo='@WebUser.OrgNo' ORDER BY No,Idx";
    map.AddDDLSQL(FlowAttr.FK_FlowSort, null, '类别', GloWF.srcFlowSorts, true);

    map.AddTBString(FlowAttr.OrgNo, null, '组织编号', false, false, 0, 50, 10, false);
    //  map.AddHidden(FlowAttr.OrgNo, " = ", WebUser.OrgNo);

    map.AddTBStringPK(FlowAttr.No, null, '编号', true, true, 1, 4, 3);
    map.AddTBString(FlowAttr.Name, null, '名称', true, false, 0, 50, 300);
    //add  2013-08-30.
    map.AddTBString(FlowAttr.BillNoFormat, null, '单号格式', true, false, 0, 50, 10, false);

    map.AddTBString(FlowAttr.FlowEventEntity, null, '事件实体', true, true, 0, 150, 30);

    map.AddTBString(FlowAttr.PTable, null, '存储表', true, false, 0, 30, 10);

    // add 2013-02-05.
    map.AddTBString(FlowAttr.TitleRole, null, '标题生成规则', true, false, 0, 150, 10, true);

    map.AddBoolean(FlowAttr.IsCanStart, true, '独立启动？', true, true);
    map.AddTBInt(FlowAttr.IsFullSA, 0, '是否计算未来处理人', true, true);

    //for GPE
    map.AddTBInt(FlowAttr.FlowRunWay, 0, 'FlowRunWay', false, false);
    map.AddTBString(FlowAttr.RunObj, null, 'RunObj', true, true, 0, 150, 30);
    map.AddTBInt(FlowAttr.StartGuideWay, 0, 'StartGuideWay', false, false);
    map.AddTBString(FlowAttr.StartGuidePara1, null, 'StartGuidePara', true, false, 0, 150, 10, true);
    map.AddTBString(FlowAttr.StartGuidePara1, null, 'StartGuidePara1', true, false, 0, 150, 10, true);
    map.AddTBString(FlowAttr.StartGuidePara2, null, 'StartGuidePara2', true, false, 0, 150, 10, true);
    map.AddTBString(FlowAttr.StartGuidePara3, null, 'StartGuidePara3', true, false, 0, 150, 10, true);

    // for gpe_
    map.AddTBInt(FlowAttr.StartLimitRole, 0, '发起限制规则', false, false);
    map.AddTBString(FlowAttr.StartLimitPara, null, '参数1', true, false, 0, 150, 10, true);

    map.AddTBInt(FlowAttr.StartLimitRole, 0, 'StartLimitRole', false, false);
    map.AddTBInt(FlowAttr.StartGuideWay, 0, 'StartGuideWay', false, false);
    //DTSWay同步数据
    map.AddTBInt(FlowAttr.DTSWay, 0, 'DTSWay', false, false);
    map.AddTBString(FlowAttr.DTSSpecNodes, null, 'DTSSpecNodes', true, false, 0, 150, 10, true);

    map.AddTBInt(FlowAttr.BatchListCount, 0, 'BatchListCount', false, false);
    map.AddTBInt('BatStartRole', 0, 'BatStartRole', false, false);

    //流程计划完成时间.
    map.AddTBInt(FlowAttr.SDTOfFlowRole, 0, 'SDTOfFlowRole', false, false);
    map.AddTBString(FlowAttr.SDTOfFlowRoleSQL, null, 'SDTOfFlowRoleSQL', true, false, 0, 150, 10, true);
    map.AddTBInt('DeadLineRole', 0, 'DeadLineRole', false, false);

    //草稿
    map.AddDDLSysEnum(FlowAttr.Draft, 0, '草稿规则', true, true, FlowAttr.Draft, '@0=无(不设草稿)@1=保存到待办@2=保存到草稿箱');

    map.AddTBDateTime(FlowAttr.DesignTime, null, '创建时间', true, true);
    map.AddTBString(FlowAttr.OrgNo, null, '组织编号', false, false, 0, 50, 10, false);

    //改造参数类型.
    map.AddTBInt(FlowAttr.FlowDevModel, 0, '设计模式', false, false);
    map.AddTBString(FlowAttr.FrmUrl, null, '表单信息', true, true, 0, 100, 10, true);
    map.AddTBString('Icon', '', '流程图标', true, false, 0, 100, 150);

    //业务字段规则.
    map.AddTBInt('BuessFieldRole', 0, '业务字段规则', false, false);
    map.AddTBString('BuessFields', null, '字段', true, true, 0, 100, 10, true);
    map.AddTBString('BuessFieldNames', null, '名称', true, true, 0, 100, 10, true);
    map.ParaFields = ',DTSSpecNodes,BatStartRole,';
    // 添加AtPara
    map.AddTBAtParas(200);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeUpdate(): Promise<boolean> {
    const fl = new BSEntity('BP.WF.Flow');
    fl.No = this.No;
    await fl.RetrieveFromDBSources();
    if (fl.IsStartInMobile != this.IsStartInMobile || fl.IsCanStart != this.IsCanStart || fl.Name != this.Name) {
      await fl.DoMethodReturnString('ClearStartFlows');
    }

    return true;
  }
  public DoReloadRptData() {
    return '成功执行..';
  }

  public DoGenerTitle() {
    return '成功执行..';
  }
}

/**
 * 流程s
 */
export class Flows extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Flow();
  }

  constructor() {
    super();
  }
  public GetFlows() {}
}
