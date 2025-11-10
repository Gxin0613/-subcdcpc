import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GloWF } from '../../GloWF';

// 节点属性
export class AccepterRoleByEmpsFrmDtl extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleByEmpsFrmDtl');
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
    const map = new Map('WF_Node', '从表里的人员编号字段');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.NodeFrmID, null, '表单ID', false, true, 100);
    let frmID = this.NodeFrmID;
    if (!frmID) frmID = 'ND@NodeID';
    //let sql = `SELECT No,Name From Sys_MapDtl Where FK_MapData!='' AND (FK_MapData='@NodeFrmID' OR FK_MapData='ND@NodeID')`;
    map.AddDDLSQL('DeliveryParas', null, '从表', GloWF.SQLOfFrmMapDtl(), true);

    map.AddTBString('DtlField', null, '从表列', true, false, 0, 50, 200, true);
    //sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@DeliveryParas' AND MyDataType=1 AND KeyOfEn Not IN ('AtPara','OID','RDT','GUID','Title','Rec','CDT')`;
    map.SetPopList('DtlField', GloWF.SQLOfFrmMapDtlColumn(), false, '800px', '300px', '选择字段');
    map.AddTBAtParas(4000);
    map.ParaFields = ',DtlField,';
    this._enMap = map;
    return this._enMap;
  }
}
