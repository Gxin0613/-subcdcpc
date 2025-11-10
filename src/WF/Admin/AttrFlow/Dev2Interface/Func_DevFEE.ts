import { FuncTypeModel, PageBaseFunc } from '/@/bp/UIEntity/PageBaseFunc';
import { Flow } from '/@/WF/TSClass/Flow';

export class Func_DevFEE extends PageBaseFunc {
  BtnClick(btnName?: string | undefined) {
    //棒棒ssdsdsdsd
  }
  constructor() {
    super('Func_DevFEE');
    this.PageTitle = '流程事件类';
    this.TypeModel = FuncTypeModel.Func;
  }

  public async Init() {
    this.Desc = 'sdfdsfsdfsdf';

    return;
    const flowNo = this.RequestVal('PKVal');

    const flow = new Flow(flowNo);
    await flow.Retrieve();

    const docs = `
     #### 流程说明:
     xxxx

     流程编号:  ${flowNo}  名称: ${flow.Name}

     登录与门户API
首先要进行代码集成与组织机构的集成
其次在自己的系统登录界面，登录成功后要执行ccbpm的框架登录。
所谓的登录就是调用ccbpm的登录接口，如左边的代码所示。

// 如下代码需要写入您的系统校验密码与用户名之后。
string userNo = "zhangsan";
BP.WF.Dev2Interface.Port_Login(userNo);
菜单
发起：一个操作员可以发起的工作
待办：等待处理的工作。
在途：我参与的，但是这条流程还没有结束的流程。
抄送：不需要我处理，但是需要我知晓的工作。
发起:

//获得指定人员的可以发起的流程列表,调用这个接口返回一个datatable, 可以参考一个demo实现发起列表的输出。

System.Data.DataTable dtStart = BP.WF.Dev2Interface.DB_GenerCanStartFlowsOfDataTable("zhangsan");
待办：

//获得指定人员的待办,调用这个接口返回一个datatable, 可以参考一个demo实现发起列表的输出。
DataTable dtTodolist = BP.WF.Dev2Interface.DB_GenerEmpWorksOfDataTable();在途：

//获得指定人员的在途,调用这个接口返回一个datatable ，代码参考：。
DataTable dtRuning = BP.WF.Dev2Interface.DB_GenerRuning();查询：

//ccbpm给你提供了一个link ，您可以调用这个link ,也可以自己去根据代码实现。

实现列表输出代码，请参考:

运行Demo: 查询
创建WorkID
创建工作ID是启动流程的开始。
ccbpm的工作ID是一个Int64位的整数，始终是按照序号+1产生的。
该workid全局唯一，并且没有重复性，该信息记录到Sys_Serial，WorkID的生成从100开始。
该workid全局唯一，并且没有重复性，该信息记录到Sys_Serial，WorkID的生成从100开始。
//传入流程编号，调用创建一个工作ID。
Int64 workid = BP.WF. Dev2Interface.Node_CreateBlankWork("001");
发送 - 简单发送
工作发送就是让节点向下运动。
调用接口执行发送后，返回一个执行结果的对象，该对象是流程引擎执行过程中的变量。
解析该变量，可以检查出流程是否完成，运行到那一个节点上去了，下一个节点谁可以处理工作？
它的流向，是根据流程设计的规则执行的。
它的接收人，是根据接受人的规则确定的。
//传入流程编号, WorkID执行发送.
BP.WF.SendReturnObjs objs= BP.WF.Dev2Interface.Node_SendWork("001",workid);

// 检查流程是否结束？
bool isFlowOver = objs.IsStopFlow;

// 获得发送到那个节点上去了？
int toNodeID = objs.VarToNodeID;
string toNodeName = objs.VarToNodeName;

// 获得发送给谁了？ 注意：这里如果是多个接受人员就会使用逗号分开。
string toEmpID = objs.VarAcceptersID;
string toEmpName = objs.VarAcceptersName;

// 输出提示信息, 这个信息可以提示给操作员.
string infoMsg = objs.ToMsgOfHtml();

发送 - 要指定发送给谁？发送到那个节点？(万能发送接口)
如果程序员知道下一步要发送给谁，发送到那一个节点的情况下，就可以调用这个接口。
该接口就会摆脱流程引擎设计的方向条件规则与接受人规则。
//如果确定了（或者自己计算好了）下一步要达到的节点，下一步的接受人，就可以按照如下格式调用。
BP.WF.SendReturnObjs objs = null; objs = BP.WF.Dev2Interface.Node_SendWork("001", workid, 103, "zhangsan" );
//发送给一个人,如果发送给多个人用逗号分开比如: zhangsan,lisi,wangwu

//下面调用方式，是知道要发送到那一个节点，但是不知道要发送给谁，让当前的节点定义的接受人规则来确定。
objs = BP.WF.Dev2Interface.Node_SendWork("001", workid, 103, null);

//下面调用方式，是知道要发送到那些人，但是不知道要发送到那个节点，让当前的节点定义的方向条件来确定。
objs = BP.WF.Dev2Interface.Node_SendWork("001", workid, 103,"zhangsan");

// 输出提示信息, 这个信息可以提示给操作员.
string infoMsg = objs.ToMsgOfHtml();
撤销
撤销是发送的逆向操作。
撤销可以调用ccbpm提供的撤销窗口完成，这是最简单的方式。
地址为：/WF/WorkOpt/UnSend.htm 参数为: FK_Flow,FK_Node,WorkID,FID，当前流程的4大参数。
如果需要在其他设备上工作，或者要自己写一个移交界面，请参考。
能否被撤销，是有当前活动节点的撤销规则所决定的。
撤销的功能显示在，在途的流程列表里，只有在途的工作才能被撤销。
在途工作：顾名思义，就是我参与的工作，并且工作尚未完成。
回滚流程，是在流程结束后需要重新在指定的节点，让指定的人员从新向下走。
/*
*执行撤销，返回撤销是否成功信息，如果抛出异常就说明撤销失败。
*撤销失败的原因多种，最有可能的是因为当前活动节点不允许撤销规则决定的。
*/

string msg= BP.WF.Dev2Interface.Flow_DoUnSend( workID);
回滚
回滚与撤销不同的是回滚是在流程完成以后的操作，并且回滚是由管理员操作的。
回滚流程，是在流程结束后需要重新在指定的节点，让指定的人员从新向下走。
//执行回滚，返回的是回滚执行信息，如果回滚失败，则会抛出异常。
string msg= BP.WF.Dev2Interface.Flow_DoRebackWorkFlow("001", workID, 103, "因为审批错误，需要回滚，从节点103重新开始审批。");
退回
退回可以调用ccbpm提供的退回窗口完成，这是最简单的方式。
地址为：/WF/WorkOpt/ReturnWork.htm 参数为: FK_Flow,FK_Node,WorkID,FID，当前流程的4大参数。
如果需要在其他设备上工作，或者要自己写一个退回界面，请参考。
/*
* 1, 获得当前节点可以退回的节点，该接口返回一个datatable。
* 2, 一个节点能够退回到那写节点是由当前节点的退回规则确定的。
* 3, 调用退回需要三个参数：节点编号，工作ID, 流程ID, 对于线性流程FID始终等于0.
*/
System.Data.DataTable dtCanReturnNodes = BP.WF.Dev2Interface.DB_GenerWillReturnNodes(103, workid, 0);
// 返回的是可以退回的节点。

//执行退回，当前的节点是103，要退回的节点是105，
string msg = BP.WF.Dev2Interface.Node_ReturnWork("001", workid, 0, 103, 105, "您的申请信息不完整，请修改后重新发送。", false);
移交
移交也可以调用ccbpm提供的移交窗口完成，这是最简单的方式。
地址为：/WF/WorkOpt/Shift.htm 参数为: FK_Flow,FK_Node,WorkID,FID，当前流程的4大参数。
移交就是把自己所要做的工作交给其他人处理。
如果需要在其他设备上工作，或者要自己写一个移交界面，请参考。

/*
* 调用移交接口，传入必要的参数执行移交.
* FID 在线性流程上始终等于0.
*/

BP.WF.Dev2Interface.Node_Shift("001", 103, workid, 0, "zhangsan", "因我需要出差，所以特把工作移交给您。");

/*
* 撤销移交
* 如果在移交之后，发现不需要移交，就需要撤销回来，调用撤销移交接口。
*/
BP.WF.Dev2Interface.Node_ShiftUn("001", workid);
加签
加签也可以调用ccbpm提供的加签窗口完成，这是最简单的方式。
地址为：/WF/WorkOpt/Shift.htm 参数为: FK_Flow,FK_Node,WorkID,FID，当前流程的4大参数。
加签就是把自己所要做的工作参考其他人意见，或者让其他人处理。
加签有两种模式：1，加签后由加签人发送到下一个节点。2，加签后由让加签人发送给当前人，由当前人发送给下一个节点。
如果需要在其他设备上工作，或者要自己写一个加签界面，请参考。

/*
* 调用加签接口，传入必要的参数执行.
* FID 在线性流程上始终等于0.
*/

//技术人员zhangsan接受工作后，点击发送还会发送给当前人员，由当前人员发送给下一节点。
string info1= BP.WF.Dev2Interface.Node_Askfor(workid, BP.WF.AskforHelpSta.AfterDealSendByWorker, "zhangsan", "这里需要您出具技术鉴定意见.");

//技术人员填写后，直接就发送了下一节点.
string info2 = BP.WF.Dev2Interface.Node_Askfor(workid, BP.WF.AskforHelpSta.AfterDealSend, "zhangsan", "这里需要您出具技术鉴定意见.");

//技术人员回复加签，在由当前人发送到下一个节点。
string infoReply = BP.WF.Dev2Interface.Node_AskforReply("001", 103, workid,0, "我已经出具了技术鉴定意见，请参考.");
结束流程
流程结束有三种方式
第一种走到最后一个节点正常结束。
第二种在特定的节点上，用户需要终止流程向下运动(与删除流程不同)。
第三种在特定的节点上，用户需要删除流程。

/* * 手工的结束流程,这种方式会记录日志.
*/
string overInfo = BP.WF.Dev2Interface .Flow_DoFlowOver( workID, "该供应商找不到了，要结束掉该流程。");
/* * 删除流程,
* 删除流程有多种方式，用户可以根据自己的需求，调用不同的方式.
* 最后一个参数是是否删除子流程.
*/

//按照标记删除流程
string delInfo0 = BP.WF.Dev2Interface .Flow_DoDeleteFlowByFlag( workID, "我不需要请假了", true);

//彻底的删除流程，无日志记录.
string delInfo1 = BP.WF.Dev2Interface .Flow_DoDeleteFlowByReal( workID, "我不需要请假了", true);

//彻底的删除流程,有日志记录.
string delInfo2 = BP.WF.Dev2Interface .Flow_DoDeleteFlowByWriteLog("001", workID, "我不需要请假了", true);

    `;

    return docs;
  }
}
