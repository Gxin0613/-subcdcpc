import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '../../AttrNode/NodeExt';
import { DirectionAttr, Directions } from '../Direction';
import { GPE_CondModel } from '../GPE_CondModel';

// 节点属性
export class NodeDirCondition extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.NodeDirCondition');
    if (!!pkval) this.NodeID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '方向条件');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    // map.AddTBString(NodeExtAttr.Name, null, '名称', true, false, 0, 50, 200);

    /**************************** 方向条件.  **********************/
    map.AddGroupMethod('方向条件');
    //优先级.
    map.AddRM_DtlSearch('优先级', new Directions(), DirectionAttr.Node, '移动,设置条件', '', 'ToNode,ToNodeName', 'icon-file');
    //转向规则.
    map.AddRM_GPE(new GPE_CondModel(), 'icon-file');

    this._enMap = map;
    return this._enMap;
  }
}
