import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttr, MapAttrAttr } from './MapAttr';
import { BindFunctions } from '../MapExt/BindFunction/BindFunction';
import { GPE_ActiveDDL } from '../MapExt/ActiveDDL/GPE_ActiveDDL';
import { GPE_DDLFullCtrlts } from '../MapExt/DDLFullCtrl/GPE_DDLFullCtrlts';
import { GPE_AutoFullDLL } from '../MapExt/AutoFullDLL/GPE_AutoFullDLL';
import { MapExtAttr } from '../MapExt';
import { GPE_EnumHidItems } from '../MapExt/EnumHidItems/GPE_EnumHidItems';
import { GPE_GenerDBSrcSearch } from '/@/CCFast/GenerDBSrc/GPE_GenerDBSrcSearch';

/// <summary>
/// 字段属性
/// </summary>
export class MapAttrSFSQL extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrSFSQL');
    if (!!mypk) {
      this.MyPK = mypk;
    }
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
    const map = new Map('Sys_MapAttr', '外部数据源字段');

    map.AddMyPK(true);
    // map.AddTBInt(MapAttrAttr.LGType, 4, '类型', true, true);
    //map.AddDDLSysEnum(MapAttrAttr.LGType, 4, '类型', false, false);
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20, true);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20, true);

    //默认值.
    map.AddTBString(MapAttrAttr.UIBindKey, null, '外键SFTable', true, true, 0, 150, 20);
    map.AddTBString(MapAttrAttr.DefVal, null, '默认值', true, false, 0, 300, 20);
    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    map.AddBoolean(MapAttrAttr.UIVisible, true, '可见', true, false);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);
    map.AddTBInt(MapAttrAttr.EditType, 0, "编辑类型", false, false);
    //设置数据源.
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '数据源', '&MarkID=Main&DBModel=SFTable');

    //设置联动
    map.AddRM_GPE(new GPE_ActiveDDL(), 'icon-screen-tablet');
    //设置显示过滤
    // map.AddRM_GPE(new GPE_AutoFullDLL(), 'icon-magnifier');
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '显示过滤', '&DBModel=SFTable&MarkID=AutoFullDLL');

    //装载填充.
    //map.AddRM_GPE(new GPE_PageLoadFullDDL(), 'icon-loop');
    map.AddRM_EnOnly('外键表属性', 'TS.FrmUI.SFTable', '@UIBindKey', 'icon-key');
    map.AddRM_DtlSearch('事件绑函数', new BindFunctions(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=BindFunction');

    map.AddRM_GPE(new GPE_DDLFullCtrlts(), 'icon-arrow-right-circle', '_DDLFullCtrl');
    map.AddRM_GPE(new GPE_EnumHidItems(), 'icon-film');

    // //填充其他控件
    // map.AddGroupMethod('填充数据');

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterDelete(): Promise<boolean> {
    const en = new MapAttr();
    en.MyPK = this.FK_MapData + '_' + this.KeyOfEn + 'T';
    await en.Delete();
    // alert('相关的名称字段已经删除了.');
    return Promise.resolve(true);
  }
}

/**
 * 外部数据源s
 */
export class MapAttrSFSQLs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrSFSQL();
  }
  constructor() {
    super();
  }
}
