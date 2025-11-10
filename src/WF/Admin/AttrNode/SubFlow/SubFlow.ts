import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

export class SubFlowAttr {
  // #region 基本属性
  /// <summary>
  /// 标题
  /// </summary>
  public static readonly SubFlowNo = 'SubFlowNo';
  /// <summary>
  /// 流程名称
  /// </summary>
  public static readonly SubFlowName = 'SubFlowName';
  /// <summary>
  /// 子流程状态
  /// </summary>
  public static readonly SubFlowSta = 'SubFlowSta';
  /// <summary>
  /// 序号
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// 批量发送后是否隐藏父流程的待办.
  /// </summary>
  public static readonly SubFlowHidTodolist = 'SubFlowHidTodolist';
  /// <summary>
  /// 显示在那里？
  /// </summary>
  public static readonly YGWorkWay = 'YGWorkWay';
  /// <summary>
  /// 主流程编号
  /// </summary>
  public static readonly FK_Flow = 'FK_Flow';
  /// <summary>
  /// 节点ID
  /// </summary>
  public static readonly FK_Node = 'FK_Node';
  /// <summary>
  /// 表达式类型
  /// </summary>
  public static readonly ExpType = 'ExpType';
  /// <summary>
  /// 条件表达式
  /// </summary>
  public static readonly CondExp = 'CondExp';
  /// <summary>
  /// 调用时间
  /// </summary>
  public static readonly InvokeTime = 'InvokeTime';
  /// <summary>
  /// 越轨子流程退回类型
  /// </summary>
  public static readonly YBFlowReturnRole = 'YBFlowReturnRole';
  /// <summary>
  /// 要退回的节点
  /// </summary>
  public static readonly ReturnToNode = 'ReturnToNode';
  /// <summary>
  /// 延续到的节点
  /// </summary>
  public static readonly YanXuToNode = 'YanXuToNode';
  /// <summary>
  /// 子流程类型
  /// </summary>
  public static readonly SubFlowType = 'SubFlowType';
  /// <summary>
  /// 子流程模式
  /// </summary>
  public static readonly SubFlowModel = 'SubFlowModel';
  // #endregion

  //#region 子流程的发起.
  /// <summary>
  /// 如果当前为子流程，仅仅只能被调用1次，不能被重复调用。
  /// </summary>
  public static readonly StartOnceOnly = 'StartOnceOnly';
  /// <summary>
  /// 如果当前为子流程，只有该流程结束后才可以重新启用
  /// </summary>
  public static readonly CompleteReStart = 'CompleteReStart';
  /// <summary>
  /// 是否启动
  /// </summary>
  public static readonly IsEnableSpecFlowStart = 'IsEnableSpecFlowStart';
  /// <summary>
  /// 指定的流程启动后，才能启动该子流程.
  /// </summary>
  public static readonly SpecFlowStart = 'SpecFlowStart';
  /// <summary>
  /// 备注
  /// </summary>
  public static readonly SpecFlowStartNote = 'SpecFlowStartNote';
  /// <summary>
  /// 是否启用
  /// </summary>
  public static readonly IsEnableSpecFlowOver = 'IsEnableSpecFlowOver';
  /// <summary>
  /// 指定的子流程结束后，才能启动该子流程.
  /// </summary>
  public static readonly SpecFlowOver = 'SpecFlowOver';
  /// <summary>
  /// 备注
  /// </summary>
  public static readonly SpecFlowOverNote = 'SpecFlowOverNote';
  /// <summary>
  /// 是否启用按指定的SQL启动
  /// </summary>
  public static readonly IsEnableSQL = 'IsEnableSQL';
  /// <summary>
  /// SQL语句
  /// </summary>
  public static readonly SpecSQL = 'SpecSQL';
  /// <summary>
  /// 是否启动按指定平级子流程节点
  /// </summary>
  public static readonly IsEnableSameLevelNode = 'IsEnableSameLevelNode';
  /// <summary>
  /// 平级子流程节点
  /// </summary>
  public static readonly SameLevelNode = 'SameLevelNode';
  /// <summary>
  /// 启动模式
  /// </summary>
  public static readonly SubFlowStartModel = 'SubFlowStartModel';
  /// <summary>
  /// 展现风格.
  /// </summary>
  public static readonly SubFlowShowModel = 'SubFlowShowModel';

  public static readonly DBSrcDoc = 'DBSrcDoc';
  public static readonly DBSrcType = 'DBSrcType';

  // #endregion

  /// <summary>
  /// 自动启动子流程：发送规则.
  /// </summary>
  public static readonly SendModel = 'SendModel';
  /// <summary>
  /// 父流程字段值拷贝到对应子流程字段中
  /// </summary>
  public static readonly SubFlowCopyFields = 'SubFlowCopyFields';
  /// <summary>
  /// 子流程结束后填充父流程的规则
  /// </summary>
  public static readonly BackCopyRole = 'BackCopyRole';
  /// <summary>
  /// 子流程字段值拷贝到对应父流程字段中
  /// </summary>
  public static readonly ParentFlowCopyFields = 'ParentFlowCopyFields';
  /// <summary>
  /// 父流程自动运行到下一步的规则
  /// </summary>
  public static readonly ParentFlowSendNextStepRole = 'ParentFlowSendNextStepRole';
  /// <summary>
  /// 父流程自动结束的规则
  /// </summary>
  public static readonly ParentFlowOverRole = 'ParentFlowOverRole';
  /// <summary>
  /// 指定的子流程节点
  /// </summary>
  public static readonly SubFlowNodeID = 'SubFlowNodeID';
  public static readonly SubFlowLab = 'SubFlowLab';
  public static readonly IsAutoSendSLSubFlowOver = 'IsAutoSendSLSubFlowOver';


  public static readonly Help_SubFlowShowNodeID = `
    #### 帮助
    - 若子流程需要显示在轨迹图上，就需要绑定显示子流程的节点。
    - 第1步:在当前节点上，右键创建子流程icon, 并拖动到响应的位置.
    - 第2步: 打开当前属性框，选择创建的子流程节点.
    #### 其他
    - 不在兼容旧版本的设计规则,需要手工升级.
  `;

}

/// <summary>
/// 子流程
/// </summary>
export class SubFlow extends EntityMyPK {
  //   /// 学生编号
  //   get FK_Student() {
  //     return this.GetValStringByKey(SubFlowAttr.FK_Student);
  //   }

  //   set FK_Student(value: any) {
  //     this.SetValByKey(SubFlowAttr.FK_Student, value);
  //   }

  constructor(pkval?: string) {
    super('TS.WF.SFlow.SubFlow', 'BP.WF.Template.SFlow.SubFlow');
    if (!!pkval) {
      this.OID = pkval;
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
    const map = new Map('WF_NodeSubFlow', '子流程');

    map.AddMyPK();

    map.AddTBString(SubFlowAttr.FK_Flow, null, '主流程编号', true, true, 0, 5, 150);
    map.AddTBInt(SubFlowAttr.FK_Node, 0, '主流程节点', false, true);

    map.AddTBString(SubFlowAttr.SubFlowNo, null, '子流程编号', true, true, 0, 10, 60, false);
    map.AddTBString(SubFlowAttr.SubFlowName, null, '子流程名称', true, true, 0, 200, 150, false);

    //map.AddTBInt(SubFlowAttr.SubFlowType, 0, '子流程类型', false, true);
    map.AddDDLSysEnum(SubFlowAttr.SubFlowType, 0, '类型', true, true, SubFlowAttr.SubFlowType, '@0=手动启动子流程@1=触发启动子流程@2=延续子流程@3=前置导航子流程');
    // map.AddTBInt(SubFlowAttr.SubFlowModel, 0, '子流程模式', false, true);
    map.AddDDLSysEnum(SubFlowAttr.SubFlowModel, 0, '模式', true, true, SubFlowAttr.SubFlowModel, '@0=下级@1=同级');

    map.AddTBInt(SubFlowAttr.ParentFlowSendNextStepRole, 0, '父流程自动运行到下一步规则', false, true);
    map.AddTBInt(SubFlowAttr.ParentFlowOverRole, 0, '父流程结束规则', false, true);
    map.AddTBInt(SubFlowAttr.SubFlowNodeID, 0, '指定子流程节点ID', false, true);
    map.AddTBInt(SubFlowAttr.IsAutoSendSLSubFlowOver, 0, '同级子流程结束规则', false, true);
    map.AddTBString('SubFlowShowNodeID', null, '轨迹显示位置',  true,true,10,20,20);

    //启动限制规则0.
    map.AddTBInt(SubFlowAttr.StartOnceOnly, 0, '仅能被调用1次', false, true);

    //启动限制规则1.
    map.AddTBInt(SubFlowAttr.IsEnableSpecFlowStart, 0, '指定的流程启动后,才能启动该子流程(请在文本框配置子流程).', false, true);
    map.AddTBString(SubFlowAttr.SpecFlowStart, null, '子流程编号', true, false, 0, 200, 150, true);
    map.AddTBString(SubFlowAttr.SpecFlowStartNote, null, '备注', true, false, 0, 500, 150, true);

    //启动限制规则2.
    map.AddTBInt(SubFlowAttr.IsEnableSpecFlowOver, 0, '指定的流程结束后,才能启动该子流程(请在文本框配置子流程).', true, true);
    map.AddTBString(SubFlowAttr.SpecFlowOver, null, '子流程编号', true, false, 0, 200, 150, true);
    map.AddTBString(SubFlowAttr.SpecFlowOverNote, null, '备注', true, false, 0, 500, 150, true);

    map.AddTBInt(SubFlowAttr.ExpType, 0, '表达式类型', false, true);
    map.AddTBString(SubFlowAttr.CondExp, null, '条件表达式', true, false, 0, 500, 150, true);

    map.AddTBInt(SubFlowAttr.YBFlowReturnRole, 0, '退回方式', false, true);

    map.AddTBString(SubFlowAttr.ReturnToNode, null, '要退回的节点', true, true, 0, 200, 150, false);

    map.AddTBInt(SubFlowAttr.SendModel, 0, '自动触发的子流程发送方式', false, true);
    map.AddTBInt(SubFlowAttr.SubFlowStartModel, 0, '启动模式', false, true);

    map.AddTBString(SubFlowAttr.SubFlowCopyFields, null, '父流程字段对应子流程字段', false, false, 0, 400, 150, true);
    map.SetHelperAlert(
      SubFlowAttr.SubFlowCopyFields,
      `启动子流程时，将父流程字段值copy至子流程字段，设置模式为：@ParentField1=SubField1@ParentField2=SubField2@ParentField3=SubField3`,
    );
    map.AddTBInt(SubFlowAttr.BackCopyRole, 0, '子流程结束后数据字段反填规则', false, true);
    
    map.AddTBString(SubFlowAttr.ParentFlowCopyFields, null, '子流程字段对应父流程字段', true, false, 0, 400, 150, true);
    map.SetHelperAlert(
      SubFlowAttr.ParentFlowCopyFields,
      `子流程结束后，将子流程字段值回填至父流程字段，设置模式为：@SubField1=ParentField1@SubField2=ParentField2@SubField3=ParentField3`,
    );
    map.AddDDLSysEnum(SubFlowAttr.SubFlowSta, 1, '状态', true, true, SubFlowAttr.SubFlowSta, '@0=禁用@1=启用@2=只读');

    map.AddTBInt(SubFlowAttr.Idx, 0, '顺序', true, false);

    //为中科软增加. 批量发送后，需要隐藏父流程的待办.
    map.AddTBInt(SubFlowAttr.SubFlowHidTodolist, 0, '批量发送后是否隐藏父流程待办', true, false);

    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = this.FK_Node + '_' + this.SubFlowNo + '_' + this.SubFlowType;
    return Promise.resolve(true);
  }
}

/**
 * 子流程s
 */
export class SubFlows extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SubFlow();
  }
  constructor() {
    super();
  }
}
