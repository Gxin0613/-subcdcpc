import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

/// <summary>
/// 字段属性
/// </summary>
export class AttrEnum extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.AttrEnum');
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
    const map = new Map('Sys_MapAttr', '枚举字段');
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 100, 190, true);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 100, 150);
    map.AddTBString(MapAttrAttr.DefVal, null, '默认值', true, false, 0, 100, 80, true);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填字段', true, true);

    map.AddTBString(MapAttrAttr.UIBindKey, null, '枚举值', true, false, 0, 100, 200, true);
    map.AddDDLSysEnum(MapAttrAttr.UIContralType, 0, '控件类型', true, true, 'EnumCtrlType', '@1=下拉框2=单选按钮', null, false);

    map.AddTBInt(MapAttrAttr.LGType, 0, 'LGType', false, false);
    map.AddTBInt(MapAttrAttr.UIContralType, 0, 'UIContralType', false, false);

    this._enMap = map;
    return this._enMap;
  }

  // override async beforeDelete(): Promise<boolean> {
  //   switch (this.KeyOfEn) {
  //     case 'OID':
  //     case 'WFState':
  //     case 'FID':
  //     case 'AtPara':
  //       alert('系统字段不能删除');
  //       return false;
  //     default:
  //       break;
  //   }
  //   return true;
  // }
}

/**
 * 枚举字段s
 */
export class AttrEnums extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new AttrEnum();
  }
  constructor() {
    super();
  }
}
