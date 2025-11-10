import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';

// 节点属性
export class NodeFWC extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.NodeFWC');
    if (!!pkval) this.NodeID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '审核组件状态-批量修改');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, true, 0, 50, 200);
    map.AddDDLSysEnum(NodeExtAttr.FWCSta, 0, '审核组件状态', true, true, NodeExtAttr.FWCSta, '@0=禁用@1=启用@2=只读');

    // map.AddGroupMethod('基本配置');
    // //测试.
    // //节点工具栏,主从表映射.
    // map.AddRM_DtlBatch('工具栏-批量编辑', new NodeToolbars(), NodeToolbarAttr.FK_Node, '', '', '从表测试', 'icon-file');
    // //节点工具栏,主从表映射.
    // map.AddRM_DtlSearch('工具栏-列表编辑', new NodeToolbars(), NodeToolbarAttr.FK_Node, '', '', '', '从表测试', 'icon-file');
    // //当前节点表单
    // map.AddRM_GPE(new GPE_AutoStart(), 'icon-energy');
    // //关联引用其他节点表单
    // // map.AddRM_GPE(new GPE_FastInput(),"icon-docs");
    // //有上一个节点表单来确定
    // map.AddRM_GPE(new GPE_AutoStart(), 'icon-magnifier-add');

    this._enMap = map;
    return this._enMap;
  }
}

//审核组件状态-批量修改
export class NodeFWCs extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeFWC();
  }
  constructor() {
    super();
  }
}
