import { WinDocModel } from '../Admin/WinDocModel';
import { WindowTemplate } from '../Admin/WindowTemplate';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_WindowDBSrc extends PageBaseGroupNew {
  constructor() {
    super('GPN_WindowDBSrc');
    this.PageTitle = '数据源向导';
  }

  public async Init() {
    this.AddGroup('A', '新建窗体'); //增加分组.
    this.SelectItemsByList('SelectType', '选择数据源', this.BuessUnit, false, this.selectChartType());
    this.SelectItemsByList('SelectType.Table', '表', this.BuessUnit, false, this.selectChartType());

    this.SelectItemsByList('SelectType.Table.ChartType', '选择图表类型', this.BuessUnit, false, this.selectChartType());
    // 查询需要的字段
    const AttrsSQL = GloWF.SQLOfWindowDBSrcAttrsSQL(this.RequestVal('FrmID')); //`SELECT KeyOfEn as No,Name FROM Sys_MapAttr WHERE MyDataType IN (2,3,5,8) AND LGType=0 AND FK_MapData='${this.RequestVal('FrmID')}'`;
    this.SelectItemsByList('SelectType.NumFiled', '分析数据', this.BuessUnit, false, AttrsSQL);

    const AttrsSQL1 = GloWF.SQLOfWindowDBSrcAttrsSQL1(this.RequestVal('FrmID')); //`SELECT KeyOfEn as No,Name FROM Sys_MapAttr WHERE MyDataType IN (2,1) AND LGType in (1,2) AND FK_MapData='${this.RequestVal('FrmID')}'`;
    this.SelectItemsByList('SelectType.NumFiled.Group', '分析内容', this.BuessUnit, false, AttrsSQL1);
  }

  // 选择图表类型
  public selectChartType() {
    return JSON.stringify([
      { No: WinDocModel.ChartLine, Name: '折线图' },
      { No: WinDocModel.ChartPie, Name: '饼状图' },
      { No: WinDocModel.ChartZZT, Name: '柱状图' },
      { No: WinDocModel.ChartRate, Name: '百分比扇形图' },
      { No: WinDocModel.ChartRing, Name: '环形图' },
    ]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (pageNo != 'SelectType.NumFiled.Group') return;

    const frmID = this.RequestVal('RefPKVal');
    const en = new WindowTemplate();
    en.SetPara('EnName', enName);
    await en.Insert();

    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enName, en.MyPK));
  }
  public readonly WebApi = `
  #### 帮助
  - 执行定义的过程.
  - 系统将把表单数据主表从表，都会写入到接口里面去.
`;

  public readonly SFProc = `
  #### 帮助
  - 执行定义的过程.
  - 系统将把表单数据主表从表，都会写入到接口里面去.
`;

  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
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
#### DEMO.
- 定义一个子类，如下图:
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/UnitDemo.png "屏幕截图.png")  
- 在BP类里定义一个业务单元类 如下图中的 出库信息初始化 BuessUnitFrmND1407 ，继承自 BP.Sys.BuessUnitBase
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/BuessUnitBase.Java.png "屏幕截图.png")  
- 在后台选择这个类配置到表单事件中。

#### 配置图例
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/Event.png "屏幕截图.png")  
#### 配置图例
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/Event1.png "屏幕截图.png")  
#### 事件存储
 所有的事件配置信息都存储在Sys_FrmEvent表里。
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/Eventcc.png "屏幕截图.png")  
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
        {
          No: 'ShiftBefore',
          Name: '移交前',
        },
        {
          No: 'ShiftAfter',
          Name: '移交后',
        },
      ]);
    } //流程.

    //是一个表单.
    if (this.RefMainEnName === 'TS.Frm.MapFrmFool') {
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
    } //结束表单.

    // alert('没有判断的类型:' + this.RefDtlEnName);
    // alert(this.RefMainEnName);

    return Promise.resolve([]);
  }
}
