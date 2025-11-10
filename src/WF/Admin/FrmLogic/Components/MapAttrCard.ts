import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

// 证件
export class MapAttrCard extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SelfCommonent.MapAttrCard');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_MapAttr', '证件');

    map.AddMyPK();

    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20, true);

    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20);

    map.AddTBInt(MapAttrAttr.MinLen, 0, '最小长度', true, false);
    map.AddTBInt(MapAttrAttr.MaxLen, 50, '最大长度', true, false);
    map.SetHelperAlert(MapAttrAttr.MaxLen, '定义该字段的字节长度.');

    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    map.SetHelperAlert(MapAttrAttr.UIWidth, '对自由表单,从表有效,显示文本框的宽度.');

    map.AddTBInt(MapAttrAttr.UIContralType, 0, '控件', true, false);
    //显示的分组.

    map.AddTBInt(MapAttrAttr.Idx, 0, '序号', true, false);
    map.SetHelperAlert(MapAttrAttr.Idx, '对经典表单有效:用于调整字段在同一个分组中的顺序.');

    this._enMap = map;
    return this._enMap;
  }
}

//证件s
export class MapAttrCards extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrCard();
  }
  constructor() {
    super();
  }
}
