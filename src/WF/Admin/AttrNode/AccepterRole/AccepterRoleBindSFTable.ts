import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { GloWF } from '../../GloWF';

// 节点属性
export class AccepterRoleBindSFTable extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleBindSFTable');
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
    const map = new Map('WF_Node', '绑定字典');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);

    // const help0 = `
    // #### 帮助.
    // - 请选择一个字典表.
    // - 字典表在字典库里维护，如果列表里没有您要的数据，请您在设置里增加字典.
    // - 设置字典：需要设置（无）参数的字典.
    // `;
    // const help1 = `
    // #### 帮助.
    // - 请选择一个字典表.
    // - 字典表在字典库里维护，如果列表里没有您要的数据，请您在设置里增加字典.
    // - 设置字典：需要设置有参数的字典.
    // `;

    map.AddTBString('DeliveryParas', null, '绑定字典(多参)', true, false, 0, 100, 100, true);
    //const sql = ` SELECT No,Name FROM Sys_SFTable WHERE CodeStruct=0 `;
    map.SetPopList('DeliveryParas', GloWF.srcBindSFTable, false, '600px', '800px', '请选择字典', 'icon-people');

    // MapExt.AddAttrSFTable(map, 'DeliveryParas', '绑定字典(多参)', 1, 0);
    this._enMap = map;
    return this._enMap;
  }
}
