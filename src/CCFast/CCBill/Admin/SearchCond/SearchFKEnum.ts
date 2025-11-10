import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GPE_ActiveDDL } from '/@/WF/Admin/FrmLogic/MapExt/ActiveDDL/GPE_ActiveDDL';
import { GPE_AutoFullDLL } from '/@/WF/Admin/FrmLogic/MapExt/AutoFullDLL/GPE_AutoFullDLL';

export class SearchFKEnumAttr {
  // 字段.
  public static readonly KeyOfEn = 'KeyOfEn';
  // 名称.
  public static readonly Name = 'Name';
  // 表单ID.
  public static readonly FrmID = 'FrmID';
  // 显示方式.
  public static readonly ShowWay = 'ShowWay';
  //是否多选.
  public static readonly IsMultiSelect = 'IsMultiSelect';
}

/// <summary>
/// 外键枚举查询条件
/// </summary>
export class SearchFKEnum extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.SearchFKEnum');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_SearchFKEnum', '查询条件');
    map.AddMyPK();
    map.AddTBString(SearchFKEnumAttr.FrmID, null, '表单ID', false, false, 0, 200, 70);
    map.AddTBString(SearchFKEnumAttr.KeyOfEn, null, '字段', true, true, 0, 200, 150);
    map.AddTBString(SearchFKEnumAttr.Name, null, '字段名', true, true, 0, 200, 150);
    map.AddTBString('UIBindKey', null, '外键或者枚举值', true, true, 0, 200, 150);
    map.AddBoolean('IsEnum', false, '是否枚举?', true, false, false, ''); //是否枚举?
    map.AddDDLStringEnum(SearchFKEnumAttr.ShowWay, 'DDL', '显示方式', '@DDL=下拉框@Panel=平铺', true);
    map.AddBoolean(SearchFKEnumAttr.IsMultiSelect, false, '多选?', true, true, true);
    map.AddBoolean('IsReadonly', false, '是否只读', true, true, true);
    map.AddTBString('DefVal', null, '默认值', true, false, 0, 200, 70);
    map.AddTBInt('Idx', 0, 'Idx', false, false); //排序?

    //显示过滤
    map.AddRM_GPE(new GPE_AutoFullDLL(), 'icon-magnifier', '_AutoFullDLLSearchCond');

    //设置级联.
    map.AddRM_GPE(new GPE_ActiveDDL(), 'icon-drop', '_ActiveDDLSearchCond');

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 外键枚举查询条件s
 */
export class SearchFKEnums extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SearchFKEnum();
  }
  constructor() {
    super();
  }
}
