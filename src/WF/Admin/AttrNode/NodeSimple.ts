import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from '../../TSClass/Node';

/// <summary>
/// 节点
/// </summary>
export class NodeSimple extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.NodeSimple');
    if (!!pkval) {
      this.NodeID = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '节点');

    map.AddTBIntPK('NodeID', 0, '节点ID');
    map.AddTBString(NodeAttr.Name, null, '名称', false, false, 0, 200, 10);
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', true, false, 0, 5, 10);
    map.AddTBInt(NodeAttr.RunModel, 0, '运行模式', true, true);

    //0=用户节点,1=路由节点，2抄送节点, 3=子流程.
    map.AddTBInt(NodeAttr.NodeType, 0, '节点类型', true, true);

    map.AddTBInt(NodeAttr.X, 0, 'X坐标', false, false);
    map.AddTBInt(NodeAttr.Y, 0, 'Y坐标', false, false);
    map.AddTBInt(NodeAttr.Step, 0, '步骤', true, false);

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
export class NodeSimples extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeSimple();
  }
  constructor() {
    super();
  }
}
