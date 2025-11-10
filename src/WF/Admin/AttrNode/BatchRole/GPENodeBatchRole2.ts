import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';

// 节点属性
export class GPENodeBatchRole2 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.GPENodeBatchRole2');
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
    const map = new Map('WF_Node', '审核字段分组模式');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '节点名', true, true, 0, 300, 10, true);

    const str1 = '@0=选择的多条记录一个意见框@1=每个记录后面都有一个意见框@2=无意见';
    map.AddDDLSysEnum('BatchCheckNoteModel', 0, '填写意见格式', true, true, 'BatchCheckNoteModel', str1);
    map.AddTBInt('BatchCheckListCount', 0, '显示行数', true, false);

    map.AddTBString('BatchCheckNoteField', null, '设置分组字段', true, false, 0, 300, 10, true);

    map.AddTBString('BatchFields', null, '显示的字段', true, false, 0, 300, 10, true);
    map.AddTBString('EditFields', null, '可编辑的字段', true, false, 0, 300, 10, true);

    map.AddTBAtParas();

    map.ParaFields = ',BatchCheckNoteModel,BatchCheckListCount,BatchFields,EditFields,BatchCheckNoteField,';

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
}
