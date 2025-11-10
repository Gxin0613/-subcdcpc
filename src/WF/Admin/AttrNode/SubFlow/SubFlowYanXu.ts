import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { SubFlowAttr } from './SubFlow';
/// <summary>
/// 子流程
/// </summary>
export class SubFlowYanXu extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.SFlow.SubFlowYanXu', 'BP.WF.Template.SFlow.SubFlowYanXu');
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
    const map = new Map('WF_NodeSubFlow', '延续子流程');
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('基本属性');
    map.AddMyPK();
    map.AddTBString(SubFlowAttr.FK_Flow, null, '主流程编号', false, false, 0, 5, 100);
    map.AddTBInt(SubFlowAttr.FK_Node, 0, '节点', false, true);

    map.AddDDLSysEnum(SubFlowAttr.SubFlowType, 2, '子流程类型', true, false, SubFlowAttr.SubFlowType, '@0=手动启动子流程@1=触发启动子流程@2=延续子流程@3=前置导航子流程');
    map.AddDDLSysEnum(SubFlowAttr.SubFlowModel, 0, '子流程模式', true, true, SubFlowAttr.SubFlowModel, '@0=下级子流程@1=同级子流程');
    map.AddDDLSysEnum(SubFlowAttr.SubFlowSta, 1, '状态', true, true, SubFlowAttr.SubFlowSta, '@0=禁用@1=启用@2=只读');

    map.AddTBString(SubFlowAttr.SubFlowNo, null, '子流程编号', true, true, 0, 10, 150, false);
    map.AddTBString(SubFlowAttr.SubFlowName, null, '子流程名称', true, true, 0, 200, 150, false);

    map.AddDDLSQL('SubFlowShowNodeID', null, '轨迹显示位置', 'Flow_SubFlowNodes', true);
    map.SetHelperAlert('SubFlowShowNodeID', SubFlowAttr.Help_SubFlowShowNodeID);

    map.AddTBInt(SubFlowAttr.Idx, 0, '显示顺序', true, false);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.setMyPK(this.FK_Node + '_' + this.SubFlowNo + '_2');
    //this.setMyPK(this.FK_Node + '_' + this.SubFlowNo + '_' + this.SubFlowType);
    return Promise.resolve(true);
  }
}

/**
 * 子流程s
 */
export class SubFlowYanXus extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SubFlowYanXu();
  }
  constructor() {
    super();
  }
}
