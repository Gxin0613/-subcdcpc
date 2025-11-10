import { message } from 'ant-design-vue';
import { SysEvent } from './SysEvent';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import DBAccess from '/@/utils/gener/DBAccess';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '/@/WF/Comm/GloComm';
import { Node } from '/@/WF/TSClass/Node';

export class GPN_Event extends PageBaseGroupNew {
  constructor() {
    super('GPN_Event');
    this.ForEntityClassID = 'TS.Sys.SysEvent';
    this.PageTitle = '新建事件';
  }

  public async Init() {
    // this.AddGroup('Z', '新建事件'); //增加分组.
    // this.AddFunction('ToUrl1', '创建事件', this.GenerDBSrc);

    // this.AddGroup('F', '事件类型'); //增加分组.
    // const ids = await this.MyGenerSorts();
    // debugger; //@yln. 如何循环增加.
    // for (let index = 0; index < ids.length; index++) {
    //   const element = ids[index];
    //   this.AddBlank('MyEvent_' + element.No, element.Name, this.HelpUn);
    // }

    if (this.RefMainEnName === 'TS.WF.Template.FlowExt') {
      this.AddGroup('FlowExt', '流程事件');
      this.AddBlank('FlowOnCreateWorkID', '创建工作ID后', this.HelpUn);
      this.AddBlank('FlowOverBefore', '流程结束前', this.HelpUn);
      this.AddBlank('FlowOverAfter', '流程结束后', this.HelpUn);
      this.AddBlank('BeforeFlowDel', '流程删除前', this.HelpUn);
      this.AddBlank('AfterFlowDel', '流程删除后', this.HelpUn);
      return;
    }

    if (this.RefMainEnName === 'TS.WF.Template.NodeExt') {
      this.AddGroup('NodeExt', '节点事件');
      this.AddBlank('WorkArrive', '工作到达', this.HelpUn);
      this.AddBlank('SendWhen', '当节点发送前', this.HelpUn);
      this.AddBlank('SendSuccess', '节点发送成功时', this.HelpUn);
      this.AddBlank('SendError', '节点发送失败时', this.HelpUn);
      this.AddBlank('ReturnAfter', '退回后', this.HelpUn);
      this.AddBlank('ReturnThisNode', '退回到当前节点后', this.HelpUn);
      this.AddBlank('UndoneBefore', '当节点撤销发送前', this.HelpUn);
      this.AddBlank('UndoneAfter', '当节点撤销发送后', this.HelpUn);
      this.AddBlank('WhenReadWork', '工作打开后', this.HelpUn);
      return;
    }

    if (this.RefMainEnName === 'TS.Frm.MapDtlExt') {
      this.AddGroup('MapDtlExt', '从表事件');
      this.AddBlank('DtlRowSaveBefore', '从表行保存前', this.HelpUn);
      this.AddBlank('DtlRowSaveAfter', '从表行保存后', this.HelpUn);
      this.AddBlank('DtlRowDelBefore', '从表行删除前', this.HelpUn);
      this.AddBlank('DtlRowDelAfter', '从表行删除后', this.HelpUn);
      return;
    }

    if (this.RefMainEnName === 'TS.Frm.FrmBill') {
      this.AddGroup('FrmBill', '单据事件');
      this.AddBlank('OverBefore', '归档前', this.HelpUn);
      this.AddBlank('OverAfter', '归档后', this.HelpUn);
      this.AddBlank('CheckStart', '启动审核', this.HelpUn);
      this.AddBlank('CheckOver', '审核结束后', this.HelpUn);
      this.AddBlank('UnSend', '撤销审核', this.HelpUn);
      this.AddBlank('Reback', '回滚前', this.HelpUn);
      this.AddBlank('FrmLoadBefore', '表单载入前', this.HelpUn);
      this.AddBlank('FrmLoadAfter', '节点表单载入后', this.HelpUn);
      this.AddBlank('SaveBefore', '当表单保存前', this.HelpUn);
      this.AddBlank('SaveAfter', '当表单保存后', this.HelpUn);
      this.AddBlank('DeleteBefore', '当表单删除前', this.HelpUn);
      this.AddBlank('DeleteAfter', '当表单删除后', this.HelpUn);
      this.AddBlank('DtlRowSaveBefore', '从表保存前', this.HelpUn);
      return;
    }

    this.AddGroup('Frm', '表单事件');
    this.AddBlank('FrmLoadBefore', '表单载入前', this.HelpUn);
    this.AddBlank('FrmLoadAfter', '表单载入后', this.HelpUn);
    this.AddBlank('SaveBefore', '当表单保存前', this.HelpUn);
    this.AddBlank('SaveAfter', '当表单保存后', this.HelpUn);
    this.AddBlank('DeleteBefore', '当表单删除前', this.HelpUn);
    this.AddBlank('DeleteAfter', '当表单删除后', this.HelpUn);
    return;

    // this.AddGroup('A', '新建事件(废)'); //增加分组.
    // this.TextSQL('2', '数据源模式', this.Docs0, '输入过程名称:', '', '比如:excec mypro');
    // this.SelectItemsByList('7', '业务单元-BuessUnit', this.BuessUnit, false, await this.GenerBuessUnit());
    // this.SelectItemsByGroupList('9', '执行自定义过程', this.SFProc, false, GloWF.srcDBSrc, GloWF.srcSFProc);
    // this.SelectItemsByList('6', '事件类-EventBase', this.BuessUnit, false, await this.GenerEventBase());
    // this.TextBox1_Name('8', '执行WebApi', this.WebApi, '请求接口名称', '我的WebApi接口', '比如:执行付款,修改成删除状态');
    // this.AddGroup('B', '数据源管理'); //增加分组.
    // //调用执行方法.
    // this.AddFunction('ToUrl', '数据源维护ToUrl', this.AdminDBSrc);

    // this.SelectItemsByList('7', '业务单元-BuessUnit', this.BuessUnit, false, await this.GenerUnit());
    // this.TextBox1_Name('3', '执行URL', this.Docs4, '输入URL', 'http://xxxx.xxx.xxx.xxx', '请输入url');
  }
  public async GenerDBSrc() {
    const url = GloComm.UrlSearch('TS.Sys.SFDBSrc');
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  ///业务单元.
  public async GenerBuessUnit() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionDtl_Init');
    return JSON.stringify(data);
  }
  //事件类.
  public async GenerEventBase() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionEventBase_Init');
    return JSON.stringify(data);
  }

  public async AdminDBSrc() {
    const url = GloComm.UrlSearch('TS.Sys.SFDBSrc');
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const nodeID = this.RequestVal('RefPKVal');
    //执行创建.
    const en = new SysEvent();
    en.FK_DBSrc = '无';
    en.EventSource = 1; //节点事件.
    en.RefPKVal = nodeID; // 节点ID,表单ID.
    en.EventID = sortNo; //事件ID.SendWhen,SendErr 事件.
    en.EventName = await this.GetSortName(sortNo); //事件名称.
    en.EventDoTypeT = await this.GetSortName(sortNo); //事件名称.

    if (this.RefMainEnName.includes('TS.Frm.MapFrmFool')) en.EventSource = 0;
    if (this.RefMainEnName.includes('TS.WF.Template.Frm')) en.EventSource = 0;
    if (this.RefMainEnName.includes('TS.CCBill.FrmDict')) en.EventSource = 0;
    if (this.RefMainEnName.includes('TS.CCBill.FrmEntityNoName')) en.EventSource = 0;
    if (this.RefMainEnName.includes('TS.CCBill.FrmBill')) en.EventSource = 0;
    if (this.RefMainEnName === 'TS.WF.Template.NodeExt') en.EventSource = 1;
    if (this.RefMainEnName === 'TS.WF.Template.FlowExt') en.EventSource = 2;
    if (this.RefMainEnName === 'TS.Frm.MapDtlExt') en.EventSource = 0;

    en.EventDoType = pageNo; //存储过程/事件类?.
    en.EventName = this.GetPageName(pageNo); //执行类型名称.
    en.DoDoc = tb2;
    //表单事件.
    if (en.EventSource == 0) {
      en.FrmID = this.RefPKVal;
    }

    //是节点的时候.
    if (en.EventSource == 1) {
      const node = new Node(this.RefPKVal);
      await node.Retrieve();
      if (node.NodeFrmID === '' || node.NodeFrmID.lastIndexOf('ND') == 0) en.FrmID = 'ND' + parseInt(node.FK_Flow) + 'Rpt';
      else en.FrmID = node.NodeFrmID;
      en.NodeID = node.NodeID;
      en.FlowNo = node.FK_Flow;
      en.RefFlowNo = node.FK_Flow;
    }
    //流程事件.
    if (en.EventSource == 2) {
      en.FrmID = 'ND' + parseInt(this.RefPKVal) + 'Rpt';
      en.FK_Flow = this.RefPKVal;
      en.RefFlowNo = this.RefPKVal;
    }

    const enName = 'TS.Sys.SysEvent';

    en.EventID = pageNo;
    en.EventName = this.GetPageName(pageNo);

    //判断改事件，是否存在？如果存在就拒绝执行.
    let mypk = 'xx';
    if (en.EventSource == 0) mypk = en.FrmID + '_' + pageNo;
    if (en.EventSource == 1) mypk = en.NodeID + '_' + pageNo;
    if (en.EventSource == 2) mypk = en.FlowNo + '_' + pageNo;

    en.MyPK = mypk;
    const num = await en.RetrieveFromDBSources();
    if (num == 0) {
      await en.Insert();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enName, en.MyPK));
    }
    message.info('该事件已经存在，不需要重复添加.');
    return;
  }
  public readonly WebApi = `
  #### 帮助
  - 执行WebApi定义的逻辑业务.
  #### Demo
  - 设置的: http://192.168.10:1000/xx?JinE=@JinE
  - 系统执行的: http://192.168.10:1000/xx?JinE=1001&WrokID=1000&FlowNo=009&NodeID=905&Token=xxxxxx
  - 说明：系统就会自动补充上系统参数. WorkID,FlowNo,NodeID,Token 数据.
  -  如果配置了@+字段名,系统就会自动替换下来.
  #### 返回值约定
  - err@xxxxxx 错误信息，抛出的异常信息.
  - info@xxxxx 执行成功的信息.
  - 其他的信息，系统也会提示出来按照info@计算。
`;

  public readonly SFProc = `
  #### 帮助
  - 执行在后台封装好的过程.
`;

  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
  - 请选择数据库类型的数据源。
  - 在执行内容里填写一个存储过程名称，注意表达式支持变量。如： EXEC YourProName @OID
  #### 运行图例
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/StoreProcedure.png "屏幕截图.png")  
`;

  // 业务单元.
  public readonly BuessUnit = `
#### 帮助
- ccbpm提供了一个让后台开发人员使用的代码表达业务逻辑实现的方式,业务单元是其中的一种.
- 定义: 处理一段业务逻辑脚本, 我们称为业务单元,比如:付款,出库. 
- 这个业务模块有通用性,可以被很多流程所调用,我们把它封装为一个业务单元.
- 这个代码块从一个基类上继承下来（BP.Sys.BuessUnitBase）. 按照要求重写方法. 
- 在配置的时候，ccbpm通过基类的反射功能，放入到下拉框，方便流程设计人员进行选择配置.
#### DEMO
- 定义一个子类，如下图:
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/UnitDemo.png "屏幕截图.png")  
- 在BP类里定义一个业务单元类 如下图中的 出库信息初始化 BuessUnitFrmND1407 ，继承自 BP.Sys.BuessUnitBase
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/BuessUnitBase.Java.png "屏幕截图.png")  
- 在后台选择这个类配置到表单事件中。
`;

  //事件类
  public readonly Event = `
#### 帮助
- 首先要写一个子类，从指定的基类上集成下来.
- 1. for c# 改基类为：BP.WF.FlowEventBase， 请参考文档尾部的代码模板。
- 2. for java 改基类为: bp.wf.FlowEventBase ， 请参考文档尾部的代码模板。
- 3. 在子类里重写这些事件, 利用这些事件完成您的业务逻辑。
`;

  public readonly Docs4 = `
#### 帮助
- 返回一行数据的json格式的数据源.
- 在执行内容里设置一个http://myserver/Do.aspx?DoType=aaaaa，创建一个Do.aspx 根据DoType 标记这不同的内容处理。
- 如果顺利处理了就返回空，出现异常一定要返回: Error+”异常信息。”
- 处理返回值用: this.Response.Write("Error:"+msg); 方法.
- Ccform 处理的机制是，使用 HttpWebRequest 类静默的执行URL ,然后获取返回的内容。如果检查到前几个字符是Error 就认为是异常ccform 就会抛出异常。
#### 系统参数：
- 您定义的url比如为 /App/DoUrl.aspx?ABC=123 , 系统会在之后增加一些参数，这些参数叫系统参数。实际执行的url为。
- http://yourserver/App/DoUrl.aspx?ABC=123&UserNo=xy&SID=xxxxx&FK_Dept=1010&FK_Unit=10&EntityName=ND101&EntityPK=OID&EntityPKVal=12333& FK_Event=xxxxxx
`;

  public async GenerSorts(): Promise<any[]> {
    return [];
  }

  public async MyGenerSorts(): Promise<any[]> {
    //流程.
    if (this.RefMainEnName === 'TS.WF.Template.FlowExt') {
      return Promise.resolve([
        {
          No: 'FlowOnCreateWorkID',
          Name: '创建工作ID后',
        },
        {
          No: 'FlowOverBefore',
          Name: '流程结束前',
        },
        {
          No: 'FlowOverAfter',
          Name: '流程结束后',
        },
        {
          No: 'BeforeFlowDel',
          Name: '流程删除前',
        },
        {
          No: 'AfterFlowDel',
          Name: '流程删除后',
        },
      ]);
    } //流程.

    //节点.
    if (this.RefMainEnName === 'TS.WF.Template.NodeExt') {
      return Promise.resolve([
        {
          No: 'FlowOnCreateWorkID',
          Name: '创建流程实例时',
        },
        {
          No: 'WorkArrive',
          Name: '工作到达',
        },
        {
          No: 'SendWhen',
          Name: '当节点发送前',
        },
        {
          No: 'SendSuccess',
          Name: '节点发送成功时',
        },
        {
          No: 'SendError',
          Name: '节点发送失败时',
        },
        {
          No: 'ReturnBefore',
          Name: '当节点退回前',
        },
        {
          No: 'ReturnAfter',
          Name: '退回后',
        },
        {
          No: 'ReturnThisNode',
          Name: '退回到当前节点后',
        },
        {
          No: 'UndoneBefore',
          Name: '当节点撤销发送前',
        },
        {
          No: 'UndoneAfter',
          Name: '当节点撤销发送后',
        },
        {
          No: 'WhenReadWork',
          Name: '工作打开后',
        },
      ]);
    }
    //从表
    if (this.RefMainEnName === 'TS.Frm.MapDtlExt') {
      return Promise.resolve([
        {
          No: 'DtlRowSaveBefore',
          Name: '从表保存前',
        },
        {
          No: 'DtlRowSaveAfter',
          Name: '从表保存后',
        },
        {
          No: 'DtlRowDelBefore',
          Name: '从表删除前',
        },
        {
          No: 'DtlRowDelAfter',
          Name: '从表删除后',
        },
      ]);
    }
    //从表
    //单据.
    if (this.RefMainEnName === 'TS.CCBill.FrmBill') {
      //是一个表单.
      return Promise.resolve([
        {
          No: 'OverBefore',
          Name: '归档前',
        },
        {
          No: 'OverAfter',
          Name: '归档后',
        },
        {
          No: 'CheckStart',
          Name: '启动审核',
        },
        {
          No: 'CheckOver',
          Name: '审核结束后',
        },
        {
          No: 'UnSend',
          Name: '撤销审核',
        },
        {
          No: 'Reback',
          Name: '回滚前',
        },
        {
          No: 'FrmLoadBefore',
          Name: '表单载入前',
        },
        {
          No: 'FrmLoadAfter',
          Name: '节点表单载入后',
        },
        {
          No: 'SaveBefore',
          Name: '当表单保存前',
        },
        {
          No: 'SaveAfter',
          Name: '当表单保存后',
        },
        {
          No: 'DeleteBefore',
          Name: '当表单删除前',
        },
        {
          No: 'DeleteAfter',
          Name: '当表单删除后',
        },
      ]);
    }

    //是一个表单.
    return Promise.resolve([
      {
        No: 'FrmLoadBefore',
        Name: '表单载入前',
      },
      {
        No: 'FrmLoadAfter',
        Name: '节点表单载入后',
      },
      {
        No: 'SaveBefore',
        Name: '当表单保存前',
      },
      {
        No: 'SaveAfter',
        Name: '当表单保存后',
      },
      {
        No: 'DeleteBefore',
        Name: '当表单删除前',
      },
      {
        No: 'DeleteAfter',
        Name: '当表单删除后',
      },
    ]);

    // alert('没有判断的类型:' + this.RefDtlEnName);
    // alert(this.RefMainEnName);

    return Promise.resolve([]);
  }
}
