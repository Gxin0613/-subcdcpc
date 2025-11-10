import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { FlowSort } from '../Admin/FlowSort';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { EntitiesWorkID, EntityWorkID } from '/@/bp/en/EntityWorkID';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPN_ReSend } from './GPN_ReSend';
import { GenerWorkFlowViewAttr } from './GenerWorkFlowExt';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { GL_AdminGenerList } from './GL_AdminGenerList';
import { GL_AdminReback } from './GL_AdminReback';
import { GPN_WorkShiftBatch } from '../../Comm/Setting/GPN_WorkShiftBatch';

// 流程实例查询
export class GenerWorkFlowMy extends EntityWorkID {
  constructor(pkval?: number) {
    super('TS.FlowData.GenerWorkFlowMy');
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
    const map = new Map('WF_GenerWorkFlow', '综合查询');

    map.AddTBIntPK(GenerWorkFlowViewAttr.WorkID, 0, 'WorkID', false);
    map.AddTBString(GenerWorkFlowViewAttr.Title, null, '标题', true, true, 0, 100, 350, true);
    map.AddTBString(GenerWorkFlowViewAttr.Starter, null, '发起人', false, false, 0, 30, 70);
    map.AddTBString(GenerWorkFlowViewAttr.StarterName, null, '发起人', true, true, 0, 30, 70);

    map.AddDDLSysEnum(GenerWorkFlowViewAttr.WFSta, 0, '流程状态', true, false, GenerWorkFlowViewAttr.WFSta, '@0=运行中@1=已完成@2=其他');
    //WFStaT
    // map.AddDDLSysEnum(GenerWorkFlowAttr.WFState, 0, '大状态', true, false, 'WFState', '@0=运行中@1=已完成@2=其它');
    map.AddTBString(GenerWorkFlowViewAttr.NodeName, null, '当前节点', true, true, 0, 100, 180);
    map.AddTBDateTime(GenerWorkFlowViewAttr.RDT, null, '记录日期', true, true);
    map.AddTBString(GenerWorkFlowViewAttr.BillNo, null, '单据编号', true, true, 0, 100, 90);
    //map.AddTBStringDoc(GenerWorkFlowAttr.FlowNote, null, "备注", true, false, true);

    map.AddDDLEntities(GenerWorkFlowViewAttr.FK_FlowSort, null, '类别', new FlowSort(), false);
    // map.AddDDLEntities(GenerWorkFlowAttr.FK_Flow, null, '流程', new Flow(), false);
    // map.AddDDLEntities(GenerWorkFlowAttr.FK_Dept, null, '隶属部门', new Dept(), false);

    map.AddTBInt(GenerWorkFlowViewAttr.FID, 0, 'FID', false, false);
    map.AddTBInt(GenerWorkFlowViewAttr.FK_Node, 0, 'FK_Node', false, false);
    map.AddTBString(GenerWorkFlowViewAttr.FK_Flow, null, 'FK_Flow', false, false, 0, 50, 150);
    map.AddDDLSysEnum(GenerWorkFlowViewAttr.WFState, 0, '流程状态', true, false, GenerWorkFlowViewAttr.WFState);
    map.AddTBString('FK_Flow', null, 'FK_Flow', false, false, 0, 12, 10, false);
    map.AddTBString(GenerWorkFlowViewAttr.FK_NY, null, '发起月份', true, true, 0, 100, 150);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 100, 150);

    //单组织版
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) {
      if (WebUser.IsAdmin == false) map.AddHidden('Starter', ' LIKE ', '%@WebUser.No%');
    } else {
      map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');
      if (WebUser.IsAdmin == false) map.AddHidden('Starter', ' LIKE ', '%@WebUser.No%');
    }

    map.DTSearchKey = GenerWorkFlowViewAttr.RDT;
    map.DTSearchWay = DTSearchWay.ByDateRange; //.多个解析

    //外键枚举条件.
    map.AddSearchAttr(GenerWorkFlowViewAttr.WFSta);
    map.AddSearchAttr(GenerWorkFlowViewAttr.FK_FlowSort);

    map.AddGroupMethod('实例运维');
    const rmGJ = new RefMethod();
    rmGJ.Title = '查看工作';
    rmGJ.ClassMethod = 'DoTrack';
    rmGJ.Icon = 'icon-graph';
    rmGJ.Visable = true;
    rmGJ.Warning = '';
    rmGJ.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rmGJ);

    const rmTrack = new RefMethod();
    rmTrack.Title = '流程轨迹';
    rmTrack.ClassMethod = 'OpenTrack';
    rmTrack.Icon = 'icon-graph';
    rmTrack.Visable = false;
    rmTrack.Warning = '';
    rmTrack.IsForEns = true;
    rmTrack.RefMethodType = RefMethodType.FuncToolbar;
    map.AddRefMethod(rmTrack);

    if (WebUser.IsAdmin) {
      //管理处理人.
      map.AddRM_GL(new GL_AdminGenerList(), '管理处理人', 'icon-people'); //管理处理人.

      const rm2 = new RefMethod();
      rm2.Title = '移交';
      rm2.ClassMethod = 'Shift';
      rm2.HisMap.AddTBString('p1', null, '要移交的人员账号多个用逗号分开', true, false, 0, 100, 1000, true);
      rm2.HisMap.AddTBString('p2', null, '移交原因', true, false, 0, 100, 1000, true);
      map.AddRefMethod(rm2);

      const rm32 = new RefMethod();
      rm32.Title = '增加查阅人';
      rm32.ClassMethod = 'AddViewer';
      rm32.HisMap.AddTBString('p1', null, '要增加的人员账号多个用逗号分开', true, false, 0, 100, 1000, true);
      // map.AddRefMethod(rm32);

      // map.AddMapLoader(() => {
      //   map.AddRM_UrlTabOpen('移交', '/src/WF/Comm/En.vue?EnName=TS.WorkOpt.Shift&WorkID=' + this.WorkID, 'icon-people');
      // });

      //调整
      map.AddRM_GPN(new GPN_ReSend(), 'icon-people');
      map.AddRM_GL(new GL_AdminReback(), '回滚', 'icon-people'); //回滚处理人.

      // const rmShift = new RefMethod();
      // rmShift.Icon = 'icon-key';
      // rmShift.Title = '移交';
      // rmShift.ClassMethod = 'DoFlowShift';
      // rmShift.Warning = '';
      // rmShift.RefMethodType = RefMethodType.Func;
      // map.AddRefMethod(rmShift);

      const rmQZ = new RefMethod();
      rmQZ.Icon = 'icon-key';
      rmQZ.Title = '强制结束';
      rmQZ.Warning = '您确定要结束吗？';
      rmQZ.ClassMethod = 'DoFlowOver';
      rmQZ.HisMap.AddTBString('BeiZhu', null, '备注', true, false, 0, 100, 300);
      map.AddRefMethod(rmQZ);

      const rmLJ = new RefMethod();
      rmLJ.Title = '逻辑删除';
      rmLJ.ClassMethod = 'DoDeleteFlag';
      rmLJ.HisMap.AddTBString('Note', null, '删除原因', true, false, 0, 100, 100);
      rmLJ.Icon = 'icon-close';
      rmLJ.IsForEns = false;
      map.AddRefMethod(rmLJ);

      const rmDel = new RefMethod();
      rmDel.Title = '彻底删除';
      rmDel.ClassMethod = 'DoDelete';
      rmDel.Warning = '您确定要删除吗？包括该流程的所有数据。';
      rmDel.Icon = 'icon-close';
      rmDel.IsForEns = false;
      map.AddRefMethod(rmDel);

      map.AddGroupMethod('高级功能');
      //批量移交.
      map.AddRM_GPN(new GPN_WorkShiftBatch(), 'icon-people');
    }

    // const rmData = new RefMethod();
    // rmData.Icon = 'icon-wrench';
    // rmData.Title = '修复数据';
    // rmData.IsForEns = false;
    // rmData.ClassMethod = 'RepairDataIt';
    // rmData.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rmData);

    this._enMap = map;
    return this._enMap;
  }

  public async Shift(p1: String, p2: String): Promise<string> {
    const en = new BSEntity('BP.WF.GenerWorkFlow', this.WorkID);
    await en.Retrieve();
    const str = await en.DoMethodReturnString('Shift', p1, p2);
    return str.replace(/%40/g, '@');
    //return new GPNReturnObj(GPNReturnType.DoNothing, str);
  }

  public OpenTrack() {
    const url = `/src/WF/WorkOpt/OneWork.vue?WorkID=${this.WorkID}&FK_Flow=${this.FK_Flow}&FK_Node=${this.FK_Node}`;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  public async AddViewer(p1: String): Promise<string> {
    const en = new BSEntity('BP.WF.GenerWorkFlow', this.WorkID);
    await en.Retrieve();
    const str = await en.DoMethodReturnString('Shift', p1, p2);
    return str.replace(/%40/g, '@');
    //return new GPNReturnObj(GPNReturnType.DoNothing, str);
  }

  public async DoReBack(nodeID, note) {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    en.WorkID = this.WorkID;
    en.FlowNo = this.FK_Flow;
    if (nodeID == undefined) {
      return new GPNReturnObj(GPNReturnType.Error, '请选择节点');
    }
    if (note == undefined) note = '无';
    const str = await en.DoMethodReturnString('DoRollback', nodeID, note);
    return new GPNReturnObj(GPNReturnType.Message, str);
  }
  public DoTrack() {
    const url = '/#/WF/MyView?WorkID=' + this.WorkID + '&FK_Flow=' + this.FK_Flow + '&FK_Node=' + this.FK_Node;
    return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, url);
  }
  //修复数据.
  public async RepairDataIt(): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    en.WorkID = this.WorkID;
    en.FlowNo = this.FK_Flow;
    return await en.DoMethodReturnString('RepairDataIt');
  }

  //执行流程结束.
  public async DoFlowOver(note: string): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    en.WorkID = this.WorkID;
    return await en.DoMethodReturnString('DoFlowOver', note);
  }

  //执行逻辑删除.
  public async DoDeleteFlag(note: string): Promise<string> {
    const en = new BSEntity('BP.WF.Data.GenerWorkFlowView', this.WorkID.toString());
    await en.Init();
    await en.RetrieveFromDBSources();
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
  //执行移交.
  public async DoFlowShift() {
    const url = '/src/WF/Comm/En.vue?EnName=TS.WorkOpt.Shift&WorkID=' + this.WorkID + '&FID=' + this.FID + '&FK_Flow=' + this.FK_Flow + '&FK_Node=' + this.FK_Node;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '移交');
    // 通过iframe打开路由 就是 GPNReturnType.OpenIframeByDrawer
    // 通过文件路径打开  GPNReturnType.OpenUrlByModal | OpenUrlByDrawer75
  }
}

//流程实例查询s
export class GenerWorkFlowMys extends EntitiesWorkID {
  get GetNewEntity(): EntityWorkID {
    return new GenerWorkFlowMy();
  }
  constructor() {
    super();
  }
}
