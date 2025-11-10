import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';

// AR501
export class RouteAttr2Emp extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.RouteAttr2Emp');
    if (!!pkval) this.NodeID = pkval;
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
    const map = new Map('WF_Node', '');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString('RouteAttr2Emp', null, '字段名称', true, false, 0, 100, 100, true);
    map.AddTBStringDoc('DeliveryParas', null, '配置', true, false, true);
    map.AddBoolean('Ismultiple', false, '启用多选', true, true);
    map.AddTBAtParas(4000);
    map.ParaFields = ',RouteAttr2Emp,Ismultiple,';

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterUpdate(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
