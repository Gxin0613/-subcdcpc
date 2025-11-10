import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GloWF } from '../../GloWF';

export class GPENodeBatchRoleAttr {
  public static readonly BatchCheckNoteModel = 'BatchCheckNoteModel';
  public static readonly BatchCheckListCount = 'BatchCheckListCount';
  public static readonly BatchFields = 'BatchFields';
  public static readonly EditFields = 'EditFields';
}

// 节点属性
export class GPENodeBatchRole1 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.GPENodeBatchRole1');
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
    const map = new Map('WF_Node', '审核组件模式');

    map.AddTBIntPK(NodeExtAttr.NodeID, 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, false, 0, 100, 10);
    map.AddTBString(NodeExtAttr.FK_Flow, null, 'FK_Flow', false, false, 0, 100, 10);

    const str1 = '@0=选择的多条记录一个意见框@1=每个记录后面都有一个意见框@2=无意见';
    map.AddDDLSysEnum(GPENodeBatchRoleAttr.BatchCheckNoteModel, 0, '填写意见格式', true, true, 'BatchCheckNoteModel', str1, null, true);
    map.AddTBInt(GPENodeBatchRoleAttr.BatchCheckListCount, 12, '显示行数', true, false, false, this.ShowRows);

    map.AddTBString(GPENodeBatchRoleAttr.BatchFields, null, '显示的字段', true, false, 0, 300, 10, true, this.Note1);
    map.AddTBString(GPENodeBatchRoleAttr.EditFields, null, '可编辑的字段', true, false, 0, 300, 10, true, this.Note2);

    // const sqlGroup = `SELECT OID as No, Lab as Name FROM Sys_GroupField WHERE FrmID='ND@Rpt' ORDER BY Idx `;
    // const sqlList = `SELECT KeyOfEn as No, Name,GroupID as GroupNo FROM Sys_MapAttr WHERE FK_MapData='ND@NodeID' Order BY Idx `;
    // const frmID = 'ND' + parseInt(flowNo) + 'Rpt';
    // const sqlFrm = GloWF.SQLOfMapAttrsGener(frmID); // 获得SQL

    //const cc= GloWF.srcFrmGroups
    // map.SetPopGroupList(GPENodeBatchRoleAttr.BatchFields, sqlGroup, sqlList, true);
    // map.SetPopGroupList(GPENodeBatchRoleAttr.EditFields, sqlGroup, sqlList, true);

    // map.AddTBString('EditFields', null, '可编辑的字段', true, false, 0, 300, 10, true);
    //map.AddTBStringDoc('EditFields', null, '可编辑的字段AddTBStringDoc', true, false, true);
    map.AddTBAtParas();
    map.ParaFields = ',BatchCheckNoteModel,BatchCheckListCount,BatchFields,EditFields,';

    // //绑定角色.
    // map.AddGroupMethod('绑定角色');
    // map.AddRM_One2Many_List('平铺模式设置角色', new NodeStations(), new Stations(), NodeStationAttr.FK_Node, NodeStationAttr.FK_Station, 'icon-file');
    // map.AddRM_One2Many_GroupList(
    //   '分组模式设置角色',
    //   new NodeStations(),
    //   new Stations(),
    //   NodeStationAttr.FK_Node,
    //   NodeStationAttr.FK_Station,
    //   new StationTypes(),
    //   'FK_StationType',
    //   'icon-file',
    // );

    this._enMap = map;
    return this._enMap;
  }
  public readonly ShowRows = `
  #### 帮助
   - 显示的行数,就是每页显示多少条记录.
   - 设置太多批量审核就会导致系统太慢.
   `;
  public readonly Note1 = `
  #### 帮助
   - 设置显示的列表字段，多个字段用逗号分开.
   - 比如： Tel,Addr,Email
   - 这里的字段是可以编辑的字段.
   `;
  public readonly Note2 = `
   #### 帮助
    - 设置显示的列表字段，多个字段用逗号分开.
    - 比如： Tel,Addr,Email
    `;
}
