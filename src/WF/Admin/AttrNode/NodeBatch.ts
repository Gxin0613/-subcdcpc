import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from '../../TSClass/Node';

/// <summary>
/// 节点
/// </summary>
export class NodeBatch extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.NodeBatch');
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
    const map = new Map('WF_Node', '节点组件');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeAttr.Name, null, '名称', true, true, 0, 200, 290);
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', false, false, 0, 5, 50);
    map.AddDDLSysEnum(NodeAttr.FWCSta, 0, '审核组件', true, true, NodeAttr.FWCSta, '@0=禁用@1=启用@2=只读', '', false, 100);
    map.AddDDLSysEnum('GovDocSta', 0, '公文组件', true, true, NodeAttr.FWCSta, '@0=禁用@1=启用@2=只读', '', false, 100);

    const str = '@0=不签名@1=图片签名@2=写字板@3=电子签名@4=电子盖章@5=电子签名+盖章';
    map.AddDDLSysEnum('SigantureEnabel', 0, '签名方式', true, true, null, str);
    //  map.SetHelperUrl(NodeWorkCheckAttr.SigantureEnabel, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5415110&doc_id=31094');

    // map.attrsOfOneVSM.AddListModel(new NodeStations(), new Stations(), NodeStationAttr.FK_Node, NodeStationAttr.FK_Station);
    // map.attrsOfOneVSM.AddListModel(new NodeEmps(), new Emps(), NodeStationAttr.FK_Node, NodeEmpAttr.FK_Emp);
    // map.attrsOfOneVSM.AddListModel(new NodeDepts(), new Depts(), NodeDeptAttr.FK_Node, NodeDeptAttr.FK_Dept);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点s
 */
export class NodeBatchs extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeBatch();
  }
  constructor() {
    super();
  }
}
