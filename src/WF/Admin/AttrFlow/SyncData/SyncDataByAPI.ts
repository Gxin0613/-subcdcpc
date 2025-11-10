import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { SyncDataAttr } from './SyncData';

/// 数据同步
export class SyncDataByAPI extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrFlow.SyncDataByAPI');
    if (!!pkval) {
      this.MyPK = pkval;
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
    const map = new Map('WF_SyncData', '同步到API');

    map.AddMyPK();
    map.AddTBString(SyncDataAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    map.AddTBString(SyncDataAttr.APIUrl, null, 'API地址', true, false, 0, 300, 50, true);
    map.AddTBStringDoc(SyncDataAttr.Note, null, '备注', true, false, true);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
