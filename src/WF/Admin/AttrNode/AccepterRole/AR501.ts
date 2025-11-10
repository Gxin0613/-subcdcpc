import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';

// AR501
export class AR501 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AR501');
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
    const map = new Map('WF_Node', '直接上级');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString('AR501DeptNo', null, '部门编码', true, false, 0, 100, 100, true);
    map.AddTBInt('AR501StationType', 0, '岗位类型', true, false, true);
    map.AddTBAtParas(4000);

    //  map.SetPopGroupList('NodeStations', GloWF.srcStationTypes, GloWF.srcStations, true, '300px', '500px', '选择角色', 'icon-people', '1');
    //    map.AddRM_GPE(new GPE_ShenFenModel(), 'icon-drop');

    map.ParaFields = ',AR501DeptNo,AR501StationType,';

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterUpdate(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
