import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
/// 节点表单属性
export class EnSearchCol extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Sys.EnSearchCol');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_MapExt', '字段列显示1');
    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 100, 20);
    map.AddTBString(MapExtAttr.ExtModel, null, '类型1', false, false, 0, 30, 20);
    map.AddTBString(MapExtAttr.ExtType, null, '类型2', false, false, 0, 30, 20);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '字段', true, true, 0, 30, 100);
    map.AddTBString(MapExtAttr.Tag, null, '中文名', true, false, 0, 2000, 150);
    map.AddTBInt(MapExtAttr.W, 100, '宽度', true, false);
    map.AddTBInt('Idx', 0, '顺序', true, false);
    //map.AddTBAtParas(300);
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点表单属性s
 */
export class EnSearchCols extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new EnSearchCol();
  }
  constructor() {
    super();
  }
}
