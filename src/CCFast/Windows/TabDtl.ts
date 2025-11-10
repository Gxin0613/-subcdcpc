import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { DtlAttr } from './Dtl';
import { SFDBSrc } from '../../WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import DBAccess from '/@/utils/gener/DBAccess';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// TabDtl变量信息 属性
export class TabDtlAttr extends EntityNoNameAttr {
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

/// TabDtl变量信息
export class TabDtl extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.TabDtl');
    if (!!pkVal) {
      this.MyPK = pkVal;
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
    map.AddTBString(DtlAttr.RefPK, null, 'RefPK', false, false, 0, 40, 20, false);

    map.AddDDLSysEnum(DtlAttr.DBType, 0, '数据源类型', true, true, 'WindowsDBType', '@0=数据库查询SQL@1=执行Url返回Json@2=执行DataUserJSLabWindows.js的函数.');
    map.AddDDLEntities(DtlAttr.DBSrc, null, '数据源', new SFDBSrc(), true);
    map.AddDDLSysEnum(DtlAttr.WindowsShowType, 0, '显示类型', true, true, 'WindowsShowType', '@0=饼图@1=柱图@2=折线图@4=简单Table');

    map.AddTBString(DtlAttr.Name, null, '标签', true, false, 0, 300, 70, true);
    map.AddTBString(DtlAttr.FontColor, null, '字体风格', true, false, 0, 300, 100, true);
    map.AddTBString(DtlAttr.Exp0, null, '表达式', true, false, 0, 300, 1000, true);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * TabDtl变量信息s
 */
export class TabDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new TabDtl();
  }
  constructor() {
    super();
  }
}
