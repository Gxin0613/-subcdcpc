import { DataBankBase } from '/@/bp/UIEntity/DataBankBase';

export class DBank_CCBill extends DataBankBase {
  constructor() {
    super('DBank_CCBill', 'local', '本机数据源'); //连接到本机数据源获取数据.
    DataBankBase.register('DBank_CCBill', DBank_CCBill);
  }
  // 重写的构造方法，初始化参数.
  public override async Init() {
    this.IsTesting = true;
    //  this.AddSearch('Flows', '获得流程列表', `SELECT No,Name,FK_FlowSort GroupNo FROM WF_Flow  WHERE FrmUrl='@Key' Order By Idx`);

    if (this.IsTesting == true) await this.PushDataBoxsToBackground();
  }
}
