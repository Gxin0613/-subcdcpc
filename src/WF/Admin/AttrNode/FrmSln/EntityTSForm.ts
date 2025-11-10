import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { FrmNode } from '/@/WF/Admin/AttrNode/FrmSln/FrmNode';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';

// 节点属性
export class EntityTSForm extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.EntityTSForm', 'BP.WF.Template.NodeExt');
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
    const map = new Map('WF_Node', 'EntityTS高代码');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.FK_Flow, null, 'FK_Flow', false, false, 0, 50, 200);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, true, 0, 50, 200);

    map.AddTBString(NodeExtAttr.FormUrl, null, '高代码', true, false, 0, 50, 200, true);
    map.AddTBAtParas(500);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    try {
      const frmNode = new FrmNode();
      frmNode.MyPK = this.FormUrl + '_' + this.NodeID + '_' + this.FK_Flow;
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
        return true;
      }

      await frmNode.Update();
      return true;
    } catch (e: any) {
      alert(e);
      return false;
    }
  }
}
