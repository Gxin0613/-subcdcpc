import { Stocks } from './Stock';
import { TuiYan } from './TuiYan';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_TuiYanExt extends PageBaseGroupNew {
  constructor() {
    super('GPN_TuiYanExt');
    this.PageTitle = '推演';
  }

  public async Init() {
    this.AddGroup('A', '推演', 'icon-drop'); //增加分组.
    const ids = this.RequestVal('IDs');
    alert(ids);
    this.SelectItemsByList('DT.Selected', '选择股票', this.HelpTodo, true, this.MyStocks, true, false, ids);
  }

  public async MyStocks() {
    const ens = new Stocks();
    await ens.RetrieveAll();
    return ens.toJSONString();
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    //本机导入表单.
    if (pageNo === 'DT.Selected') {
      const en = new TuiYan();
      en.Name = '推演:' + DataType.CurrentDateTime;
      en.DTTo = this.RequestVal('tb1', 'DT'); //时间点到.
      en.DTFrom = ''; //上设置时间点.
      en.NumOfStocks = _tb1.split(',').length; //选择的股票数.
      en.StockNos = _tb1;
      en.StockNames = _tb2;
      await en.Insert();

      //执行推演.
      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      handler.AddPara('No', en.No); //生成的推演编号.
      handler.AddPara('StockNos', _tb1); //选择的股票.

      const data = await handler.DoMethodReturnString('GPN_TuiYan_DoIt');
      //提示信息.
      if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      else return new GPNReturnObj(GPNReturnType.Message, data);
    }
  }
}
