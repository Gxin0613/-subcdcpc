import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloWF } from '../../GloWF';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_FlowCopySaaS extends PageBaseGroupNew {
  constructor() {
    super('GPN_FlowCopySaaS');
    this.PageTitle = '流程复制';
  }
  public async Init() {
    this.AddGroup('A', '流程复制');
    const FlowSortHelp = `
#### 流程复制帮助指南
- 请从列表中选择租户名称，点击下一步。`;
    //const orgNo = this.params.RefPKVal; // 租户编号

    this.SelectItemsByList('SelectFlowSort', this.params.BtnLab + ' - 选择租户', FlowSortHelp, false, GloWF.srcSelectOrgs);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //debugger;
    if (this.params.FlowNos == undefined || this.params.FlowNos == null || this.params.FlowNos == '') {
      message.info('请选择要复制的流程');
      return null;
    }
    const flowNos = this.params.FlowNos; // 流程编号
    const flowSortNo = tb1; // 流程目录编号
    const flowNoArray = flowNos.split(','); // 将流程编号字符串拆分为数组

    let newFlowNos = '';
    for (const flowNo of flowNoArray) {
      // 复制流程 返回新流程编号
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner');
      handler.AddPara('FlowNo', flowNo);
      handler.AddPara('FlowSort', flowSortNo);
      const data = await handler.DoMethodReturnString('FlowCopy');
      if (data == undefined || data == null) {
        message.info(flowNo + '流程复制失败，错误信息：' + data);
        return null;
      }
      newFlowNos += data + ',';
    }
    newFlowNos = newFlowNos.substring(0, newFlowNos.length - 1);
    message.info('流程[' + flowNos + ']复制成功,新的流程编号:' + newFlowNos);

    if (flowNoArray.length > 1) {
      return new GPNReturnObj(GPNReturnType.CloseAndReload, '复制成功');
    } else {
      // const url = '/#/WF/Designer/EditFlow?FlowNo=' + newFlowNos;
      const url = GloComm.UrlFlowD(newFlowNos);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
  }
}
