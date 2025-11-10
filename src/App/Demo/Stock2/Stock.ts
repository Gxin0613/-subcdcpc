import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import { SubTablePosition } from '/@/bp/en/Config';
import { StockDtls } from './StockDtl';
import { StockDays } from './StockDay';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import HttpHandler from '/@/utils/gener/HttpHandler';

// 股票
export class Stock extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Quest.Stock');
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
    const map = new Map('Quest_Stock', '股票');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, false, 1, 59, 100);
    map.AddTBString('Name', null, '股票名称', true, false, 0, 100, 100);
    map.AddTBDate('DT', null, '同步时间点', true, true); //日期:2025-09-09
    map.AddTBMoney('OpenNum', 0, '开盘价', true, true);
    map.AddTBMoney('MaxNum', 0, '最高', true, true);
    map.AddTBMoney('MinNum', 0, '最低', true, true);
    map.AddTBMoney('SwingNum', 0, '振幅', true, true);
    map.AddTBMoney('CloseNum', 0, '收盘价', true, true);

    map.AddGroupAttr('计算属性');
    map.AddTBDate('DTFrom', null, '计算日期从', true, false);
    map.AddTBDate('DTTo', null, '到', true, false);
    map.AddTBMoney('LineMax', 0, '最高线', true, true);
    map.AddTBMoney('LineMin', 0, '最低线', true, true);
    map.AddTBMoney('LineJE', 0, '设置水平线', true, false);
    map.SetHelperAlert('LineJE', '如果为0，则按照DTTo的时间点金额计算.');
    map.AddTBMoney('LineRun', 0, '应用水平线', true, true);
    map.SetHelperAlert('LineRun', '本次计算水平线,默认取DTTo的时间金额.');

    map.AddTBMoney('TimeZhiShu', 1, '时间指数', true, false);
    map.SetHelperAlert('TimeZhiShu', '用于调节时间计算面积.');

    map.AddTBMoney('AreaAdd', 0, '面积+', true, true);
    map.AddTBMoney('AreaCut', 0, '面积-', true, true);
    map.AddTBMoney('AreaRate', 0, '阴阳比率', true, true);
    map.AddTBInt('RecommRate', 0, '推荐指数', true, true);

    //查询条件.
    map.DTSearchWay = DTSearchWay.ByDate;
    // map.AddSearchAttr('RunState');

    map.AddGroupMethod('基础数据');
    const rm5 = new RefMethod();
    rm5.Title = '同步当前数据';
    rm5.ClassMethod = 'DTS_CurrData';
    rm5.Warning = '数据较大,请耐心等待.';
    map.AddRefMethod(rm5);
    map.AddRM_DtlSearch('每日价格', new StockDays(), 'StockNo', '', '', '', 'icon-people', true, '', SubTablePosition.Left);
    map.AddRM_DtlSearch('价格明细', new StockDtls(), 'StockNo', '', '', '', 'icon-people', true, '', SubTablePosition.Left);

    const rm0 = new RefMethod();
    rm0.Title = '求指数';
    rm0.ClassMethod = 'AreaThis';
    rm0.Warning = '数据较大,请耐心等待.';
    rm0.HisMap.AddTBDate('dtFrom', '@RDT', '日期从', true, false);
    rm0.HisMap.AddTBDate('dtTo', '@RDT', '到', true, false);
    map.AddRefMethod(rm0);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
    handler.AddPara('DTFrom', this.DTFrom);
    handler.AddPara('DTTo', this.DTTo);
    handler.AddPara('No', this.No);
    const data = await handler.DoMethodReturnJson('Stock_AreaThis');
    this.AreaAdd = data.AreaAdd;
    this.AreaCut = data.AreaCut;
    this.AreaRate = data.AreaRate;
    this.LineRun = data.LineRun;
    this.LineMin = data.LineMin;
    this.LineMax = data.LineMax;
    this.RecommRate = data.RecommRate;
    return Promise.resolve(true);
  }

  //求推荐指数
  public async AreaThis(dtFrom: string, dtTo: string): Promise<string> {
    dtFrom = '2025-09-01';
    dtTo = '2025-09-06';

    const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
    handler.AddPara('DTFrom', dtFrom);
    handler.AddPara('DTTo', dtTo);
    handler.AddPara('No', this.No);
    const val = await handler.DoMethodReturnString('Stock_AreaThis');
    return val;
  }

  public async DTS_CurrData(): Promise<string> {
    const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
    handler.AddPara('No', this.No);
    const val = await handler.DoMethodReturnString('DTS_CurrData');
    return val;
  }
}

//推断s
export class Stocks extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Stock();
  }
  constructor() {
    super();
  }
}
