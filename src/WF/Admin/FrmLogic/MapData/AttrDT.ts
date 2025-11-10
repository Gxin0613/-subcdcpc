import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

/// <summary>
/// 字段属性
/// </summary>
export class AttrDT extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.AttrDT');
    if (!!mypk) this.MyPK = mypk;
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_MapAttr', '日期字段');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 150);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 190, true);

    map.AddTBString(MapAttrAttr.DefVal, null, '默认值表达式', true, false, 0, 400, 200, true);

    map.AddBoolean(MapAttrAttr.UIVisible, true, '可见？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填字段', true, true);

    map.AddGroupAttr('外观设置');
    //  map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    map.AddTBString(MapAttrAttr.Tip, null, '激活提示', true, false, 0, 400, 150, true);
    map.AddTBInt(MapAttrAttr.MyDataType, 0, 'MyDataType', false, false);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 数值字段s
 */
export class AttrDTs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new AttrDT();
  }
  constructor() {
    super();
  }
}
