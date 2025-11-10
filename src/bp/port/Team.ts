import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { TeamType } from '/@/bp/port/TeamType';
// 属性
export class TeamAttr extends EntityNoNameAttr {
  /// 组织编号
  public static readonly OrgNo = 'OrgNo';
  public static readonly TeamTypeNo = 'TeamTypeNo';
  public static readonly ParentNo = 'ParentNo';
  /// 序号
  public static readonly Idx = 'Idx';
}

// 权限组
export class Team extends EntityNoName {
  /// 组织编号
  get OrgNo() {
    return this.GetValStringByKey(TeamAttr.OrgNo);
  }
  set OrgNo(value: any) {
    this.SetValByKey(TeamAttr.OrgNo, value);
  }

  //Idx.
  get Idx() {
    return this.GetValIntByKey(TeamAttr.Idx);
  }
  set Idx(value: any) {
    this.SetValByKey(TeamAttr.Idx, value);
  }

  constructor(no?: string) {
    super('TS.Port.Team');
    if (!!no) {
      this.setPKVal(no);
    }
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
    const map = new Map('Port_Team', '项目组');
    map.CodeStruct = '3';
    map.AddTBStringPK(TeamAttr.No, null, '编号', true, true, 1, 50, 100);
    map.AddTBString(TeamAttr.Name, null, '名称', true, false, 0, 50, 200);
    // map.AddDDLEntities(TeamAttr.TeamTypeNo, null, '类型', new TeamType(), true);
    map.AddTBString(TeamAttr.ParentNo, null, 'ParentNo', true, false, 0, 50, 200);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    map.AddTBInt('Idx', 0, 'Idx', false, true);

    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');

    this._enMap = map;
    return this._enMap;
  }
}

//权限组s
export class Teams extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Team();
  }
  constructor() {
    super();
  }
}
