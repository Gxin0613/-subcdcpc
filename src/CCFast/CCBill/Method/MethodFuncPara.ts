import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';

/// <summary>
/// 字段属性
/// </summary>
export class MethodFuncPara extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.CCBill.MethodFuncPara');
    if (!!mypk) this.MyPK = mypk;
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
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_MapAttr', '字段属性');

    map.AddMyPK();

    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 100);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '属性', true, true, 1, 200, 60);

    map.AddTBString(MapAttrAttr.Name, null, '描述', true, false, 0, 200, 100);
    map.AddTBString(MapAttrAttr.DefVal, null, '默认值', false, false, 0, 400, 20);
    map.AddTBInt(MapAttrAttr.DefValType, 1, '默认值类型', true, false);

    map.AddTBInt(MapAttrAttr.UIContralType, 0, '控件', true, false);
    map.AddTBInt(MapAttrAttr.MyDataType, 1, '数据类型', true, false);

    map.AddDDLSysEnum(MapAttrAttr.LGType, 0, '逻辑类型', true, false, MapAttrAttr.LGType, '@0=普通@1=枚举@2=外键@3=打开系统页面');

    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    map.AddTBFloat(MapAttrAttr.UIHeight, 23, '高度', true, false);

    map.AddTBInt(MapAttrAttr.MinLen, 0, '最小长度', true, false);
    map.AddTBInt(MapAttrAttr.MaxLen, 300, '最大长度', true, false);

    map.AddTBString(MapAttrAttr.UIBindKey, null, '绑定的信息', true, false, 0, 150, 20);
    map.AddTBString(MapAttrAttr.UIRefKey, null, '绑定的Key', true, false, 0, 30, 20);
    map.AddTBString(MapAttrAttr.UIRefKeyText, null, '绑定的Text', true, false, 0, 30, 20);

    map.AddTBInt(MapAttrAttr.UIVisible, 1, '是否可见', true, true);
    map.AddTBInt(MapAttrAttr.UIIsEnable, 1, '是否启用', true, true);
    map.AddTBInt(MapAttrAttr.UIIsLine, 0, '是否单独栏显示', true, true);
    map.AddTBInt(MapAttrAttr.UIIsInput, 0, '是否必填字段', true, true);
    map.AddTBInt(MapAttrAttr.TextModel, 0, '文本类型', true, true);
    map.AddTBInt(MapAttrAttr.IsSupperText, 0, '是否是大文本', true, true);

    map.AddTBInt(MapAttrAttr.ColSpan, 1, '单元格数量', true, false);
    map.AddTBInt(MapAttrAttr.GroupID, 0, '显示的分组', false, true);
    // xxx 新增的样式.
    map.AddTBInt(MapAttrAttr.Idx, 0, '序号', true, false);
    map.AddTBString(MapAttrAttr.Icon, '0', 'Icon', true, false, 0, 50, 20);
    map.ParaFields = '';
    //参数属性.
    map.AddTBAtParas(4000);
    this._enMap = map;
    return this._enMap;
  }

  protected override beforeInsert(): Promise<boolean> {
    this.MyPK = this.FK_MapData + '_' + this.KeyOfEn;
    return Promise.resolve(true);
  }

  public override async afterInsert() {
    return true;
  }
}

/**
 * 字段属性s
 */
export class MethodFuncParas extends EntitiesMyPK {
  get GetNewEntity(): MethodFuncPara {
    return new MethodFuncPara();
  }
  constructor() {
    super();
  }
}
