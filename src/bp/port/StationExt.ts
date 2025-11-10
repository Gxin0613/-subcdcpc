import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '../en/Map/UAC';
import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '../web/WebUser';
import DBAccess from '/@/utils/gener/DBAccess';

// 角色
export class StationExt extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.StationExt');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Port_Station', '角色');
    //map.CodeStruct = `3`;

    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 100);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddTBString('FK_StationType', null, '类型', false, false, 0, 50, 200);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    map.AddTBInt('Idx', 0, 'Idx', true, true);

    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    if (!this.OrgNo) this.SetValByKey('OrgNo', WebUser.OrgNo);
    if (!this.No) this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

//角色s
export class StationExts extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new StationExt();
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
