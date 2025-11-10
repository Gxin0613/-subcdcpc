import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GPE_ShenFenModel } from './GPE_ShenFenModel';
import { GloWF } from '../../GloWF';
import { NodeStation, NodeStations } from '../NodeStation';

// 绑定角色
export class ARStation extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.ARStation');
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
    const map = new Map('WF_Node', '绑定角色');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString('Name', null, '名称', true, true, 0, 100, 100);

    map.AddTBString('NodeStations', null, '角色', true, false, 0, 100, 100, true);
    map.SetPopGroupList('NodeStations', GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择角色', 'icon-people', '1');

    map.AddRM_GPE(new GPE_ShenFenModel(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterUpdate(): Promise<boolean> {
    //删除原来的数据. liyongchao, 2022-12-19
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
