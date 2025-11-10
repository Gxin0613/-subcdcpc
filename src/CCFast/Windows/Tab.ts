import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { WindowTemplateAttr } from './Admin/WindowTemplate';
import { TabDtls } from './TabDtl';
import { DtlAttr } from './Dtl';
import DBAccess from '/@/utils/gener/DBAccess';

/// Tab标签页
export class Tab extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.Tab');
    if (!!pkVal) this.No = pkVal;
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
    const map = new Map('GPM_WindowTemplate', 'Tab标签页');

    // #region 基本信息.
    map.AddTBStringPK('No', null, '编号', true, true, 1, 40, 200);
    map.AddTBInt('ColSpan', 2, '占的列数', true, false);
    map.SetHelperAlert('ColSpan', '画布按照4列划分布局，输入的输在在1=4之间.');
    map.AddTBInt(WindowTemplateAttr.RowSpan, 1, '占的行数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.RowSpan, '换算高度为360px * rowspan');

    map.AddTBString('Name', null, '标题', true, false, 0, 300, 20, true);
    map.AddTBString('Icon', null, 'Icon', true, false, 0, 100, 20, true);
    //   #endregion 基本信息.

    //  #region 更多链接.
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
    map.AddTBString(WindowTemplateAttr.MoreLab, null, '更多标签', true, false, 0, 300, 20);
    //  #endregion 更多链接.

    map.AddRM_DtlBatch('从表', new TabDtls(), DtlAttr.RefPK);

    this._enMap = map;
    return this._enMap;

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
