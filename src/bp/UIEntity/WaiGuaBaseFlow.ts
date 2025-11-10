import { message } from 'ant-design-vue';
import { WaiGuaBaseFrm } from './WaiGuaBaseFrm';

export abstract class WaiGuaBaseFlow extends WaiGuaBaseFrm {
  /**
   * @param classID 类名
   * @param flowNo 流程编号或流程标记.
   */
  protected constructor(classID: string, flowNo: string) {
    if (classID.includes('WGFlow_') == false) {
      message.warning('外挂类名[' + classID + ']不符合规范,必须是以 WGFlow_ 开头.');
      return;
    }
    super(classID);
    this.FlowNo = flowNo;
  }
  //初始化数据.
  abstract Init();

  /** 按钮点击事件 */
  abstract BtnClick(srcEvent: string, btnName: string, _ids?: string);

  //工作ID.
  public WorkID?: number;
  public FlowNo?: string; //流程编号.
  public NodeID?: number; //当前节点ID.
  public ToolbarMyFlow?: string; //处理页面按钮
  public ToolbarMyView?: string; //查看页面按钮
  public ToolbarMyCC?: string; //抄送页面按钮
  public ToolbarSearchFlow?: string; //查询页面按钮
  public SearchFlowRowBtns?: string; // 行按钮
  /**
   * 创建工作ID后
   * @returns 执行的消息
   */
  public async FlowOnCreateWorkID(): Promise<string | null> {
    return null;
  }
  /**
   * 流程结束前
   * @returns 执行的消息
   */
  public async FlowOverBefore(): Promise<string | null> {
    return null;
  }
  /**
   * 流程结束后
   * @returns 执行的消息
   */
  public async FlowOverAfter(): Promise<string | null> {
    return null;
  }
  /**
   * 流程删除前
   * @returns 执行的消息
   */
  public async BeforeFlowDel(): Promise<string | null> {
    return null;
  }
  /**
   * 流程删除后
   * @returns 执行的消息
   */
  public async AfterFlowDel(): Promise<string | null> {
    return null;
  }
  /**
   * 发送前
   * @returns 执行的消息
   */
  public async SendWhen(): Promise<string | null> {
    return null;
  }
  /**
   * 发送错误
   * @returns 执行的消息
   */
  public async SendError(): Promise<string | null> {
    return null;
  }
  /**
   * 发送成功
   * @returns 执行的消息
   */
  public async SendSuccess(): Promise<string | null> {
    return null;
  }
  /**
   * 退回前
   * @returns 执行的消息
   */
  public async ReturnBefore(): Promise<string | null> {
    return null;
  }
  /**
   * 退回后
   * @returns 执行的消息
   */
  public async ReturnAfter(): Promise<string | null> {
    return null;
  }
  /**
   * 撤销前
   * @returns 执行的消息
   */
  public async UndoneBefore(): Promise<string | null> {
    return null;
  }
  /**
   * 撤消后
   * @returns 执行的消息
   */
  public async UndoneAfter(): Promise<string | null> {
    return null;
  }

  /**
   * 第一次读取工作时
   * @returns 执行的消息
   */
  public async WhenReadWork(): Promise<string | null> {
    return null;
  }
  /**
   * 移交前
   * @returns 执行的消息
   */
  public async ShiftBefore(): Promise<string | null> {
    return null;
  }
  /**
   * 移交后
   * @returns 执行的消息
   */
  public async ShiftAfter(): Promise<string | null> {
    return null;
  }
}
