import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { DataType } from '/@/bp/en/DataType';
import Events from '/@/utils/Events';
import { useDesignerStore } from '/@/store/modules/form';
/**
 * 字段属性
 */
export class MapAttrAttr {
  /// 表单ID
  public static readonly FK_MapData = 'FK_MapData';
  /// 属性
  public static readonly KeyOfEn = 'KeyOfEn';
  /// 描述
  public static readonly Name = 'Name';
  public static readonly DefVal = 'DefVal';
  public static readonly DefValType = 'DefValType';
  public static readonly UIContralType = 'UIContralType';
  public static readonly MyDataType = 'MyDataType';
  public static readonly LGType = 'LGType';
  public static readonly UIWidth = 'UIWidth';
  public static readonly UIHeight = 'UIHeight';
  public static readonly MinLen = 'MinLen';
  public static readonly MaxLen = 'MaxLen';
  public static readonly UIBindKey = 'UIBindKey';
  public static readonly UIRefKey = 'UIRefKey';
  public static readonly UIRefKeyText = 'UIRefKeyText';
  public static readonly ExtIsSum = 'ExtIsSum';
  public static readonly UIVisible = 'UIVisible';
  public static readonly UIIsEnable = 'UIIsEnable';
  public static readonly UIIsLine = 'UIIsLine';
  public static readonly UIIsInput = 'UIIsInput';
  public static readonly IsSupperText = 'IsSupperText';
  public static readonly FontSize = 'FontSize';
  public static readonly IsSigan = 'IsSigan';
  public static readonly GUID = 'GUID';
  public static readonly EditType = 'EditType';
  public static readonly Tag = 'Tag';
  public static readonly Tag1 = 'Tag1';
  public static readonly Tag2 = 'Tag2';
  public static readonly Tag3 = 'Tag3';
  public static readonly Tip = 'Tip';
  public static readonly ColSpan = 'ColSpan';
  public static readonly LabelColSpan = 'LabelColSpan';
  public static readonly RowSpan = 'RowSpan';
  public static readonly GroupID = 'GroupID';
  public static readonly IsEnableInAPP = 'IsEnableInAPP';
  public static readonly CSSCtrl = 'CSSCtrl';
  public static readonly CSSLabel = 'CSSLabel';
  public static readonly Idx = 'Idx';
  public static readonly Icon = 'Icon';
  public static readonly TextModel = 'TextModel';
}

/// <summary>
/// 字段属性
/// </summary>
export class MapAttr extends EntityMyPK {
  /// 是否是数字.
  get IsNum() {
    const myDataType = this.GetValByKey('MyDataType');
    return myDataType == DataType.AppInt || myDataType == DataType.AppDouble || myDataType == DataType.AppFloat || myDataType == DataType.AppMoney;
  }

  constructor(mypk?: string) {
    super('TS.Sys.MapAttr');
    if (!!mypk) this.setPKVal(mypk);
  }

  get IsCustomize() {
    return this.UIContralType > 3;
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
  //没有地方使用到 public static SQLOfGroupAttr = "SELECT OID as No, Lab as Name FROM Sys_GroupField WHERE FrmID='@FK_MapData' AND (CtrlType IS NULL OR CtrlType='') ";

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_MapAttr', '字段属性');

    map.AddMyPK();

    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '属性', true, true, 1, 200, 20);

    map.AddTBString(MapAttrAttr.Name, null, '描述', true, false, 0, 200, 20);
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

    map.AddBoolean(MapAttrAttr.ExtIsSum, false, '是否显示合计(对从表有效)', true, true);
    map.AddBoolean(MapAttrAttr.UIVisible, true, '是否可见', true, true);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否启用', true, true);
    map.AddBoolean(MapAttrAttr.UIIsLine, false, '是否单独栏显示', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填字段', true, true);
    //map.AddTBInt(MapAttrAttr.IsSecret, 0, '是否保密', true, true);
    //map.AddTBInt(MapAttrAttr.IsRichText, 0, '富文本', true, true);
    //@0=普通文本@1=密码框@2=大文本@3=富文本
    map.AddTBInt(MapAttrAttr.TextModel, 0, '文本类型', true, true);
    map.AddTBInt(MapAttrAttr.IsSupperText, 0, '是否是大文本', true, true);
    map.AddTBInt(MapAttrAttr.FontSize, 0, '字体大小', true, true);

    // 是否是签字，操作员字段有效。2010-09-23 增加。 @0=无@1=图片签名@2=CA签名.
    map.AddTBInt(MapAttrAttr.IsSigan, 0, '签字？', true, false);
    map.AddTBString(MapAttrAttr.GUID, null, 'GUID', true, false, 0, 128, 20);
    map.AddTBInt(MapAttrAttr.EditType, 0, '编辑类型', true, false);
    map.AddTBString(MapAttrAttr.Tag, null, '标识', true, false, 0, 100, 20);
    map.AddTBString(MapAttrAttr.Tag1, null, 'WPS标识', true, false, 0, 4000, 20);
    map.AddTBString(MapAttrAttr.Tag2, null, '标识2', true, false, 0, 100, 20);
    map.AddTBString(MapAttrAttr.Tag3, null, '标识3', true, false, 0, 100, 20);
    map.AddTBString(MapAttrAttr.Tip, null, '激活提示', false, true, 0, 200, 20);
    //单元格数量。2013-07-24 增加。
    //  map.AddTBString(MapAttrAttr.ColSpan, "1", "单元格数量", true, false, 0, 3, 3);
    map.AddTBInt(MapAttrAttr.ColSpan, 1, '单元格数量', true, false);
    //文本占单元格数量
    map.AddTBInt(MapAttrAttr.LabelColSpan, 1, '文本单元格数量', true, false);
    //文本跨行
    map.AddTBInt(MapAttrAttr.RowSpan, 1, '行数', true, false);
    //显示的分组.
    map.AddTBInt(MapAttrAttr.GroupID, 0, '显示的分组', false, true);
    map.AddBoolean(MapAttrAttr.IsEnableInAPP, true, '是否在移动端中显示', true, true);

    // xxx 新增的样式.
    map.AddTBInt(MapAttrAttr.Idx, 0, '序号', true, false);
    map.AddTBString(MapAttrAttr.Icon, null, 'Icon', true, false, 0, 50, 20);
    map.ParaFields = '';

    //参数属性.
    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    // this.KeyOfEn = this.KeyOfEn.Trim();
    this.MyPK = this.GetValByKey('FK_MapData') + '_' + this.GetValByKey('KeyOfEn');
    const dStore = useDesignerStore();
    const idx = dStore.newWidgetIndex;
    if (idx > 0) {
      this.SetValByKey('Idx', idx);
    }
    return Promise.resolve(true);
  }

  public override async afterInsert() {
    console.log('after-insert:', this.Row);
    Events.emit('insertField', Object.fromEntries(this.Row));
    return Promise.resolve(true);
  }
  public DescIt() {
    if (this.MyDataType == DataType.AppString) {
      if (this.UIContralType == 0) return ` str(${this.MaxLen}) `;
      if (this.UIContralType == 1) return ` str(${this.MaxLen})DBSrc:${this.UIBindKey} `;
    }

    if (this.MyDataType == DataType.AppInt) {
      if (this.UIContralType == 0) return ` int整型 `;
      if (this.UIContralType == 1) return ` enum枚举:${this.UIBindKey} `;
      if (this.UIContralType == 2) return ` enum枚举:${this.UIBindKey} `;
      if (this.UIContralType == 3) return ` enum枚举:${this.UIBindKey} `;
    }
    if (this.MyDataType == DataType.AppBoolean) return `boolen布尔`;
    if (this.MyDataType == DataType.AppFloat) return `float浮点`;
    if (this.MyDataType == DataType.AppDouble) return `double双精度`;
    if (this.MyDataType == DataType.AppDate) return `date日期`;
    if (this.MyDataType == DataType.AppDateTime) return `dateTime日期时间`;
  }
  public GetEnName() {
    const enName = this.GetParaString('EnName', '');
    if (enName != '') return enName;

    if (this.MyDataType == DataType.AppString) {
      if (this.UIContralType == 0) return 'TS.FrmUI.MapAttrString'; //如果是文本框.
      if (this.UIContralType == 1) return 'TS.FrmUI.MapAttrSFSQL'; //如果是下拉框.
    }
    if (this.MyDataType == DataType.AppInt) {
      if (this.UIContralType == 0) return 'TS.FrmUI.MapAttrNum'; //如果是文本框.
      if (this.UIContralType == 1) return 'TS.FrmUI.MapAttrEnum'; //如果是下拉框.
      if (this.UIContralType == 2) return 'TS.FrmUI.MapAttrEnum'; //如果是下拉框.
      if (this.UIContralType == 3) return 'TS.FrmUI.MapAttrEnum'; //如果是下拉框.
    }
    if (this.MyDataType == DataType.AppFloat || this.MyDataType == DataType.AppDouble || this.MyDataType == DataType.AppMoney) {
      return 'TS.FrmUI.MapAttrNum';
    }

    if (this.MyDataType == DataType.AppBoolean) {
      return 'TS.FrmUI.MapAttrBoolean';
    }

    if (this.MyDataType == DataType.AppDate || this.MyDataType == DataType.AppDateTime) {
      return 'TS.FrmUI.MapAttrDT';
    }

    alert('没有判断的类型,请检查.');
    return 'TS.FrmUI.MapAttrString';
  }
}

/**
 * 字段属性s
 */
export class MapAttrs extends EntitiesMyPK {
  get GetNewEntity(): MapAttr {
    return new MapAttr();
  }
  constructor() {
    super();
  }
}
