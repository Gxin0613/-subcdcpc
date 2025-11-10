import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '../../../bp/en/Map/RefMethod';
import { GPE_StartGuide } from './StartGuide/GPE_StartGuide';
import { GPE_Limit } from './Limit/GPE_Limit';
import { GPE_BatchStart } from './BatchStart/GPE_BatchStart';
import { GPE_SDTOfFlow } from './SDTOfFlow/GPE_SDTOfFlow';
import { GPE_AutoStart } from './AutoStart/GPE_AutoStart';
import { GPE_DeadLineRole } from './DeadLineRole/GPE_DeadLineRole';
import BSEntity from '/@/utils/gener/BSEntity';
import { FlowAttr } from '../../TSClass/Flow';
import { GPE_SyncRole } from './SyncData/GPE_SyncRole';
import { SyncDataAttr, SyncDatas } from './SyncData/SyncData';
import { SysEventAttr, SysEvents } from '../FrmLogic/MapData/FrmEvent/SysEvent';
import { PushMsgAttr, PushMsgs } from '../AttrNode/NodeMsg/PushMsg';
import { GPN_FlowExpImp } from './ImpExp/GPN_FlowExpImp';
import { NodeBatchs } from '../AttrNode/NodeBatch';
import { GL_FlowVer } from './Ver/GL_FlowVer';
import { GPE_FullSA } from './Ver/GPE_FullSA';
// import { GovDocTemplate, GovDocTemplates } from './GovDoc/GovDocTemplate';
import { GPE_FlowShareSln } from '../FlowLogic/ShareFlow/GPE_FlowShareSln';
import { GPN_ImpFlowData } from './ImpData/GPN_ImpFlowData';
import { GPE_FlowBuessFields } from './Rpt/GPE_FlowBuessFields';
import { GPN_FlowCopy } from './ImpExp/GPN_FlowCopy';
import { GloWF } from '../GloWF';
import { getAppEnvConfig } from '/@/utils/env';
import { PCenters } from '/@/CCFast/GPM/PCenter/PCenter';
import { PowerCenterAttr } from '/@/CCFast/GPM/CCMenu/PowerCenter';
import { GL_Event } from '../FrmLogic/MapData/FrmEvent/GL_Event';
//属性列表
export class FlowExtAttr extends FlowAttr {}

// 流程属性
export class FlowExt extends EntityNoName {
  constructor(no?: string) {
    super('TS.WF.Template.FlowExt');
    //关联更新的类.
    this.setPKVal(no);
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
    const map = new Map('WF_Flow', '流程属性');
    map.EnClassID = this.classID;

    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(FlowAttr.No, null, '编号', true, true, 1, 4, 3);

    //处理流程类别.
    map.AddDDLSQL(FlowAttr.FK_FlowSort, null, '类别', GloWF.srcFlowSorts, true);
    map.AddTBString(FlowAttr.Name, null, '名称', true, false, 0, 50, 10, true);
    const FlowGroupIDHelp = `
#### 帮助
- 根据配置不同路由标识来给不同流程进行分类，通过调用接口来获取指定路由下可发起的流程(/WF/API/Flow_GroupIDForStart)，多个路由标识用英文逗号隔开。
    `;
    map.AddTBString(FlowAttr.FlowGroupID, null, '流程路由标识', true, false, 0, 300, 10, false, FlowGroupIDHelp);

    // add 2013-02-14 唯一确定此流程的标记
    map.AddTBString(FlowAttr.FlowMark, null, '流程标记', true, false, 0, 150, 10);
    map.AddTBString(FlowAttr.FlowEventEntity, null, '事件实体', true, true, 0, 150, 10);

    map.SetHelperUrl(FlowAttr.FlowMark, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661870&doc_id=31094');
    map.SetHelperUrl(FlowAttr.FlowEventEntity, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661871&doc_id=31094');

    // add 2013-02-05.
    map.AddTBString(FlowAttr.TitleRole, null, '标题生成规则', true, false, 0, 150, 10, false);
    map.SetHelperUrl(FlowAttr.TitleRole, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661872&doc_id=31094');

    map.AddTBString(FlowAttr.TitleRoleNodes, null, '生成标题的节点', true, false, 0, 300, 10);
    // let msg = "设置帮助";
    //msg += "\r\n 1. 如果为空表示只在开始节点生成标题.";
    //msg += "\r\n 2. * 表示在任意节点可生成标题.";
    //msg += "\r\n 3. 要在指定的节点重新生成标题用逗号分开,比如: 102,105,109";
    map.SetHelperUrl(FlowAttr.TitleRoleNodes, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661873&doc_id=31094');

    map.AddBoolean(FlowAttr.IsCanStart, true, '可以独立启动否？(独立启动的流程可以显示在发起流程列表里)', true, true, true);
    map.SetHelperUrl(FlowAttr.IsCanStart, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661874&doc_id=31094');
    // map.AddBoolean(FlowAttr.IsFullSA, false, '是否自动计算未来的处理人？', true, true, true);
    // map.SetHelperUrl(FlowAttr.IsFullSA, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661875&doc_id=31094');

    //map.AddDDLSysEnum(FlowAttr.IsAutoSendSubFlowOver, 0, "为子流程时结束规则", true, true,
    // FlowAttr.IsAutoSendSubFlowOver, "@0=不处理@1=让父流程自动运行下一步@2=结束父流程");

    //map.AddBoolean(FlowAttr.GuestFlowRole, false, "是否外部用户参与流程(非组织结构人员参与的流程)", true, true, false);
    map.AddDDLSysEnum(FlowAttr.GuestFlowRole, 0, '外部用户参与流程规则', true, true, 'GuestFlowRole', '@0=不参与@1=开始节点参与@2=中间节点参与');
    map.SetHelperUrl(FlowAttr.GuestFlowRole, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661876&doc_id=31094');

    // 草稿
    map.AddDDLSysEnum(FlowAttr.Draft, 0, '草稿规则', true, true, FlowAttr.Draft, '@0=无(不设草稿)@1=保存到待办@2=保存到草稿箱');
    map.SetHelperUrl(FlowAttr.Draft, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661878&doc_id=31094');

    //为 莲荷科技增加一个系统类型, 用于存储当前所在流程树的第2级流程树编号.
    map.AddTBString(FlowAttr.SysType, null, '系统类型', false, false, 0, 50, 10, false);
    map.AddTBString(FlowAttr.Tester, null, '发起测试人', true, false, 0, 100, 10, true);

    map.AddTBString(FlowAttr.CCORShareLab, '抄送/分享', '抄送/分享', true, false, 0, 50, 10);
    map.AddBoolean(FlowAttr.CCORShareEnable, false, '是否在查看流程中启用', true, true);
    map.SetHelperUrl(FlowAttr.Tester, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661882&doc_id=31094');

    // add 2014-10-19.
    map.AddDDLSysEnum(FlowAttr.ChartType, 0, '节点图形类型', true, true, 'ChartType', '@0=几何图形@1=肖像图片');

    // FlowDevModel.FoolTruck
    const cfg = '@0=专业模式@1=极简@2=累加@3=绑定单表单@4=绑定多表单@5=SDK表单@6=嵌入式表单@7=物联网流程';
    map.AddDDLSysEnum(FlowAttr.FlowDevModel, 0, '设计模式', true, true, 'FlowDevModel', cfg);
    //map.AddDDLSysEnum(FlowAttr.ChartType, 0, '节点图形类型', true, true, 'ChartType', '@0=几何图形@1=肖像图片');
    // if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
    //   map.AddTBString('Orgs', null, '共享...', true, true, 0, 300, 20, true);
    //   map.SetPopList('Orgs', GloWF.srcOrgs, true, '300px', '500px', '共享...', 'icon-organization');
    // }
    map.AddBoolean(FlowAttr.IsWaterMark, false, '表单是否启用水印', true, true, false);

    const text = `@0=系统默认值@1=登录人员账号@2=登录人员名称@3=当前日期(yyyy年MM月dd日)@4=当前日期(yyyy年MM月dd日HH时mm分)@5=登录人员名称+当前日期(yyyy年MM月dd日)@6=登录人员名称+当前日期(yyyy年MM月dd日HH时mm分)`;
    map.AddDDLSysEnum(FlowAttr.WaterMarkText, 0, '水印默认展示', true, true, 'WaterMarkText', text);

    map.AddGroupAttr('数据&表单');
    map.AddTBString(FlowAttr.FrmUrl, null, '表单信息', true, true, 0, 100, 10, true);

    //批量发起 add 2013-12-27.
    map.AddBoolean(FlowAttr.IsBatchStart, false, '是否启用批量发起流程？(需设置"发起字段"：字段1,字段2,字段3,...)', true, true, false);
    map.AddTBString(FlowAttr.BatchStartFields, null, '发起字段', true, false, 0, 100, 10, false);
    map.SetHelperUrl(FlowAttr.IsBatchStart, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3952886&doc_id=31094');

    //移动到这里 by zhoupeng 2016.04.08.
    map.AddBoolean(FlowAttr.IsResetData, false, '是否启用开始节点数据重置按钮？已经取消)', false, true, true);
    map.AddBoolean(FlowAttr.IsLoadPriData, false, '是否自动装载上一笔数据？', true, true, true);
    map.SetHelperUrl(FlowAttr.IsLoadPriData, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3953030&doc_id=31094');
    map.AddBoolean(FlowAttr.IsDBTemplate, true, '是否启用数据模版？', true, true, true);
    map.AddBoolean(FlowAttr.IsStartInMobile, true, '是否可以在手机里启用？(如果发起表单特别复杂就不要在手机里启用了)', true, true, true);
    map.SetHelperAlert(FlowAttr.IsStartInMobile, '用于控制手机端流程发起列表.');

    map.AddBoolean(FlowAttr.IsMD5, false, '是否是数据防止篡改(MD5数据加密防篡改)', true, true, true);
    map.SetHelperUrl(FlowAttr.IsMD5, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3952971&doc_id=31094');

    map.AddBoolean(FlowAttr.IsJM, false, '是否是数据加密流程(把所有字段加密存储)', true, true, true);
    map.SetHelperUrl(FlowAttr.IsJM, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3952997&doc_id=31094');
    //@Hongyan
    map.AddBoolean(FlowAttr.IsEnableDBVer, false, '是否是启用表单数据版本控制', true, true, true);
    map.SetHelperUrl(FlowAttr.IsEnableDBVer, 'https://docs.qq.com/doc/DRFVORWF3R0ZIV1h5');

    map.AddTBString(FlowAttr.PTable, null, '流程数据存储表', true, false, 0, 100, 10);
    map.SetHelperUrl(FlowAttr.PTable, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=4000827&doc_id=31094');

    //add  2013-08-30.
    map.AddTBString(FlowAttr.BillNoFormat, null, '单据编号格式', true, false, 0, 50, 10, false);
    map.SetHelperUrl(FlowAttr.BillNoFormat, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3953012&doc_id=31094');

    //add  2023-03-08. 业务主键字段
    map.AddTBString(FlowAttr.BuessPKFields, null, '业务主键字段s', true, false, 0, 50, 10, false);
    map.SetHelperUrl(FlowAttr.BuessPKFields, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=7862441&doc_id=31094');

    // add 2019-09-25 by zhoupeng
    map.AddTBString(FlowAttr.BuessFields, null, '关键业务字段', true, false, 0, 100, 10, false);
    let msg = '用于显示在待办上的业务字段信息.';
    msg += `	
 1. 用户在看到待办的时候，就可以看到流程的实例的关键信息。`;
    msg += `	
 2. 用于待办的列表信息显示.`;
    msg += `	
 3. 配置格式为. Tel,Addr,Email  这些字段区分大小写并且是节点表单字段.`;
    msg += `	
 4. 数据存储在WF_GenerWorkFlow.AtPara里面.`;
    msg += `	
 5. 存储格式为: @BuessFields = 电话^Tel^18992323232;地址^Addr^山东济南;`;
    map.SetHelperAlert(FlowAttr.BuessFields, msg);
    map.AddTBString(FlowAttr.AdvEmps, null, '高级查询人员', true, false, 0, 100, 10, false);
    msg = '用于指定人员查询流程实例数据集合的设置.';
    msg += `	
 存储格式：人员编号以逗号分割如zhangsan,lisi,`;
    map.SetHelperAlert(FlowAttr.AdvEmps, msg);

    map.AddGroupAttr('轨迹');
    //map.AddBoolean(FlowAttr.IsFrmEnable, false, '是否显示表单', true, true, false);
    map.AddBoolean(FlowAttr.IsTruckEnable, true, '是否显示轨迹图', true, true, false);
    map.AddBoolean(FlowAttr.IsTimeBaseEnable, true, '是否显示时间轴', true, true, false);
    map.AddBoolean(FlowAttr.IsTableEnable, true, '是否显示时间表', true, true, false);
    //map.AddBoolean(FlowAttr.IsOPEnable, false, '是否显示操作', true, true, false);
    map.AddDDLSysEnum(FlowAttr.TrackOrderBy, 0, '排序方式', true, true, FlowAttr.TrackOrderBy, '@0=按照时间先后顺序@1=倒序(新发生的在前面)');
    map.AddTBInt('ShareSln', 0, '流程共享方案', false, false);
    map.AddTBString('Orgs', null, '共享组织', false, false, 0, 300, 20, true);
    map.AddTBString('OrgsT', null, '组织名称', false, false, 0, 300, 20, true);
    //增加参数字段.
    map.AddTBAtParas(4000);
    map.ParaFields = ',CCORShareEnable,CCORShareLab,';

    /**********************************  基本信息   */
    map.AddGroupMethod('基本配置');
    const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
    if (!VITE_GLOB_HIDE_HELP_DOCS) {
      map.AddRM_UrlLinkeWinOpen('外挂', 'https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl', 'icon-puzzle');
    }
    //自动发起
    map.AddRM_GPE(new GPE_AutoStart(), 'icon-paper-plane');

    //发起限制规则.
    map.AddRM_GPE(new GPE_Limit(), 'icon-anchor');

    //发起前置导航.
    map.AddRM_GPE(new GPE_StartGuide(), 'icon-directions');

    map.AddRM_GPE(new GPE_FlowShareSln(), 'icon-share');

    //导入钉钉数据.
    map.AddRM_GPN(new GPN_ImpFlowData(), 'icon-share-alt');

    map.AddRM_GL(new GL_Event(), '流程事件2025', 'icon-energy', '&1=2');

    //事件.
    map.AddRM_DtlSearch('流程事件', new SysEvents(), SysEventAttr.RefFlowNo, '', '', SysEventAttr.ShowAttrs, 'icon-energy', false, '&NodeID=0');

    //节点消息.
    map.AddRM_DtlSearch('流程消息', new PushMsgs(), PushMsgAttr.RefPKVal, '', '', PushMsgAttr.showAttrsMsg, 'icon-speech');

    // //修改设计模式.
    // map.AddRM_GPE(new GPE_FlowDevModel(), 'icon-settings');
    //map.AddRM_GPE(new GPE_FlowFrmSln(), 'icon-list');

    //批量发起.
    map.AddRM_GPE(new GPE_BatchStart(), 'icon-list');
    map.AddRM_DtlBatch('节点组件', new NodeBatchs(), 'FK_Flow', '', '', 'icon-drop');

    //查看权限
    map.AddRM_DtlSearch('流程实例查看权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '&CtrlObj=MyView', 'icon-energy', true);

    //业务字段.
    map.AddRM_GPE(new GPE_FlowBuessFields(), 'icon-share');

    //map.AddRM_DtlBatch('公文组件', new NodeBatchs(), 'FK_Flow');

    //导入导出
    map.AddGroupMethod('版本管理', 'icon-layers');
    map.AddRM_GPN(new GPN_FlowExpImp(), 'icon-drop');
    map.AddRM_GPN(new GPN_FlowCopy(), 'icon-drop');
    map.AddRM_GL(new GL_FlowVer(), '版本管理', 'icon-drop');
    map.AddRM_GPE(new GPE_FullSA(), 'icon-drop');

    // const rm335 = new RefMethod();
    // rm335.Title = '生成数据版本';
    // // rm5.Warning = '您确定要执行吗?大概需要1-2分钟左右.';
    // rm335.Warning = '您确定要生成数据版本吗？生成后对于自动计算未来接受人的流程就会重新计算.';
    // rm335.ClassMethod = 'GenerDataVer';
    // rm335.Icon = 'icon-check';
    // rm335.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rm335);
    /**********************************  流程时限规则   */
    map.AddGroupMethod('时限规则', 'icon-clock');
    //时限规则.
    map.AddRM_GPE(new GPE_SDTOfFlow(), 'icon-clock');
    map.AddRM_GPE(new GPE_DeadLineRole(), 'icon-clock');
    // map.AddRM_DataV(new DataV_OneFlowAdmin());

    /**********************************  数据同步   */
    map.AddGroupMethod('数据同步', 'icon-cloud-upload');
    //同步数据
    map.AddRM_GPE(new GPE_SyncRole(), 'icon-cloud-upload');
    const showAttrs1 = ''; // 'EventNo,EventName,AccepterID,AccepterDoc1,AccepterDoc2,IsEnableSMS,IsEnableEmail';
    map.AddRM_DtlSearch('同步内容', new SyncDatas(), SyncDataAttr.FlowNo, '', '', showAttrs1, 'icon-speech');

    /**********************************  开发接口   */
    map.AddGroupMethod('流程维护', 'icon-puzzle');

    const rm5 = new RefMethod();
    rm5.Title = '检查流程';
    rm5.Warning = '';
    rm5.ClassMethod = 'CheckFlow';
    rm5.Icon = 'icon-check';
    rm5.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm5);

    const rm6 = new RefMethod();
    rm6.Title = '删除指定的流程';
    rm6.Warning = '您确定要执行吗?删除后不可恢复.';
    rm6.Icon = 'icon-close';
    rm6.ClassMethod = 'DeleteByWorkID';
    rm6.HisMap.AddTBInt('WorkID', 0, '工作ID', true, false);
    rm6.HisMap.AddTBString('Note', 'Note', '请输入原因', true, false, 0, 100, 100);
    rm6.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm6);

    const rm7 = new RefMethod();
    rm7.Title = '删除指定日期范围内的流程';
    rm7.Warning = '您确定要执行吗?删除后不可恢复.';
    rm7.Icon = 'icon-close';
    rm7.ClassMethod = 'DeleteByDate';
    rm7.HisMap.AddTBDateTime('DTFrom', '', '时间从', true, false);
    rm7.HisMap.AddTBDateTime('DTTo', '', '时间到', true, false);
    rm7.HisMap.AddTBString('Note', 'Note', '请输入原因', true, false, 0, 100, 100);
    rm7.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm7);

    // map.AddGroupMethod('试验中的功能', 'icon-plane');
    // const rmT1 = new RefMethod();
    // rmT1.Title = '一键设置审核组件工作模式';
    // rmT1.RefMethodType = RefMethodType.Func;
    // const msg1 = `
    // 您确定要设置审核组件模式吗？ <br>
    //  1. 第2个节点以后的节点表单都指向第2个节点表单.  <br>
    //  2. 结束节点都设置为只读模式. <br>
    //  3. 设置完成后，要手工刷新一下整个流程设计器.<br>
    // `;
    // rmT1.Warning = msg1;
    // rmT1.ClassMethod = 'DoSetFWCModel';
    // rmT1.Icon = 'icon-briefcase';
    // map.AddRefMethod(rmT1);

    //map.AddRM_GPN(new GPN_Flowd)

    map.GroupBarShowModel = 0;
    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeUpdate(): Promise<boolean> {
    const fl = new BSEntity('BP.WF.Flow');
    fl.No = this.No;
    fl.setPK(this.No);
    fl.FlowMark = this.FlowMark;
    await fl.RetrieveFromDBSources();
    if (fl.IsStartInMobile != this.IsStartInMobile || fl.IsCanStart != this.IsCanStart || fl.Name != this.Name) {
      await fl.DoMethodReturnString('ClearStartFlows');
    }

    //检查标记是否重复?
    if (!!fl.FlowMark) {
      const data = await fl.DoMethodReturnString('CheckFlowMark', fl.FlowMark, fl.No); //检查流程标记.

      if (data.includes('err@')) {
        alert(data);
        return false;
      }
    }

    // await fl.Update();
    // await fl.RetrieveFromDBSources();
    // this.FlowEventEntity = fl.FlowEventEntity;
    // debugger;
    return true;
  }
  protected override async afterUpdate(): Promise<boolean> {
    const fl = new BSEntity('BP.WF.Flow');
    fl.No = this.No;
    fl.setPK(this.No);
    await fl.RetrieveFromDBSources();
    await fl.DoMethodReturnString('DoSetFlowEventEntity');
    return true;
  }

  //设置极简模式.
  public async DoSetFWCModel() {
    const en = new BSEntity('BP.WF.Template.FlowExt', this.No);
    await en.Init();
    await en.RetrieveFromDBSources();
    return await en.DoMethodReturnString('DoSetFWCModel');
  }

  public async DeleteByWorkID(workID: number, note) {
    const flow = new BSEntity('BP.WF.Template.FlowExt', this.No);
    await flow.Retrieve();
    return await flow.DoMethodReturnString('DoDelDataOne', String(workID), note);
  }
  public async DeleteByDate(dtFrom, dtTo) {
    const flow = new BSEntity('BP.WF.Template.FlowExt', this.No);
    await flow.Retrieve();
    return await flow.DoMethodReturnString('DoDelFlows', dtFrom, dtTo, '1');
  }
  public async CheckFlow() {
    const flow = new BSEntity('BP.WF.Flow', this.No);
    await flow.Retrieve();
    const data = await flow.DoMethodReturnString('DoCheck');

    return (
      `tabOpen@原始数据:
` + JSON.stringify(data, null, 2)
    );
  }
}

export class FlowExts extends EntitiesNoName {
  get GetNewEntity(): FlowExt {
    return new FlowExt();
  }

  constructor() {
    super();
  }
}
