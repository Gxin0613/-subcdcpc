import { Map } from '/@/bp/en/Map/Map';
import { FrmNodeAttr } from '../FrmNode';
import { FoolTruckFrmNodes } from '/@/WF/Admin/AttrNode/FrmSln/Sln10/FoolTruckFrmNode';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { UAC } from '/@/bp/en/Map/UAC';
// 节点属性
export class Sln10 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.AttrNode.Sln10');
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
    const map = new Map('WF_Node', '累加表单');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, true, 0, 50, 200);
    map.AddTBAtParas();

    map.AddGroupMethod('累加表单');
    //map.AddRM_DtlSearch('累加的表单', new FrmNodeExts(), FrmNodeAttr.FK_Node, '', '', showAttrs, 'icon-drop', true, '');
    map.AddRM_DtlSearch('累加的表单', new FoolTruckFrmNodes(), FrmNodeAttr.FK_Node, '', '', 'MyPK,FK_Node,FK_Frm,FrmSln', 'icon-drop');

    const rm = new RefMethod();
    rm.Title = '设置所有节点都采用此方案';
    rm.Warning = '您确定要执行,设置该流程所有节点都采用此方案吗?';
    rm.ClassMethod = 'DoSetIt';
    rm.RefMethodType = RefMethodType.FuncToolbar;
    map.AddRefMethod(rm);
    this._enMap = map;
    return this._enMap;
  }

  public async DoSetIt() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
    handler.AddPara('FK_Node', this.NodeID);
    return await handler.DoMethodReturnString('FoolTruck_SetAllNodeFrmUseThisSln');
  }
}
