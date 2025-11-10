import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { WindowTemplateAttr } from './Admin/WindowTemplate';
import { SFDBSrc } from '../../WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';

/// Info信息块 属性
export class InfoAttr extends EntityNoNameAttr {
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

/// Info信息块
export class Info extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.Info');
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
    const map = new Map('GPM_WindowTemplate', '通知公告');

    // #region 基本信息.
    map.AddTBStringPK(WindowTemplateAttr.No, null, '编号', true, true, 1, 40, 200);
    map.AddTBInt(WindowTemplateAttr.ColSpan, 1, '占的列数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.ColSpan, '画布按照4列划分布局，输入的输在在1=4之间.');
    map.AddTBInt(WindowTemplateAttr.RowSpan, 1, '占的行数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.RowSpan, '换算高度为360px * rowspan');
    map.AddTBString(WindowTemplateAttr.Name, null, '标题', true, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.Icon, null, 'Icon', true, false, 0, 100, 20, true);
    //#endregion 基本信息.

    map.AddTBString(WindowTemplateAttr.MoreLab, null, '更多标签', true, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.MoreUrl, null, '更多链接', true, false, 0, 300, 20, true);
    const help = `
    #### 帮助
    - url链接可以配置外链，以http:// 或者 https:// 开头
      外链可以为任意互联网地址 - 例如ccflow官网: http://ccflow.org
    - url链接也可以配置系统内部的链接， 以self://开头
      系统内部链接可以配置系统工作地址 - 例如打开编号001的流程: self://WF/MyFlow?FK_Flow=001 
    `;
    map.SetHelperAlert(WindowTemplateAttr.MoreUrl, help);
    map.AddDDLSysEnum(WindowTemplateAttr.MoreLinkModel, 0, '打开方式', true, true, WindowTemplateAttr.MoreLinkModel, '@0=新窗口@1=本窗口@2=覆盖新窗口');

    // #region 数据源.
    map.AddDDLSysEnum(WindowTemplateAttr.DBType, 0, '数据源类型', true, true, 'WindowsDBType', '@0=数据库查询SQL@1=执行Url返回Json@2=执行DataUserJSLabWindows.js的函数.');
    map.AddDDLEntities(WindowTemplateAttr.DBSrc, null, '数据源', new SFDBSrc(), true);

    map.AddTBStringDoc(WindowTemplateAttr.Docs, null, 'SQL内容表达式', true, false, true);
    // #endregion 数据源.

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * Info信息块s
 */
export class Infos extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Info();
  }
  constructor() {
    super();
  }
}
