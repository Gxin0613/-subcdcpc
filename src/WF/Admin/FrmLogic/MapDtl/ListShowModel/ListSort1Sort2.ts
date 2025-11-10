import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { GloWF } from '../../../GloWF';

// 节点属性
export class ListSort1Sort2 extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Frm.ListSort1Sort2', 'BP.Sys.MapDtl');
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
    const map = new Map('Sys_MapDtl', '大类小类');

    map.AddTBStringPK('No', null, '从表ID', true, true, 0, 100, 10);
    map.AddTBString('Name', null, '名称', true, true, 0, 200, 10);

    //let sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@No' AND UIVisible=1 AND UIContralType=1`;
    map.AddDDLSQL('D1', '', '维度1字段', GloWF.SQLOfListShoModel3D(), true, '见帮助');
    map.AddDDLSQL('D2', '', '维度2字段', GloWF.SQLOfListShoModel3D(), true, '见帮助');
    map.AddTBAtParas();
    map.ParaFields = ',D1,D2,D1T,D2T,';
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
