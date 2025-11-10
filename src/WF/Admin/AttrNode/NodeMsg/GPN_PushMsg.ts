import { GloWF } from '../../GloWF';
import { PushMsg } from './PushMsg';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { Node } from '/@/WF/TSClass/Node';

export class GPN_PushMsg extends PageBaseGroupNew {
  constructor() {
    super('GPN_PushMsg');
    this.PageTitle = '推送对象选择方式';
    this.ForEntityClassID = 'TS.WF.PushMsg';
  }
  public async Init() {
    this.AddGroup('A', '推送对象选择方式');
    this.AddBlank('TodoEmps', '当事人', this.TodoEmps);
    const nodeID = this.RefPKVal;
    const node = new Node(nodeID);
    await node.RetrieveFromDBSources();
    const flowNo = node.FK_Flow;
    const rpt = 'ND' + parseInt(flowNo) + 'Rpt';

    //表单字段. , 如何获得外部传来的参数
    //const srcGroup = `SELECT OID as No, Lab as Name from Sys_GroupField WHERE FrmID='ND${nodeID}'`;
    //const srcList = `SELECT KeyOfEn as No,Name,GroupID as GroupNo FROM Sys_MapAttr WHERE FK_MapData='${rpt}'`;
    this.SelectItemsByGroupList('Field', '表单上的字段作为接受对象', this.Field, false, GloWF.SQLOfPushMsgFields(nodeID), GloWF.SQLOfPushMsgSrcList(rpt));

    // this.SelectItemsByList('Field', '表单上的字段作为接受对象', this.Docs0);
    //const srcNodeList = "SELECT NodeID as No,  Name from WF_Node WHERE FK_Flow='" + flowNo + "'";
    this.SelectItemsByList('NodeWorker', '其他节点的处理人', this.NodeWorker, true, GloWF.SQLOfNodesOfFlow(flowNo));

    this.SelectItemsByTreeEns('SpecEmpNo', '发给指定的人', this.SpecEmpNo, true, GloWF.srcDepts, GloWF.srcDeptRoot, GloWF.srcEmps, '');
    this.AddBlank('Starter', '开始节点的发起人', this.Starter);
    this.TextSQL('BySQL', '按照SQL计算', this.BySQL, '请输入查询SQL语句', '', '请阅读帮助,注意格式.');
  }

  public async GenerSorts(): Promise<any[]> {
    const type = this.RequestVal('MsgModel');
    // alert(type);
    //节点模式.
    if (type == 'NodeMsg') {
      return Promise.resolve([
        // {
        //   No: 'WorkArrive',
        //   Name: '工作到达时',
        // },
        {
          No: 'SendWhen',
          Name: '当节点发送前',
        },
        {
          No: 'SendSuccess',
          Name: '节点发送成功时',
        },
        {
          No: 'ReturnAfter',
          Name: '当节点退回后',
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

    //流程模式.
    return Promise.resolve([
      {
        No: 'FlowOnCreateWorkID',
        Name: '创建工作ID后',
      },
      {
        No: 'FlowOverAfter',
        Name: '流程结束后',
      },
      {
        No: 'AfterFlowDel',
        Name: '流程删除后',
      },
      {
        No: 'FlowWarning',
        Name: '整体流程预警',
      },
      {
        No: 'FlowOverDue',
        Name: '整体流程逾期',
      },
    ]);
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    let nodeID = this.RequestVal('NodeID');
    if (!nodeID) nodeID = this.RequestVal('RefPKVal');

    //创建节点.
    const node = new Node(nodeID);

    const i = await node.RetrieveFromDBSources();
    if (i == 0) {
      node.NodeID = Number.parseInt(nodeID + '01');
      await node.RetrieveFromDBSources();
    }

    //执行创建.
    const en = new PushMsg();
    en.FlowNo = node.FK_Flow;
    en.NodeID = nodeID;
    en.RefPKVal = nodeID;
    en.EventNo = sortNo; //事件ID. WorkArrive.SendWhen
    en.EventName = await this.GetSortName(sortNo); //页面名称.

    en.PushWayExp1 = tb1;
    en.PushWayExp2 = tb2;
    // //实现的方式.
    // en.PushWayNo = pageNo;
    // en.PushWayName = this.GetSortName(pageNo);

    //设置不同的示例，让其打开的时候,能够不同类型的编辑.
    if (pageNo === 'TodoEmps') en.SetPara('EnName', 'TS.WF.NMGener'); //当事人
    if (pageNo === 'Starter') en.SetPara('EnName', 'TS.WF.NMGener'); //发起人.
    if (pageNo === 'Field') en.SetPara('EnName', 'TS.WF.NMField'); //按照表单字段值推送.
    if (pageNo === 'NodeWorker') en.SetPara('EnName', 'TS.WF.NMNodeWorker'); //指定节点的处理人.
    if (pageNo === 'SpecEmpNo') en.SetPara('EnName', 'TS.WF.NMSpecEmpNo'); //指定人员.
    if (pageNo === 'BySQL') en.SetPara('EnName', 'TS.WF.NMBySQL'); //按SQL计算.

    en.PushWayNo = pageNo; // 'TodoEmps'; //当事人.
    en.PushWayName = this.GetPageName(pageNo); // 'TodoEmps'; //当事人.

    //节点事件.
    if (en.EventNo === 'WorkArrive') {
      // enName = 'TS.WF.NMWorkArrive';
      en.PushWayNo = pageNo; // 'TodoEmps'; //当事人.
      if (pageNo === 'TodoEmps') en.PushWayName = '工作处理人';
      else en.PushWayName = this.GetPageName(pageNo);
      en.SMSDoc = '新工作到达';
    }

    if (en.EventNo === 'SendSuccess') {
      // enName = 'TS.WF.NMSendSuccess';
      en.PushWayNo = pageNo; //当事人.
      if (pageNo === 'TodoEmps') en.PushWayName = '下一步骤工作处理人';
      else en.PushWayName = this.GetPageName(pageNo);

      en.SMSDoc = '来自流程{FlowName}节点{NodeName}发送人{@WebUser.Name}的新工作{url}';
      en.MailTitle = '标题{Title}-发送人{@WebUser.Name}';
      en.MailDoc = '标题{Title}来自流程{FlowName}节点{NodeName}发送人{@WebUser.Name}的新工作{url}';
    }
    if (en.EventNo === 'ReturnAfter') {
      // enName = 'TS.WF.NMReturnAfter';
      en.PushWayNo = pageNo; //当事人.
      if (pageNo === 'TodoEmps') en.PushWayName = '退回的工作接收人';
      else en.PushWayName = this.GetPageName(pageNo);

      en.SMSDoc = '工作退回{Titile} - {url}';
      en.MailTitle = '工作退回,{Title}-退回人{@WebUser.Name}';
      en.MailDoc = '工作退回，标题{Title}来自流程{FlowName}节点{NodeName}退回人{@WebUser.Name} - {url}';
    }

    if (en.EventNo === 'UndoneAfter') {
      // enName = 'TS.WF.NMUndoneAfter';
      en.PushWayNo = pageNo; //当事人.
      if (pageNo === 'TodoEmps') en.PushWayName = '撤销前的工作处理人';
      else en.PushWayName = this.GetPageName(pageNo);

      en.SMSDoc = '工作被撤销{Titile} - {url}';
      en.MailTitle = '工作被撤销,{Title}-撤销人{@WebUser.Name}';
      en.MailDoc = '工作被撤销,标题{Title}来自流程{FlowName}节点{NodeName}撤销人{@WebUser.Name} - {url}';
    }
    if (en.EventNo === 'WhenReadWork') {
      //  enName = 'TS.WF.NMWhenReadWork';
      en.PushWayNo = pageNo; //当事人.
      if (pageNo === 'TodoEmps') en.PushWayName = '工作处理人';
      else en.PushWayName = this.GetPageName(pageNo);

      en.SMSDoc = '工作被读取{Titile} - {url}';
      en.MailTitle = '工作被读取,{Title}-读取人{@WebUser.Name}';
      en.MailDoc = '工作被读取,标题{Title}来自流程{FlowName}节点{NodeName}读取人{@WebUser.Name} - {url}';
    }
    // if (enName != 'TS.WF.NodeMsg') en.SetPara('EnName', enName);
    await en.Insert();
    // const url = '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.MyPK;
    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(en.GetParaString('EnName', ''), en.PKVal));
  }
  // 当事人
  public readonly TodoEmps = `
  #### 帮助
  - 定义: 当事人，就是操作流程后要影响的人，就叫当事人.
  - 退回: 退回给的人就是当事人.
  - 发送: 接收人就是当事人.
  - 移交: 被移交的人.
  - 撤销: 撤销前的处理人.
`;

  //表单字段.
  public readonly Field = `
#### 帮助
- 定义: 流程表单上的字段采集的操作员信息作为消息的接收人.
#### 解释
- 在节点表单上增加一个字段，该字段采集的是人员信息，如果有多个人员就用逗号分开.
- 系统在发送的时间，从NDxxRpt表里获取该字段的信息作为接收人.
`;

  //其他节点的处理人.
  public readonly NodeWorker = `
 #### 帮助
 - 定义: 选择一个或者多个节点，这个节点的处理人就是消息的接收人.
 - 注意: 选择的节点一定是当前节点以前的节点，不能选择未来的节点.
 #### 其它
 - 可以多选节点.
 `;

  //发给指定的人
  public readonly SpecEmpNo = `
  #### 帮助
  - 发送给指定人员，可以多选.
  #### 其它
  - 人员必须是组织结构里面的人员，就是Port_Emp表里的人员.
    
`;

  public readonly Starter = `
  #### 帮助
  - 向开始节点处理人发送消息.
  - 开始节点就是申请人、启动人.
`;
  public readonly BySQL = `
#### 帮助
 - 输入一个SQL查询语句, 返回的是No、Name两个列：人员编号、人员名称.
 - 这些账号必须在组织结构表里.
 - 系统就会发送给这些人.
 #### 其它
 - SQL语句支持ccbpm表达式.
 - 比如：发送给自己本部门的人员 select No,Name FROM Port_Emp where FK_Dept='@WebUser.DeptNo'
`;
}
