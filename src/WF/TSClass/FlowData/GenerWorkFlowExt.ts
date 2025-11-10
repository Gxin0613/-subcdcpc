import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { EntitiesWorkID, EntityWorkID } from '/@/bp/en/EntityWorkID';
import { FlowSort } from '../Admin/FlowSort';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPN_ReSend } from './GPN_ReSend';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

//属性列表
export class GenerWorkFlowViewAttr {
  /// <summary>
  /// 工作ID
  /// </summary>
  public static readonly WorkID = 'WorkID';
  /// <summary>
  /// 工作流
  /// </summary>
  public static readonly FK_Flow = 'FK_Flow';
  /// <summary>
  /// 流程状态
  /// </summary>
  public static readonly WFState = 'WFState';
  /// <summary>
  /// 流程状态(简单)
  /// </summary>
  public static readonly WFSta = 'WFSta';
  /// <summary>
  /// 标题
  /// </summary>
  public static readonly Title = 'Title';
  /// <summary>
  /// 发起人
  /// </summary>
  public static readonly Starter = 'Starter';
  /// <summary>
  /// 产生时间
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 活动记录时间
  /// </summary>
  public static readonly SendDT = 'SendDT';
  /// <summary>
  /// 完成时间
  /// </summary>
  public static readonly CDT = 'CDT';
  /// <summary>
  /// 得分
  /// </summary>
  public static readonly Cent = 'Cent';
  /// <summary>
  /// 当前工作到的节点.
  /// </summary>
  public static readonly FK_Node = 'FK_Node';
  /// <summary>
  /// 当前工作角色
  /// </summary>
  public static readonly FK_Station = 'FK_Station';
  /// <summary>
  /// 部门
  /// </summary>
  public static readonly FK_Dept = 'FK_Dept';
  /// <summary>
  /// 年月
  /// </summary>
  public static readonly FK_NY = 'FK_NY';
  /// <summary>
  /// 流程ID
  /// </summary>
  public static readonly FID = 'FID';
  /// <summary>
  /// 是否启用
  /// </summary>
  public static readonly IsEnable = 'IsEnable';
  /// <summary>
  /// 流程名称
  /// </summary>
  public static readonly FlowName = 'FlowName';
  /// <summary>
  /// 发起人名称
  /// </summary>
  public static readonly StarterName = 'StarterName';
  /// <summary>
  /// 节点名称
  /// </summary>
  public static readonly NodeName = 'NodeName';
  /// <summary>
  /// 部门名称
  /// </summary>
  public static readonly DeptName = 'DeptName';
  /// <summary>
  /// 流程类别
  /// </summary>
  public static readonly FK_FlowSort = 'FK_FlowSort';
  /// <summary>
  /// 优先级
  /// </summary>
  public static readonly PRI = 'PRI';
  /// <summary>
  /// 流程应完成时间
  /// </summary>
  public static readonly SDTOfFlow = 'SDTOfFlow';
  /// <summary>
  /// 节点应完成时间
  /// </summary>
  public static readonly SDTOfNode = 'SDTOfNode';
  /// <summary>
  /// 父流程ID
  /// </summary>
  public static readonly PWorkID = 'PWorkID';
  /// <summary>
  /// 父流程编号
  /// </summary>
  public static readonly PFlowNo = 'PFlowNo';
  /// <summary>
  /// 父流程节点
  /// </summary>
  public static readonly PNodeID = 'PNodeID';
  /// <summary>
  /// 子流程的调用人.
  /// </summary>
  public static readonly PEmp = 'PEmp';
  /// <summary>
  /// 客户编号(对于客户发起的流程有效)
  /// </summary>
  public static readonly GuestNo = 'GuestNo';
  /// <summary>
  /// 客户名称
  /// </summary>
  public static readonly GuestName = 'GuestName';
  /// <summary>
  /// 单据编号
  /// </summary>
  public static readonly BillNo = 'BillNo';
  /// <summary>
  /// 备注
  /// </summary>
  public static readonly FlowNote = 'FlowNote';
  /// <summary>
  /// 待办人员
  /// </summary>
  public static readonly TodoEmps = 'TodoEmps';
  /// <summary>
  /// 待办人员数量
  /// </summary>
  public static readonly TodoEmpsNum = 'TodoEmpsNum';
  /// <summary>
  /// 任务状态
  /// </summary>
  public static readonly TaskSta = 'TaskSta';
  /// <summary>
  /// 临时存放的参数
  /// </summary>
  public static readonly AtPara = 'AtPara';
  /// <summary>
  /// 参与人
  /// </summary>
  public static readonly Emps = 'Emps';
  /// <summary>
  /// GUID
  /// </summary>
  public static readonly GUID = 'GUID';
}

// 流程实例查询
export class GenerWorkFlowExt extends EntityWorkID {
  constructor(pkval?: number) {
    super('TS.FlowData.GenerWorkFlowExt');
    if (!!pkval) this.WorkID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    uac.IsView = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_GenerWorkFlow', '流程查询');
    map.AddTBString(GenerWorkFlowViewAttr.Title, null, '标题', true, true, 0, 150, 200, true);
    map.AddTBIntPK(GenerWorkFlowViewAttr.WorkID, 0, 'WorkID', true);

    map.AddTBString(GenerWorkFlowViewAttr.FK_Flow, null, 'FK_Flow', false, false, 0, 50, 10);
    map.AddTBString(GenerWorkFlowViewAttr.Starter, null, '发起人', false, false, 0, 50, 10);
    map.AddTBString(GenerWorkFlowViewAttr.StarterName, null, '发起人', true, true, 0, 50, 10);

    map.AddDDLSysEnum(GenerWorkFlowViewAttr.WFSta, 0, '流程状态', true, false, GenerWorkFlowViewAttr.WFSta, '@0=运行中@1=已完成@2=其他');

    map.AddDDLSysEnum(GenerWorkFlowViewAttr.WFState, 0, '大状态', true, false, 'WFState');
    map.AddTBInt(GenerWorkFlowViewAttr.FK_Node, 0, '停留节点', false, false);
    map.AddTBString(GenerWorkFlowViewAttr.NodeName, null, '节点名称', true, true, 0, 100, 10);

    map.AddTBDateTime(GenerWorkFlowViewAttr.RDT, null, '记录日期', true, true);
    map.AddTBDateTime(GenerWorkFlowViewAttr.SendDT, null, '发送时间', true, true);
    map.AddTBString(GenerWorkFlowViewAttr.BillNo, null, '单据编号', true, true, 0, 100, 10);
    //map.AddTBStringDoc(GenerWorkFlowViewAttr.FlowNote, null, "备注", true, false, true);

    map.AddDDLEntities(GenerWorkFlowViewAttr.FK_FlowSort, null, '类别', new FlowSort(), false);
    // map.AddDDLEntities(GenerWorkFlowViewAttr.FK_Flow, null, '流程', new Flow(), false);
    // map.AddDDLEntities(GenerWorkFlowViewAttr.FK_Dept, null, '隶属部门', new Dept(), false);
    map.AddTBInt(GenerWorkFlowViewAttr.FID, 0, 'FID', false, false);
    map.AddTBString(GenerWorkFlowViewAttr.FK_NY, null, '发起月份', true, true, 0, 100, 10);
    map.AddTBString(GenerWorkFlowViewAttr.TodoEmps, '', '处理人', true, true, 0, 100, 10);
    map.AddTBInt(GenerWorkFlowViewAttr.PWorkID, 0, 'PWorkID', false, false);
    map.AddTBString(GenerWorkFlowViewAttr.PFlowNo, null, 'PFlowNo', false, false, 0, 50, 10);

    map.AddTBAtParas(4000);

    //查询条件.
    map.AddSearchAttr(GenerWorkFlowViewAttr.WFSta);

    map.DTSearchKey = GenerWorkFlowViewAttr.RDT;
    map.DTSearchLabel = '时间';
    map.DTSearchWay = DTSearchWay.ByDateRange;

    //把不等于 0 的去掉.
    map.AddHidden(GenerWorkFlowViewAttr.WFState, '!=', '0');
    map.AddGroupMethod('实例运维');
    const rmGJ = new RefMethod();
    rmGJ.Title = '查看工作';
    rmGJ.ClassMethod = 'DoTrack';
    rmGJ.Icon = 'icon-graph';
    rmGJ.Visable = true;
    rmGJ.Warning = '';
    rmGJ.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rmGJ);

    //调整
    map.AddRM_GPN(new GPN_ReSend(), 'icon-people');

    const rmDel = new RefMethod();
    rmDel.Title = '彻底删除';
    rmDel.ClassMethod = 'DoDelete';
    rmDel.Warning = '您确定要删除吗？包括该流程的所有数据。';
    // rm.Icon = "../../WF/Img/Btn/Delete.gif";
    rmDel.Icon = 'icon-close';
    rmDel.IsForEns = false;
    map.AddRefMethod(rmDel);

    const rmLJ = new RefMethod();
    rmLJ.Title = '逻辑删除';
    rmLJ.ClassMethod = 'DoDeleteFlag';
    rmLJ.HisMap.AddTBString('Note', null, '删除原因', true, false, 0, 100, 100);
    rmLJ.Icon = 'icon-close';
    rmLJ.IsForEns = false;
    map.AddRefMethod(rmLJ);

    const rm = new RefMethod();
    rm.Title = '催办';
    rm.ClassMethod = 'DoPress';
    rm.HisMap.AddTBString('Note', null, '催办信息', true, false, 0, 500, 200);
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    const rmQZ = new RefMethod();
    rmQZ.Icon = 'icon-key';
    rmQZ.Title = '强制结束';
    rmQZ.Warning = '您确定要结束吗？';
    rmQZ.ClassMethod = 'DoFlowOver';
    rmQZ.HisMap.AddTBString('BeiZhu', null, '备注', true, false, 0, 100, 300);
    map.AddRefMethod(rmQZ);

    this._enMap = map;
    return this._enMap;
  }

  //轨迹查看.
  public DoTrack() {
    const url = '/#/WF/MyView?WorkID=' + this.WorkID + '&FK_Flow=' + this.FK_Flow + '&FK_Node=' + this.FK_Node;
    return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, url);
  }

  //修复数据.
  public async RepairDataIt(): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    await en.RetrieveFromDBSources();
    return await en.DoMethodReturnString('RepairDataIt');
  }

  //执行流程结束.
  public async DoFlowOver(note: string): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    await en.RetrieveFromDBSources();
    if (note == undefined) note = '无';
    return await en.DoMethodReturnString('DoFlowOver', note);
  }

  //执行逻辑删除.
  public async DoDeleteFlag(note: string): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    await en.RetrieveFromDBSources();
    en.FlowNo = this.FK_Flow;
    if (note == undefined) note = '无';
    return await en.DoMethodReturnString('DoDeleteFlag', note);
  }

  //执行彻底删除.
  public async DoDelete(): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    en.WorkID = this.WorkID;
    en.FlowNo = this.FK_Flow;
    return await en.DoMethodReturnString('DoDelete');
  }

  //执行催办.
  public async DoPress(note: string): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    en.WorkID = this.WorkID;
    if (note == undefined) note = '无';
    return await en.DoMethodReturnString('DoPress', note);
  }
}

//流程实例查询s
export class GenerWorkFlowExts extends EntitiesWorkID {
  get GetNewEntity(): EntityWorkID {
    return new GenerWorkFlowExt();
  }
  constructor() {
    super();
  }
}
