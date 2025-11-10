import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from './MapAttr';
import { BindFunctions } from '../MapExt/BindFunction/BindFunction';
import { GPE_RadioBtns } from '../MapExt/RadioBtns/GPE_RadioBtns';

import { MapExtAttr } from '../MapExt';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';

/// <summary>
/// 字段属性
/// </summary>
export class MapAttrBoolean extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrBoolean');
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
    const map = new Map('Sys_MapAttr', 'Boolean字段');
    map.AddMyPK(true);
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20, true);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20);
    map.AddTBString(MapAttrAttr.DefVal, '0', '默认值(是否选中？0=否,1=是)', true, false, 0, 10, 20);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.AddRadioBtn('CheckModel', 0, '控件类型', true, true, 'BoolenCtrlType', '@0=复选框@1=单选按钮', '', false);
    map.AddTBStringDoc(MapAttrAttr.Tip, null, '激活提示', true, false, false);
    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    map.AddTBInt(MapAttrAttr.EditType, 0, "编辑类型", false, false);
    map.ParaFields = ',CheckModel,';
    //参数属性.
    map.AddTBAtParas(4000);


    map.AddRM_DtlSearch('事件绑函数', new BindFunctions(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=BindFunction');
    map.AddRM_GPE(new GPE_RadioBtns(), 'icon-control-forward');
    map.AddGroupMethod('高级设置');
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
