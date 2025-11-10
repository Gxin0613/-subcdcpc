import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from './MapAttr';
import { GPE_FieldNameLink } from '../MapExt/FieldNameLink/GPE_FieldNameLink';
import { BindFunctions } from '../MapExt/BindFunction/BindFunction';
import { GPE_ReqDays } from '../MapExt/ReqDays/GPE_ReqDays';
import { GPE_AutoFull } from '../MapExt/AutoFull/GPE_AutoFull';
import { GPE_RMBDaXie } from '../MapExt/RMBDaXie/GPE_RMBDaXie';
import { GPE_AutoFullDtlField } from '../MapExt/AutoFullDtlField/GPE_AutoFullDtlField';
import { MapExtAttr } from '../MapExt';
import { GloSYS } from '/@/bp/GloSYS';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPN_Int2Enum } from './GPN_Int2Enum';
import { GPE_DtlNumFiledSumAvg } from '../MapExt/DtlNumFiledSumAvg/GPE_DtlNumFiledSumAvg';
import { FieldNumColors } from '../MapExt/FieldNumColor/FieldNumColor';
import { GPE_FieldPopShowDtl } from '../MapExt/FieldPopShowDtl/GPE_FieldPopShowDtl';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPE_EndLabEnum } from '../MapExt/GPE_EndLabEnum';
import { GPE_FieldInputStyle } from '../MapExt/FieldInputStyle/GPE_FieldInputStyle';
/// <summary>
/// 字段属性
/// </summary>
export class MapAttrNum extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrNum', 'BP.Sys.FrmUI.MapAttrNum');
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
    const map = new Map('Sys_MapAttr', '数值字段');

    map.AddMyPK(true);

    map.AddTBString(MapAttrAttr.FK_MapData, null, '实体标识', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20);

    map.AddDDLSysEnum(MapAttrAttr.MyDataType, 2, '数据类型', true, false, MapAttrAttr.MyDataType, GloSYS.enumMyDataType);

    map.AddTBString(MapAttrAttr.DefVal, '', '默认值', true, false, 0, 200, 20);
    map.AddTBInt('NumScale', 2, '小数位数', true, false, false);
    // const help = `
    // 给该字段设置默认值:
    // 1. 如果是整形就设置一个整形的数字作为默认值.
    // 2. 对于float,decimal数据类型，如果设置0.0000就是标识要保留4位小数,如果是1.0000 标识保留4位小数,默认值为1.
    // `;
    //map.AddDDLSysEnum(MapAttrAttr.DefValType, 1, '默认值选择方式', true, true, 'DefValType', '@0=默认值为空@1=按照设置的默认值设置');

    map.AddBoolean(MapAttrAttr.UIVisible, true, '是否可见？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);
    //map.AddBoolean(MapAttrAttr.IsSecret, false, "是否保密？", true, true);
    //这个放入到GPE去了.
    //map.AddBoolean('ExtIsSum', false, '是否显示合计(对从表有效)', true, true);
    //map.SetHelperAlert('ExtIsSum', '如果是从表，就需要显示该从表的合计,在从表的底部.');

    map.AddTBString(MapAttrAttr.Tip, null, '激活提示', true, false, 0, 400, 20, true);
    map.AddTBFloat(MapAttrAttr.UIWidth, 80, '宽度', true, false);
    map.AddTBFloat(MapAttrAttr.UIHeight, 23, '高度', true, true);
    map.AddTBInt(MapAttrAttr.EditType, 0, "编辑类型", false, false);
    map.AddTBString('NumMin', null, '最小值', true, false, 0, 400, 20);
    map.AddTBString('NumMax', null, '最大值', true, false, 0, 400, 20);
    map.AddTBFloat('NumStepLength', 1, '步长', true, false);

    // map.AddGroupAttr('移动端');
    map.AddBoolean('IsLabLine', false, '移动端:标题独占一行?', true, true);

    map.AddTBAtParas(4000);
    //参数字段.
    map.ParaFields = ',NumMin,NumMax,NumStepLength,NumScale,';
    // map.AddTBFloat(MapAttrAttr.Steplength, 0, '步长', true, true);

    map.AddGroupMethod('基本设置');
    map.AddRM_GPE(new GPE_AutoFull(), 'icon-energy');
    map.AddRM_GPE(new GPE_FieldNameLink(), 'icon-settings');
    map.AddRM_GPE(new GPE_ReqDays(), 'icon-calendar');
    map.AddRM_GPE(new GPE_RMBDaXie(), 'icon-wrench');
    map.AddRM_GPE(new GPE_EndLabEnum(), 'icon-wrench');

    // map.AddRM_GPE(new GPE_NumEnterLimit(), 'icon-wrench', '_NumEnterLimit');
    // map.AddRM_GPE(new GPE_NumSteplength(), 'icon-wrench', '_NumSteplength');

    map.AddRM_DtlSearch('事件绑函数', new BindFunctions(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=BindFunction');
    map.AddRM_DtlSearch('数值域颜色', new FieldNumColors(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=FieldNumColor');
    map.AddRM_GPE(new GPE_FieldPopShowDtl(), 'icon-link'); //数据pop设置

    //if (GloSYS.enumMyDataType.indexOf('8') > 0)
    map.AddRM_GPE(new GPE_FieldInputStyle(), 'icon-pencil'); //输入样式;

    map.AddGroupMethod('从表相关');
    map.AddRM_GPE(new GPE_AutoFullDtlField(), 'icon-calculator');
    map.AddRM_GPE(new GPE_DtlNumFiledSumAvg(), 'icon-social-skype');

    map.AddGroupMethod('高级');
    const rm14 = new RefMethod();
    rm14.Title = '类型转换';
    rm14.ClassMethod = 'DoTurnQZFieldType';
    rm14.HisMap.AddDDLSysEnum('key1', 1, '数据类型', true, true, 'MyDataType');
    rm14.RefMethodType = RefMethodType.Func;
    rm14.Icon = 'icon-directions';
    map.AddRefMethod(rm14);

    map.AddRM_GPN(new GPN_Int2Enum(), 'icon-list');

    // const rm6 = new RefMethod();
    // rm6.Title = '设置文本框RMB大写';
    // rm6.ClassMethod = '.DoRMBDaXie()';
    // rm6.RefMethodType = RefMethodType.RightFrameOpen;
    // rm6.Icon = 'icon-wrench';
    // map.AddRefMethod(rm6);

    // const rm7 = new RefMethod();
    // rm7.Title = '输入范围限制';
    // rm7.ClassMethod = '.DoLimit()';
    // rm7.RefMethodType = RefMethodType.RightFrameOpen;
    // rm7.Icon = 'icon-wrench';
    // map.AddRefMethod(rm7);

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
 * 数值字段s
 */
export class MapAttrNums extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrNum();
  }
  constructor() {
    super();
  }
}
