import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';

// 节点属性
export class BlockModelAdvSetting extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.BlockModelAdvSetting');
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
    const map = new Map('WF_Node', '阻塞高级设置');
    map.AddTBIntPK('NodeID', 0, '节点ID', false);
    map.AddTBString('BlockAlert', null, '阻塞内容', true, false, 0, 500, 100, true);

    this._enMap = map;
    return this._enMap;
  }
}
