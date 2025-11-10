import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from '../../TSClass/Node';

export class NodeAccepter extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.NodeAccepter');
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
    const map = new Map('WF_Node', '接受人规则');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeAttr.Name, null, '名称', true, true, 0, 200, 200);
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', false, false, 0, 5, 50);

    map.AddTBInt('NodeWorkType', 0, '节点类型', false, false);

    map.AddTBInt(NodeAttr.DeliveryWay, 0, '接受人规则', false, false);
    //map.AddTBString(NodeAttr.DeliveryWay, null, '规则', true, true, 0, 5, 50);
    map.AddTBString(NodeAttr.DeliveryParas, null, '参数', true, true, 0, 5, 50);
    map.AddTBString('DeliveryParasT', null, '参数T', false, true, 0, 5, 50);

    map.AddTBInt('FormType', 0, '表单方案', true, true, false, '', 100);
    map.AddTBString('NodeFrmID', null, '表单ID', true, true, 0, 100, 100);

    map.AddTBString('NodeEmps', null, '人员', false, true, 0, 1000, 100, true);
    map.AddTBString('NodeEmpsT', null, '人员T', false, true, 0, 1000, 100, true);

    map.AddTBString('NodeStations', null, '角色', false, true, 0, 100, 100, true);
    map.AddTBString('NodeStationsT', null, '角色T', false, true, 0, 100, 100, true);

    map.AddTBString('NodeDepts', null, '部门', false, true, 0, 500, 100, true);
    map.AddTBString('NodeDeptsT', null, '部门T', false, true, 0, 500, 100, true);

    map.AddTBString('NodeWebAPI', null, 'WebAPI', false, true, 0, 100, 100, true);
    map.AddTBString('NodeWebAPIT', null, 'WebAPI', false, true, 0, 100, 100, true);

    // map.AddDDLSysEnum(NodeAttr.FormType, 0, '接受人规则', true, true, 'DeliveryWayExt', vals, '', false, 100);

    //  map.AddDDLSysEnum(NodeAttr.FWCSta, 0, '审核组件', true, true, NodeAttr.FWCSta, '@0=禁用@1=启用@2=只读', '', false, 100);
    // map.AddDDLSysEnum('GovDocSta', 0, '公文组件', true, true, NodeAttr.FWCSta, '@0=禁用@1=启用@2=只读', '', false, 100);

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
export class NodeAccepters extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeAccepter();
  }
  constructor() {
    super();
  }
}
