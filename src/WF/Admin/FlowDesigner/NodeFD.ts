import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { NodeAttr } from '/@/WF/TSClass/Node';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
// 节点属性
export class NodeFD extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.FD.NodeFD');
    //  super('TS.WF.FD.NodeFD', 'BP.WF.Template.NodeFD');
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
    const map = new Map('WF_Node', '节点属性');

    map.AddGroupAttr('基本配置');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString('Name', null, '名称', true, false, 0, 100, 10, false);
    map.AddDDLSysEnum('WhoExeIt', 0, '谁执行它', true, true, NodeAttr.WhoExeIt, '@0=操作员执行@1=机器执行@2=混合执行');

    // 撤销规则.
    const str1 = '@0=上一步可以撤销@1=不能撤销@2=上一步与开始节点可以撤销@3=指定的节点可以撤销';
    map.AddDDLSysEnum(NodeAttr.CancelRole, 0, '撤销规则', true, true, NodeAttr.CancelRole, str1);
    map.AddBoolean(NodeAttr.CancelDisWhenRead, false, '对方已经打开就不能撤销', false, true);

    map.AddBoolean(NodeAttr.IsOpenOver, false, '已阅即完成?', true, true, false);

    const str12 = '@0=禁用@1=启用@2=只读';
    map.AddDDLSysEnum(NodeAttr.FWCSta, 0, '审核组件', true, true, NodeAttr.FWCSta, str12);

    map.AddTBString(NodeAttr.Tip, null, '操作提示', true, false, 0, 100, 10, false, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3653667&doc_id=31094');
    // #endregion  基础属性
    map.AddTBString('Icon', null, '节点Icon', true, false, 0, 70, 10);
    map.AddTBInt('NodeType', 0, '节点类型', false, true);

    this._enMap = map;
    return this._enMap;
  }

  //一键设置审核组件模式,
  public DoSetCheckModel() {
    return '';
  }

  public DoNodeToolbars() {
    return '/WF/Comm/Dtl.vue?EnsName=TS.WF.Template.NodeToolbars&RefPK=FK_Node&RefPKVal=' + this.NodeID;
  }
}

//节点属性s
export class NodeFDs extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeFD();
  }

  constructor() {
    super();
  }
}
