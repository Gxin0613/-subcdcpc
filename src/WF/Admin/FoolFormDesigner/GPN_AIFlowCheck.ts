import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from './dto/HttpHandler';

export class GPN_AIFlowCheck extends PageBaseGroupNew {
  constructor() {
    super('GPN_AIFlowCheck');
    this.PageTitle = 'AI流程检查';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', 'AI流程检查'); //增加分组.
    this.AddBlank('DeliveryWay', '接受人规则', this.DeliveryWay1);
    this.Table('DeliveryWay.Nodes', '内容输出', this.DeliveryWay2, true, this.GenerNodes);
  }
  public async GenerNodes() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    const data: any = await handler.DoMethodReturnJson('AiFlow_NodesDeliveryWayGener');
    return JSON.stringify(data);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(_pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (_pageNo == 'DeliveryWay.Nodes') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
      const data: any = await handler.DoMethodReturnString('AiFlow_NodesDeliveryWaySave');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
  }
  public readonly DeliveryWay1 = `
    #### 说明
    - 接收人规则是指，谁可以处理指定节点的工作.
    - ccbpm提供了30多种接收人规则,是应用不同的场景,比如:绑定接收人，绑定部门，绑定岗位等.
    - AI可以帮助我们把每个节点的接收人规则给与最大的匹配与建议.
    `;
  public readonly DeliveryWay2 = `
    #### 说明
    - 接收人规则是指，谁可以处理指定节点的工作.
    - ccbpm提供了30多种接收人规则,是应用不同的场景,比如:绑定接收人，绑定部门，绑定岗位等.
    - AI可以帮助我们把每个节点的接收人规则给与最大的匹配与建议.
    `;
}
