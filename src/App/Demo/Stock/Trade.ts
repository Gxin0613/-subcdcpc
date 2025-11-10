import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';

// 城市
export class Trade extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.Trade');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.Readonly();
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Trade', '交易');
    map.CodeStruct = '3';
    //采集数据
    map.AddTBStringPK('No', null, '编号', false, true, 1, 59, 59);
    map.AddTBDate('Name', null, '日期', true, true);
    map.AddTBString('StockNo', null, 'StockNo', true, true, 1, 59, 50);
    map.AddTBMoney('OpenNum', 0, '开盘价', true, true);
    map.AddTBMoney('MaxNum', 0, '最高', true, true);
    map.AddTBMoney('MinNum', 0, '最低', true, true);
    map.AddTBMoney('CloseNum', 0, '收盘价', true, true);
    map.AddTBMoney('SwingNum', 0, '振幅', true, true);
    map.DTSearchWay = DTSearchWay.ByDateRange;
    this._enMap = map;
    return this._enMap;
  }
}

//城市s
export class Trades extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Trade();
  }
  constructor() {
    super();
  }
}
