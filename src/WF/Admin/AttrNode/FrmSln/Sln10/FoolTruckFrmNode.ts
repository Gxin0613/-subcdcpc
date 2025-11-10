import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmNodeAttr } from '../FrmNode';
import { GPE_FrmCtrlSln } from '/@/WF/Admin/AttrNode/FrmSln/Sln5/GPE_FrmCtrlSln';

/// <summary>
/// 节点表单属性
/// </summary>
export class FoolTruckFrmNode extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FoolTruckFrmNode');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_FrmNode', '节点表单属性');

    map.AddGroupAttr('基本设置');
    map.AddMyPK(true);
    map.AddTBInt(FrmNodeAttr.FK_Node, 0, '节点ID', true, true);
    map.AddTBString(FrmNodeAttr.FK_Frm, null, '表单', true, true, 0, 300, 150);

    const help2 = '控制该表单数据元素权限的方案，如果是自定义方案，就要设置每个表单元素的权限.';
    map.AddDDLSysEnum(FrmNodeAttr.FrmSln, 0, '控制方案', false, true, FrmNodeAttr.FrmSln, '@0=默认方案@1=只读方案@2=自定义方案', help2, false);

    map.AddTBString(FrmNodeAttr.FK_Flow, null, '流程编号', false, false, 0, 4, 20);
    map.AddTBAtParas();
    map.AddGroupMethod('基本设置');
    map.AddRM_GPE(new GPE_FrmCtrlSln(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点表单属性s
 */
export class FoolTruckFrmNodes extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FoolTruckFrmNode();
  }
  constructor() {
    super();
  }
}
