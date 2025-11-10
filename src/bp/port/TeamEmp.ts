/// 用户部门 属性
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';
import { TeamEmpStation, TeamEmpStations } from './TeamEmpStation';
import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { Team } from '/@/bp/port/Team';

/// 用户部门
export class TeamEmp extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Port.TeamEmp');
    if (!!mypk) {
      this.setPKVal(mypk);
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_TeamEmp', '用户组');
    map.CodeStruct = '2';
    map.AddMyPK();
    map.AddTBString('EmpNo', null, '人员', false, false, 0, 50, 100);
    map.AddTBString('TeamNo', null, '组', true, true, 0, 50, 50);
    map.AddTBString('TeamName', null, '组名称', true, true, 0, 50, 100);
    map.AddTBString('StationNo', null, '角色名称', true, false, 0, 50, 50, true);
    //角色选择.
    map.SetPopGroupList('StationNo', GloWF.srcStationTypes, GloWF.srcStations, true, '600px', '500px', '选择角色', 'icon-people');
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
  protected override async afterDelete(): Promise<boolean> {
    //删除岗位信息.
    const des = new TeamEmpStations();
    await des.Delete('EmpNo', this.EmpNo, 'TeamNo', this.TeamNo);
    return true;
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    //部门名称,是否为空.
    const empNo = this.GetValByKey('EmpNo');
    const teamNo = this.GetValByKey('TeamNo');
    const stationNo = this.GetValByKey('StationNo');
    const team = new Team(teamNo);
    await team.Retrieve();
    this.TeamName = team.Name;
    if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) this.OrgNo = team.OrgNo;

    //转成数组. 1,2,3,
    //判断this.StationNo是否存在，不存在删除掉Port_TeamEmpStation的数据
    if (!!stationNo) {
      const ids = stationNo.split(',').filter((item) => !!item);
      // 如果是编辑的某个部门，先删除这个部门下的所有角色
      const stations = new TeamEmpStations();
      await stations.Delete('TeamNo', teamNo, 'EmpNo', empNo);

      for (const id of ids) {
        const station = new TeamEmpStation();
        station.MyPK = `${teamNo}_${empNo}_${id}`;
        station.TeamNo = teamNo;
        station.EmpNo = empNo;
        station.StationNo = id;
        if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) station.OrgNo = teamNo.OrgNo;
        else station.OrgNo = WebUser.OrgNo;
        await station.Insert();
        //}
      }
    } else {
      const stations = new TeamEmpStations();
      await stations.Delete('TeamNo', teamNo, 'EmpNo', empNo);
    }
    return true;
  }
}

//用户部门s
export class TeamEmps extends EntitiesMyPK {
  get GetNewEntity(): TeamEmp {
    return new TeamEmp();
  }
  constructor() {
    super();
  }
}
