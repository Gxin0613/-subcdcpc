import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Flow, FlowAttr } from '../../TSClass/Flow';
import { SubTablePostion } from '/@/bp/en/Config';
import { GL_FlowCheckInfo } from './GL_FlowCheckInfo';
import { GL_FlowTester } from '../../GenerList/GL_FlowTester';
import { NodeBatchWorkChecks } from '../AttrNode/NodeBatchWorkCheck';
import GloFrm from '../FrmLogic/GloFrm';
import { MapData } from '../FrmLogic/MapData';
import { GL_BatchFlow } from './GL_BatchFlow';
import { BaseEntityExt } from '/@/bp/UIEntity/BaseEntityExt';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { DataV_OneFlowAdmin } from '../../TSClass/DataV_OneFlowAdmin';
import { DataV_OneFlowEmp } from '../../TSClass/DataV_OneFlowEmp';
import { GloComm } from '../../Comm/GloComm';
import { FlowDevModel } from '../EnumLab';
import { GL_Todolist } from '../../GenerList/GL_Todolist';
import { GL_Runing } from '../../GenerList/GL_Runing';
import { GL_Complete } from '../../GenerList/GL_Complete';
import { GL_Draft } from '../../GenerList/GL_Draft';
import { getAppEnvConfig } from '/@/utils/env';

// 流程属性
export class FlowJiJian extends EntityNoName {
  constructor(no?: string) {
    // super('TS.WF.FD.FlowFD', 'BP.WF.Template.FlowFD');
    super('TS.WF.FD.FlowJiJian');
    //关联更新的类.
    this.setPKVal(no);
  }

  override GetRefExt(): WaiGuaBaseEntity | BaseEntityExt | null {
    const ext = new BaseEntityExt(this);
    ext.EnOption.isFramework = true;
    return ext;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Flow', '流程设计');

    map.AddGroupAttr('流程设计');
    map.AddTBStringPK(FlowAttr.No, null, '编号', true, false, 1, 4, 3);

    map.AddMapLoader(() => {
      map.AddGroupMethod('流程设计', 'icon-settings');
      //const url = GloWF.DealExp();
      map.AddRM_UrlTabOpen('1.设计流程', '/src/WF/Admin/FlowDesigner/index.vue?hideEntry=1&FlowNo=' + this.No, 'icon-organization');
      map.AddRM_GL(new GL_BatchFlow(), '2.接受人规则', 'icon-people', '&DoType=Accepter&FlowNo=@No');
      map.AddRM_DtlBatch('3.审核组件', new NodeBatchWorkChecks(), 'FK_Flow', '', '', 'icon-check', '', SubTablePostion.Left);
      const rm = new RefMethod();
      rm.ClassMethod = 'DFrm';
      rm.Title = '4.设计表单';
      rm.RefMethodType = RefMethodType.Func;
      rm.Icon = 'icon-star';
      rm.Warning = '';
      map.AddRefMethod(rm);
      map.AddRM_GL(new GL_FlowCheckInfo(), '5.流程检查', 'icon-like', '&FlowNo=' + this.No);
      map.AddRM_GL(new GL_FlowTester(), '6.测试运行', 'icon-paper-plane', '&FlowNo=' + this.No);

      // map.AddGroupMethod('高级设置', 'icon-notebook');
      // 我认为极简模式打开属性就可以了，不用完全配置 wanglu
      // map.AddRM_UrlTabOpen('流程属性', '/src/WF/Comm/EnOnly.vue?EnName=TS.WF.Template.FlowExt&PKVal=' + this.No, 'icon-fire');
      // map.AddRM_UrlRightFrameOpen('流程属性', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');
      // 通过什么方式来管理节点属性？ by wanglu
      // map.AddRM_UrlRightFrameOpen('节点属性', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');
      // map.AddRM_UrlTabOpen('流程二开', `/src/WF/Comm/En.vue?EnName=TS.WF.FlowRptSetting&PKVal=${this.No}&FlowNo=${this.No}`, 'icon-fire');

      map.AddGroupMethod('流程应用', 'icon-cup');
      // 这些地方只需要打开SearchFlow，管理此流程 wanglu
      //  const urlSearchFlow= GloWF.s
      map.AddRM_UrlTabOpen('我的流程', '/src/WF/Rpt/SearchFlow.vue?FlowNo=' + this.No, 'icon-home');
      map.AddRM_GL(new GL_Todolist(), '待办', 'icon-clock', '&FlowNo=' + this.No);
      map.AddRM_GL(new GL_Draft(), '草稿', 'icon-note', '&FlowNo=' + this.No);
      map.AddRM_GL(new GL_Runing(), '在途', 'icon-hourglass', '&FlowNo=' + this.No);
      map.AddRM_GL(new GL_Complete(), '已完成', 'icon-check', '&FlowNo=' + this.No);

      // map.AddRM_UrlRightFrameOpen('发起', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');
      // map.AddRM_UrlRightFrameOpen('待办', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');
      // map.AddRM_UrlRightFrameOpen('在途', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');

      // map.AddGroupMethod('流程统计', 'icon-notebook');
      // map.AddRM_UrlRightFrameOpen('个人统计', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');
      // map.AddRM_UrlRightFrameOpen('组织统计', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');
      map.AddRM_DataV(new DataV_OneFlowAdmin(), 'icon-pie-chart', '', '&FlowNo=' + this.No);
      map.AddRM_DataV(new DataV_OneFlowEmp(), 'icon-user', '', '&FlowNo=' + this.No);
      map.AddRM_UrlTabOpen('流程报表', '/src/WF/Rpt/RptFlow.vue?FlowNo=' + this.No, 'icon-docs');

      //帮助
      const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
      if (!VITE_GLOB_HIDE_HELP_DOCS) {
        map.AddGroupMethod('代码开发');
        map.AddRM_UrlLinkeWinOpen('外挂二开', 'https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl', 'icon-puzzle');
        map.AddRM_UrlLinkeWinOpen('视频教程', 'http://ccflow.org/Ke.html?From=local', 'icon-puzzle');
      }

      // map.AddRM_HelpDocs('帮助', '/src/WF/Comm/HelpDocs.vue?key=HelpFEE', this.HelpFEE);
      // map.AddRM_HelpDocs('FEE-Java', '/src/WF/Comm/HelpDocs.vue?key=Dev_FEE_Java', this.Dev_FEE_Java, 'icon-puzzle');
      // map.AddRM_HelpDocs('FEE-Net', '/src/WF/Comm/HelpDocs.vue?key=Dev_FEE_Net', this.Dev_FEE_Net, 'icon-key');
      // map.AddRM_HelpDocs('API', '/src/WF/Comm/HelpDocs.vue?key=APIDesc', this.APIDesc, 'icon-puzzle');
      // map.AddRM_HelpDocs('帮助-报表', '/src/WF/Comm/HelpDocs.vue?key=RptHelp', this.RptHelp);
      // map.AddRM_HelpDocs('帮助-帮助', '/src/WF/Comm/HelpDocs.vue?key=HelpFlow', this.HelpFlow);
    });

    // /**********************************  流程时限规则   */
    // //时限规则.
    // map.AddRM_GPE(new GPE_SDTOfFlow(), 'icon-file');

    // map.AddRM_GPE(new GPE_DeadLineRole(), 'icon-file');

    // /**********************************  开发接口   */
    // map.AddGroupMethod('开发接口');
    // map.AddRM_UrlRightFrameOpen('URL调用接口', '/src/WF/Admin/AttrFlow/Dev2Interface/Dev_Url.vue', 'icon-file');

    // //同步数据
    // map.AddRM_GPE(new GPE_DTSTable(), 'icon-file');

    // //节点工具栏,主从表映射.
    // map.AddRM_DtlSearch('流程事件', new FlowEvents(), SysEventAttr.RefFlowNo, '', '', 'EventDoType,DoDoc', 'icon-fire');

    // //map.AddRM_DtlSearch('流程事件', new FlowEvents(), SysEventAttr.RefFlowNo, '', '', 'EventDoType,DoDoc', 'icon-fire');

    // //增加链接.
    // map.AddRM_UrlRightFrameOpen('SDK开发接口', '/src/WF/Admin/AttrFlow/Dev2Interface/Dev_SDK.vue', 'icon-fire');
    // map.AddRM_UrlRightFrameOpen('FEE代码接口', '/src/WF/Admin/AttrFlow/Dev2Interface/Dev_FEE.vue', 'icon-fire');
    // map.AddRM_UrlRightFrameOpen('自定义流程属性', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');

    // const rm5 = new RefMethod();
    // rm5.Title = '检查流程';
    // rm5.Warning = '您确定要执行吗?大概需要1-2分钟左右.';
    // rm5.GroupName = '开发接口';
    // rm5.ClassMethod = 'CheckFlow';
    // rm5.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rm5);

    // const rm6 = new RefMethod();
    // rm6.Title = '删除指定的流程';
    // rm6.Warning = '您确定要执行吗?删除后不可恢复.';
    // rm6.GroupName = '开发接口';
    // rm6.ClassMethod = 'DeleteByWorkID';
    // rm6.HisMap.AddTBInt('WorkID', 'WorkID', 0, '工作ID', true, false);
    // rm6.HisMap.AddTBString('Note', 'Note', '请输入原因', true, false, 0, 100, 100);
    // rm6.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rm6);

    this._enMap = map;
    return this._enMap;
  }

  public async DFlow() {
    return '';
  }
  public async DFrm() {
    const flow = new Flow();
    await flow.Init();

    flow.No = this.No;
    await flow.RetrieveFromDBSources();
    const openFrmRM = new RefMethod();
    //绑定单表单.
    if (flow.FlowDevModel == FlowDevModel.JiJian || flow.FlowDevModel == FlowDevModel.RefOneFrmTree) {
      let frmID = flow.FrmUrl;
      if (frmID == null || frmID == '') frmID = 'ND' + parseInt(flow.No + '01');
      await GloFrm.CheckForm(frmID);
      const md = new MapData(frmID);
      await md.RetrieveFromDBSources();
      // 如果是极简模式
      const url = md.UrlDesigner() + '&FlowNo=' + flow.No;
      openFrmRM.ClassMethod = url;
      openFrmRM.RefMethodType = RefMethodType.TabIframeOpen; // 打开iframe页
      openFrmRM.Title = '2.表单设计';
      return openFrmRM;
    }
    const myurl = GloComm.UrlGenerList('GL_BatchFlow', '&DoType=Frm&FlowNo=' + this.No);
    openFrmRM.ClassMethod = myurl;
    openFrmRM.RefMethodType = RefMethodType.TabOpen; // 打开组件
    openFrmRM.Title = '2.表单设计';
    return openFrmRM;
  }
}
