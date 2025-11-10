import { Subflow } from '@vicons/carbon';
import { GloWF } from '../../GloWF';
import { SubFlow } from './SubFlow';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { Flow } from '/@/WF/TSClass/Flow';
import { Node } from '/@/WF/TSClass/Node';
export class GPN_NewSubFlow extends PageBaseGroupNew {
  constructor() {
    super('GPN_NewSubFlow');
    this.ForEntityClassID = 'TS.WF.SFlow.SubFlow';
    this.PageTitle = '新建子流程';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('A', '请选择子流程模式'); //增加分组.
    const flowNo = this.RequestVal('FlowNo');
    const srcGroup = GloWF.srcFlowSorts; //'SELECT No,Name FROM WF_FlowSort ORDER BY Idx';
    //新建子流程时排除父流程
    const srcList = GloWF.SQLOfSubFlowSrcList(flowNo); //`SELECT No,Name,FK_FlowSort as GroupNo FROM WF_Flow WHERE No != ${flowNo} ORDER BY Idx`;
    this.SelectItemsByGroupList('0', '手工启动子流程', this.Docs0, false, srcGroup, srcList);
    this.SelectItemsByGroupList('1', '自动启动子流程', this.Docs1, false, srcGroup, srcList);
    this.SelectItemsByGroupList('2', '延续子流程', this.Docs2, false, srcGroup, srcList);
    this.SelectItemsByGroupList('3', '发起导航创建子流程(对开始节点有效)', this.Docs3, false, srcGroup, srcList);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const subFlowNo = tb1;
    if (subFlowNo === '') {
      alert('请输入流程编号');
      return;
    }

    const nodeID = this.RequestVal('RefPKVal');

    //子流程实体.
    const subFlowEntity = new Flow(subFlowNo);
    await subFlowEntity.Retrieve();

    //当前节点.
    const currNodeEntity = new Node(nodeID);
    await currNodeEntity.Retrieve();
    // debugger;
    //执行创建.
    const subFlow = new SubFlow();
    subFlow.MyPK = nodeID + '_' + subFlowNo + '_' + pageNo;
    const val = await subFlow.IsExits();
    if (val === true) {
      alert('子流程已经存在');
      return;
    }

    subFlow.FK_Flow = currNodeEntity.FK_Flow;
    subFlow.FK_Node = nodeID;

    subFlow.SubFlowNo = subFlowEntity.No;
    subFlow.SubFlowName = subFlowEntity.Name; //流程名称.
    subFlow.SubFlowType = pageNo;

    const node = new Node();
    node.NodeID = nodeID;
    await node.Retrieve();
    let enName = '';
    //设置不同的示例，让其打开的时候,能够不同类型的编辑.
    if (pageNo === '0') enName = 'TS.WF.SFlow.SubFlowHand';
    if (pageNo === '1') enName = 'TS.WF.SFlow.SubFlowAuto';
    if (pageNo === '2') enName = 'TS.WF.SFlow.SubFlowYanXu';
    if (pageNo === '3') enName = 'TS.WF.SFlow.SubFlowGuide';
    subFlow.SetPara('EnName', enName);
    await subFlow.Insert();
    if (pageNo === '1') {
      const subFlowAutoNum = currNodeEntity.GetParaInt('SubFlowAutoNum', 0);
      currNodeEntity.SetPara('SubFlowAutoNum', subFlowAutoNum + 1);
      await currNodeEntity.Update();
    }
    //转入到url.
    const url = GloComm.UrlEn(enName, Subflow.MyPK);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  // 经典表单说明
  public readonly Docs0 = `
  #### 帮助
   - 手工启动的子流程，依附于子流程组件。
   - 绑使用子流程组件，可以启用一个或者多个子流程。
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/AttrNode/SubFlow/Img/SubFlowHand1.png "屏幕截图.png")
   
`;

  public readonly Docs1 = `
  #### 帮助
   - 自动触发子流程，在指定的事件，指定的条件满足的时候，就自动启动子流。
   - 指定的事件： 发送时， 工作到达时。
   - 指定的条件：按照表单字段，按照参数（类似于配置方向条件）。
   - 其他的条件与属性概念与手工启动子流程相同。
  #### 帮助文档
   - <a  href="https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3982374&doc_id=31094"> 更多内容，详见说明 </a>
  #### 图例1
  ![输入图片说明](./resource/WF/Admin/AttrNode/SubFlow/Img/SubFlow2.png "屏幕截图.png")

  #### 图例2
  ![输入图片说明](./resource/WF/Admin/AttrNode/SubFlow/Img/SubFlow3.png "屏幕截图.png")
  
`;

  public readonly Docs2 = `
  #### 帮助
   - 延续子流程是一个特殊的下级子流程.
   - 主流程的特定节点，只能发起一个延续子流程，启动后该节点的活动就被冻结了，需要等待延续流程运行后，根据配置主流程自动运行或者自动结束。
   - 子流程的开始节点也可以退回到父流程上去。
  #### 帮助文档
  - <a  href="https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3982375&doc_id=31094"> 更多内容，详见说明 </a>
  #### 运行图例
  ![输入图片说明](./resource/WF/Admin/AttrNode/SubFlow/Img/SubFlowYanXu1.png "屏幕截图.png")
  #### 流程图
  ![输入图片说明](./resource/WF/Admin/AttrNode/SubFlow/Img/SubFlowYanXu2.png "屏幕截图.png")


`;

  public readonly Docs3 = `
  #### 帮助
   - 在流程属性的前置导航中，有几个选项需要在开始节点选择子流程。
   - 请参考流程属性的前置导航功能.
  #### 应用场景
   - 我们做一个费用报销单，需要选择一个或多个采购申请单.
   - 当前流程就是父流程，要选择的单笔或者多笔数据就是子流程.
   - 这个现象是先出现子流程，等其完成后出现父流程.
 
 `;
}
