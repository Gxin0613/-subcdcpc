import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { FrmSubFlow } from './FrmSubFlow';
import { NodeAttr } from './Node';
import { NodeWorkCheck } from '/@/WF/Admin/AttrNode/NodeWorkCheck';
import { FrmTrack } from '../Comm/Components/FrmTrack';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';

/// <summary>
/// 自定义工具栏
/// </summary>
export class FrmNodeComponent extends EntityNodeID {
  constructor(oid?: number) {
    super('TS.WF.Template.FrmNodeComponent');
    if (!!oid) {
      this.OID = oid;
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
    const map = new Map('WF_Node', '节点表单组件');

    map.AddTBIntPK(NodeAttr.NodeID, 0, '节点ID');
    map.AddTBString(NodeAttr.Name, null, '节点名称', true, true, 0, 100, 10);

    const fwc = new NodeWorkCheck();
    map.AddAttrs(fwc._enMap.attrs);

    const subflow = new FrmSubFlow();
    map.AddAttrs(subflow._enMap.attrs);

    //轨迹组件.
    const track = new FrmTrack();
    map.AddAttrs(track._enMap.attrs);

    //流转自定义组件.
    //const ftt = new FrmTransferCustom();
    //map.AddAttrs(ftt._enMap.attrs);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 自定义工具栏s
 */
export class FrmNodeComponents extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new FrmNodeComponent();
  }
  constructor() {
    super();
  }
}
