import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { SysEventAttr, SysEvents } from '/@/WF/Admin/FrmLogic/MapData/FrmEvent/SysEvent';
import { CollectionAttr, Collections } from './Collection/Collection';
import { PG_Group2Method } from './Method/PG_Group2Method';
import { SearchFKEnumAttr, SearchFKEnums } from './Admin/SearchCond/SearchFKEnum';
import { GPE_ListShowWay } from './Admin/SearchCond/GPE_ListShowWay';
import { DBRoles } from './DBRole/DBRole';
import { GPE_FrmType } from '/@/WF/Admin/FrmLogic/GPE_FrmType';
import { GPE_BillCheckModel } from './GPE_BillCheckModel';
import { SubTablePostion } from '/@/bp/en/Config';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPE_SearchKey } from './Admin/SearchCond/GPE_SearchKey';
import { MapExtSearchCols } from '/@/CCFast/CCBill/Admin/ShowCol/MapExtSearchCol';
import { GPE_TableStyle } from '/@/CCFast/CCBill/Admin/SearchCond/GPE_TableStyle';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GPE_DTSearchWay } from './Admin/SearchCond/GPE_DTSearchWay';

//属性列表
export class FrmBillAttr extends FrmAttr {
  public static readonly RefDict = 'RefDict';
  public static readonly SortBy = 'SortBy';
}

// 单据
export class FrmBill extends EntityNoName {
  constructor(pkval?: string) {
    // super("bp.demo.FrmBill","TS.Demo.BPFramework.FrmBill");
    super('TS.CCBill.FrmBill');
    if (pkval) this.No = pkval;
  }

  // 单据的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '单据表单');
    map.GroupBarShowModel = 1; //平铺模式.

    // #region 基本属性.
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK(MapDataAttr.No, null, '表单编号', true, true, 1, 100, 20);
    map.SetHelperAlert(MapDataAttr.No, '也叫表单ID,系统唯一.');

    // map.AddDDLSysEnum(MapDataAttr.FrmType, 0, '表单类型', true, true, 'BillFrmType', '@0=经典表单@1=自由表单@8=开发者表单');
    map.AddTBString(MapDataAttr.PTable, null, '存储表', true, false, 0, 100, 20);
    map.SetHelperAlert(MapDataAttr.PTable, '存储的表名,如果您修改一个不存在的系统将会自动创建一个表.');

    map.AddTBString(MapDataAttr.Name, null, '表单名称', true, false, 0, 100, 20);
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
    let cfg = '@0=MyDictFrameWork.htm 单据与单据相关功能编辑器';
    cfg += '@1=MyDict.htm 单据编辑器';
    cfg += '@2=MyBill.htm 单据编辑器';
    cfg += '@9=自定义URL';
    map.AddDDLSysEnum('SearchDictOpenType', 0, '双击行打开内容', true, true, 'SearchDictOpenType', cfg);
    map.AddBoolean('IsSelectMore', true, '是否下拉查询条件多选?', true, true);
    map.AddBoolean('ShowNumIndex', true, '是否显示数字索引?', true, true);
    map.AddBoolean('ShowNumPK', false, '是否显示主键?', true, true);

    map.AddTBString('UrlExt', null, '要打开的Url', true, false, 0, 300, 60, true);

    const model = `@5=30%@6=50%@7=70%@8=90%`;
    map.AddDDLSysEnum('OpenModel', 6, '详情页抽屉宽度（百分比）', true, true, 'OpenModel', model);

    map.AddTBInt(FrmAttr.PopHeight, 500, '弹窗高度', false, false);
    map.AddTBInt(FrmAttr.PopWidth, 760, '弹窗宽度', false, false);

    map.AddDDLSysEnum(MapDataAttr.TableCol, 0, '表单显示列数', false, false, 'TableCol', '@0=4列@1=6列');
    map.AddTBString('SortFields', null, '指定在列表中显示排序的字段', true, false, 0, 100, 20, false);
    map.SetPopGroupList('SortFields', GloWF.sqlGroupField('@No'), GloWF.sqlFields('@No'), true, '600px', '500px', '选择排序的字段', 'icon-people');

    map.AddTBString(FrmBillAttr.SortColumns, null, '排序字段', true, false, 0, 100, 20, false);
    // map.AddDDLStringEnum(FrmBillAttr.SortBy, null, '排序方式', true, false, 0, 100, 20, true);
    map.AddDDLStringEnum(FrmBillAttr.SortBy, 'ASC', '排序方式', '@ASC=正序@DESC=倒序', true);

    map.AddTBString(FrmBillAttr.RowColorSet, null, '表格行颜色设置', true, false, 0, 100, 20, true);
    map.SetHelperAlert(FrmBillAttr.RowColorSet, '按照指定字段存储的颜色设置表格行的背景色');

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

    //#region 单据属性.
    map.AddGroupAttr('单据属性');
    map.AddDDLSysEnum(MapDataAttr.FrmType, 0, '表单类型', true, true, 'BillFrmType', '@0=经典表单@1=自由表单@10=章节表单@6=VSTO表单');
    // map.SetHelperAlert(FrmBillAttr.EntityType, '该单据的类型,@0=单据@1=编号名称单据@2=树结构单据.');

    map.AddTBString(FrmBillAttr.BillNoFormat, null, '单号规则', true, false, 0, 100, 20, true);
    map.SetHelperUrl('BillNoFormat', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3953012&doc_id=31094');
    map.AddDDLSysEnum('BillNoFormatTime', 0, '生成时间', true, true, 'BillNoFormatTime', '@0=创建时@1=提交时');

    map.AddTBString(FrmBillAttr.TitleRole, null, '标题生成规则', true, false, 0, 100, 20, true);
    map.SetHelperUrl('TitleRole', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661872&doc_id=31094');

    map.AddTBString(FrmBillAttr.SortColumns, null, '排序字段', true, false, 0, 100, 20, true);

    map.AddTBString(FrmBillAttr.FieldSet, null, '字段求和求平均设置', true, false, 0, 100, 20, true);
    map.AddTBString(FrmBillAttr.RefDict, null, '单据关联的单据', false, true, 0, 190, 20, true);
    //  #endregion 单据属性.
    map.AddTBString(FrmBillAttr.BtnRefBill, '关联单据', '关联单据', true, false, 0, 50, 20);
    map.AddDDLSysEnum(FrmAttr.RefBillRole, 0, '关联单据工作模式', true, true, 'RefBillRole', '@0=不启用@1=非必须选择关联单据@2=必须选择关联单据');
    map.AddTBString(FrmBillAttr.RefBill, null, '关联单据ID', true, false, 0, 100, 20, true);
    map.SetHelperAlert(
      FrmBillAttr.RefBill,
      `请输入单据编号,多个单据编号用逗号分开.	
比如:Bill_Sale,Bill_QingJia`,
    );

    //审核信息.
    map.AddTBString('BillCheckModel', 'None', '审核模式', false, false, 0, 20, 10, true, null);
    map.AddTBString('BillCheckTag', null, '审核内容', false, false, 0, 300, 10, true, null);

    // #region 设计者信息.
    // map.AddGroupAttr('设计者信息');
    // // map.AddTBString(MapDataAttr.Designer, null, '设计者', true, false, 0, 500, 20);
    // // map.AddTBString(MapDataAttr.DesignerContact, null, '联系方式', true, false, 0, 500, 20);
    // // map.AddTBString(MapDataAttr.DesignerUnit, null, '单位', true, false, 0, 500, 20, true);
    // //map.AddTBStringDoc(MapDataAttr.Note, null, '备注', true, false, true);
    // map.AddTBString(MapDataAttr.GUID, null, 'GUID', true, true, 0, 128, 20, false);
    // map.AddTBString(MapDataAttr.Ver, null, '版本号', true, true, 0, 30, 20);

    map.AddTBInt(MapDataAttr.Idx, 100, '序号', false, false);
    // #endregion 设计者信息.

    // #region 扩展参数.
    map.AddTBAtParas(3000); //参数属性.
    map.AddTBString(FrmBillAttr.Tag0, null, 'Tag0', false, false, 0, 500, 20);
    map.AddTBString(FrmBillAttr.Tag1, null, 'Tag1', false, false, 0, 500, 20);
    map.AddTBString(FrmBillAttr.Tag2, null, 'Tag2', false, false, 0, 500, 20);

    //显示列控制.
    map.AddTBInt(FrmAttr.ShowColModel, 0, 'ShowColModel', false, false);
    map.AddTBString(FrmBillAttr.ShowCols, null, 'ShowCols', false, false, 0, 500, 20);

    //关键字查询..
    map.AddTBInt(FrmAttr.IsSearchKey, 0, 'IsSearchKey', false, false);
    map.AddTBString('StringSearchKeys', null, 'StringSearchKeys', false, false, 0, 200, 20);
    map.AddTBString('StringSearchKeysT', null, 'StringSearchKeysT', false, false, 0, 200, 20);
    map.AddTBString('TBSearchKeyPlaceholder', null, '查询关键字', false, false, 0, 200, 20);

    map.AddDDLSysEnum('ListDtlShowWay', 1, '表格行展开', true, true, 'ListDtlShowWay', '@0=无@1=显示从表(平铺)@2=显示从表(Tab)@3=显示表单详情@4=显示从表联动控件');
    map.SetHelperUrl('ListDtlShowWay', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=14221366&doc_id=31094');

    //按日期查询.
    map.AddTBInt('DTSearchWay', 0, 'DTSearchWay', false, false);
    map.AddTBInt('DTShowWay', 0, 'DTShowWay', false, false); //季度，年月查询。
    map.AddTBString('DTSearchKey', null, 'DTSearchKey', false, false, 0, 100, 20);
    map.AddTBInt('DDLShowWays', 0, 'DDLShowWays', false, false);

    //展现方式. 0=经典列表,1=树干叶子,2=联动.
    map.AddTBInt('ListShowWayKey', 0, '展现方式', false, false);
    map.AddTBString('RptSearchKeys', null, 'RptSearchKeys', false, false, 0, 50, 20);
    //隐藏查询条件.
    map.AddTBInt('HidenWay', 0, '是否启用隐藏条件?', false, false);
    map.AddTBString('HidenField', null, '隐藏查询字段', false, false, 0, 150, 20);

    map.AddTBInt('TableStyle', 0, '表格内容展示类型', false, false);
    map.AddTBInt(MapDataAttr.FrmW, 900, 'FrmW', false, true);

    map.ParaFields = `,HidenWay,IsSearchKey,StringSearchKeys,StringSearchKeysT,RptSearchKeys,DTSearchWay,DTSearchKey,DDLShowWays,TBSearchKeyPlaceholder,SortFields,SortFieldsT,`;
    //#endregion 扩展参数.

    //#region 基本功能.
    map.AddGroupMethod('单记录');
    map.AddRM_PG(new PG_Group2Method(), 'icon-energy');
    map.AddRM_EnOnly('常规按钮', 'TS.CCBill.FrmDictBtn', '@No', 'icon-star');
    map.AddRM_GPE(new GPE_FrmType(), 'icon-note'); //表单工作模式.
    map.AddRM_GPE(new GPE_BillCheckModel(), 'icon-check'); //审核模式.
    //map.AddRM_DtlSearch('表单事件', new SysEvents(), SysEventAttr.RefPKVal, '', '', SysEventAttr.ShowAttrs, 'icon-energy');

    map.AddGroupMethod('列表');

    const showAttr1 = 'Name,IsEnable,MethodModel,Icon,IsZD,';
    map.AddRM_DtlSearch('工具栏', new Collections(), CollectionAttr.FrmID, '', '', showAttr1, 'icon-film', true, '', SubTablePostion.Left);

    //展现方式.
    map.AddRM_GPE(new GPE_ListShowWay(), 'icon-grid');
    map.AddRM_UrlTabOpen('多表头', '/@/WF/views/Comm/MultiTitle.vue?DoType=Dict');
    map.AddRM_DtlBatch('列表显示列', new MapExtSearchCols(), 'FK_MapData', '', '', 'icon-drop', '&FK_MapData=@No&ExtModel=SearchCol', SubTablePostion.Left, 0, 400, true);

    map.AddGroupMethod('查询条件');
    //关键字查询模式.
    map.AddRM_GPE(new GPE_SearchKey(), 'icon-calendar');
    //外键枚举查询条件
    map.AddRM_DtlSearch('外键枚举查询条件', new SearchFKEnums(), SearchFKEnumAttr.FrmID, '', '', '', 'icon-drop', true);

    map.AddRM_GPE(new GPE_DTSearchWay(), 'icon-calendar');

    map.AddGroupMethod('数据&按钮权限');
    map.AddRM_DtlSearch('列表权限', new DBRoles(), 'FrmID', '', '', '', 'icon-list', false, '&DBRole=DBList');
    map.AddRM_DtlSearch('新建-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-plus', false, '&DBRole=RecNew');
    map.AddRM_DtlSearch('删除-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-close', false, '&DBRole=RecDelete');
    map.AddRM_DtlSearch('保存-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-trash', false, '&DBRole=RecSave');
    map.AddRM_DtlSearch('归档-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=RecFiling');
    map.AddRM_DtlSearch('提交审核-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-check', false, '&DBRole=SubmitCheck');

    map.AddRM_DtlSearch('导入-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-login', false, '&DBRole=ImpExcel');
    map.AddRM_DtlSearch('导出-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-logout', false, '&DBRole=ExpExcel');
    map.AddRM_DtlSearch('篡改-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-energy', false, '&DBRole=RecJuggle');

    //表格内容展示模式
    map.AddGroupMethod('表格内容');
    map.AddRM_GPE(new GPE_TableStyle(), 'icon-drop');

    map.AddGroupMethod('编程');
    map.AddRM_DtlSearch('事件', new SysEvents(), SysEventAttr.RefPKVal, '', '', SysEventAttr.ShowAttrs, 'icon-energy');
    map.AddRM_UrlLinkeWinOpen('外挂', 'https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl', 'icon-puzzle');

    this._enMap = map;
    return this._enMap;
  }

  public async FrmBillTurn2FrmEntityNoName(): Promise<string> {
    const en = new BSEntity('BP.Sys.MapData', this.No);
    en.setPK(this.No);
    await en.RetrieveFromDBSources();
    const val = en.DoMethodReturnJSON('FrmBillTurn2EntityNoName');
    return Promise.resolve(val);
  }

  public CCFormAPI() {
    const help = `
    #### 帮助
    -  ccform提供两个类的接口， 功能页面调用与
    #### 新建接口
    - 新建一单据记录的链接. 
    - /WF/Port.vue?DoWhat=NewFrmBillRec&FrmID=xxxx
    - 打开一单据记录的链接. 
    - /WF/Port.vue?DoWhat=OpenFrmBillRec&FrmID=xxxx&OID=xxxx
    `;
    return 'tabOpen@' + help;
  }
}

//单据s
export class FrmBills extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FrmBill();
  }

  constructor() {
    super();
  }
}
