import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GPE_SelectorModel } from './GPE_SelectorModel';
import { SelecterAttr } from './SelecterFree';

// 节点属性
export class SelecterFix extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.SelecterFix');
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
    const map = new Map('WF_Node', '人员选择器');
    map.AddTBIntPK(NodeExtAttr.NodeID, 0, '节点ID', true);
    map.AddTBInt(SelecterAttr.SelectorModel, 0, '显示方式', false, false);

    map.AddBoolean(SelecterAttr.IsAutoLoadEmps, true, '是否自动加载上一次选择的人员？', true, true, true);
    map.AddBoolean(SelecterAttr.IsSimpleSelector, false, '是否单项选择(只能选择一个人)？', true, true, true);
    map.AddTBString(SelecterAttr.DeliveryParas, null, '参数', false, false, 0, 100, 100, false, null);
    map.AddTBString(SelecterAttr.SelectorP1, null, '选择人分组', false, false, 0, 100, 100, false, null);
    map.AddTBString(SelecterAttr.SelectorP2, null, '选择人员', false, false, 0, 100, 100, false, null);
    map.AddRM_GPE(new GPE_SelectorModel(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
}
