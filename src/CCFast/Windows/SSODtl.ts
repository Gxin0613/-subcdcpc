import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { HtmlVarDtlAttr } from './HtmlVarDtl';

/// HtmlVarDtl变量信息 属性
export class SSODtlAttr extends EntityNoNameAttr {
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

/// HtmlVarDtl变量信息
export class SSODtl extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.SSODtl');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }

  /// 实体的权限控制
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
    const map = new Map('GPM_WindowTemplateDtl', 'Dtl变量信息');

    map.AddMyPK();
    map.AddTBString(HtmlVarDtlAttr.RefPK, null, '关联键', false, false, 0, 40, 20);
    map.AddTBString(HtmlVarDtlAttr.Name, null, '系统名称', true, false, 0, 300, 120, true);
    map.AddTBString('Icon', 'icon-link', '图标', true, false, 0, 150, 120, true);
    map.AddTBString('Url', 'http://ccflow.org/?1=2', '地址', true, false, 0, 300, 120, true);

    const strs = '@NewWindow=新窗口@Self=本页打开';
    map.AddDDLStringEnum('OpenModel', 'NewWindow', '链接打开方式', strs, true);

    //map.AddDDLEntities(HtmlVarDtlAttr.DBSrc, 'local', '数据源', new SFDBSrc(), true);
    // map.AddTBString(HtmlVarDtlAttr.Exp0, null, '表达式0', true, false, 0, 300, 120, true);
    // map.AddTBString(HtmlVarDtlAttr.Exp1, null, '表达式1', true, false, 0, 300, 120, true);
    // map.AddTBInt(HtmlVarDtlAttr.WindowsShowType, 0, '显示类型', true, false);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}

/**
 * HtmlVarDtl变量信息s
 */
export class SSODtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SSODtl();
  }
  constructor() {
    super();
  }
}
