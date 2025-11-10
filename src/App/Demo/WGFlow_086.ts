import { WaiGuaBaseFlow } from '/@/bp/UIEntity/WaiGuaBaseFlow';
//流程外挂
export class WGFlow_086 extends WaiGuaBaseFlow {
  constructor() {
    super('WGFlow_086', '086'); //注册到 064模板的流程上.
  }
  override Init() {
    //根据不同的节点显示不同的按钮.
    if (this.NodeID == 8601) {
    }
    this.ToolbarMyFlow = 'Btn1'; //工作处理器上的按钮.
    this.ToolbarMyView = 'Btn1'; //工作查看器按钮.
    this.ToolbarMyCC = 'Btn1'; //工作抄送处理器.

    this.ToolbarSearchFlow = 'Btn1'; // 流程查询的按钮.
    this.SearchFlowRowBtns = 'Btn1,Btn2'; // 流程查询的按钮.
  }
  override BtnClick(srcEvent: string, btnName: string, _ids?: string) {
    alert(`srcEvent${srcEvent} Button Name:${btnName}, WorkID:${this.WorkID} NodeID:${this.NodeID} SelectIDs:${_ids}`);
    //  const url = GloComm.UrlGenerList('GL_Todolist');
    // return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  // 退回后.
  protected override ReturnAfter(): Promise<string | null> {
    const msg = `
  ##### 提示信息
  1. 成功激活了/src/App/Demo/WGFlow_064.ts 的 ReturnAfter 事件.
  `;
    return msg;
  }
  /**
   * 发送前事件
   * @returns 执行结果 err@ 开头是异常数据,异常以后就不执行发送动作.
   */
  protected override async SendWhen() {
    if (this.NodeID == 6401) {
      const msg = `
      ##### 提示信息
      1. 成功激活了/src/App/Demo/WGFlow_064.ts 的 SendWhen事件.
      2. 如果return err@xxxxxxx 则流程不向下发送.
      3. 可以在该方法里写ts事件阻止发送动作.
      `;
      return msg; // this.GenerInfo();
      // if (!this.FrmBodyJson['Dao']) return 'err@日期到不能为空';
      // if (this.FrmBodyJson['TianShu'] == '0') return 'err@请输入请假天数';
      // if (!this.FrmBodyJson['BeiZhu']) return 'err@请输入备注';
    }
    return '';
  }

  // 发送成功
  protected override async SendSuccess(): Promise<string | null> {
    const msg = `
      1. 成功激活了/src/App/Demo/WGFlow_064.ts 的 SendSuccess 事件.
      2. 可以在该事件里调用api接口，实现更改状态、执行过程能业务操作.
      `;
    return msg;
  }
  // 退回前.
  protected override ReturnBefore(): Promise<string | null> {
    const msg = `
    ##### 提示信息
    1. 成功激活了/src/App/Demo/WGFlow_064.ts 的 ReturnBefore 事件.
    2. 如果返回 err@xxxxxxx , 则系统提示错误信息，并阻止退回.
    `;
    return msg;
  }
  /**
   * 流程结束后
   */
  protected override async FlowOverAfter() {
    const msg = `
      1. 成功激活了/src/App/Demo/WGFlow_064.ts 的 FlowOverAfter 事件.
      2. 可以编写业务逻辑实现对
      `;
    return msg;
  }
  protected override FrmLoadBefore(): Promise<string | null> {
    // return null;
    const msg = `
    ##### 提示信息
    1. 成功激活了/src/App/Demo/WGFlow_064.ts 的 FrmLoadBefore 事件.
    2. 在该时间里可以改变  this.FrmBodyJson['xxxxxx'] 的值用于显示在表单上.
    `;
    return msg;
  }
  protected override FrmLoadAfter(): Promise<string | null> {
    const msg = `
    ##### 提示信息
    1. 成功激活了/src/App/Demo/WGFlow_064.ts 的 FrmLoadAfter 事件.
    `;
    return msg;
  }

  //定义一个方法，获得环境信息.
  public async GenerInfo(): Promise<string> {
    const msg = `
    %%%%% 环境信息 %%%%%
    1.获得表单数据:
      日期从：${this.FrmBodyJson['RiQiCong']} 到 ${this.FrmBodyJson['Dao']} 
      请假类型ID: ${this.FrmBodyJson['QingJiaLeiXing']}, 请假类型ID: ${this.FrmBodyJson['QingJiaLeiXingT']}
    2.流程信息:
       流程编号: ${this.FlowNo},WorkID: ${this.WorkID}, 停留节点ID:${this.NodeID}. 
    3. 当前操作员信息:
       登录人员账号: ${WebUser.No}, 名称: ${WebUser.Name}, 部门编号: ${WebUser.DeptNo}, 部门名称: ${WebUser.DeptName}
    `;
    return msg;
  }
}
