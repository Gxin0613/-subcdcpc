import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';

// 股票价格
export class StockDay extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Quest.StockDay');
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
    const map = new Map('Quest_StockDay', '每日价格');

    map.AddGroupAttr('基本信息');
    map.AddMyPK();
    map.AddTBString('StockNo', null, '股票编号', true, true, 0, 100, 100);
    map.AddTBString('StockName', null, '名称', true, true, 0, 100, 100);

    map.AddTBDate('DT', null, '日期', true, true); //日期:2025-09-09
    map.AddTBMoney('OpenNum', 0, '开盘价', true, true);
    map.AddTBMoney('MaxNum', 0, '最高', true, true);
    map.AddTBMoney('MinNum', 0, '最低', true, true);
    map.AddTBMoney('SwingNum', 0, '振幅', true, true);
    map.AddTBMoney('CloseNum', 0, '收盘价', true, true);

    map.DTSearchWay = DTSearchWay.ByDate;

    this._enMap = map;
    return this._enMap;
  }
}

//股票价格s
export class StockDays extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new StockDay();
  }
  constructor() {
    super();
  }
}
