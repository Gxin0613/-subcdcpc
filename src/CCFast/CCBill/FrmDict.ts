import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { FrmBillAttr } from './FrmBill';
import { SysEventAttr, SysEvents } from '/@/WF/Admin/FrmLogic/MapData/FrmEvent/SysEvent';
import { CollectionAttr, Collections } from './Collection/Collection';
import { PG_Group2Method } from './Method/PG_Group2Method';
import { GPE_DTSearchWay } from './Admin/SearchCond/GPE_DTSearchWay';
import { SearchFKEnumAttr, SearchFKEnums } from './Admin/SearchCond/SearchFKEnum';
import { GPE_ListShowWay } from './Admin/SearchCond/GPE_ListShowWay';
import { GPE_TableStyle } from './Admin/SearchCond/GPE_TableStyle';
import { DBRoles } from './DBRole/DBRole';
import { GPE_FrmType } from '/@/WF/Admin/FrmLogic/GPE_FrmType';
import { SubTablePostion } from '/@/bp/en/Config';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { MapExtSearchCols } from '/@/CCFast/CCBill/Admin/ShowCol/MapExtSearchCol';
import { GPE_SearchKey } from '/@/CCFast/CCBill/Admin/SearchCond/GPE_SearchKey';

//属性列表
export class FrmDictAttr extends FrmAttr {
  // 位置
  public static readonly WZ = 'WZ';
  public static readonly SortBy = 'SortBy';
}

// 实体
export class FrmDict extends EntityNoName {
  constructor(pkval?: string) {
    // super("bp.demo.FrmDict","TS.Demo.BPFramework.FrmDict");
    super('TS.CCBill.FrmDict');
    if (pkval) this.No = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '实体表单');
    map.GroupBarShowModel = 1; //平铺模式.

    // #region 基本属性.
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK(MapDataAttr.No, null, '表单编号', true, true, 1, 190, 20);
    map.SetHelperAlert(MapDataAttr.No, '也叫表单ID,系统唯一.');
    map.AddDDLSysEnum(MapDataAttr.FrmType, 0, '表单类型', true, true, 'BillFrmType', '@0=经典表单@1=自由表单@10=章节表单@6=VSTO表单');

    map.AddTBString(MapDataAttr.PTable, null, '存储表', true, false, 0, 500, 20, true);
    map.SetHelperAlert(MapDataAttr.PTable, '存储的表名,如果您修改一个不存在的系统将会自动创建一个表.');

    map.AddTBString(MapDataAttr.Name, null, '表单名称', true, false, 0, 200, 20, true);
    //  map.AddDDLEntities(MapDataAttr.FK_FormTree, "01", "表单类别", new SysFormTrees(), false);
    //#endregion 基本属性.
    //  #region 外观.
    map.AddGroupAttr('列表属性');
    map.AddDDLSysEnum(
      FrmAttr.RowOpenModel,
      3,
      '行记录打开模式',
      true,
      true,
      'RowOpenMode',
      '@0=新窗口打开@1=在本窗口打开@2=弹出窗口打开,关闭后不刷新列表@3=弹出窗口打开,关闭后刷新列表',
    );
    let cfg = '@0=MyDictFrameWork.htm 实体与实体相关功能编辑器';
    cfg += '@1=MyDict.htm 实体编辑器';
    cfg += '@2=MyBill.htm 单据编辑器';
    cfg += '@9=自定义URL';
    map.AddDDLSysEnum('SearchDictOpenType', 0, '双击行打开内容', true, true, 'SearchDictOpenType', cfg);

    map.AddTBString('UrlExt', null, '要打开的Url', true, false, 0, 500, 60, true);

    map.AddBoolean('IsSelectMore', true, '是否下拉查询条件多选?', true, true);

    map.AddBoolean('ShowNumIndex', true, '是否显示数字索引?', true, true);
    //map.AddBoolean('ShowNumPK', false, '是否显示主键?', true, true);

    map.AddDDLSysEnum('ListDtlShowWay', 1, '表格行展开', true, true, 'ListDtlShowWay', '@0=无@1=显示从表(平铺)@2=显示从表(Tab)@3=显示表单详情@4=显示从表联动控件');
    map.SetHelperUrl('ListDtlShowWay', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=14221366&doc_id=31094');

    const model = `@5=30%@6=50%@7=70%@8=90%`;
    map.AddDDLSysEnum('OpenModel', 6, '详情页抽屉宽度（百分比）', true, true, 'OpenModel', model);

    map.AddTBInt(FrmAttr.PopHeight, 500, '弹窗高度', false, false);
    map.AddTBInt(FrmAttr.PopWidth, 760, '弹窗宽度', false, false);
    map.AddDDLSysEnum(MapDataAttr.TableCol, 0, '表单显示列数', false, false, 'TableCol', '@0=4列@1=6列');
    map.AddTBString(FrmBillAttr.SortColumns, null, '排序字段', true, false, 0, 100, 20, false);
    // map.AddDDLStringEnum(FrmBillAttr.SortBy, null, '排序方式', true, false, 0, 100, 20, true);
    map.AddDDLStringEnum(FrmBillAttr.SortBy, 'ASC', '排序方式', '@ASC=正序@DESC=倒序', true);
    map.AddTBString(FrmBillAttr.ColorSet, null, '表格列颜色设置', true, false, 0, 100, 20, true);

    let msg1 = '对字段的颜色处理';
    msg1 += `	
 对于数值字段: @Age:From=0,To=18,Color=green;From=19,To=30,Color=red`;
    msg1 += `	
 对于枚举字段: @XB:From=0,To=0,Color=green;From=1,To=1,Color=red`;
    map.SetHelperAlert(FrmBillAttr.ColorSet, msg1);

    map.AddTBString(FrmBillAttr.RowColorSet, null, '表格行颜色设置', true, false, 0, 100, 20, true);
    map.SetHelperAlert(FrmBillAttr.RowColorSet, '按照指定字段存储的颜色设置表格行的背景色,比如:MyField字段');

    map.AddTBString(FrmBillAttr.FieldSet, null, '字段求和求平均设置', true, false, 0, 100, 20, true);
    //字段格式化函数.
    map.AddTBString('ForamtFunc', null, '字段格式化函数', true, false, 0, 200, 60, true);
    let msg = '对字段的显示使用函数进行处理';
    msg += `	
 1. 对于字段内容需要处理后在输出出来.`;
    msg += `	
 2. 比如：原字段内容 @zhangsa,张三@lisi,李四 显示的内容为 张三,李四`;
    msg += `	
 3. 配置格式: 字段名@函数名; 比如:  FlowEmps@DealFlowEmps; `;
    msg += `	
 4. 函数写入到 /DataUser/JSLibData/SearchSelf.js`;
    map.SetHelperAlert('ForamtFunc', msg);

    //#region 实体表单.
    map.AddGroupAttr('实体表单');
    map.AddDDLSysEnum(FrmDictAttr.EntityType, 0, '业务类型', true, false, FrmDictAttr.EntityType, '@0=独立表单@1=单据@2=编号名称实体@3=树结构实体@5=实体EntityNoName');
    map.SetHelperAlert(FrmDictAttr.EntityType, '该实体的类型,@0=单据@1=编号名称实体@2=树结构实体@5=实体EntityNoName');
    map.AddTBString(FrmDictAttr.BillNoFormat, null, '实体编号规则', true, false, 0, 10, 20, true);
    map.SetHelperAlert(
      FrmDictAttr.BillNoFormat,
      `	
实体编号规则: 	
 2标识:01,02,03等, 3标识:001,002,003,等..`,
    );
    // #region 设计者信息.
    map.AddGroupAttr('设计者信息');
    map.AddTBString(MapDataAttr.Designer, null, '设计者', true, false, 0, 500, 20);
    map.AddTBString(MapDataAttr.DesignerContact, null, '联系方式', true, false, 0, 500, 20);
    map.AddTBString(MapDataAttr.DesignerUnit, null, '单位', true, false, 0, 500, 20, true);
    map.AddTBString(MapDataAttr.GUID, null, 'GUID', true, true, 0, 128, 20, false);
    map.AddTBString(MapDataAttr.Ver, null, '版本号', true, true, 0, 30, 20);
    map.AddTBStringDoc(MapDataAttr.Note, null, '备注', true, false, true);
    map.AddTBInt(MapDataAttr.Idx, 100, '序号', false, false);
    // #endregion 设计者信息.

    // #region 扩展参数.
    map.AddTBAtParas(3000); //参数属性.
    map.AddTBString(FrmDictAttr.Tag0, null, 'Tag0', false, false, 0, 500, 20);
    map.AddTBString(FrmDictAttr.Tag1, null, 'Tag1', false, false, 0, 4000, 20);
    map.AddTBString(FrmDictAttr.Tag2, null, 'Tag2', false, false, 0, 500, 20);

    //显示列控制.
    map.AddTBInt(FrmAttr.ShowColModel, 0, 'ShowColModel', false, false);
    map.AddTBString(FrmDictAttr.ShowCols, null, 'ShowCols', false, false, 0, 500, 20);

    //显示列控制.-移动
    map.AddTBInt(FrmAttr.ShowColMobileModel, 0, 'ShowColMobileModel', false, false);
    map.AddTBString(FrmDictAttr.ShowMobileCols, null, 'ShowMobileCols', false, false, 0, 500, 20);

    //显示树列.
    map.AddTBInt('ShowColTree', 0, '是否树模式?', false, false);
    map.AddTBString('ColTree', null, '树字段', false, false, 0, 50, 20);

    //关键字查询..
    map.AddTBInt('IsSearchKey', 1, 'IsSearchKey', false, false);
    map.AddTBString('StringSearchKeys', null, 'StringSearchKeys', false, false, 0, 500, 20);
    map.AddTBString('TBSearchKeyPlaceholder', null, '查询关键字', false, false, 0, 500, 20);

    //按日期查询.
    map.AddTBInt('DTSearchWay', 0, 'DTSearchWay', false, false);
    map.AddTBInt('DTShowWay', 0, 'DTShowWay', false, false); //季度，年月查询。
    map.AddTBString('DTSearchKey', null, 'DTSearchKey', false, false, 0, 500, 20);
    map.AddTBInt('DDLShowWays', 0, 'DDLShowWays', false, false);

    //展现方式. 0=经典列表,1=树干叶子,2=联动.
    map.AddTBInt('ListShowWay', 0, '列表展现', false, false);
    map.AddTBString('ListShowKey', null, '字段', false, false, 0, 50, 20);

    map.AddTBString('RptSearchKeys', null, 'RptSearchKeys', false, false, 0, 50, 20);

    //隐藏查询条件.
    map.AddTBInt('HidenWay', 0, '是否启用隐藏条件?', false, false);
    map.AddTBString('HidenField', null, '隐藏查询字段', false, false, 0, 500, 20);

    map.AddDDLSysEnum('OverflowMode', 0, '文本内容溢出处理', true, true, 'OverflowMode', '@0=不换行(tooltip)@1=换行');
    map.AddTBInt('DtlShowWay', 0, '从表展示模式', false, false); //参数字段.

    // map.AddTBInt('HidenWay', 0, '是否启用隐藏条件?', false, false);
    map.ParaFields = `,DtlShowWay,ShowColTree,ColTree,HidenWay,IsSearchKey,StringSearchKeys,RptSearchKeys,DTSearchWay,DTSearchKey,DDLShowWays,TBSearchKeyPlaceholder,HidenField,`;
    //#endregion 扩展参数.

    //#region 基本功能.
    map.AddGroupMethod('单记录');
    map.AddRM_PG(new PG_Group2Method(), 'icon-drop');
    map.AddRM_EnOnly('常规按钮', 'TS.CCBill.FrmDictBtn', '@No', 'icon-drop');
    map.AddRM_GPE(new GPE_FrmType(), 'icon-note'); //表单工作模式.
    map.AddRM_DtlSearch('表单事件', new SysEvents(), SysEventAttr.RefPKVal, '', '', SysEventAttr.ShowAttrs, 'icon-energy');

    const rm = new RefMethod();
    rm.Title = '转成EntityNoName';
    rm.ClassMethod = 'Turn2FrmEntityNoName';
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = '目前的实体是主键是OID,要兼容高代码，把实体设置为No 主键的实体吗？';
    rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    map.AddGroupMethod('列表');
    const showAttr1 = 'Name,IsEnable,MethodModel,Icon,IsZD,';
    map.AddRM_DtlSearch('工具栏', new Collections(), CollectionAttr.FrmID, '', '', showAttr1, 'icon-film', true, '', SubTablePostion.Left);
    //展现方式.
    map.AddRM_GPE(new GPE_ListShowWay(), 'icon-grid');
    map.AddRM_UrlTabOpen('多表头', '/@/WF/views/Comm/MultiTitle.vue?DoType=Dict');

    //显示的列.
    //map.AddRM_GPE(new GPE_SearchBillShowCol());
    //显示的树列.
    //map.AddRM_GPE(new GPE_SearchDictTreeModel());
    map.AddRM_DtlBatch('列表显示列', new MapExtSearchCols(), 'FK_MapData', '', '', 'icon-drop', '&FK_MapData=@No&ExtModel=SearchCol');

    map.AddGroupMethod('查询条件');
    //关键字查询模式.
    map.AddRM_GPE(new GPE_SearchKey(), 'icon-drop');
    //外键枚举查询条件
    map.AddRM_DtlSearch('外键枚举查询条件', new SearchFKEnums(), SearchFKEnumAttr.FrmID, '', '', '', 'icon-drop', true);

    //日期查询方式
    map.AddRM_GPE(new GPE_DTSearchWay(), 'icon-drop');
    // map.AddRM_GPE(new GPE_DTShowWay(), 'icon-drop'); //日期展示格式.

    //表格内容展示模式
    map.AddGroupMethod('表格内容');
    map.AddRM_GPE(new GPE_TableStyle(), 'icon-drop');

    map.AddGroupMethod('编程-翻译中');
    map.AddRM_DtlSearch('事件', new SysEvents(), SysEventAttr.RefPKVal, '', '', SysEventAttr.ShowAttrs, 'icon-energy');

    map.AddGroupMethod('数据权限');
    map.AddRM_DtlSearch('列表权限', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=DBList');
    map.AddRM_DtlSearch('新建-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecNew');
    map.AddRM_DtlSearch('删除-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecDelete');
    map.AddRM_DtlSearch('保存-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecSave');
    map.AddRM_DtlSearch('归档-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecFiling');
    map.AddRM_DtlSearch('导入-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=EnsImp');
    map.AddRM_DtlSearch('导出-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=ExpExcel');

    map.AddMapLoader(() => {
      map.AddGroupMethod('大屏设计');
      map.AddRM_UrlTabOpen('大屏设计', '/src/CCFast/Views/RptWhiteEdit.vue?FrmID=' + this.No + '&PageID=FrmDict' + this.No, 'icon-film');
    });

    this._enMap = map;
    return this._enMap;
  }

  public async Turn2FrmEntityNoName(): Promise<string> {
    const en = new BSEntity('BP.Sys.MapData', this.No);
    en.setPK(this.No);
    await en.RetrieveFromDBSources();
    const val = en.DoMethodReturnJSON('Turn2EntityNoName');
    return val;
  }

  public CCFormAPI() {
    const help = `
    #### 帮助
    -  ccform提供两个类的接口， 功能页面调用与
    #### 新建接口
    - 新建一实体记录的链接. 
    - /WF/Port.vue?DoWhat=NewFrmDictRec&FrmID=xxxx
    - 打开一实体记录的链接. 
    - /WF/Port.vue?DoWhat=OpenFrmDictRec&FrmID=xxxx&OID=xxxx
    `;
    return 'tabOpen@' + help;
  }
}

//实体s
export class FrmDicts extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FrmDict();
  }

  constructor() {
    super();
  }
}
