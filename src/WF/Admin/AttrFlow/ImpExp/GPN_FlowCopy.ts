import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloWF } from '../../GloWF';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_FlowCopy extends PageBaseGroupNew {
  constructor() {
    super('GPN_FlowCopy');
    this.PageTitle = '流程复制';
  }
  public async Init() {
    this.AddGroup('A', '流程复制');
    const FlowSortHelp = `
#### 流程复制帮助指南
- 请从列表中选择目标流程目录，点击下一步。
`;
    const flowNo = this.RefPKVal; // 流程编号

    this.SelectItemsByList('SelectFlowSort', '选择流程目录', FlowSortHelp, false, GloWF.srcFlowSorts);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, _tb2: string, _tb3: string) {
  //  debugger;
    const flowNo = this.RefPKVal; // 流程编号
    const flowSortNo = tb1; // 流程目录编号

    // 复制流程 返回新流程编号
    // const newFlowNo = await WF_Flow.Copy(flowNo, flowSortNo);
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner');
    handler.AddPara('FlowNo', flowNo);
    handler.AddPara('FlowSort', flowSortNo);
    const data = await handler.DoMethodReturnString('FlowCopy');
    if (data == undefined || data == null) {
      message.info('创建失败:' + data);
      return null;
    }

    message.info('流程创建成功,模板编号:' + data);

    // const url = '/#/WF/Designer/EditFlow?FlowNo=' + data;
    const url = GloComm.UrlFlowD(data);

    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }
}
