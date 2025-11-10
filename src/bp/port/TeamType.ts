import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '../web/WebUser';
import { CCBPMRunModel } from '../difference/SystemConfig';
import DBAccess from '/@/utils/gener/DBAccess';
// 属性
export class TeamTypeAttr extends EntityNoNameAttr {
  /// 组织编号
  public static readonly OrgNo = 'OrgNo';
  /// 序号
  public static readonly Idx = 'Idx';
}
// 角色类型
export class TeamType extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.TeamType');
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
    const map = new Map('Port_TeamType', '组类型');
    map.CodeStruct = '2';
    map.AddTBStringPK(TeamTypeAttr.No, null, '编号', true, true, 2, 100, 200);
    map.AddTBString(TeamTypeAttr.Name, null, '名称', true, false, 0, 50, 200);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    map.AddTBInt(TeamTypeAttr.Idx, 0, 'Idx', true, false);
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    // this.OrgNo = WebUser.OrgNo;
    if (!this.OrgNo) this.SetValByKey('OrgNo', WebUser.OrgNo);
    if (!this.No) this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

//角色类型s
export class TeamTypes extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new TeamType();
  }
  constructor() {
    super();
  }

  //查询全部
  override async RetrieveAll() {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return await super.RetrieveAll('Idx');
    else return await this.Retrieve('OrgNo', WebUser.OrgNo, 'Idx');
  }
}
