import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { WindowTemplateAttr } from './Admin/WindowTemplate';
import DBAccess from '/@/utils/gener/DBAccess';

/// iFrame信息块 属性
export class iFrameAttr extends EntityNoNameAttr {
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

/// iFrame信息块
export class iFrame extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.iFrame');
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
    const map = new Map('GPM_WindowTemplate', 'iFrame框架信息块');

    //   #region 基本信息.
    map.AddTBStringPK(WindowTemplateAttr.No, null, '编号', true, true, 1, 40, 200);
    map.AddTBInt(WindowTemplateAttr.ColSpan, 1, '占的列数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.ColSpan, '画布按照4列划分布局，输入的输在在1=4之间.');
    map.AddTBInt(WindowTemplateAttr.RowSpan, 1, '占的行数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.RowSpan, '换算高度为360px * rowspan');
    map.AddTBString(WindowTemplateAttr.Name, null, '标题', true, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.Icon, null, 'Icon', true, false, 0, 100, 20, true);
    // #endregion 基本信息.
    map.AddTBString(WindowTemplateAttr.Docs, null, 'Url', true, false, 0, 100, 20, true);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}
