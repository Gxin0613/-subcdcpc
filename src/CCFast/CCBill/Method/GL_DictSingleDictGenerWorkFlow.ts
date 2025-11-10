import { MethodSingleDictGenerWorkFlow } from './MethodSingleDictGenerWorkFlow';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

export class GL_DictSingleDictGenerWorkFlow extends PageBaseGenerList {
  constructor() {
    super('GL_DictSingleDictGenerWorkFlow');
    this.PageTitle = '流程列表';
  }
  //重写的构造方法.
  async Init() {
    const workID = this.RequestVal('OID');

    const en = new MethodSingleDictGenerWorkFlow();
    en.No = this.RequestVal('MethodID');
    await en.Retrieve();

    this.PageSize = 10;
    this.GroupFields = 'FlowName'; //分组字段.
    this.LabFields = 'WFState';
    this.Icon = '';
    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.

    this.DTFieldOfSearch = 'RDT'; //按照日期范围查询的字段.
    this.DTFieldOfLabel = '日期'; //日期字段名.
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_OptOneFlow');
    handler.AddPara('FrmID', en.FrmID);
    handler.AddPara('No', en.No);
    handler.AddPara('MethodNo', en.No);
    handler.AddPara('WorkID', workID);
    const data = await handler.DoMethodReturnString('SingleDictGenerWorkFlows_Init');
    this.Columns = [
      { Key: 'Title', Name: '标题', width: 500 },
      { Key: 'StarterName', Name: '发起人', width: 160 },
      { Key: 'RDT', Name: '发起日期', width: 500 },
      { Key: 'NodeName', Name: '停留节点', width: 500 },
      { Key: 'Sender', Name: '发送人', width: 160 },
      { Key: 'WFState', Name: '状态', width: 160 },
    ];
    let ens = data['GenerWorkFlows'] || [];
    ens = ens.filter((en) => en.WFState > 1);
    ens.forEach((en) => {
      if (en.WFState == 2) en.WFState = '@新工作=green';
      if (en.WFState == 4) en.WFState = '@挂起=yellow';
      if (en.WFState == 7) en.WFState = '@作废=red';
      if (en.WFState == 5) en.WFState = '@退回=red';
      if (en.WFState == 3) en.WFState = '@归档=blue';
      if (en.WFState == 6) en.WFState = '@移交=red';
      if (en.WFState == 8) en.WFState = '@加签=gree';
    });
    this.Data = ens;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const isSinglePages = this.RequestVal('IsSinglePages') || '1';
    let url = `/@/WF/MyView.vue?WorkID=${object.WorkID}&FK_Flow=${object.FK_Flow}&FK_Node=${object.FK_Node}`;
    const isMobile = IsMobile();
    if (isMobile) url = url = `/@/CCMobile/MyView.vue?WorkID=${object.WorkID}&FK_Flow=${object.FK_Flow}&FK_Node=${object.FK_Node}&IsShowBar=0&IsSinglePages=${isSinglePages}`;

    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  //按钮事件.
  async BtnClick(btnName: string, object: Record<string, any>) {
    console.log(btnName);
    const isSinglePages = this.RequestVal('IsSinglePages') || 1;
    let url = `/@/WF/MyViewGener.vue?WorkID=${object.WorkID}&FK_Flow=${object.FK_Flow}&FK_Node=${object.FK_Node}`;
    const isMobile = IsMobile();
    if (isMobile) url = url = `/@/CCMobile/MyViewGener.vue?WorkID=${object.WorkID}&FK_Flow=${object.FK_Flow}&FK_Node=${object.FK_Node}&IsShowBar=0&IsSinglePages=${isSinglePages}`;

    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }
}
