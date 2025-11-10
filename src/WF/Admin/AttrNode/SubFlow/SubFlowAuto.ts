import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { SubFlowAttr } from './SubFlow';

/// <summary>
/// 子流程
/// </summary>
export class SubFlowAuto extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.SFlow.SubFlowAuto', 'BP.WF.Template.SFlow.SubFlowAuto');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_NodeSubFlow', '自动启动子流程');

    map.GroupBarShowModel = 1;

    map.AddGroupAttr('基本设置');
    map.AddMyPK();

    map.AddTBString(SubFlowAttr.FK_Flow, null, '主流程编号', true, true, 0, 5, 100);
    map.AddTBInt(SubFlowAttr.FK_Node, 0, '节点', false, true);

    map.AddDDLSysEnum(SubFlowAttr.SubFlowType, 0, '子流程类型', true, false, SubFlowAttr.SubFlowType, '@0=手动启动子流程@1=触发启动子流程@2=延续子流程@3=前置导航子流程');

    map.AddTBString(SubFlowAttr.SubFlowNo, null, '子流程编号', true, true, 0, 10, 150, false);
    map.AddTBString(SubFlowAttr.SubFlowName, null, '子流程名称', true, true, 0, 200, 150, false);

    map.AddDDLSysEnum(SubFlowAttr.SubFlowModel, 0, '子流程模式', true, true, SubFlowAttr.SubFlowModel, '@0=下级子流程@1=同级子流程');

    map.AddDDLSysEnum(SubFlowAttr.SubFlowSta, 1, '状态', true, true, SubFlowAttr.SubFlowSta, '@0=禁用@1=启用@2=只读');

    const str = '@0=不处理@1=该子流程运行结束@2=该子流程运行到指定节点';
    map.AddDDLSysEnum(SubFlowAttr.ParentFlowSendNextStepRole, 0, '父流程自动运行到下一步规则', true, true, SubFlowAttr.ParentFlowSendNextStepRole, str);

    map.AddDDLSysEnum(SubFlowAttr.ParentFlowOverRole, 0, '父流程结束规则', true, true, SubFlowAttr.ParentFlowSendNextStepRole, str);
    map.AddTBInt(SubFlowAttr.SubFlowNodeID, 0, '指定子流程节点ID', true, false);

    const str1 = '@0=不处理@1=让同级子流程自动运行下一步@2=结束同级子流程';
    map.AddDDLSysEnum(SubFlowAttr.IsAutoSendSLSubFlowOver, 0, '同级子流程结束规则', true, true, SubFlowAttr.IsAutoSendSLSubFlowOver, str1);

    map.AddDDLSysEnum(SubFlowAttr.InvokeTime, 0, '调用时间', true, true, SubFlowAttr.InvokeTime, '@0=发送时@1=工作到达时@2=流程结束时');

    map.AddDDLSQL('SubFlowShowNodeID', null, '轨迹显示位置', 'Flow_SubFlowNodes', true);
    map.SetHelperAlert('SubFlowShowNodeID', SubFlowAttr.Help_SubFlowShowNodeID);

    map.AddGroupAttr('启动限制规则');
    map.AddBoolean(SubFlowAttr.StartOnceOnly, false, '仅能被调用1次.', true, true, true);
    map.AddBoolean(SubFlowAttr.CompleteReStart, false, '该子流程运行结束后才可以重新发起.', true, true, true);
    map.AddBoolean(SubFlowAttr.IsEnableSpecFlowStart, false, '指定的流程启动后,才能启动该子流程(请在文本框配置子流程).', true, true, true);
    map.AddTBString(SubFlowAttr.SpecFlowStart, null, '子流程编号', true, false, 0, 200, 150, true);
    map.SetHelperAlert(SubFlowAttr.SpecFlowStart, '指定的流程启动后，才能启动该子流程，多个子流程用逗号分开. 001,002');
    map.AddTBString(SubFlowAttr.SpecFlowStartNote, null, '备注', true, false, 0, 500, 150, true);

    //启动限制规则.
    map.AddBoolean(SubFlowAttr.IsEnableSpecFlowOver, false, '指定的流程结束后,才能启动该子流程(请在文本框配置子流程).', true, true, true);
    map.AddTBString(SubFlowAttr.SpecFlowOver, null, '子流程编号', true, false, 0, 200, 150, true);
    map.SetHelperAlert(SubFlowAttr.SpecFlowOver, '指定的流程结束后，才能启动该子流程，多个子流程用逗号分开. 001,002');
    map.AddTBString(SubFlowAttr.SpecFlowOverNote, null, '备注', true, false, 0, 500, 150, true);

    //启动限制规则
    map.AddBoolean(SubFlowAttr.IsEnableSQL, false, '按照指定的SQL配置.', true, true, true);
    map.AddTBString(SubFlowAttr.SpecSQL, null, 'SQL语句', true, false, 0, 500, 150, true);

    //启动限制规则
    map.AddBoolean(SubFlowAttr.IsEnableSameLevelNode, false, '按照指定平级子流程节点完成后启动.', true, true, true);
    map.AddTBString(SubFlowAttr.SameLevelNode, null, '平级子流程节点', true, false, 0, 500, 150, true);
    map.SetHelperAlert(SubFlowAttr.SameLevelNode, '按照指定平级子流程节点完成后启动，才能启动该子流程，多个平级子流程节点用逗号分开. 001,102;002,206');

    map.AddGroupAttr('启动数据源');
    const help = `
    #### 帮助
    - 默认是【当前表单主表数据】, 来发起单个子流程给子流程的开始节点表单赋值.
    - 如果按照指定SQL数据源进行赋值，是根据sql数据源返回的列名匹配子流程开始节点表单字段，赋值发起流程，多少行数据，就发起多少个子流程.
    - 通常是查询当前流程的子表数据，进行发起子流程比如: SELECT A.XXX,B.XXXX,B.YYY FROM NDXRpt A, NDXxxDtl1 B WHERE A.OID=B.RefPK AND A.OID=@WorkID
    - 根据返回的行数，来启动多个子流程。
    `;
    map.AddDDLSysEnum(SubFlowAttr.DBSrcType, 0, '数据源类型', true, true, SubFlowAttr.DBSrcType, '@0=当前表单主表数据@1=指定SQL数据源');
    map.AddTBString(SubFlowAttr.DBSrcDoc, null, 'SQL内容', true, false, 0, 500, 150, true);
    map.SetHelperAlert('DBSrcDoc', help);

    map.AddGroupAttr('自动发送方式');
    map.AddDDLSysEnum(SubFlowAttr.SendModel, 0, '自动发送方式', true, true, SubFlowAttr.SendModel, '@0=给当前人员设置开始节点待办@1=发送到下一个节点');
    map.SetHelperAlert(SubFlowAttr.SendModel, '如果您选择了[发送到下一个节点]该流程的下一个节点的接受人规则必须是自动计算的,而不能手工选择.');
    map.AddTBString(SubFlowAttr.SubFlowCopyFields, null, '父流程字段对应子流程字段', true, false, 0, 400, 150, true);
    map.SetHelperAlert(
      SubFlowAttr.SubFlowCopyFields,
      `启动子流程时，将父流程字段值copy至子流程字段，设置模式为：@ParentField1=SubField1@ParentField2=SubField2@ParentField3=SubField3`,
    );
    map.AddDDLSysEnum(SubFlowAttr.BackCopyRole, 0, '子流程结束后数据字段反填规则', true, true, SubFlowAttr.BackCopyRole, '@0=不反填@1=字段自动匹配@2=按照设置的格式@3=混合模式');

    const help1 = `
    #### 帮助
    - 就是数据子流程结束后，需要把数据写入到父流程里面去，通过PWorkID.
    - 应用场景: 父流程是一个工程类的流程，投标是工程的子流程，投标子流程结束后，需要把投标的信息返填到主流程上去.
    - 如果父子流程都使用的是内置的表单,那么数据就可以通过配置的模式返填. 否则需要使用事件来完成数据的返填.
    `;
    map.AddTBString(SubFlowAttr.ParentFlowCopyFields, null, '子流程字段对应父流程字段', true, false, 0, 400, 150, true, help1);

    //批量发送后，是否隐藏父流程的待办
    map.AddBoolean('SubFlowHidTodolist', false, '发送后是否隐藏父流程待办', true, true, true);
    map.AddTBInt(SubFlowAttr.Idx, 0, '顺序', true, false);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.setMyPK(this.FK_Node + '_' + this.SubFlowNo + '_1');
    //this.setMyPK(this.FK_Node + '_' + this.SubFlowNo + '_' + this.SubFlowType);
    return Promise.resolve(true);
  }
}

/**
 * 子流程s
 */
export class SubFlowAutos extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SubFlowAuto();
  }
  constructor() {
    super();
  }
}
