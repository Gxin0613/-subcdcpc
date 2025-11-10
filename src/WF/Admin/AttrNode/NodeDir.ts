import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { DirectionAttr, Directions } from '../Cond2020/Direction';

// 节点属性
export class NodeDir extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Template.NodeDir');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '节点属性');
    map.EnClassID = this.classID;

    map.AddTBIntPK('NodeID', 0, '节点ID');
    map.AddTBString('Name', null, '名称', true, true, 0, 100, 10, false);

    map.AddGroupMethod('基本设置');
    map.AddRM_DtlSearch('到达节点', new Directions(), DirectionAttr.Node, '帮助', '', 'ToNode,ToNodeName', 'icon-drop', true, '&Node=@NodeID');

    this._enMap = map;
    return this._enMap;
  }
}
