import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
/// Dtl变量信息 属性
export class DtlAttr extends EntityNoNameAttr {
  public static readonly FontColor = 'FontColor';
  /// <summary>
  /// 打开的链接或函数
  /// </summary>
  public static readonly UrlExt = 'UrlExt';
  public static readonly DBSrc = 'DBSrc';
  public static readonly DBType = 'DBType';
  public static readonly Exp0 = 'Exp0';
  public static readonly Exp1 = 'Exp1';

  public static readonly RefPK = 'RefPK';
  public static readonly WindowsShowType = 'WindowsShowType';
}

/// Dtl变量信息
export class Dtl extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.Dtl');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('GPM_WindowTemplateDtl', 'Dtl变量信息');

    map.AddMyPK();
    map.AddTBString(DtlAttr.Name, null, '标签', true, false, 0, 300, 20, true);
    map.AddTBString(DtlAttr.FontColor, null, '颜色', true, false, 0, 300, 20, true);
    map.AddTBString(DtlAttr.Exp0, null, '表达式0', true, false, 0, 300, 20, true);
    map.AddTBString(DtlAttr.Exp1, null, '表达式1', true, false, 0, 300, 20, true);
    map.AddTBString(DtlAttr.DBSrc, null, '数据源', true, false, 0, 100, 20, true);
    map.AddTBInt(DtlAttr.WindowsShowType, 0, '显示类型', true, false);

    this._enMap = map;
    return this._enMap;
  }
}
