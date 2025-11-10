/// <summary>
/// 用户部门岗位 属性
/// </summary>
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import WebUser from '../web/WebUser';
import { CCBPMRunModel } from '../difference/SystemConfig';
import { Team } from '/@/bp/port/Team';

export class TeamEmpStationAttr {
  public static readonly TeamNo = 'TeamNo';
  public static readonly EmpNo = 'EmpNo';
  public static readonly StationNo = 'StationNo';
}

/// <summary>
/// 用户部门岗位
/// </summary>

export class TeamEmpStation extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Port.TeamEmpStation');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_TeamEmpStation', '用户组岗位');
    map.CodeStruct = '2';
    map.AddMyPK();
    map.AddTBString(TeamEmpStationAttr.EmpNo, null, '人员', true, true, 0, 50, 200);
    map.AddTBString(TeamEmpStationAttr.TeamNo, null, '组编号', true, true, 0, 50, 200);
    map.AddTBString(TeamEmpStationAttr.StationNo, null, '角色编号', true, true, 0, 50, 200);

    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
      const teamP = new Team(this.TeamNo);
      teamP.No = this.TeamNo;
      await teamP.Retrieve();
      this.OrgNo = teamP.OrgNo;
    } else this.OrgNo = WebUser.OrgNo;
    return true;
  }
}

//用户部门岗位s
export class TeamEmpStations extends EntitiesMyPK {
  get GetNewEntity(): TeamEmpStation {
    return new TeamEmpStation();
  }
  constructor() {
    super();
  }
}
