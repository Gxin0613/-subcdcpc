import { Stocks } from './Stock';
import { DataVBase } from '/@/bp/UIEntity/DataVBase';

export class DataV_Stock extends DataVBase {
  constructor() {
    super('DataV_Stock');
    this.PageTitle = '股票信息'; //执行标记,获得数据.
  }

  //重写的构造方法.
  override async Init() {
    this.AddHtml('金币', 2, '', 'xxxxxx', 1);
    this.AddChartZZT({
      title: '股票信息',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await this.MyStocks,
    });
  }
  public async MyStocks() {
    const ens = new Stocks();
    await ens.RetrieveAll();
    return ens.toJSONString();
  }
}
