import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { RptDtls } from './RptDtl';

// 推断
export class Rpt extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Demo.Rpt');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.Readonly();
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Rpt', '推断报告');
    map.CodeStruct = '3';

    map.AddGroupAttr('参数');
    map.AddMyPK();
    map.AddTBString('StockNo', null, '推断编号', false, false, 0, 100, 10, true);
    map.AddTBString('StockName', null, '推断名称', true, true, 0, 300, 80);
    map.AddTBString('StockNo', null, 'Stock编号', true, true, 0, 300, 100);

    map.AddTBString('IdxNo', null, '执行号', true, true, 0, 100, 50, true);
    map.AddDDLSysEnum('ExceModel', 0, '模式', true, true, 'ExceModel', '@0=单股@1=多线程');
    map.AddTBDate('DTFrom', null, '日期从', true, true);
    map.AddTBDate('DTTo', null, '日期到', true, true);
    map.AddTBInt('TradeTimes', 1, '交易次', true, true);

    map.AddTBInt('CarWidth', 1, '车宽', true, true);
    map.AddTBInt('NearDays', 4, '样本天数', true, true);
    map.AddTBMoney('Principal', 20, '本金', true, true);

    map.AddGroupAttr('结果');
    map.AddTBInt('ResultAll', 0, '样本数', true, true, true);
    map.AddTBInt('ResultTop', 0, '高位', true, true);
    map.AddTBInt('ResultDown', 0, '低位', true, true);

    map.AddTBInt('ResultSta0', 0, '完美', true, true);
    map.AddTBInt('ResultSta1', 0, '抛出', true, true);
    map.AddTBInt('ResultSta2', 0, '吸入', true, true);
    map.AddTBInt('ResultSta3', 0, '全翻', true, true);
    map.AddTBMoney('ResultWin', 0, '盈利', true, true);
    map.AddTBInt('Onhand', 0, '库存', true, true);
    // map.AddRM_DtlBatch('详情', new RptDtls(), 'RptMyPK', '', ',', 'icon-people', '', SubTablePostion.Left, 0, 400);
    map.AddRM_DtlSearch('详情', new RptDtls(), 'RptMyPK', '', '', '', 'icon-people', false);

    this._enMap = map;
    return this._enMap;
  }
}

//推断s
export class Rpts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Rpt();
  }
  constructor() {
    super();
  }
}
