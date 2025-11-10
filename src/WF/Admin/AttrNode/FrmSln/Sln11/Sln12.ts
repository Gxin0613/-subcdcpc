import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { FrmNode, FrmNodes } from '../FrmNode';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { MapData } from '../../../FrmLogic/MapData';

// 节点属性
export class Sln12 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.AttrNode.Sln12');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
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
    const map = new Map('WF_Node', '单表单(绑定独立表单)');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '节点名称', true, true, 0, 50, 200);
    map.AddTBString(NodeExtAttr.FK_Flow, null, 'FK_Flow', false, false, 0, 50, 200);
    // let str = ' SELECT No,Name FROM Sys_MapData ';
    // str += "  WHERE Sys_MapData.FK_FormTree Is Not Null AND FK_FormTree !='' ";
    // map.AddDDLSQL(NodeExtAttr.NodeFrmID, null, '选择表单', str, true);
    map.AddTBString(NodeExtAttr.NodeFrmID, null, '表单ID', true, true, 0, 50, 200);
    //map.AddTBString('NodeFrmIDT', null, '表单名称', true, true, 0, 50, 200);
    //设置选择表单的Pop弹窗.
    //map.SetPopGroupList(NodeExtAttr.NodeFrmID, GloWF.srcFrmTree, GloWF.srcBindFrmList, false);

    map.AddGroupMethod('绑定单表单');
    // map.AddRM_DtlBatch('3.批量设置属性', new FrmNodeExts(), FrmNodeAttr.FK_Node);
    // const showAttrs = 'FK_Frm,FrmSln,WhoIsPK,FrmNameShow,CheckField,FrmEnableRole,';
    // const showAttrs = 'FK_Frm,FrmSln,WhoIsPK,FrmNameShow,FrmEnableRole';
    // map.AddRM_DtlSearch('绑定表单', new FrmNodes(), FrmNodeAttr.FK_Node, '', '', showAttrs, 'icon-drop', true, '');

    //相关功能.
    const url = '/#/WF/Comm/En?EnName=TS.AttrNode.FrmNodeExt&PKVal=@NodeFrmID_@FrmID_@FK_Flow'; // + this.NodeFrmID;
    map.AddRM_UrlTabOpen('节点表单属性', url, 'icon-drop');

    const rm = new RefMethod();
    rm.Title = '设置所有节点都采用此方案';
    rm.ClassMethod = 'DoSetIt';
    rm.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm);

    // map.AddGroupMethod('字段权限');
    // const rm1 = new RefMethod();
    // rm1.Title = '表单属性';
    // rm1.ClassMethod = 'DoFrmAttr';
    // rm1.RefMethodType = RefMethodType.LinkModel;
    // map.AddRefMethod(rm1);
    // map.AddRM_UrlRightFrameOpen('批量设置', '/src/', '高级设置');

    this._enMap = map;
    return this._enMap;
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    try {
     // debugger;
      const frmNode = new FrmNode();
      frmNode.MyPK = this.NodeFrmID + '_' + this.NodeID + '_' + this.FK_Flow;
      const num = await frmNode.RetrieveFromDBSources();
      frmNode.FK_Node = this.NodeID;
      frmNode.FK_Frm = this.NodeFrmID;
      frmNode.FK_Flow = this.FK_Flow;
      // frmNode.FrmNameShow = this.Name; //表单名称.
      frmNode.SetPara('EnName', 'TS.AttrNode.FrmNodeExt');
      if (num == 0) {
        const mapdata = new MapData(this.NodeFrmID);
        await mapdata.RetrieveFromDBSources();
        frmNode.FrmNameShow = mapdata.Name;
        await frmNode.Insert();
      } else {
        await frmNode.Update();
      }

      const frmNodes = new FrmNodes();
      await frmNodes.Retrieve('FK_Node', this.NodeID);
      for (const frmNode1 of frmNodes) {
        if (frmNode1.FK_Frm != this.NodeFrmID) await frmNode1.Delete();
      }

      return true;
    } catch (e: any) {
      alert(e);
      return false;
    }
  }

  public DoFrmAttr() {
    if (this.NodeFrmID == '' || this.NodeFrmID == null) return 'err@错误,请先设置表单ID.';
    return 'url@/src/WF/Comm/En.vue?EnName=TS.AttrNode.FrmNodeExt&PKVal=' + this.NodeFrmID + '_' + this.NodeFrmID + '_' + this.FK_Flow;
  }

  public async DoSetIt() {
    if (this.NodeFrmID == '' || this.NodeFrmID == null) throw new Error('err@错误,请先设置表单ID.');

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
    handler.AddPara('FK_Node', this.NodeID);
    const data = await handler.DoMethodReturnString('RefOneFrmTree_SetAllNodeFrmUseThisSln');
    return data;
  }
}
