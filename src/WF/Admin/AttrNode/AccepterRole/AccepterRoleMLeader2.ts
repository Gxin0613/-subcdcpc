import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { GloWF } from '/@/WF/Admin/GloWF';
import { NodeStation, NodeStations } from '/@/WF/Admin/AttrNode/NodeStation';

// 节点属性
export class AccepterRoleMLeader2 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleMLeader2');
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
    const map = new Map('WF_Node', '连续多级主管');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    // 选择顶级部门.
    map.AddTBString('NodeStations', null, '选择部门', true, false, 0, 100, 100, true);

    map.SetPopTree('NodeStations', GloWF.srcDeptLazily, '0', false, '600px', '800px', '选择部门', 'icon-people', false, true);

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterUpdate(): Promise<boolean> {
    const ens = new NodeStations();
    await ens.Delete('FK_Node', this.NodeID);
    if (typeof this.NodeStations !== 'string') {
      return Promise.resolve(true);
    }
    const strs = this.NodeStations.split(',');
    strs.forEach(async (str) => {
      const en = new NodeStation();
      en.FK_Node = this.NodeID;
      en.FK_Station = str;
      en.MyPK = this.NodeID + '_' + str;
      await en.Insert(); //插入到数据表.
    });

    return Promise.resolve(true);
  }
}
