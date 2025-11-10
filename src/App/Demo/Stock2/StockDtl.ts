import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 股票价格
export class StockDtl extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Quest.StockDtl');
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
    const map = new Map('Quest_StockDtl', '股票价格');

    map.AddGroupAttr('基本信息');
    map.AddMyPK(); // StockNo+'_'+DTTime
    map.AddTBString('StockNo', null, 'StockNo', false, false, 0, 100, 100);
    map.AddTBString('StockName', null, 'StockName', false, false, 0, 100, 100);
    map.AddTBDateTime('DTTime', null, '日期', true, true);
    map.AddTBMoney('JE', 0, '价格', true, true);

    map.AddGroupAttr('计算属性');
    map.AddTBMoney('JEOfParent', 0, '上个时间点的价格', true, true);
    map.AddTBMoney('JECut', 0, '高度JE-JEOfParent', true, true);
    map.AddTBMoney('SpanSecond', 0, '间隔秒', true, true);
    map.AddTBMoney('SpanMinute', 0, '间隔分', true, true);
    map.AddTBMoney('Area', 0, '面积', true, true);

    this._enMap = map;
    return this._enMap;
  }
}

//股票价格s
export class StockDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new StockDtl();
  }
  constructor() {
    super();
  }
}
