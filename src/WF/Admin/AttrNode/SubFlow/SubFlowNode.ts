import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { SubFlowAttr } from './SubFlow';
/// <summary>
/// 子流程
/// </summary>
export class SubFlowNode extends EntityMyPK {

  constructor(pkval?: string) {
    super('TS.WF.SFlow.SubFlowNode', 'BP.WF.Template.SFlow.SubFlow');
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
    map.AddDDLSysEnum(SubFlowAttr.SubFlowType, 0, '类型', true, false, SubFlowAttr.SubFlowType, '@0=手动启动子流程@1=触发启动子流程@2=延续子流程@3=前置导航子流程');
    map.AddDDLSysEnum(SubFlowAttr.SubFlowModel, 0, '模式', true, false, SubFlowAttr.SubFlowModel, '@0=下级@1=同级');
    map.AddDDLSysEnum(SubFlowAttr.SubFlowSta, 1, '状态', true, false, SubFlowAttr.SubFlowSta, '@0=禁用@1=启用@2=只读');
    map.AddTBInt(SubFlowAttr.Idx, 0, '顺序', true, false);

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
export class SubFlowNodes extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SubFlowNode();
  }
  constructor() {
    super();
  }
}
