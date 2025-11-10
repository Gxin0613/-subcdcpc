import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from '../../TSClass/Node';
/// <summary>
/// 审核组件
/// </summary>
export class NodeGovDoc extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Template.NodeGovDoc');
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
    const map = new Map('WF_Node', '公文组件');
    map.AddGroupAttr('基本设置');
    map.AddTBIntPK(NodeAttr.NodeID, 0, '节点ID');
    map.AddTBString(NodeAttr.Name, null, '节点名称', true, true, 0, 100, 10);
    map.AddDDLSysEnum('GovDocSta', 0, '组件状态', true, true, 'FWCSta', '@0=禁用@1=启用@2=只读');
    //#endregion 外观
    this._enMap = map;
    return this._enMap;
  }
}
