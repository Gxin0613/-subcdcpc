import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { NodeAttr } from '/@/WF/TSClass/Node';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { BtnAttr, BtnLab } from './BtnLab';
import { GPE_FrmSln } from './FrmSln/GPE_FrmSln';
import { GPE_AccepterRole } from './AccepterRole/GPE_AccepterRole';
import { GPE_TurnTo } from './TurnTo/GPE_TurnTo';
import { GPE_TodolistModel } from '/@/WF/Admin/AttrNode/TodolistModel/GPE_TodolistModel';
import { NodeToolbarAttr, NodeToolbars } from './NodeToolbar';
import { GPE_BatchRole } from './BatchRole/GPE_BatchRole';
import { GPE_EvaluationRole } from './EvaluationRole/GPE_EvaluationRole';
import { SubFlowAttr, SubFlows } from './SubFlow/SubFlow';
import { GPE_OvertimeRole } from './OvertimeRole/GPE_OvertimeRole';
import { GPE_FrmSummaryField } from './FrmSummaryField/GPE_FrmSummaryField';
import { GPE_FrmTransfer } from './FrmTransfer/GPE_FrmTransfer';
import { PushMsgAttr, PushMsgs } from './NodeMsg/PushMsg';
import { GPE_BlockModel } from './BlockModel/GPE_BlockModel';
import { GloWF } from '/@/WF/Admin/GloWF';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPE_CCWriteRole } from '/@/WF/Admin/AttrNode/CCRole/GPE_CCWriteRole';
import { Conds } from '../Cond2020/Cond';
import { GL_Event } from '../FrmLogic/MapData/FrmEvent/GL_Event';
// 属性列表
export class NodeExtAttr extends NodeAttr {}

// 节点属性
export class NodeExt extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Template.NodeExt', 'BP.WF.Template.NodeExt');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '节点属性');
    map.EnClassID = this.classID;
    map.GroupBarShowModel = 0;

    map.AddGroupAttr('基本属性');
    map.AddTBIntPK(NodeExtAttr.NodeID, 0, '节点ID', true);
    //#region  基础属性
    //map.AddTBIntPK(NodeAttr.NodeID, 0, "节点ID", true, true);
    // map.SetHelperUrl(NodeAttr.NodeID, "http://ccbpm.mydoc.io/?v=5404&t=17901");
    map.SetHelperUrl(NodeAttr.NodeID, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3576080&doc_id=31094');

    //map.SetHelperAlert(NodeAttr.Step, "它用于节点的排序，正确的设置步骤可以让流程容易读写."); //使用alert的方式显示帮助信息.
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', false, false, 0, 5, 10);
    map.AddTBString(NodeAttr.FlowName, null, '流程名', false, true, 0, 200, 10);

    map.AddTBString(NodeAttr.Name, null, '名称', true, true, 0, 100, 10, false);
    map.SetHelperAlert(NodeAttr.Name, '修改节点名称时如果节点表单名称为空着节点表单名称和节点名称相同，否则节点名称和节点表单名称可以不相同');

    map.AddDDLSysEnum(NodeAttr.WhoExeIt, 0, '谁执行它', true, true, NodeAttr.WhoExeIt, '@0=操作员执行@1=机器执行@2=混合执行');
    map.SetHelperUrl(NodeAttr.WhoExeIt, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3576195&doc_id=31094');

    map.AddDDLSysEnum(NodeAttr.ReadReceipts, 0, '已读回执', true, true, NodeAttr.ReadReceipts, '@0=不回执@1=自动回执@2=由上一节点表单字段决定@3=由SDK开发者参数决定');
    map.SetHelperUrl(NodeAttr.ReadReceipts, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3882411&doc_id=31094');

    // 撤销规则.
    const str1 = '@0=上一步可以撤销@1=不能撤销@2=上一步与开始节点可以撤销@3=指定的节点可以撤销';
    map.AddDDLSysEnum(NodeAttr.CancelRole, 0, '撤销规则', true, true, NodeAttr.CancelRole, str1);
    map.AddBoolean(NodeAttr.CancelDisWhenRead, false, '对方已经打开就不能撤销', true, true);
    map.SetHelperUrl(NodeAttr.CancelRole, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3576276&doc_id=31094');
    map.AddTBString(NodeAttr.CancelNodes, null, '可撤销的节点', true, false, 0, 200, 50, true);

    //map.AddBoolean(NodeAttr.IsTask, true, "允许分配工作否?", true, true, false, "http://ccbpm.mydoc.io/?v=5404&t=17904");
    //map.AddBoolean(NodeAttr.IsExpSender, true, "本节点接收人不允许包含上一步发送人", true, true, false);
    //map.AddBoolean(NodeAttr.IsRM, true, "是否启用投递路径自动记忆功能?", true, true, false, "http://ccbpm.mydoc.io/?v=5404&t=17905");
    map.AddBoolean(NodeAttr.IsOpenOver, false, '已阅即完成?', true, true);
    map.SetHelperUrl(NodeAttr.IsOpenOver, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3653663&doc_id=31094');

    const help1 = `
    #### 定义
    - 所谓的可逆节点，Reversible Node，就是双向箭头节点，可以重复执行的节点. 
    - 当一个节点，被运动了1次+，它就是可逆节点，因为它被重复发送了.
    - 第一次，按照接收人规则接收人有a,b,c三个人. 如果再发送回来，需要重新计算接收人就true,
    不需要重新计算接收人，把当事人做为接收人就是 false.
    #### 应用场景
    - 流程图
    - 节点A，节点B是双线箭头.
    `;
    map.AddBoolean(NodeAttr.IsResetAccepter, false, '可逆节点时重新计算接收人?', true, true, false, help1);

    //为铁路局,会签子流程. 增加
    const IsSendDraftSubFlow = '如果有启动的草稿子流程，是否发送它们？';
    map.AddBoolean(NodeAttr.IsSendDraftSubFlow, false, '是否发送草稿子流程?', true, true, true, IsSendDraftSubFlow);
    //map.AddBoolean(NodeAttr.IsToParentNextNode, false, "子流程运行到该节点时，让父流程自动运行到下一步", true, true, true);

    map.AddBoolean(
      NodeAttr.IsGuestNode,
      false,
      '是否是外部用户执行的节点(非组织结构人员参与处理工作的节点)?',
      true,
      true,
      true,
      'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661834&doc_id=31094',
    );

    map.AddBoolean(NodeAttr.IsYouLiTai, false, '该节点是否是游离态', true, true);
    map.SetHelperUrl(NodeAttr.IsYouLiTai, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3653664&doc_id=31094');

    map.AddBoolean(NodeAttr.WaitIframeMsg, false, '是否等待嵌入式表单消息', true, true, false);
    map.SetHelperUrl(NodeAttr.WaitIframeMsg, '[适用于嵌入式表单]如果集成的页面需要预处理部分逻辑，那么需要开启此项，等待集成的页面处理完成后，才继续执行工具栏按钮');

    map.AddBoolean(NodeAttr.AllowMultipleEditors, false, '是否允许多人编辑', true, true, false);
    map.SetHelperUrl(NodeAttr.AllowMultipleEditors, '对于需要多人处理的表单，可开启此选项，实现类似腾讯文档共同编辑的效果，需要设置为抢办模式');

    map.AddTBString(NodeAttr.FocusField, null, '焦点字段', true, false, 0, 50, 10, false);
    map.SetHelperUrl(NodeAttr.FocusField, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3653665&doc_id=31094');

    //节点业务类型.
    // map.AddTBInt("NodeAppType", 0, "节点业务类型", false, false);
    map.AddTBInt('FWCSta', 0, '节点状态', false, false);
    map.AddTBInt('FWCAth', 0, '审核附件是否启用', false, false);

    //map.AddTBInt(NodeAttr.DeliveryWay, 0, '接受人规则', false, false);

    map.AddTBString(NodeAttr.SelfParas, null, '自定义属性', true, false, 0, 500, 10, true);
    map.SetHelperUrl(NodeAttr.SelfParas, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3653666&doc_id=31094');

    map.AddTBInt(NodeAttr.Step, 0, '步骤(无计算意义)', true, false);
    map.SetHelperUrl(NodeAttr.Step, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3576085&doc_id=31094');

    map.AddTBString(NodeAttr.Tip, null, '操作提示', true, false, 0, 100, 10, false, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3653667&doc_id=31094');
    // #endregion  基础属性

    const HelpIsSSS = `
    #### 帮助
    - 该属性是对于该节点上有多个人处理有效。
    - 比如：A发送到B，B节点上有张三、李四、王五可以处理，您可以指定1个或者多个人处理B节点上的工作。
    `;
    map.AddBoolean(NodeAttr.IsTask, false, '是否允许分配人员?', true, true, true, HelpIsSSS);
    const HelpIsRememme = `
    #### 帮助
    - 该属性是对于该节点上有多个人处理有效。
    - 比如：A发送到B，B节点上有张三、李四、王五可以处理，这次你把工作分配给李四，
    - 如果设置了记忆，那么ccbpm就在下次发送的时候，自动投递给李四，当然您也可以重新分配。
    `;
    map.AddBoolean(NodeAttr.IsRM, true, '是否启用投递路径自定记忆?', true, true, true, HelpIsRememme);
    const IsExpSender = `
    #### 帮助
    - 该属性是对于该节点上有多个人处理有效。
    - 比如：A发送到B，B节点上有张三、李四、王五可以处理，如果是李四发送的，该设置是否需要把李四排除掉。
    `;
    map.AddBoolean(NodeAttr.IsExpSender, true, '接收人范围是否排除发送人?', true, true, true, IsExpSender);

    const IsOpenSelecter = `
    #### 帮助
    - 在按照绑定人员计算时，如果找不到人，就弹出接收人选择器选择。
    `;
    map.AddBoolean('IsOpenSelecter', false, '找不到接收人是否手工选择?', true, true, true, IsOpenSelecter);

    map.AddGroupAttr('运行模式');
    // #region 运行模式
    map.AddDDLSysEnum(NodeAttr.RunModel, 0, '节点类型', true, false, NodeAttr.RunModel, '@0=线形@1=合流@2=分流@3=分合流@4=同表单@5=异表单');
    map.SetHelperUrl(NodeAttr.RunModel, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661853&doc_id=31094'); //增加帮助.

    //子线程类型.
    map.AddTBFloat(NodeAttr.PassRate, 100, '完成通过率', true, false);
    map.SetHelperUrl(NodeAttr.PassRate, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661856&doc_id=31094'); //增加帮助.

    //增加对退回到合流节点的 子线城的处理控制.
    map.AddBoolean(BtnAttr.ThreadIsCanDel, true, '是否可以删除子线程(当前节点已经发送出去的线程，并且当前节点是分流，或者分合流有效，在子线程退回后的操作)？', true, true, true);
    map.AddBoolean(BtnAttr.ThreadIsCanAdd, true, '是否可以增加子线程(当前节点已经发送出去的线程，并且当前节点是分流，或者分合流有效)？', true, true, true);
    map.AddBoolean(BtnAttr.ThreadIsCanAddOfHL, true, '是否可以增加子线程(当前节点是合流节点有效)？', true, true, true);

    map.AddBoolean(BtnAttr.ThreadIsCanShift, false, '是否可以移交子线程(当前节点已经发送出去的线程，并且当前节点是分流，或者分合流有效，在子线程退回后的操作)？', true, true, true);

    map.AddDDLSysEnum(NodeAttr.USSWorkIDRole, 0, '异表单子线程WorkID生成规则', true, true, NodeAttr.USSWorkIDRole, '@0=仅生成一个WorkID@1=按接收人生成WorkID');
    map.SetHelperAlert(NodeAttr.USSWorkIDRole, '对上一个节点是合流节点，当前节点是异表单子线程有效。');

    //map.AddBoolean(NodeAttr.AutoRunEnable, false, "是否启用自动运行？(仅当分流点向子线程发送时有效)", true, true, true);
    //map.AddTBString(NodeAttr.AutoRunParas, null, "自动运行SQL", true, false, 0, 100, 10, true);

    //为广西计算中心加.
    map.AddBoolean(NodeAttr.IsSendBackNode, false, '是否是发送返回节点(发送当前节点，自动发送给该节点的发送人。)?', true, true, true);
    map.SetHelperUrl(NodeAttr.IsSendBackNode, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=6396936&doc_id=31094');
    // #endregion 分合流子线程属性

    map.AddGroupAttr('跳转');
    // #region 自动跳转规则
    map.AddBoolean(NodeAttr.AutoJumpRole0, false, '处理人就是发起人', true, true, true);
    map.SetHelperUrl(NodeAttr.AutoJumpRole0, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3980077&doc_id=31094'); //增加帮助

    map.AddBoolean(NodeAttr.AutoJumpRole1, false, '处理人已经出现过', true, true, true);
    map.AddBoolean(NodeAttr.AutoJumpRole3, false, '未来节点处理人已经出现过(只针对计算未来处理人的节点使用)', true, true, true);
    map.SetHelperUrl(NodeAttr.AutoJumpRole3, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8393139&doc_id=31094'); //增加帮助

    map.AddBoolean(NodeAttr.AutoJumpRole2, false, '处理人与上一步相同', true, true, true);
    map.AddBoolean(NodeAttr.WhenNoWorker, false, '(是)找不到人就跳转,(否)提示错误.', true, true, true);
    map.AddTBString(NodeAttr.AutoJumpExp, null, '表达式', true, false, 0, 200, 10, true);
    //map.AddTBStringDoc(NodeAttr.AutoJumpExp, null, '表达式', true, false, true);
    map.SetHelperAlert(NodeAttr.AutoJumpExp, '可以输入Url或SQL语句,请参考帮助文档.'); //增加帮助

    map.AddDDLSysEnum(NodeAttr.SkipTime, 0, '执行跳转事件', true, true, NodeAttr.SkipTime, '@0=上一个节点发送时@1=当前节点工作打开时');
    map.SetHelperUrl(NodeAttr.SkipTime, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3980077&doc_id=31094'); //增加帮助
    // #endregion

    //最后增加按钮权限..
    map.AddGroupAttr('按钮权限');
    const lab = new BtnLab();
    map.AddAttrs(lab._enMap.attrs); // 增加一个集合
    map.loaders = [...map.loaders, ...lab._enMap.loaders];

    map.SetPopList(NodeAttr.ReturnNodes, GloWF.srcNodes, true, '500px', '500px', '选择退回到的节点', 'icon-people');
    map.SetPopList(NodeAttr.CancelNodes, GloWF.srcNodes, true, '500px', '500px', '选择撤销的节点', 'icon-people');
    map.SetPopList(NodeAttr.JumpToNodes, GloWF.srcNodes, true, '500px', '500px', '可跳转到的节点', 'icon-people');

    //是否游离态.
    map.ParaFields = `,IsTask,IsRM,IsExpSender,IsYouLiTai,CancelNodes,ReturnNodes,IsOpenSelecter,TeamReturnRole,ThreadIsCanAddOfHL,`;
    map.AddTBAtParas(4000);

    /**************************** 基本信息.  &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& **********************/
    map.AddGroupMethod('基本配置', 'icon-drop');
    map.AddRM_GPE(new GPE_AccepterRole(), 'icon-user-following'); //接受人规则.
    map.AddRM_GPE(new GPE_TodolistModel(), 'icon-people'); //多人处理规则.

    map.AddRM_GPE(new GPE_CCWriteRole(), 'icon-book-open');

    map.AddRM_GL(new GL_Event(), '节点事件', 'icon-energy', '');
    // map.AddRM_DtlSearch('节点事件', new SysEvents(), 'RefPKVal', null, '', 'EventID,EventName,', 'icon-energy', true);
    map.AddRM_UrlLinkeWinOpen('外挂', 'https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl', 'icon-puzzle');

    //节点消息.
    map.AddRM_DtlSearch('节点消息', new PushMsgs(), PushMsgAttr.RefPKVal, '', '', PushMsgAttr.showAttrsMsg, 'icon-speech', false, '&MsgModel=NodeMsg');
    //发送后转向.
    map.AddRM_GPE(new GPE_TurnTo(), 'icon-directions');
    // 发送阻塞
    map.AddRM_GPE(new GPE_BlockModel(), 'icon-close');

    const attrs = `DataFromText,Note,`;
    map.AddRM_DtlSearch('流程完成条件', new Conds(), 'RefPKVal', '', '', attrs, 'icon-drop', true, '');

    //节点工具栏,主从表映射.
    //  map.AddRM_DtlSearch('自定义工具栏1', new NodeToolbars(), NodeToolbarAttr.FK_Node, '', '', '');
    //节点工具栏,主从表映射.
    const rm_custom_toolbar = new RefMethod();
    const toolbar_entity = new NodeToolbars();
    rm_custom_toolbar.Title = '自定义工具栏';
    rm_custom_toolbar.Icon = 'icon-settings';
    rm_custom_toolbar.RefMethodType = RefMethodType.Dtl;
    rm_custom_toolbar.RefDtlClsID = toolbar_entity.GetNewEntity.classID;
    rm_custom_toolbar.RefDtlRefPK = NodeToolbarAttr.FK_Node;
    rm_custom_toolbar.ClassMethod = `/src/WF/Comm/Dtl/DtlSearch.vue?key=custom_toolbar`;
    rm_custom_toolbar.params = {
      EnName: toolbar_entity.GetNewEntity.classID,
      RefPK: NodeToolbarAttr.FK_Node,
      RefMainEnName: this.EnClassID,
      ButsTableTop: '',
      ButsItem: '',
      ShowAttrs: '',
      isMove: '0',
      //Title: '节点事件',
      Icon: 'icon-settings',
    };
    map.AddRefMethod(rm_custom_toolbar);
    // map.AddRM_DtlSearch('自定义工具栏', new NodeToolbars(), NodeToolbarAttr.FK_Node, '帮助', '', '', 'icon-settings', true);
    // map.AddRM_DtlBatch('批量修改工具栏', new NodeToolbars(), NodeToolbarAttr.FK_Node, '帮助', '', '', 'icon-settings', true);
    // /*****************************  抄送规则  ***************************  */
    // map.AddGroupMethod('抄送规则', 'icon-pencil');
    // map.AddRM_GPE(new GPE_CCWriteRole(), 'icon-book-open');
    // //抄送规则.
    // // const urlCCRole = `/src/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_CCRole&NodeID=` + this.NodeID;
    // //  map.AddRM_UrlTabOpen('新建规则', urlCCRole, 'icon-plus');
    // map.AddRM_DtlSearch('自动抄送规则', new CCRoles(), CCRoleAttr.NodeID, '', '', '', 'icon-notebook', true);

    /**************************** 表单.  **********************/
    map.AddGroupMethod('表单方案', 'icon-grid');
    map.AddRM_GPE(new GPE_FrmSln(), 'icon-grid'); //表单方案.
    map.AddRM_GPE(new GPE_BatchRole(), 'iconfont icon-ptkj-lianxuqianpimoshi'); //批量审核

    //批量设置审核组件的状态.
    map.AddRM_EnOnly('审核组件', 'TS.WF.Template.NodeWorkCheck', '@NodeID', 'icon-note');
    map.AddRM_EnOnly('公文组件', 'TS.WF.Template.NodeGovDoc', '@NodeID', 'icon-note');

    //map.AddRM_EnOnly('子流程组件', 'TS.WF.Template.FrmSubFlow', '@NodeID', 'icon-organization');
    // const url2 = `/src/WF/Comm/EnOnly.vue?EnName=TS.WF.Template.FrmSubFlow&PKVal=` + this.NodeID;
    // map.AddRM_UrlTabOpen('子流程组件', url2, 'icon-organization');
    // const url3 = `/src/WF/Comm/EnOnly.vue?EnName=TS.WF.Template.FrmTrack&PKVal=` + this.NodeID;
    // map.AddRM_UrlTabOpen('轨迹组件', url3, 'icon-plane');
    //map.AddRM_GPE(new GPE_FrmTrack(), 'icon-list'); //轨迹组件
    // const url4 = `/src/WF/Comm/EnOnly.vue?EnName=TS.WF.Template.FrmTransferCustom&PKVal=` + this.NodeID;
    // map.AddRM_UrlTabOpen('流转自定义组件', url4, 'icon-puzzle');

    map.AddRM_GPE(new GPE_FrmTransfer(), 'icon-puzzle'); //流转自定义组件.
    map.AddRM_GPE(new GPE_FrmSummaryField(), 'iconfont icon-fuwenbenkuang'); //摘要字段.

    /******************************** 父子流程  ************************************************  */
    map.AddGroupMethod('子流程', 'icon-paper-plane');
    map.AddRM_EnOnly('子流程组件', 'TS.WF.Template.FrmSubFlowNode', '@NodeID', 'icon-organization');
    // const subFlowUrl1 = `/src/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_NewSubFlow&NodeID=` + this.NodeID;
    // map.AddRM_UrlTabOpen('新建子流程', subFlowUrl1, 'icon-plus');
    // map.AddRM_DtlSearch('手工启动', new SubFlowHands(), SubFlowAttr.FK_Node, '新建子流程', '属性', showAttrs, 'icon-paper-plane', true, '&SubFlowType=0');
    // map.AddRM_DtlSearch('自动启动', new SubFlowAutos(), SubFlowAttr.FK_Node, '新建子流程', '属性', showAttrs, 'icon-paper-plane', true, '&SubFlowType=1');
    // map.AddRM_DtlSearch('延续子流程', new SubFlowYanXus(), SubFlowAttr.FK_Node, '新建子流程', '属性', showAttrs, 'icon-paper-plane', true, '&SubFlowType=2');
    const showAttrs = 'SubFlowNo,SubFlowName,SubFlowSta,SubFlowType,SubFlowModel,';
    map.AddRM_DtlSearch('子流程', new SubFlows(), SubFlowAttr.FK_Node, '', '', showAttrs, 'icon-organization', true, '');

    map.AddGroupMethod('考核规则');
    map.AddRM_GPE(new GPE_EvaluationRole(), 'icon-badge');
    map.AddRM_GPE(new GPE_OvertimeRole(), 'icon-bell');

    /**************************** 方向条件.  **********************/
    //  map.AddGroupMethod('方向条件', 'icon-share');
    //优先级.
    // map.AddRM_DtlSearch('到达节点', new Directions(), DirectionAttr.Node, '帮助', '', 'ToNode,ToNodeName', 'icon-drop', true, '&Node=' + this.NodeID);
    //转向规则.
    //  map.AddRM_GPE(new GPE_CondModel(), 'icon-drop');
    // // 添加加载器类型
    // if (this.NodeID > 10) {
    //   map.AddMapLoader(async () => {
    //     //查询到达的方向.
    //     const ens = new Directions();
    //     await ens.Init();
    //     await ens.Retrieve(DirectionAttr.Node, this.NodeID, 'Idx');
    //     ens.forEach((dir) => {
    //       // let url = '/src/WF/Admin/Cond2020/List.vue?MyPK=' + dir.MyPK;
    //       // url += `&NodeID=${dir.Node}`;
    //       // url += `&ToNodeID=${dir.ToNode}`;
    //       // url += '&CondType=2';
    //       // url += `&FlowNo=${dir.FK_Flow}`;
    //       // this._enMap.AddRM_UrlTabOpen('' + dir.ToNode + '-' + dir.ToNodeName, url, 'icon-plane');

    //       let url = '';
    //       url = `/src/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.WF.Cond&RefPK=RefPKVal
    //       &ButsTableTop=检查正确性
    //       &ButsItem=&IsMove=1&OrderBy=Idx`;
    //       // url += '&FK_Node=' + dir.Node + '&ToNodeID=' + dir.ToNode;
    //       // url += '&NodeID=' + dir.Node + '&FK_Flow=' + dir.FK_Flow;
    //       url += '&RefPKVal=' + dir.MyPK;
    //       url += '&ShowAttrs=DataFromText,Note';
    //       //  url += '&FK_Node=' + this.NodeID + '&ToNodeID=' + dir.ToNode;

    //       this._enMap.AddRM_UrlTabOpen('' + dir.ToNode + '-' + dir.ToNodeName, url, 'icon-plane');
    //     });
    //   });
    //}
    // map.AddRM_GPE(new GPE_EvaluationRole(), 'icon-user');
    //map.AddRM_UrlTabOpen('调度组件', url);
    //const ur2l = `/src/WF/Comm/Dtl/DtlBatch.vue?EnName=TS.WF.NodeFWC&RefPK=FK_Flow&ButsTableTop=&ButsItem=&ShowAttrs=&IsMove=false&FK_Flow=@FK_Flow`;
    //map.AddRM_Func('一键设置审核组件模式', 'DoSetCheckModel', '确定要执行吗？');
    // map.AddRM_UrlTabOpen('节点表单组件', '/src/WF/Admin/Cond2020/GPN_Cond/CondByFrm.vue?NodeID=' + this.NodeID + '&ToNodeID=102');

    this._enMap = map;
    return this._enMap;
  }

  //一键设置审核组件模式,
  public DoSetCheckModel() {
    return '';
  }

  public DoNodeToolbars() {
    return '/WF/Comm/Dtl.vue?EnsName=TS.WF.Template.NodeToolbars&RefPK=FK_Node&RefPKVal=' + this.NodeID;
  }
}

//节点属性s
export class NodeExts extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeExt();
  }

  constructor() {
    super();
  }
}
