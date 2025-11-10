import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';

// 股票价格
export class TuiYanDayTrack extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Quest.TuiYanDayTrack');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    if (WebUser.No === 'admin') {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    } else {
      uac.IsUpdate = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Quest_TuiYanDayTrack', '推演天');

    map.AddGroupAttr('基本信息');
    map.AddMyPK(); //
    map.AddTBString('StockNo', null, 'StockNo', true, false, 0, 100, 100);
    map.AddTBString('TuiYanNo', null, '推演ID', true, false, 0, 100, 100);
    map.AddTBDate('DT', null, '日期', true, true);
    map.AddTBMoney('NumOfDays', 0, '第几天', true, true);
    map.AddTBMoney('NumOfErr', 0, '失败数', true, true);
    map.AddTBMoney('NumOfSucess', 0, '成功数', true, true);
    map.AddTBMoney('Win', 0, '盈利亏损', true, true);

    map.DTSearchWay = DTSearchWay.ByDateRange;

    this._enMap = map;
    return this._enMap;
  }
}

//股票价格s
export class TuiYanDayTracks extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new TuiYanDayTrack();
  }
  constructor() {
    super();
  }
}
