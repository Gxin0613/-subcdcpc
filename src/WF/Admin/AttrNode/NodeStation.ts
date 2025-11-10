/// <summary>
/// 节点角色 属性
/// </summary>

import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

//节点角色属性.
export class NodeStationAttr {
  public static readonly FK_Node = 'FK_Node';
  public static readonly FK_Station = 'FK_Station';
}

/// <summary>
/// 节点角色
/// </summary>
export class NodeStation extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.Template.NodeStation');
    if (!!mypk) {
      this.MyPK = mypk;
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
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('WF_NodeStation', '节点角色');
    map.AddMyPK();
    map.AddTBInt(NodeStationAttr.FK_Node, 0, '节点ID', true, false);
    map.AddTBString(NodeStationAttr.FK_Station, null, '角色', true, false, 0, 50, 200);
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }
}

//节点角色s
export class NodeStations extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new NodeStation();
  }
  constructor() {
    super();
  }
}
