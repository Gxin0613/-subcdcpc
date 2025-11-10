import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { SubFlowAttr } from './SubFlow';

/// <summary>
/// 子流程
/// </summary>
export class SubFlowHand extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.SFlow.SubFlowHand', 'BP.WF.Template.SFlow.SubFlowHand');
    if (!!pkval) {
      this.setPKVal(pkval);
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
    const map = new Map('WF_NodeSubFlow', '手工启动子流程');

    map.AddGroupAttr('基本属性');
    map.GroupBarShowModel = 0;

    map.AddMyPK();
    map.AddTBString(SubFlowAttr.FK_Flow, null, '主流程编号', false, false, 0, 5, 100);
    map.AddTBInt(SubFlowAttr.FK_Node, 0, '节点', false, true);
    map.AddDDLSysEnum(SubFlowAttr.SubFlowType, 0, '子流程类型', true, false, SubFlowAttr.SubFlowType, '@0=手动启动子流程@1=触发启动子流程@2=延续子流程@3=前置导航子流程');
    map.AddTBString(SubFlowAttr.SubFlowNo, null, '子流程编号', true, true, 0, 10, 150, false);
    map.AddTBString(SubFlowAttr.SubFlowName, null, '子流程名称', true, true, 0, 200, 150, false);

    map.AddDDLSysEnum(SubFlowAttr.SubFlowSta, 1, '状态', true, true, SubFlowAttr.SubFlowSta, '@0=禁用@1=启用@2=只读');
    map.AddTBString(SubFlowAttr.SubFlowLab, null, '启动文字标签', true, false, 0, 20, 150);
    map.AddDDLSysEnum(SubFlowAttr.SubFlowModel, 0, '子流程模式', true, true, SubFlowAttr.SubFlowModel, '@0=下级子流程@1=同级子流程');

    map.AddDDLSQL('SubFlowShowNodeID', null, '轨迹显示位置', 'Flow_SubFlowNodes', true);
    map.SetHelperAlert('SubFlowShowNodeID', SubFlowAttr.Help_SubFlowShowNodeID);

    map.AddGroupAttr('节点运动');
    let str = '@0=不处理@1=该子流程运行结束@2=该子流程运行到指定节点';
    map.AddDDLSysEnum(SubFlowAttr.ParentFlowSendNextStepRole, 0, '父流程自动运行到下一步规则', true, true, SubFlowAttr.ParentFlowSendNextStepRole, str);
    map.AddDDLSysEnum(SubFlowAttr.ParentFlowOverRole, 0, '父流程结束规则', true, true, SubFlowAttr.ParentFlowSendNextStepRole, str);
    map.AddTBInt(SubFlowAttr.SubFlowNodeID, 0, '指定子流程节点ID', true, false);

    str = '@0=不处理@1=让同级子流程自动运行下一步@2=结束同级子流程';
    map.AddDDLSysEnum(SubFlowAttr.IsAutoSendSLSubFlowOver, 0, '同级子流程结束规则', true, true, SubFlowAttr.IsAutoSendSLSubFlowOver, str);

    map.AddGroupAttr('限制规则');
    map.AddBoolean(SubFlowAttr.StartOnceOnly, false, '仅能被调用1次(不能被重复调用).', true, true, false);
    map.AddBoolean(SubFlowAttr.CompleteReStart, false, '该子流程运行结束后才可以重新发起.', true, true, false);

    //启动限制规则1.
    map.AddBoolean(SubFlowAttr.IsEnableSpecFlowStart, false, '指定的流程启动后,才能启动该子流程(请在文本框配置子流程).', false, true);
    map.AddTBString(SubFlowAttr.SpecFlowStart, null, '子流程编号', true, false, 0, 200, 150, true);
    map.AddTBString(SubFlowAttr.SpecFlowStartNote, null, '备注', true, false, 0, 500, 150, true);

    //启动限制规则2.
    map.AddBoolean(SubFlowAttr.IsEnableSpecFlowOver, false, '指定的流程结束后,才能启动该子流程(请在文本框配置子流程).', true, true);
    map.AddTBString(SubFlowAttr.SpecFlowOver, null, '子流程编号', true, false, 0, 200, 150, true);
    map.AddTBString(SubFlowAttr.SpecFlowOverNote, null, '备注', true, false, 0, 500, 150, true);

    map.AddGroupAttr('数据返填');
    map.AddTBString(SubFlowAttr.SubFlowCopyFields, null, '父流程字段对应子流程字段', true, false, 0, 400, 150, true);
    const help1 = `
    #### 帮助
    - 就是数据子流程结束后，需要把数据写入到父流程里面去，通过PWorkID.
    - 应用场景: 父流程是一个工程类的流程，投标是工程的子流程，投标子流程结束后，需要把投标的信息返填到主流程上去.
    - 如果父子流程都使用的是内置的表单,那么数据就可以通过配置的模式返填. 否则需要使用事件来完成数据的返填.
    `;
    map.AddDDLSysEnum(
      SubFlowAttr.BackCopyRole,
      0,
      '子流程结束后数据字段反填规则',
      true,
      true,
      SubFlowAttr.BackCopyRole,
      '@0=不反填@1=字段自动匹配@2=按照设置的格式@3=混合模式',
      help1,
    );

    const help = `
    #### 帮助
    - 子流程结束后，按照设置模式: 格式为@SubField1=ParentField1@SubField2=ParentField2@SubField3=ParentField3,
    - 即子流程字段对应父流程字段，设置成立复制
如果使用签批字段时，请使用按照设置模式
    `;
    map.AddTBString(SubFlowAttr.ParentFlowCopyFields, null, '子流程字段对应父流程字段', true, false, 0, 400, 150, true, help);

    //@0=单条手工启动, 1=按照简单数据源批量启动. @2=分组数据源批量启动. @3=树形结构批量启动.
    const str1 = '@0=单条手工启动@1=按照简单数据源批量启动@2=分组数据源批量启动@3=树形结构批量启动.';
    map.AddDDLSysEnum(SubFlowAttr.SubFlowStartModel, 0, '启动模式', true, true, SubFlowAttr.ParentFlowSendNextStepRole, str1);

    //@0=表格模式, 1=列表模式.
    const str2 = '@0=表格模式@1=列表模式.';
    map.AddDDLSysEnum(SubFlowAttr.SubFlowShowModel, 0, '展现模式', true, true, SubFlowAttr.SubFlowShowModel, str2);
    //map.AddTBInt(SubFlowAttr.SubFlowShowModel, 0, '展现模式', false, false);
    map.AddTBInt(SubFlowAttr.Idx, 0, '顺序', true, false);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.setMyPK(this.FK_Node + '_' + this.SubFlowNo + '_0');
    //this.setMyPK(this.FK_Node + '_' + this.SubFlowNo + '_' + this.SubFlowType);
    return Promise.resolve(true);
  }
}

/**
 * 子流程s
 */
export class SubFlowHands extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SubFlowHand();
  }
  constructor() {
    super();
  }
}
