import { GloComm } from '../WF/Comm/GloComm';
import HttpHandler from '../utils/gener/HttpHandler';

/// 通用功能
export class GenerFuncs {
  /**
   * 调用发起流程
   * @returns 发起流程
   */
  public static Menu_Start() {
    const url = GloComm.UrlGenerList('GL_Start');
    return url;
  }

  /**
   * 发起指定的流程
   * @param flowName 流程名称
   * @returns 返回执行结果
   */
  public static Menu_Start_SpecFlow(flowName: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI_Copilot');
    handler.AddPara('Words', flowName);
    const data = handler.DoMethodReturnString('Menu_Start_SpecFlow');
    const url = GloComm.UrlMyFlow + '&FlowNo=' + data;
    return url;
    //    return '发起流程.' + flowName;
  }

  /**
   * 启动待办
   * @returns 待办
   */
  public static Menu_Todolist() {
    const url = GloComm.UrlGenerList('GL_Todolist');
    return url;
  }
  /**
   * 打开待办
   * @param idx 第几条待办
   * @returns  打开工作处理器.
   */
  public static Menu_Todolist_Idx(idx: number) {
    return '待办' + idx;
  }
}
