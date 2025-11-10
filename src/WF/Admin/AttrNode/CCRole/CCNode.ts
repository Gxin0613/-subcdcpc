import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '../NodeExt';
import { GPE_CCWriteRole } from './GPE_CCWriteRole';
import { CCRoleAttr, CCRoles } from './CCRole';
import { NodeAttr } from '/@/WF/TSClass/Node';

// 节点属性
export class CCNode extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.AttrNode.CCNode');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('WF_Node', '抄送规则');
    map.EnClassID = this.classID;
    map.GroupBarShowModel = 0;

    map.AddGroupAttr('基本配置');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, true, 0, 200, 200, true);
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', false, false, 0, 5, 10);

    //基本设置.
    map.AddRM_GPE(new GPE_CCWriteRole(), 'icon-book-open');
    map.AddRM_DtlSearch('设置抄送人', new CCRoles(), CCRoleAttr.NodeID, '', '', '', 'icon-notebook', true);
    map.AddRM_EnOnly('审核组件', 'TS.WF.Template.NodeWorkCheck', '@NodeID', 'icon-note');
    this._enMap = map;
    return this._enMap;
  }
}
