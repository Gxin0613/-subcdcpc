import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from './MapAttr';
import { GPE_ActiveDDL } from '../MapExt/ActiveDDL/GPE_ActiveDDL';
import { GPE_AutoFullDLL } from '../MapExt/AutoFullDLL/GPE_AutoFullDLL';
import { GPE_DDLFullCtrlts } from '../MapExt/DDLFullCtrl/GPE_DDLFullCtrlts';
import { BindFunctions } from '../MapExt/BindFunction/BindFunction';
import { MapExtAttr } from '../MapExt';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPE_GenerDBSrcSearch } from '/@/CCFast/GenerDBSrc/GPE_GenerDBSrcSearch';

/// <summary>
/// 字段属性
/// </summary>
export class MapAttrSFTable extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrSFTable', 'BP.Sys.FrmUI.MapAttrSFTable');
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
    const map = new Map('Sys_MapAttr', '外键字段');

    map.AddMyPK(true);
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);

    map.AddTBString(MapAttrAttr.Name, null, '中文名', true, false, 0, 200, 20, true);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20, true);

    //默认值.
    map.AddDDLSysEnum(MapAttrAttr.LGType, 4, '类型', true, false);
    map.AddTBString(MapAttrAttr.UIBindKey, null, '外键SFTable', true, true, 0, 150, 20, true);

    //map.AddTBString(MapAttrAttr.DefVal, null, "默认值", true, false, 0, 300, 20);

    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    //map.AddTBFloat(MapAttrAttr.UIHeight, 23, "高度", true, true);

    map.AddBoolean(MapAttrAttr.UIVisible, true, '是否可见', true, false);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);
    map.AddTBInt(MapAttrAttr.EditType, 0, "编辑类型", false, false);
    //map.AddBoolean(MapAttrAttr.UIIsInput, false, "是否必填项？", true, true);
    //map.AddBoolean("IsEnableJS", false, "是否启用JS高级设置？", true, true); //参数字段.
    //装载填充.
    //map.AddRM_GPE(new GPE_PageLoadFullDDL(), 'icon-magnifier');

    //设置联动
    map.AddRM_GPE(new GPE_ActiveDDL(), 'icon-screen-tablet');

    //设置显示过滤
    map.AddRM_GPE(new GPE_AutoFullDLL(), 'icon-magnifier');
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '设置-显示过滤2025', '&DBModel=SFTable&MarkID=AutoFullDLL');

    //填充其他控件
    map.AddRM_GPE(new GPE_DDLFullCtrlts(), 'icon-arrow-right-circle');

    map.AddRM_EnOnly('外键表属性', 'TS.FrmUI.SFTable', '@UIBindKey', 'icon-key');
    /* const rm46 = new RefMethod();
    rm46.Title = '编辑外键数据';
    rm46.ClassMethod = '.DoEditData';
    rm46.RefMethodType = RefMethodType.RightFrameOpen;
    map.AddRefMethod(rm46);*/

    const rm4 = new RefMethod();
    rm4.Title = '高级JS设置';
    rm4.ClassMethod = '.DoRadioBtns()';
    rm4.RefMethodType = RefMethodType.RightFrameOpen;
    map.AddRefMethod(rm4);

    map.AddRM_DtlSearch('事件绑函数', new BindFunctions(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=BindFunction');

    this._enMap = map;
    return this._enMap;
  }

  //编辑外键数据.
  public DoEditData() {
    const url = GloComm.UrlEn('TS.FrmUI.SFTable', this.UIBindKey);
    return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, url);
  }

  /// 高级设置
  /// </summary>
  /// <returns></returns>
  public DoRadioBtns() {
    return '../../Admin/FoolFormDesigner/MapExt/RadioBtns.htm?FK_MapData=' + this.FK_MapData + '&ExtType=AutoFull&KeyOfEn=' + this.KeyOfEn + '&RefNo=' + this.MyPK;
  }
}

/**
 * 外键字段 s
 */
export class MapAttrSFTables extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrSFTable();
  }
  constructor() {
    super();
  }
}
