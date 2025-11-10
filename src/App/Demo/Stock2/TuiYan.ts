import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import BSEntity from '/@/utils/gener/BSEntity';
import { SubTablePosition } from '/@/bp/en/Config';
import { TuiYanStocks } from './TuiYanStock';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { TuiYanDayTracks } from './TuiYanDayTrack';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';

// 推演
export class TuiYan extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Quest.TuiYan');
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
    const map = new Map('Quest_TuiYan', '推演');

    map.AddGroupAttr('基础信息');
    map.AddTBStringPK('No', null, '编号', true, false, 1, 59, 50);
    map.AddTBString('Name', null, '推演名称', true, false, 0, 100, 80);
    map.AddTBString('StockNos', null, '股票编号', true, true, 0, 100, 100);
    map.AddTBInt('NumOfStocks', 0, '选择股票数', true, true);
    map.AddTBStringDoc('StockNames', null, '股票名称', true, true, true);

    map.AddGroupAttr('推演参数');
    map.AddTBDate('DTFrom', null, '计算时间点从', true, false);
    map.AddTBDate('DTTo', null, '到', true, false);
    map.AddTBMoney('DotRateWin', 3, '赢利点', true, false);
    map.SetHelperAlert('DotRateWin', '期望的赢利点,比如:3.0 就是在3个点的时候，就抛掉.');
    map.AddTBMoney('DotRateLost', 4, '止损位', true, false);
    map.SetHelperAlert('DotRateLost', '割肉点,比如:4.0 就是在4个点的时候，就抛掉.');

    map.AddGroupAttr('计算属性');
    map.AddTBDate('DTOfEnd', null, '执行结束日期', true, true);
    map.AddTBInt('NumOfDays', 0, '执行天数', true, true);
    map.AddTBInt('NumOf1', 0, '成功数', true, true);
    map.AddTBInt('NumOf2', 0, '失败数', true, true);
    map.AddTBInt('NumOf3', 0, '未命中', true, true);
    map.AddTBInt('RateOf1', 0, '成功比例', true, true);

    //查询日期.
    map.DTSearchWay = DTSearchWay.ByDate;

    map.AddGroupMethod('推演');
    map.AddRM_DtlSearch('股票表现', new TuiYanStocks(), 'TuiYanNo', '', '', '', 'icon-people', false, '', SubTablePosition.Left);
    map.AddRM_DtlSearch('每日运行', new TuiYanDayTracks(), 'TuiYanNo', '', '', '', 'icon-people', false, '', SubTablePosition.Left);

    // const rm = new RefMethod();
    // rm.Title = '重新计算';
    // rm.ClassMethod = 'Reset';
    // rm.RefMethodType = RefMethodType.FuncToolbar;
    // rm.Warning = '您确定要执行吗？';
    // rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const data = await this.Reset();
    // const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
    // handler.AddPara('DTFrom', this.DTFrom);
    // handler.AddPara('DTTo', this.DTTo);
    // handler.AddPara('No', this.No);
    // const data = await handler.DoMethodReturnJson('Stock_AreaThis');
    this.DTOfEnd = data.DTOfEnd;
    this.NumOfDays = data.NumOfDays;
    this.NumOf1 = data.NumOf1;
    this.NumOf2 = data.NumOf2;
    this.NumOf3 = data.NumOf3;
    this.RateOf1 = data.RateOf1;
    message.info('重新计算执行完毕，成功率为:' + this.RateOf1);
    return Promise.resolve(true);
  }

  public async Reset() {
    const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
    handler.AddPara('No', this.No);
    handler.AddPara('DTFrom', this.DTFrom);
    handler.AddPara('DTTo', this.DTTo);

    handler.AddPara('DotRateWin', this.DotRateWin);
    handler.AddPara('DotRateLost', this.DotRateLost);

    const data = await handler.DoMethodReturnString('TuiYan_Rest');
    return data;
  }

  public async DoGenerAll(): Promise<string> {
    const en = new BSEntity('BP.Demo.TuiYan', this.No);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('DoGenerAll');
    return val;
  }

  public async DoIt(): Promise<string> {
    const en = new BSEntity('BP.Demo.TuiYan', this.No);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('DoTuiYanModel1');
    return val;
  }
}

//推断s
export class TuiYans extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new TuiYan();
  }
  constructor() {
    super();
  }
}
