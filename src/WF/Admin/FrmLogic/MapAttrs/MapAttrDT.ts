import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from './MapAttr';
import { BindFunctions } from '../MapExt/BindFunction/BindFunction';
import { GPE_DateFieldInputRole } from '../MapExt/DateFieldInputRole/GPE_DateFieldInputRole';
import { MapExtAttr } from '../MapExt';
import { GloSYS } from '/@/bp/GloSYS';
import { GPE_DtlDateFiledMaxMin } from '../MapExt/DtlDataFieldMaxMin/GPE_DtlDateFiledMaxMin';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
/// <summary>
/// 字段属性
/// </summary>
export class MapAttrDT extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrDT');
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
    const map = new Map('Sys_MapAttr', '日期字段');

    map.AddMyPK(true);

    map.AddTBString(MapAttrAttr.FK_MapData, null, '实体标识', false, false, 1, 100, 20);

    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20);

    map.AddDDLSysEnum(MapAttrAttr.MyDataType, 6, '数据类型', true, false, MapAttrAttr.MyDataType, GloSYS.enumMyDataType);

    map.AddTBString(MapAttrAttr.DefVal, null, '默认值', true, false, 0, 100, 20, false, '@RDT为当前日期');

    map.AddBoolean(MapAttrAttr.UIVisible, true, '是否可见？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);

    map.AddDDLSysEnum(
      MapAttrAttr.IsSupperText,
      2,
      '格式',
      true,
      true,
      MapAttrAttr.IsSupperText,
      '@0=YYYY-MM-dd@1=YYYY-MM-dd HH@2=YYYY-MM-dd HH:mm@3=YYYY-MM-dd HH:mm:ss@4=YYYY-MM@5=HH:mm@6=HH:mm:ss@7=MM-dd@8=YYYY@9=MM@10=YYYY年MM月dd日@11=YYYY年MM月@12=YYYY年',
    );
    map.AddTBString(MapAttrAttr.Tip, null, '激活提示', true, false, 0, 400, 20, true);

    // map.AddGroupAttr('移动端');
    map.AddBoolean('IsLabLine', false, '移动端:标题独占一行?', true, true);
    map.AddTBInt(MapAttrAttr.EditType, 0, "编辑类型", false, false);
    map.AddTBAtParas(3000);
    map.ParaFields = ',IsLabLine,';

    map.AddGroupMethod('基本设置');
    map.AddRM_GPE(new GPE_DateFieldInputRole(), 'icon-calendar');
    map.AddRM_GPE(new GPE_DtlDateFiledMaxMin(), 'icon-social-skype');

    //  map.AddRM_GPE(new GPE_DateFieldInputRole(), 'icon-calendar');

    map.AddRM_DtlSearch('事件绑函数', new BindFunctions(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=BindFunction');
    const rm141 = new RefMethod();
    rm141.Title = '类型强制转换';
    rm141.ClassMethod = 'DoTurnQZFieldType';
    rm141.HisMap.AddDDLSysEnum('key1', 1, '数据类型', true, true, 'MyDataType');
    //const ms1g = `
    //####  输入类型:格式:int,float,double,date,datetime,boolean,money `;
    //rm141.HisMap.AddTBString('key1', 'int', ms1g, true, false, 0, 100, 100, true, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=10327592&doc_id=31094');
    rm141.RefMethodType = RefMethodType.Func;
    rm141.Warning = 'string类型转化为枚举,请先转为int,由int转枚举,';
    rm141.Icon = 'icon-directions';
    map.AddRefMethod(rm141);
    this._enMap = map;
    return this._enMap;
  }
  public async DoTurnQZFieldType(val: number) {
    const sysAttr = new BSEntity('BP.Sys.MapAttr', this.MyPK);
    await sysAttr.Init();
    await sysAttr.RetrieveFromDBSources();
    if (val == sysAttr.MyDataType) return '转换的类型和字段类型一致';
    if (!!val) {
      const msg = await sysAttr.DoMethodReturnString('DoTurnQZFieldType', val.toString());
      return msg;
    }
    return '请输入字段转换类型';
  }
}

/**
 * 日期字段s
 */
export class MapAttrDTs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrDT();
  }
  constructor() {
    super();
  }
}
