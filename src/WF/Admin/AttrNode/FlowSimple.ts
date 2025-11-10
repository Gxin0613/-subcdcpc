import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { NodeAttr } from '../../TSClass/Node';
import { EntityNoName } from '/@/bp/en/EntityNoName';

/// <summary>
/// 流程
/// </summary>
export class FlowSimple extends EntityNoName {
  constructor(pkval?: number) {
    super('TS.WF.FlowSimple');
    if (!!pkval) {
      this.NodeID = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Flow', '流程');

    map.AddTBStringPK('No', null, '编号', false, false, 0, 3, 10);
    map.AddTBString('Name', null, '名称', false, false, 0, 200, 10);

    //开始节点的坐标
    map.AddTBInt(NodeAttr.X, 0, 'X坐标', false, false);
    map.AddTBInt(NodeAttr.Y, 0, 'Y坐标', false, false);

    this._enMap = map;
    return this._enMap;
  }
}
