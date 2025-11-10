import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { Rpts } from './Rpt';

// 推断
export class Stock1 extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.Stock1');
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
    const map = new Map('Demo_Stock', '股票');
    map.CodeStruct = '3';

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 59, 100);
    map.AddTBString('Name', null, '股票名称', true, true, 0, 100, 100);
    map.AddDDLSysEnum('ExceModel', 0, '模式', true, true, 'ExceModel', '@0=单股@1=多线程');

    map.AddGroupAttr('当日价格'); //当日价格.
    map.AddTBDate('DT', null, '日期', true, true); //日期:2025-09-09
    map.AddTBMoney('OpenNum', 0, '开盘价', true, true);
    map.AddTBMoney('MaxNum', 0, '最高', true, true);
    map.AddTBMoney('MinNum', 0, '最低', true, true);
    map.AddTBMoney('SwingNum', 0, '振幅', true, true);
    map.AddTBMoney('CloseNum', 0, '收盘价', true, true);

    map.AddGroupAttr('单次推断参数');
    map.AddTBDate('DTFrom', null, '日期从', true, false);
    map.AddTBDate('DTTo', null, '日期到', true, false);
    map.AddTBInt('CarWidth', 1, '车宽', true, false);
    map.AddTBInt('NearDays', 4, '最近的天数', true, false);
    map.AddTBMoney('Principal', 20, '本金', true, true);

    map.AddGroupAttr('综合推断参数');
    map.AddTBInt('CarWidthMin', 2, '车宽Min', true, false);
    map.AddTBInt('CarWidthMax', 18, '车宽Max', true, false);
    map.AddTBInt('NearDaysMin', 2, '天数Min', true, false);
    map.AddTBInt('NearDaysMax', 10, '天数Max', true, false);

    map.AddGroupAttr('最优解');
    map.AddTBInt('RelCarWidth', 2, '车宽Min', true, true);
    map.AddTBInt('RelNearDays', 18, '车宽Max', true, true);
    map.AddTBMoney('RelWin', 20, '纯盈利', true, true);
    map.AddTBString('RelMyPK', null, '最优解主键', true, true, 0, 60, 150);

    map.AddGroupAttr('报告单据');
    map.AddTBStringDoc('JNote', null, '求最优解报告单', true, true, true);
    map.AddTBStringDoc('MyNote', null, '指导单', true, true, true);

    const rm2 = new RefMethod();
    rm2.Title = '执行单个推断';
    rm2.ClassMethod = 'DoIt';
    rm2.Warning = '按照设置的参数执行推断,每次执行之后，报告里就多一笔记录.';
    map.AddRefMethod(rm2);
    map.AddRM_DtlSearch('报告', new Rpts(), 'StockNo', '', '', '', 'icon-people', true, '');

    map.AddGroupMethod('执行推断');
    const rm = new RefMethod();
    rm.Title = '生成最优解';
    rm.ClassMethod = 'DoGenerAll';
    rm.Warning = '数据较大,请耐心等待.';
    map.AddRefMethod(rm);

    const rm3 = new RefMethod();
    rm3.Title = '生成明日交易预测';
    rm3.ClassMethod = 'DoNextDay';
    rm3.Warning = '';
    map.AddRefMethod(rm3);

    map.AddGroupMethod('数据同步');
    const rm4 = new RefMethod();
    rm4.Title = '同步历史数据';
    rm4.ClassMethod = 'DTS_Data';
    rm4.Warning = '数据较大,请耐心等待.';
    map.AddRefMethod(rm4);

    const rm5 = new RefMethod();
    rm5.Title = '同步当前数据';
    rm5.ClassMethod = 'DTS_CurrData';
    rm5.Warning = '数据较大,请耐心等待.';
    map.AddRefMethod(rm5);

    this._enMap = map;
    return this._enMap;
  }
  public async DTS_CurrData(): Promise<string> {
    const en = new BSEntity('BP.Demo.Stock', this.No);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('DTS_CurrData');
    return val;
  }

  //同步数据.
  public async DTS_Data(): Promise<string> {
    const en = new BSEntity('BP.Demo.Stock', this.No);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('DTS_Stock');
    return val;
  }

  public async DoNextDay(): Promise<string> {
    const en = new BSEntity('BP.Demo.Stock', this.No);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('GenerStockByRelData');
    return val;
  }

  public async DoGenerAll(): Promise<string> {
    const en = new BSEntity('BP.Demo.Stock', this.No);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('DoGenerAll');
    return val;
  }

  public async DoIt(): Promise<string> {
    const en = new BSEntity('BP.Demo.Stock', this.No);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('DoStockModel1');
    return val;
  }
}

//推断s
export class Stock1s extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Stock1();
  }
  constructor() {
    super();
  }
}
