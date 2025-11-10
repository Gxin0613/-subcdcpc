// 实体类
import { GenerWorkFlowExt } from './FlowData/GenerWorkFlowExt';
import HttpHandler from '/@/utils/gener/HttpHandler';

export default class Dev2Interface {
  /**
   * 通过前端发起流程
   * @param flowNo 流程模板编号
   * @param sdkFromPKVal sdk表单的主键值
   * @param paras 其他参数
   * @returns json 包含页面的信息,返回的url信息，开发者需要打开这个url.
   */
  public static async Flow_Start(flowNo: string, sdkFromPKVal = '', paras = ''): Promise<number> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('FlowNo', flowNo);
    handler.AddPara('SDKFromPKVal', sdkFromPKVal);
    handler.AddPara('Paras', paras);
    return await handler.DoMethodReturnJson('Flow_Start');
  }

  /**
   * 创建WorkID
   * @param flowNo 流程编号
   * @param paras 参数, 可以是字段名称, 格式: @Key1=Val1@Key2=val2
   * @returns 返回workid.
   */
  public static async Node_CreateBlank(flowNo: string, paras = ''): Promise<number> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('FlowNo', flowNo);
    handler.AddPara('Paras', paras);
    const workid = await handler.DoMethodReturnString('Node_CreateBlankWork');
    return Number.parseInt(workid);
  }

  public static async Node_SetParentInfo(workID: number, pworkID: number, pflowNo: string) {
    const gwf = new GenerWorkFlowExt(workID);
    await gwf.RetrieveFromDBSources();
    gwf.PWorkID = pworkID;
    gwf.PFlowNo = pflowNo;
    await gwf.Update();
  }

  /**
   * 执行发送
   * @param flowNo 流程编号
   * @param workID 工作ID
   * @param toNodeID 到达的节点
   * @param toEmps 到达的人员.
   * @returns 返回执行内容.
   */
  public static async Node_SendWork(flowNo: string, workID: number, toNodeID = 0, toEmps = '') {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('FlowNo', flowNo);
    handler.AddPara('WorkID', workID);
    handler.AddPara('ToNodeID', toNodeID);
    handler.AddPara('ToEmps', toEmps);
    return await handler.DoMethodReturnString('Node_SendWork');
    // return '100';
  }
  /**
   * 保存节点表单数据
   * @param workID 工作ID
   * @param paras 主表数据,格式为: @key1=val1@key2=Val2
   * @param dtls 从表json数据：支持多个从表
   * @param aths 附件数据：支持多个附件，格式参考源代码.
   * @returns 执行结果.
   */
  public static async Node_SaveWork(workID: number, paras = '', dtls = '', aths = '') {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('WorkID', workID);
    handler.AddPara('Paras', paras);
    handler.AddPara('Dtls', dtls);
    handler.AddPara('Aths', aths);
    return await handler.DoMethodReturnString('Node_SaveWork');
  }
  /**
   * 工作移交
   * @param workID 工作ID
   * @param toEmps 移交给人员： 格式：zhangsan,lisi
   * @param msg 传达的消息
   * @returns 执行结果.
   */
  public static async Node_ShiftWork(workID: number, toEmps: string, msg: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('WorkID', workID);
    handler.AddPara('ToEmps', toEmps);
    handler.AddPara('Msg', msg);
    return await handler.DoMethodReturnString('Node_ShiftWork');
  }

  /**
   * 设置草稿：标识这个workid已经被占用,请参考草稿规则.
   * @param workID 工作ID
   * @returns 执行结果
   */
  public static async Node_SetDraft(workID: number) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('WorkID', workID);
    return await handler.DoMethodReturnString('Node_SetDraft');
  }
  /**
   * 删除流程
   * @param flowNo 流程编号
   * @param workID 工作ID
   * @returns  返回执行结果.
   */
  public static async Flow_DeleteFlow(workID: number): Promise<String> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('WorkID', workID);
    const str = await handler.DoMethodReturnString('Flow_DeleteFlow');
    return str;
  }
  /**
   * 设置流程运行参数全局变量,用于控制节点转向或者接受人等.
   * @param workID 工作ID
   * @param paras 参数：格式 @key1=val1@key2=val2
   * @returns 执行结果.
   */
  public static async Flow_SetFlowParas(workID: number, paras: string): Promise<String> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('Paras', paras);
    handler.AddPara('WorkID', workID);
    const str = await handler.DoMethodReturnString('Flow_SetFlowParas');
    return str;
  }
  /**
   * 执行退回操作
   * @param workID 工作ID
   * @param toNodeID 要退回的节点,如果=0则是退回上一个节点.
   * @param msg 退回原因.
   * @returns 执行结果.
   */
  public static async Node_ReturnWork(workID: number, toNodeID: number, msg: string): Promise<String> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('WorkID', workID);
    handler.AddPara('ToNodeID', toNodeID);
    handler.AddPara('Msg', msg);
    const str = await handler.DoMethodReturnString('Node_ReturnWork');
    return str;
  }

  public static async Upload_File(file: File, fileName: string, fileType = '') {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddFile(file);
    handler.AddPara('fileName', fileName);
    handler.AddPara('fileType', fileType);
    return await handler.DoMethodReturnString('UploadFile');
  }

  /**
   * 发送消息
   * @param toEmpNos 发送给: zhangsan,lisi
   * @param title 标题
   * @param docs 内容
   * @returns 发送结果.
   */
  public static async Port_SendMsg(toEmpNos: string, title: string, docs: string): Promise<String> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('Title', title);
    handler.AddPara('Docs', docs);
    handler.AddPara('ToEmpNos', toEmpNos);
    const str = await handler.DoMethodReturnString('Port_SendMsg');
    return str;
  }
  /**
   * 发送消息
   * @param toEmpNos 发送给: zhangsan,lisi
   * @param title 标题
   * @param docs 内容
   * @param frmID 表单IF
   * @param workID 工作ID
   * @returns 提示信息
   */
  public static async Port_SendMsgByBillInfo(toEmpNos: string, title: string, docs: string, frmID: string, workID: number): Promise<String> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('Title', title);
    handler.AddPara('Docs', docs);
    handler.AddPara('ToEmpNos', toEmpNos);
    handler.AddPara('FrmID', frmID);
    handler.AddPara('WorkID', workID);
    const str = await handler.DoMethodReturnString('Port_SendMsgByBillInfo');
    return str;
  }
  /**
   * 发送消息
   * @param toEmpNos 发送给: zhangsan,lisi
   * @param title 标题
   * @param docs 内容
   * @param workID 工作ID
   * @returns 提示信息
   */
  public static async Port_SendMsgByFlowInfo(toEmpNos: string, title: string, docs: string, workID: number): Promise<String> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_TSDev2Interface');
    handler.AddPara('Title', title);
    handler.AddPara('Docs', docs);
    handler.AddPara('ToEmpNos', toEmpNos);
    handler.AddPara('WorkID', workID);
    const str = await handler.DoMethodReturnString('Port_SendMsgByFlowInfo');
    return str;
  }
}
