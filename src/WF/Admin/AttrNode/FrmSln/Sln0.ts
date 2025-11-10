import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import HttpHandler from '/@/utils/gener/HttpHandler';

// 节点属性
export class Sln0 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Sln0');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.NodeID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '内置-经典表单');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, false, 0, 50, 200);

    // //绑定表单
    // // map.AddRM_One2Many_GroupList('1.绑定表单', new FrmNodeExts(), new FrmAdms(), FrmNodeAttr.FK_Node, FrmNodeAttr.FK_Frm, new FrmSorts(), MapDataAttr.FK_FormTree, 'icon-file');

    // //map.AddRM_One2Many_GroupList("分组", new NodeStations(), new Stations(),
    // //NodeStationAttr.FK_Node, NodeStationAttr.FK_Station, new StationTypes(), "FK_Station",
    // //"绑定角色", "icon-file");
    // const rm = new RefMethod();
    // rm.Title = '2.设置该流程所有节点都采用此方案';
    // rm.Warning = '您确定要执行,设置该流程所有节点都采用此方案吗?';
    // rm.ClassMethod = 'DoSetIt';
    // rm.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rm);
    // // map.AddRM_DtlBatch('3.批量设置属性', new FrmNodeExts(), FrmNodeAttr.FK_Node);
    // map.AddRM_DtlSearch('批量设置属性', new FrmNodeExts(), FrmNodeAttr.FK_Node, '', '', '', '', false);
    //map.AddRM_Url_RightFrameOpen("批量设置", "/src/", "高级设置");

    this._enMap = map;
    return this._enMap;
  }

  public DoFrmAttr() {
    if (this.NodeFrmID == '' || this.NodeFrmID == null) return 'err@错误,请先设置表单ID.';

    return 'url@/src/WF/Comm/En.vue?EnName=TS.AttrNode.FrmNodeExt&PKVal=' + this.NodeID + '_' + this.NodeFrmID;
  }

  public async DoSetIt() {
    if (this.NodeFrmID == '' || this.NodeFrmID == null) throw new Error('err@错误,请先设置表单ID.');
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
    handler.AddPara('FK_Node', this.NodeID);
    return await handler.DoMethodReturnString('RefOneFrmTree_SetAllNodeFrmUseThisSln');
  }
}
