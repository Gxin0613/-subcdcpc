/// <summary>
/// 节点权限组 属性
/// </summary>

import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

//节点权限组属性.
export class NodeTeamAttr {
  public static readonly FK_Node = 'FK_Node';
  public static readonly FK_Team = 'FK_Team';
}

/// <summary>
/// 节点权限组
/// </summary>
export class NodeTeam extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.Template.NodeTeam');
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
    const map = new Map('WF_NodeTeam', '节点权限组');
    map.AddMyPK();

    map.AddTBInt(NodeTeamAttr.FK_Node, 0, '节点ID', true, false);
    map.AddTBString(NodeTeamAttr.FK_Team, null, '权限组', true, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }
}

//节点权限组s
export class NodeTeams extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new NodeTeam();
  }

  constructor() {
    super();
  }
}
