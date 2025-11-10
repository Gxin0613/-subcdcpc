import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { GloWF } from '../../../GloWF';

// 节点属性
export class ListShoModel3D extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Frm.ListShoModel3D', 'BP.Sys.MapDtl');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('Sys_MapDtl', '2维表字段');

    map.AddTBStringPK('No', null, '从表ID', true, true, 0, 100, 10);
    map.AddTBString('Name', null, '名称', true, true, 0, 200, 10);

    //let sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@No' AND UIVisible=1 AND UIContralType=1 `;
    map.AddDDLSQL('D1', '', '维度1字段', GloWF.SQLOfListShoModel3D(), true, '见帮助');
    map.AddDDLSQL('D2', '', '维度2字段', GloWF.SQLOfListShoModel3D(), true, '见帮助');
    map.AddDDLSQL('D3', '', '维度3字段', GloWF.SQLOfListShoModel3D(), true, '见帮助');
    //sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@No' AND UIVisible=1 AND MyDataType IN(2,3,5,8)`;
    map.AddDDLSQL('NumberField', '', '数值字段', GloWF.SQLOfListlNumberField(), true, '见帮助');
    map.AddTBAtParas();
    map.ParaFields = ',D1,D2,D3,D1T,D2T,D3T,NumberField,NumberFieldT,';
    // //绑定角色.
    // map.AddGroupMethod('绑定角色');
    // map.AddRM_One2Many_List('平铺模式设置角色', new NodeStations(), new Stations(), NodeStationAttr.FK_Node, NodeStationAttr.FK_Station, 'icon-file');
    // map.AddRM_One2Many_GroupList(
    //   '分组模式设置角色',
    //   new NodeStations(),
    //   new Stations(),
    //   NodeStationAttr.FK_Node,
    //   NodeStationAttr.FK_Station,
    //   new StationTypes(),
    //   'FK_StationType',
    //   'icon-file',
    // );

    this._enMap = map;
    return this._enMap;
  }
}
