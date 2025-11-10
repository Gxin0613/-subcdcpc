import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GL_UIContralSetting } from './GL_UIContralSetting';
import { MapAttrAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { AttrStrings } from '/@/WF/Admin/FrmLogic/MapData/AttrString';
import { AttrNums } from '/@/WF/Admin/FrmLogic/MapData/AttrNum';
import { EnSearchCols } from '/@/bp/sys/EnSearchCol';
import { DBRoles } from '/@/CCFast/CCBill/DBRole/DBRole';
/// En组件展现设置
export class EnCfg extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.User.EnCfg');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_EnCfg', '组件展现设置');

    map.AddGroupAttr('基本设置');
    map.AddTBStringPK('No', null, '实体名称', true, true, 1, 100, 60);
    map.AddDDLSysEnum('PanelIconSize', 1, 'ICON大小', true, true, 'PanelIconSize', '@0=小@1=中@2=大');

    map.AddDDLSysEnum('ListDtlShowWay', 0, '表格行展开', true, true, 'ListDtlShowWay', '@0=无@1=从表（按配置）@3=简易从表@4=当前行详情');
    map.SetHelperUrl('ListDtlShowWay', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=14221366&doc_id=31094');

    // map.AddDDLSysEnum('WinCardW', 0, '宽度', true, true, 'WinCardW', '@0=75%@1=50%@2=100%@3=25%');
    // map.AddDDLSysEnum('UIRowStyleGlo', 0, '表格数据行风格(应用全局)', true, true);
    // map.AddBoolean('IsEnableDouclickGlo', true, '是否启动双击打开(应用全局)?', true, true);

    map.AddBoolean('IsEnableFocusField', false, '是否启用焦点字段?', true, true);
    map.AddTBString('FocusField', null, '焦点字段', true, false, 0, 30, 60);

    const help1 = `
    1. 对PC端的Search组件:用于显示点击打开的列，比如:Name, Title列,在Search列表里面可以突出显示，点击链接打开详细.
    2. 对于移动端的Search则，显示第一个lab的字段，如果不设置，就显示主键.
    `;
    map.SetHelperAlert('FocusField', help1);

    map.AddDDLSysEnum('IsEnableRefFunc', 0, '相关功能列', true, true, 'IsEnableRefFunc', '@0=不显示@1=显示右侧');
    map.SetHelperAlert('IsEnableRefFunc', '在列表页面，最后一个列是否显示实体的功能按钮?');

    map.AddBoolean('EnableMobileSelect', true, '是否启用移动端选择?', true, true);
    map.SetHelperAlert('EnableMobileSelect', '是否允许移动端进行多选操作，比如批量操作');
    map.AddDDLSysEnum('PosRefFuncMobile', 0, '(移动端)相关功能显示位置', true, true, 'PosRefFuncMobile', '@0=不显示@1=显示底部@2=显示左侧@3=显示右侧');
    map.SetHelperAlert('PosRefFuncMobile', '移动端列表页，相关功能显示的位置?');

    map.AddTBString('IconEnumAttr', null, '枚举Icon图标字段', true, false, 0, 100, 60);
    const help = `
    #### 说明
    - 以枚举值的文本作为行的icon,显示在列表的右侧, 达到字段的丰富显示效果.
    - 移动PC通用设置项.
    - 比如:审核状态,类型,枚举值设置颜色显示更丰富.
    #### 其他
    - 在文本框里配置枚举字段,如果为空则不显示.
    `;
    map.SetHelperAlert('IconEnumAttr', help);

    map.AddBoolean('IsEnableOpenICON', false, '是否启用【详情】图标?', true, true);
    map.AddBoolean('isDisDBClick', false, '是否禁用行双击事件?', true, true);

    map.AddBoolean('IsEnableEnumColor', false, '是否启用枚举颜色?', false, false);
    map.AddTBString('EnumColorField', null, '枚举颜色字段', false, false, 0, 300, 60, false);

    //数据加密存储.
    map.AddBoolean('IsJM', false, '是否是加密存储?', true, true);
    map.AddBoolean('IsSelectMore', false, '是否下拉查询条件多选?', true, true);

    // map.AddBoolean('ShowNumPK', false, '是否显示主键?', true, true);
    // map.AddDDLSysEnum('MoveToShowWay', 0, '移动到显示方式', true, true);
    // map.AddDDLSysEnum('TableCol', 0, '实体表单显示列数', true, true, '实体表单显示列数', '@0=4列@1=6列');
    //  map.AddBoolean('IsShowIcon', false, '是否显示项目图标', true, true);
    map.AddTBString('KeyLabel', null, '关键字Label', true, false, 0, 30, 60, true);
    map.SetHelperAlert('KeyLabel', '(默认为:关键字:)');
    map.AddTBString('KeyPlaceholder', null, '关键字提示', true, false, 0, 300, 60, true);

    map.AddTBInt('PageSize', 20, '页面显示的条数', true, true);
    map.SetHelperAlert('PageSize', '(默认:20)');

    map.AddDDLSysEnum('FieldGroupDisplayMode', 0, '字段分组显示模式', true, true, 'FieldGroupDisplayMode', '@0=tab@1=group-bar');

    // map.AddTBInt('FontSize', 14, '页面字体大小', true, true);
    // map.SetHelperAlert('FontSize', '(默认:14px)');
    // map.AddDDLSysEnum('EditerType', 0, '大块文本编辑器', true, true);

    map.AddBoolean('IsCond', false, '退出后是否清空查询条件?', true, true);
    map.SetHelperAlert('IsCond', '在查询组件中，是不是每次进入前都要清空以前的查询条件？默认不清空。');
    // 基本信息设置.
    // 排序
    map.AddTBString('OrderBy', null, '查询排序字段', true, false, 0, 100, 60);
    map.SetHelperAlert('OrderBy', '默认按照主键(No,OID,MyPK)排序,如果多个字段排序格式为(A,B)');
    map.AddBoolean('IsDeSc', true, '是否降序排序?', true, true);
    map.SetHelperAlert('IsDeSc', '请设置排序字段然后，设置该属性.');
    const selectRowType = '@0=多选@1=单选@2=不显示';
    map.AddDDLSysEnum('TableSelectRowType', 0, '选择行', true, true, 'TableSelectRowType', selectRowType);

    // 收藏
    // map.AddBoolean('EnableFavorite', false, '是否启用收藏?', true, true);

    // 是否显示数字索引，非ID
    map.AddBoolean('ShowNumIdx', false, '是否显示数字索引', true, true);

    map.AddGroupAttr('记录弹窗');
    let cfg = '@0=En实体与实体相关功能编辑器';
    cfg += '@1=EnOnly 实体编辑器';
    cfg += '@2=/CCForm/FrmGener 经典表单解析器';
    cfg += '@3=/CCForm/FrmGener 自由表单解析器';
    cfg += '@9=自定义URL';
    map.AddDDLSysEnum('SearchUrlOpenType', 0, '双击/单击行打开内容', true, true, 'SearchUrlOpenType', cfg);
    map.AddBoolean('IsRefreshParentPage', true, '关闭后是否刷新本页面', true, true);

    map.AddTBString('UrlExt', null, '要打开的Url(PC)', true, false, 0, 500, 60, true);
    map.AddTBString('MobileUrlExt', null, '要打开的Url(移动端)', true, false, 0, 500, 60, true);
    const model = `@0=弹窗-强制关闭@1=新窗口打开-winopen模式@2=弹窗-非强制关闭@3=执行指定的方法.@4=不打开@5=抽屉30%@6=抽屉50%@7=抽屉70%@8=抽屉90%@9=抽屉嵌入式打开@10=Tab页打开`;
    map.AddDDLSysEnum('OpenModel', 6, '打开方式', true, true, 'OpenModel', model);

    map.AddTBString('OpenModelFunc', null, '弹窗方法', true, false, 0, 300, 60, false);
    let msg = '首先在写一个函数，放入到:/DataUser/JSLab/SearchSelf.js里面 ';
    msg += '\t\n 该函数里 OpenIt(传入一个已经计算好的url);';
    msg += '\t\n 比如您写一个方法: OpenItMyUrl(url);';
    map.SetHelperAlert('OpenModelFunc', msg);

    // end
    map.AddGroupAttr('工具栏按钮');
    // map.AddBoolean('BtnsShowLeft', false, '按钮显示到左边?', true, true, false);
    // msg = '配置的按钮显示位置.';
    // msg += '\t\n1.默认配置的按钮显示在右边位置. ';
    // msg += '\t\n1.这些按钮包括自定义按钮，新建，导入，导出，分组。';
    // map.SetHelperAlert('BtnsShowLeft', msg);

    map.AddBoolean('EnablePrint', false, '启用打印?（前端实现）', true, true, false);

    //导入功能.
    map.AddBoolean('IsImp', false, '是否显示导入?', true, true, false);
    map.AddDDLSysEnum('ImpIdGenerateMode', 0, '导入数据ID生成规则', true, true, 'ImpIdGenerateMode', '@0=按照数字递增@1=GUID');
    map.AddTBString('ImpFuncUrl', null, '导入功能Url', true, false, 0, 500, 60, true);
    map.SetHelperAlert('ImpFuncUrl', '如果为空，则使用通用的导入功能.');

    cfg = '@0=不导出';
    cfg += '@1=通用导出';
    cfg += '@2=按照约定的Rtf模版导出(\\DataUser\\TempleteOfExp\\EnName.rtf)';
    cfg += '@3=按照约定的excel模版导出(\\DataUser\\TempleteOfExp\\EnName.xlsx)';

    map.AddDDLSysEnum('IsExp', 0, '导出规则', true, true, 'EnsExpModel', cfg);

    map.AddBoolean('IsGroup', true, '是否显示分析按钮(在查询工具栏里)?', true, true, true);
    map.AddBoolean('IsRpt', true, '是否显示报表按钮(在查询工具栏里)?', true, true, true);
    map.AddBoolean('IsBigScreen', false, '是否显示大屏按钮(在查询工具栏里)?', true, true, true);
    // map.AddBoolean(EnCfgAttr.IsEnableLazyload, true, '是否启用懒加载？（对树结构实体有效）?', true, true, true);

    // 按钮配置信息 - 自定义按钮.

    //隐藏字段. 0=显示所有列,1=指定的列.
    map.AddTBInt('ShowColModel', 0, '显示列', false, false);
    map.AddTBString('ShowCols', null, '显示列s', false, false, 0, 300, 60, false);

    map.AddTBInt('HideAttrModel', 0, '字段隐藏规则', false, false);
    map.AddTBString('HideAttrs', null, '字段隐藏s', false, false, 0, 1000, 60, false);

    map.AddTBInt('HideMethodModel', 0, '方法隐藏规则', false, false);
    map.AddTBString('HideMethods', null, '方法隐藏s', false, false, 0, 300, 60, false);

    //手机端隐藏.
    map.AddTBInt('MHideAttrModel', 0, '字段隐藏规则', false, false);
    map.AddTBString('MHideAttrs', null, '字段隐藏s', false, false, 0, 900, 60, false);

    map.AddTBInt('MHideMethodModel', 0, '方法隐藏规则', false, false);
    map.AddTBString('MHideMethods', null, '方法隐藏s', false, false, 0, 900, 60, false);

    //***************** 相关功能 . */
    map.AddGroupMethod('基本设置');
    //map.AddRM_GPN(new GPN_SearchCol());
    map.AddRM_DtlBatch('列表显示列', new EnSearchCols(), 'FK_MapData', '', '', 'icon-drop', '&FK_MapData=@No&ExtModel=SearchCol');

    // map.AddRM_GPE(new GPE_EnumColorField());
    // map.AddRM_UrlTabOpen('多表头', '/src/WF/views/Comm/MultiTitle.vue?DoType=Ens');
    map.AddRM_UrlTabOpen('多表头', '/src/WF/Comm/subComponents/MultiHeader.vue');

    map.AddRM_GL(new GL_UIContralSetting(), '组件属性');
    // map.AddMapLoader(() => {
    //   const no = this.No;
    //   const systemClsNameSpace = ['TS.WF', 'TS.Sys', 'TS.CCBill', 'TS.User', 'TS.Port', 'TS.CCFast', 'TS.GPM'];
    //   if (systemClsNameSpace.some((cls) => no.startsWith(cls)) && WebUser.IsAdmin) {
    //     map.AddGroupMethod('隐藏设置项');
    //     map.AddRM_GPEByOptions({ en: new GPE_HideAttr(), paramsStr: '&KeyOfEn=MHideAttrModel&SaveToAttr=MHideAttrs' });
    //     map.AddRM_GPEByOptions({ en: new GPE_HideMethod(), paramsStr: '&KeyOfEn=MHideMethodModel&SaveToAttr=MHideMethods' });
    //     return;
    //   }
    // });

    //实体配置项:
    map.AddGroupMethod('权限策略');
    map.AddRM_DtlSearch('字段权限', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', true, '&DBRole=ShowAttrs');
    map.AddRM_DtlSearch('方法权限', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', true, '&DBRole=ShowMethod');
    map.AddRM_DtlSearch('列表权限', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=DBList');

    map.AddGroupMethod('按钮权限');
    map.AddRM_DtlSearch('新建-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecNew&Frm=Entity');
    map.AddRM_DtlSearch('删除-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecDelete&Frm=Entity');
    map.AddRM_DtlSearch('保存-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecSave&Frm=Entity');
    //  map.AddRM_DtlSearch('归档-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecFiling');
    map.AddRM_DtlSearch('导入-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=ImpExcel&Frm=Entity');
    map.AddRM_DtlSearch('导出-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=ExpExcel&Frm=Entity');

    map.AddGroupMethod('批量修改');
    // const rm = new RefMethod();
    // rm.Title = '生成字段';
    // rm.ClassMethod = 'ZhuXiaoXueJi';
    // rm.RefMethodType = RefMethodType.Func;
    // rm.Warning = '您确定要执行吗？';
    // rm.IsCanBatch = true; //是否允许批处理，在Search.vue组件里.
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);

    map.AddRM_DtlBatch('文本字段', new AttrStrings(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-fuwenbenkuang', '&UIVisible=1&LGType=0&UIContralType=0&MyDataType=1');
    map.AddRM_DtlBatch('整数字段', new AttrNums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-zhengshu', '&LGType=0&UIVisible=1&MyDataType=2');
    map.AddRM_DtlBatch('浮点字段', new AttrNums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-ziduanleixing-zhengshu', '&LGType=0&UIVisible=1&MyDataType=3');
    map.AddRM_DtlBatch('金额', new AttrNums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-yifabupiaoju-renminbi-xi', '&MyDataType=8&UIVisible=1');
    // map.AddRM_DtlBatch('日期', new AttrDTs(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-riqiqishu', '&MyDataType=6&UIVisible=1');
    // map.AddRM_DtlBatch('日期时间', new AttrDTs(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-shijian1', '&MyDataType=7&UIVisible=1');
    // map.AddRM_DtlBatch('枚举字段', new AttrEnums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-xialakuangbiaodan', '&LGType=1&MyDataType=1');
    // map.AddRM_DtlBatch('外键字段', new AttrSFTables(), MapAttrAttr.FK_MapData, '', '', 'icon-energy', '&LGType=2');
    // map.AddRM_DtlBatch('外部数据源', new AttrSFSQLs(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-xialakuang1', '&LGType=0&UIContralType=1');

    map.AddGroupAttr('字段样式');
    map.AddBoolean('ShowEnumAttrColor', false, '枚举字段是否显示颜色?', true, true);
    map.AddDDLSysEnum('BoolAttrDisplayMode', 0, 'Boolean字段显示方式', true, true, 'BoolAttrDisplayMode', '@0=文字@1=开关@2=图标');

    this._enMap = map;
    return this._enMap;
  }
}
