import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { SFDBSrc } from '../../WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { JumpDtl } from './JumpDtl';

/// HtmlVarDtl变量信息 属性
export class HtmlVarDtlAttr extends EntityNoNameAttr {
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
export class HtmlVarDtl extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.HtmlVarDtl');
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
    map.AddTBString(HtmlVarDtlAttr.Name, null, '标签', true, false, 0, 300, 120, true);

    const strs = '@red=红色@blue=蓝色@black=黑色';
    map.AddDDLStringEnum(HtmlVarDtlAttr.FontColor, 'black', '颜色', strs, true);

    map.AddDDLEntities(HtmlVarDtlAttr.DBSrc, 'local', '数据源', new SFDBSrc(), true);
    map.AddTBString(HtmlVarDtlAttr.Exp0, null, '表达式0', true, false, 0, 300, 120, true);
    map.AddTBString(HtmlVarDtlAttr.Exp1, null, '表达式1', true, false, 0, 300, 120, true);
    map.AddTBInt(HtmlVarDtlAttr.WindowsShowType, 0, '显示类型', true, false);

    map.AddGroupAttr('刷新频率');
    map.AddTBInt('RefreshM', 0, '分钟', true, false);
    map.AddTBInt('RefreshS', 0, '秒', true, false);

    map.AddGroupAttr('跳转设置');
    const lab = new JumpDtl();
    map.AddAttrs(lab._enMap.attrs); // 增加一个集合
    map.loaders = [...map.loaders, ...lab._enMap.loaders];

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
export class HtmlVarDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new HtmlVarDtl();
  }
  constructor() {
    super();
  }
}
