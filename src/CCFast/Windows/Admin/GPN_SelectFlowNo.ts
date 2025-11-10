import { RptPage } from '../RptPage/RptPage';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FlowExt } from '/@/WF/Admin/AttrFlow/FlowExt';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_SelectFlowNo extends PageBaseGroupNew {
  override async GenerSorts(): Promise<Array<any>> {
    return [];
  }
  constructor() {
    super('GPN_SelectFlowNo');
    this.PageTitle = '选择流程';
  }

  public async Init() {
    this.AddGroup('A', '选择流程'); //增加分组.
    this.SelectItemsByGroupList('SelectFlowNo', '选择流程', this.HelpTodo, false, GloWF.srcFlowSorts, GloWF.srcFlows, false);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string) {
    const pageID = this.RequestVal('PageID');

    const flow = new FlowExt(tb1);
    await flow.Retrieve();
    const rp = new RptPage(pageID);
    await rp.Retrieve();
    rp.FlowNo = tb1;
    rp.FlowName = flow.Name;
    await rp.Update();

    const url = GloComm.UrlGPN('GPN_WindowFlow', '&FlowNo=' + tb1 + '&PageID=' + pageID);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
}
