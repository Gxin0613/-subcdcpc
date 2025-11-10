import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 推断
export class RptDtl extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Demo.RptDtl');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.Readonly();
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_RptDtl', '推断记录');
    map.CodeStruct = '3';
    map.AddGroupAttr('本日数据');
    //采集数据
    map.AddMyPK();
    map.AddTBString('RptMyPK', null, '报告编号', false, false, 0, 100, 10, true);
    map.AddTBString('StockNo', null, 'Stock编号', true, true, 0, 300, 100);
    map.AddTBString('TradeNo', null, 'Trade主键', true, true, 0, 300, 80);
    map.AddTBMoney('CloseNum', 0, '收盘价', true, true);
    map.AddTBMoney('MaxNum', 0, '最高', true, true);
    map.AddTBMoney('MinNum', 0, '最低', true, true);
    map.AddTBMoney('SwingNum', 0, '振幅', true, true);

    map.AddGroupAttr('预测&实际'); //预测:
    map.AddTBMoney('StockCloseNum', 0, 'Stock收盘价', true, true);
    map.AddTBMoney('ResultCloseNum', 0, 'Fact收盘价', true, true);

    map.AddTBMoney('StockMax', 0, 'Stock最高', true, true);
    map.AddTBMoney('ResultMax', 0, 'Fact最高', true, true);

    map.AddTBMoney('StockMin', 0, 'Stock最低', true, true);
    map.AddTBMoney('ResultMin', 0, 'Fact最低', true, true);

    map.AddTBMoney('StockSwing', 0, 'Stock振幅', true, true);
    map.AddTBMoney('ResultSwing', 0, 'Fact振幅', true, true);

    map.AddTBMoney('StockCenter', 0, '中线位置AVG', true, true);
    map.AddTBMoney('StockSafeTop', 0, '高抛(安全线)', true, true);
    map.AddTBMoney('StockSafeDown', 0, '低吸(安全线)', true, true);

    map.AddBoolean('IsTop', false, '高位?', true, false);
    map.AddBoolean('IsDown', false, '低位?', true, false);
    map.AddDDLSysEnum('ResultSta', 0, '状态', true, false, 'ResultSta', '@0=完美@1=高位命中@2=低位命中@3=翻车');

    map.AddGroupAttr('模拟交易');
    map.AddTBMoney('Outgo', 0, '支出', true, true);
    map.AddTBMoney('Income', 0, '收入', true, true);
    map.AddTBMoney('Win', 0, '收益', true, true);
    map.AddTBMoney('Principal', 20, '本金剩余', true, true);
    map.AddTBString('ExecNote', null, '交易执行', true, true, 0, 600, 10, true);

    this._enMap = map;
    return this._enMap;
  }
}

//推断s
export class RptDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new RptDtl();
  }
  constructor() {
    super();
  }
}
