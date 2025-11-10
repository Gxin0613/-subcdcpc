import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { FrmNodeExts } from './FrmNodeExt';
import { FrmNodeAttr } from '../FrmNode';
import { FrmNodeBatchs } from './FrmNodeBatch';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

// 节点属性
export class Sln5 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.AttrNode.Sln5');
    if (!!pkval) this.NodeID = pkval;
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
    const map = new Map('WF_Node', '多表单');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, true, 0, 50, 200);
    map.AddTBInt('FrmSummaryFieldRole', 0, '摘要字段规则', false, false);
    map.AddTBString('FrmSummaryFields', null, '摘要字段s', false, false, 0, 50, 200);
    map.AddTBString('FrmSummaryNames', null, '字段名称', false, false, 0, 50, 200);

    const cfg = '@0=表单树@1=为1个表单的时候,按绑定表单库的表单计算@2=Tab标签页';
    map.AddDDLSysEnum('SheetTreeModel', 0, '展示方式设置', true, true, 'SheetTreeModel', cfg, '工作处理器的展现方式.', false);
    map.ParaFields = ',FrmSummaryFieldRole,FrmSummaryFields,SheetTreeModel,';
    map.AddTBAtParas();

    map.AddGroupMethod('绑定多表单');
    // map.AddRM_DtlBatch('3.批量设置属性', new FrmNodeExts(), FrmNodeAttr.FK_Node);
    // const showAttrs = 'FK_Frm,FrmSln,WhoIsPK,FrmNameShow,CheckField,FrmEnableRole,';
    const showAttrs = 'FK_Frm,FrmSln,WhoIsPK,FrmNameShow,FrmEnableRole,IsEnableFWC';
    map.AddRM_DtlSearch('绑定表单', new FrmNodeExts(), FrmNodeAttr.FK_Node, '', '', showAttrs, 'icon-drop', true, '');
    map.AddRM_DtlBatch('批量修改', new FrmNodeBatchs(), FrmNodeAttr.FK_Node, '', '', 'icon-drop', '');

    const rm = new RefMethod();
    rm.Title = '设置所有节点都采用此方案';
    rm.Warning = '您确定要执行,设置该流程所有节点都采用此方案吗?';
    rm.ClassMethod = 'DoSetIt';
    rm.RefMethodType = RefMethodType.FuncToolbar;
    map.AddRefMethod(rm);

    // const rm1 = new RefMethod();
    // rm1.Title = '设置';
    // rm1.Warning = '您确定要执行,设置该流程所有节点都采用此方案吗?';
    // rm1.ClassMethod = 'DoSetIt';
    // rm1.RefMethodType = RefMethodType.FuncToolbar;
    // map.AddRefMethod(rm1);

    this._enMap = map;
    return this._enMap;
  }

  public DoFrmAttr() {
    if (this.NodeFrmID == '' || this.NodeFrmID == null) return 'err@错误,请先设置表单ID.';
    //return 'url@/src/WF/Comm/En.vue?EnName=TS.AttrNode.FrmNodeExt&PKVal=' +;
    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.AttrNode.FrmNodeExt', this.NodeID + '_' + this.NodeFrmID));
  }

  public async DoSetIt() {
    //  if (this.NodeFrmID == '' || this.NodeFrmID == null) throw new Error('err@错误,请先设置表单ID.');
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
    handler.AddPara('FK_Node', this.NodeID);
    return await handler.DoMethodReturnString('SheetTree_SetAllNodeFrmUseThisSln');
  }
}
