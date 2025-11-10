import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { WindowTemplateAttr } from './Admin/WindowTemplate';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../../WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import DBAccess from '/@/utils/gener/DBAccess';
/// 表格
export class WinTable2 extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.WinTable2');
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
    const map = new Map('GPM_WindowTemplate', '二维表格');

    map.AddTBStringPK(WindowTemplateAttr.No, null, '编号', true, true, 1, 40, 200);
    map.AddTBInt(WindowTemplateAttr.ColSpan, 1, '占的列数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.ColSpan, '画布按照4列划分布局，输入的输在在1=4之间.');
    map.AddTBInt(WindowTemplateAttr.RowSpan, 1, '占的行数', true, false);
    map.SetHelperAlert(WindowTemplateAttr.RowSpan, '换算高度为360px * rowspan');

    map.AddTBString(WindowTemplateAttr.Name, null, '标题', true, false, 0, 300, 20, true);
    map.AddTBString(WindowTemplateAttr.Icon, null, 'Icon', true, false, 0, 100, 20, true);

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

    map.AddDDLSysEnum(WindowTemplateAttr.DBType, 0, '数据源类型', true, true, 'WindowsDBType', '@0=数据库查询SQL@1=执行Url返回Json@2=执行DataUserJSLabWindows.js的函数.');
    map.AddDDLEntities(WindowTemplateAttr.DBSrc, null, '数据源', new SFDBSrc(), true);

    map.AddTBStringDoc(WindowTemplateAttr.Docs, null, 'SQL内容表达式', true, false, true);
    map.AddTBString('Tag1', null, '列名对应', true, false, 0, 100, 20, true);
    map.SetHelperAlert('Tag1', '格式：性别,政治面貌,年龄,薪水 用逗号隔开对应返回的数据源列.');

    map.AddTBString(WindowTemplateAttr.C0Ens, null, '维度0数据', true, false, 0, 200, 20, true);
    map.AddTBString(WindowTemplateAttr.C1Ens, null, '维度1数据', true, false, 0, 200, 20, true);

    map.AddGroupAttr('刷新频率');
    map.AddTBInt('RefreshM', 0, '分钟', true, false);
    map.AddTBInt('RefreshS', 0, '秒', true, false);
    map.AddGroupAttr('明细设置');
    const lab = new Jump();
    map.AddAttrs(lab._enMap.attrs); // 增加一个集合
    map.loaders = [...map.loaders, ...lab._enMap.loaders];
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 表格s
 */
export class WinTable2s extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new WinTable2();
  }
  constructor() {
    super();
  }
}
