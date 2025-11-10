import { EntityOID } from '/@/bp/en/EntityOID';
export abstract class NDRptBase extends EntityOID {
  //标题
  get Title() {
    return this.GetValStringByKey('Title');
  }
  //节点状态.
  get WFState() {
    return this.GetValIntByKey('WFState');
  }
  //最后的节点
  get FlowEndNode() {
    return this.GetValIntByKey('FlowEndNode');
  }
  //发起人
  get FlowStarter() {
    return this.GetValStringByKey('FlowStarter');
  }
  //结束时间
  get FlowEnderRDT() {
    return this.GetValStringByKey('FlowEnderRDT');
  }


  protected constructor(clsId: string, refEnName?: string) {
    super(clsId, refEnName);
  }

  //获得当前节点的 Map.
  abstract get EnMapOfNode();
}
