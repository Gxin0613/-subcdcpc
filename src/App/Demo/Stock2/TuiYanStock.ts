import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 股票价格
export class TuiYanStock extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Quest.TuiYanStock');
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
    const map = new Map('Quest_TuiYanStock', '股票价格');

    map.AddGroupAttr('基本信息');
    map.AddMyPK();
    map.AddTBString('StockNo', null, 'StockNo', true, false, 0, 100, 60);
    map.AddTBString('StockName', null, 'StockName', true, false, 0, 100, 60);
    map.AddTBString('TuiYanNo', null, '推演编号', false, true, 0, 10, 10);

    map.AddGroupAttr('复制属性');
    map.AddTBDate('DTFrom', null, '计算日期从', true, false);
    map.AddTBDate('DTTo', null, '到', true, false);
    map.AddTBMoney('LineMax', 0, '最高线', true, true);
    map.AddTBMoney('LineMin', 0, '最低线', true, true);
    map.AddTBMoney('LineRun', 0, '应用水平线', true, true);

    map.AddTBMoney('TimeZhiShu', 1, '时间指数', true, false);
    map.SetHelperAlert('TimeZhiShu', '用于调节时间计算面积.');

    map.AddTBMoney('AreaAdd', 0, '面积+', true, true);
    map.AddTBMoney('AreaCut', 0, '面积-', true, true);
    map.AddTBMoney('AreaRate', 0, '阴阳比率', true, true);
    map.AddTBInt('RecommRate', 0, '推荐指数', true, true);

    map.AddGroupAttr('参数设置');
    map.AddTBMoney('DotWin', 2, '止盈位', true, false);
    map.AddTBMoney('DotLost', 2, '止损位', true, false);

    map.AddGroupAttr('计算属性');
    map.AddTBInt('MeetDayIdx', 0, '第几天?', true, true);
    map.AddTBDate('MeetDT', null, '发生日期', true, true); //盈利日期.
    map.AddTBMoney('MeetJE', 0, '发生金额', true, true);
    map.AddDDLSysEnum('TuiYanStockSta', 0, '状态', true, true, 'TuiYanStockSta', '@0=未计算@1=成功@2=失败@3=持平');

    this._enMap = map;
    return this._enMap;
  }
}

//股票价格s
export class TuiYanStocks extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new TuiYanStock();
  }
  constructor() {
    super();
  }
}
