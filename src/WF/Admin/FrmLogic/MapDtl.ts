import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName, EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import BSEntity from '/@/utils/gener/BSEntity';

//属性列表
export class MapDtlAttr extends EntityNoNameAttr {
  /// 行Idx
  public static readonly RowIdx = 'RowIdx';

  /// 工作模式
  public static readonly Model = 'Model';

  /// 使用的版本
  public static readonly DtlVer = 'DtlVer';

  /// 主表
  public static readonly FK_MapData = 'FK_MapData';

  /// 别名
  public static readonly Alias = 'Alias';

  /// PTable
  public static readonly PTable = 'PTable';

  /// DtlOpenType
  public static readonly DtlOpenType = 'DtlOpenType';

  /// 行数量
  public static readonly RowsOfList = 'RowsOfList';

  /// 是否显示合计
  public static readonly IsShowSum = 'IsShowSum';

  /// 是否显示idx
  public static readonly IsShowIdx = 'IsShowIdx';

  /// 是否允许copy数据
  public static readonly IsCopyNDData = 'IsCopyNDData';

  /// 是否只读
  public static readonly IsReadonly = 'IsReadonly';

  /// WhenOverSize
  public static readonly WhenOverSize = 'WhenOverSize';

  /// 是否可以删除
  public static readonly IsDelete = 'IsDelete';

  /// 是否可以插入
  public static readonly IsInsert = 'IsInsert';

  /// 是否可以更新
  public static readonly IsUpdate = 'IsUpdate';

  //是否可以批量修改
  public static readonly IsBatchUpdate = 'IsBatchUpdate';

  /// 是否启用通过
  public static readonly IsEnablePass = 'IsEnablePass';

  /// 是否是合流汇总数据
  public static readonly IsHLDtl = 'IsHLDtl';

  /// 是否是分流
  public static readonly IsFLDtl = 'IsFLDtl';

  /// 是否显示标题
  public static readonly IsShowTitle = 'IsShowTitle';

  /// 列表显示格式
  public static readonly ListShowModel = 'ListShowModel';

  /// 行数据显示格式
  public static readonly EditModel = 'EditModel';

  /// 自定义url。
  public static readonly UrlDtl = 'UrlDtl';

  /// 移动端显示方式
  public static readonly MobileShowModel = 'MobileShowModel';

  /// 移动端列表展示时显示的字段
  public static readonly MobileShowField = 'MobileShowField';

  /// 过滤的SQL 表达式.
  public static readonly FilterSQLExp = 'FilterSQLExp';

  /// 排序表达式.
  public static readonly OrderBySQLExp = 'OrderBySQLExp';

  /// 列自动计算表达式
  public static readonly ColAutoExp = 'ColAutoExp';

  /// 显示列
  public static readonly ShowCols = 'ShowCols';

  /// 固定到
  public static readonly FixedCols = 'FixedCols';

  /// 是否可见
  public static readonly IsView = 'IsView';

  /// H高度
  public static readonly H = 'H';

  /// 宽度
  public static readonly FrmW = 'FrmW';

  /// 高度
  public static readonly FrmH = 'FrmH';

  /// 是否启用多附件
  public static readonly IsEnableAthM = 'IsEnableAthM';

  /// GUID
  public static readonly GUID = 'GUID';

  /// 分组
  public static readonly GroupField = 'GroupField';

  /// 关联主键
  public static readonly RefPK = 'RefPK';

  /// 是否启用分组字段
  public static readonly IsEnableGroupField = 'IsEnableGroupField';

  /// 节点(用于多表单的权限控制)
  public static readonly FK_Node = 'FK_Node';

  /// 映射的实体事件类
  public static readonly FEBD = 'FEBD';

  /// 导入模式.
  public static readonly ImpModel = 'ImpModel';

  public static readonly IsEnableLink = 'IsEnableLink';
  public static readonly LinkLabel = 'LinkLabel';
  public static readonly ExcType = 'ExcType';
  public static readonly LinkUrl = 'LinkUrl';
  public static readonly LinkTarget = 'LinkTarget';

  public static readonly IsEnableLink2 = 'IsEnableLink2';
  public static readonly LinkLabel2 = 'LinkLabel2';
  public static readonly ExcType2 = 'ExcType2';
  public static readonly LinkUrl2 = 'LinkUrl2';
  public static readonly LinkTarget2 = 'LinkTarget2';
  public static readonly DtlSaveModel = 'DtlSaveModel';
  public static readonly DtlAddRecModel = 'DtlAddRecModel';
  /// 是否启用锁定
  public static readonly IsRowLock = 'IsRowLock';
  /// 子线程处理人字段
  public static readonly SubThreadWorker = 'SubThreadWorker';
  /// 子线程分组字段.
  public static readonly SubThreadGroupMark = 'SubThreadGroupMark';
  /// 是否可以导入
  public static readonly IsImp = 'IsImp';
  /// 是否可以导出
  public static readonly IsExp = 'IsExp';
  /// 查询sql
  public static readonly ImpSQLSearch = 'ImpSQLSearch';
  /// 选择sql
  public static readonly ImpSQLInit = 'ImpSQLInit';
  /// 填充数据一行数据
  public static readonly ImpSQLFullOneRow = 'ImpSQLFullOneRow';
  /// 列的中文名称
  public static readonly ImpSQLNames = 'ImpSQLNames';
  /// 从表最小集合
  public static readonly NumOfDtl = 'NumOfDtl';
  /// 是否拷贝第一条数据
  public static readonly IsCopyFirstData = 'IsCopyFirstData';
  /// 行数据初始化字段
  public static readonly InitDBAttrs = 'InitDBAttrs';
  /// 是否可以全屏显示
  public static readonly IsFullShow = 'IsFullShow';
  //是否可以复制该行数据
  public static readonly IsCopyThisData = 'IsCopyThisData';
  //是否启用Excel导入
  public static readonly IsExcelExp = 'IsExcelExp';

  public static readonly DBSrc = 'DBSrc';
}

// 从表
export class MapDtl extends EntityNoName {
  constructor(no?: string) {
    super('TS.Sys.MapDtl');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapDtl', '明细');

    // Map map = new Map("Sys_MapDtl", "明细");
    // map.IndexField = MapDtlAttr.FK_MapData;

    map.AddTBStringPK(MapDtlAttr.No, null, '编号', true, false, 1, 100, 20);
    map.AddTBString(MapDtlAttr.Name, null, '描述', true, false, 1, 200, 20);
    map.AddTBString(MapDtlAttr.Alias, null, '别名', true, false, 1, 200, 20);
    map.AddTBString(MapDtlAttr.FK_MapData, null, '主表', true, false, 0, 100, 20);
    map.AddTBString(MapDtlAttr.PTable, null, '物理表', true, false, 0, 200, 20);

    map.AddTBString(MapDtlAttr.GroupField, null, '分组字段', true, false, 0, 300, 20);
    map.AddTBString(MapDtlAttr.RefPK, null, '关联的主键', true, false, 0, 100, 20);

    // 为明细表初始化事件类.
    map.AddTBString(MapDtlAttr.FEBD, null, '映射的事件实体类', true, false, 0, 100, 20);

    // @0=普通@1=固定行
    map.AddTBInt(MapDtlAttr.Model, 0, '工作模式', false, false);
    //map.AddDDLSysEnum(MapDtlAttr.Model, 0, "工作模式", true, true,
    //MapDtlAttr.Model, "@0=普通@1=固定行");

    map.AddTBInt(MapDtlAttr.DtlVer, 0, '使用版本', false, false);
    // map.AddDDLSysEnum(MapDtlAttr.DtlVer, 0, "使用版本", true, true, MapDtlAttr.DtlVer, "@0=2017传统版@1=2019EasyUI版本");

    map.AddTBInt(MapDtlAttr.RowsOfList, 0, '初始化行数', false, false);

    map.AddBoolean(MapDtlAttr.IsEnableGroupField, false, '是否启用分组字段', false, false);

    map.AddBoolean(MapDtlAttr.IsShowSum, true, '是否显示合计？', false, false);
    map.AddBoolean(MapDtlAttr.IsShowIdx, true, '是否显示序号？', false, false);
    map.AddBoolean(MapDtlAttr.IsCopyNDData, true, '是否允许Copy数据', false, false);
    map.AddBoolean(MapDtlAttr.IsHLDtl, false, '是否是合流汇总', false, false);

    map.AddBoolean(MapDtlAttr.IsReadonly, false, '是否只读？', false, false);
    map.AddBoolean(MapDtlAttr.IsShowTitle, true, '是否显示标题？', false, false);
    map.AddBoolean(MapDtlAttr.IsView, true, '是否可见', false, false);

    map.AddBoolean(MapDtlAttr.IsInsert, true, '是否可以插入行？', false, false);
    map.AddBoolean(MapDtlAttr.IsDelete, true, '是否可以删除行', false, false);
    map.AddBoolean(MapDtlAttr.IsUpdate, true, '是否可以更新？', false, false);

    map.AddBoolean(MapDtlAttr.IsEnablePass, false, '是否启用通过审核功能?', false, false);
    //map.AddBoolean(MapDtlAttr.IsEnableAthM, false, '是否启用多附件', false, false);

    map.AddBoolean(MapDtlAttr.IsCopyFirstData, false, '是否复制第一行数据？', false, false);
    map.AddTBString(MapDtlAttr.InitDBAttrs, null, '行初始化字段', true, false, 0, 40, 20, false);
    // 超出行数
    map.AddTBInt(MapDtlAttr.WhenOverSize, 0, '列表数据显示格式', false, false);

    //数据开放类型 .
    map.AddTBInt(MapDtlAttr.DtlOpenType, 1, '数据开放类型', false, false); //参数字段.
    map.AddTBString('DtlOpenField', null, '查询字段', true, false, 0, 40, 20, false); //参数字段
    map.AddTBString('DtlOpenPara', null, '开放参数', true, false, 0, 40, 20, false); //参数字段.

    map.AddTBInt(MapDtlAttr.ListShowModel, 0, '列表数据显示格式', false, false);
    map.AddTBInt(MapDtlAttr.EditModel, 0, '行数据显示格式', false, false);
    //map.AddTBString('SFTableTreeNo', null, '损益表的模式对应树结构', false, false, 0, 128, 20);

    map.AddTBString(MapDtlAttr.UrlDtl, null, '自定义Url', true, false, 0, 200, 20, true);

    map.AddTBInt(MapDtlAttr.MobileShowModel, 0, '移动端数据显示格式', false, false);
    map.AddTBString(MapDtlAttr.MobileShowField, null, '移动端列表显示字段', true, false, 0, 100, 20);

    map.AddTBFloat(MapDtlAttr.H, 150, '高度', true, false);

    map.AddTBFloat(MapDtlAttr.FrmW, 900, '表单宽度', true, true);
    map.AddTBFloat(MapDtlAttr.FrmH, 1200, '表单高度', true, true);
    map.AddTBInt(MapDtlAttr.NumOfDtl, 0, '最小从表集合', true, false);

    map.AddTBInt('IsBatchUpdate', 0, '批量编辑规则', true, false);
    map.AddTBString('IsBatchUpdateAttrs', null, '批量编辑字段', true, false, 0, 100, 20);

    //MTR 多表头列.
    //map.AddTBString(MapDtlAttr.MTR, null, "多表头列", true, false, 0, 3000, 20);
    map.AddBoolean(MapDtlAttr.IsEnableLink, false, '是否启用超链接', true, true);
    map.AddTBString(MapDtlAttr.LinkLabel, '', '超连接标签', true, false, 0, 50, 100);
    map.AddTBString(MapDtlAttr.LinkTarget, null, '连接目标', true, false, 0, 10, 100);
    map.AddTBString(MapDtlAttr.LinkUrl, null, '连接URL', true, false, 0, 200, 200, true);

    //SQL过滤表达式.
    map.AddTBString(MapDtlAttr.FilterSQLExp, null, '过滤SQL表达式', true, false, 0, 70, 20, true);
    map.AddTBString(MapDtlAttr.OrderBySQLExp, null, '排序字段', true, false, 0, 70, 20, true);

    //add 2014-02-21.
    map.AddTBInt(MapDtlAttr.FK_Node, 0, '节点(用户独立表单权限控制)', false, false);

    //要显示的列.
    map.AddTBString(MapDtlAttr.ShowCols, null, '显示的列', true, false, 0, 500, 20, true);
    map.SetHelperAlert(MapDtlAttr.ShowCols, '默认为空,全部显示,如果配置了就按照配置的计算,格式为:field1,field2');
    // 固定列
    const fixedColHelpDocs = '配置后将在从表左侧显示固定列(不随滚动条滚动)，格式为:field1,field2,field3';
    map.AddTBString(MapDtlAttr.FixedCols, null, '固定列（左侧）', true, false, 0, 500, 20, true, fixedColHelpDocs);

    // 2014-07-17 for xinchang bank.
    map.AddBoolean(MapDtlAttr.IsExp, true, 'IsExp', false, false);
    map.AddTBInt(MapDtlAttr.ImpModel, 0, '导入规则', false, false);

    // map.AddBoolean(MapDtlAttr.IsImp, true, "IsImp", false, false);
    // map.AddBoolean(MapDtlAttr.IsEnableSelectImp, false, "是否启用选择数据导入?", false, false);
    map.AddTBString(MapDtlAttr.ImpSQLSearch, null, '查询SQL', true, false, 0, 500, 20);
    map.AddTBString(MapDtlAttr.ImpSQLInit, null, '初始化SQL', true, false, 0, 500, 20);
    map.AddTBString(MapDtlAttr.ImpSQLFullOneRow, null, '数据填充SQL', true, false, 0, 500, 20);
    map.AddTBString(MapDtlAttr.ImpSQLNames, null, '字段中文名', true, false, 0, 900, 20);
    map.AddBoolean(MapDtlAttr.IsImp, false, 'IsImp', true, true);

    //列自动计算表达式.
    map.AddTBString(MapDtlAttr.ColAutoExp, null, '列自动计算表达式', true, false, 0, 200, 20, true);
    map.AddTBString(MapDtlAttr.GUID, null, 'GUID', false, false, 0, 128, 20);

    map.AddTBInt('IsSearchKey', 0, 'IsSearchKey', false, false);
    map.AddTBString('StringSearchKeys', null, 'StringSearchKeys', false, false, 0, 500, 20);
    map.AddTBString('StringSearchKeysT', null, 'StringSearchKeysT', false, false, 0, 500, 20);
    map.AddTBInt('DTSearchWay', 0, 'DTSearchWay', false, false);
    map.AddTBString('DTSearchKey', null, 'DTSearchKey', false, false, 0, 100, 20);
    map.AddTBString('DTSearchKeyT', null, 'DTSearchKey', false, false, 0, 100, 20);

    map.AddTBInt('VSTOEditModel', 0, 'VSTO编辑模式', false, false);
    map.AddTBInt('VSTOEditPara', 2, 'VSTO编辑参数', false, false);

    map.ParaFields = ',VSTOEditModel,VSTOEditPara,DtlOpenField,DtlOpenPara,IsBatchUpdateAttrs,IsSearchKey,StringSearchKeys,StringSearchKeysT,DTSearchWay,DTSearchKey,DTSearchKeyT,';
    // map.AddTBString(MapDtlAttr.GUID, null, 'GUID', false, false, 0, 128, 20);

    //参数.
    map.AddTBAtParas(300);

    this._enMap = map;
    return this._enMap;
  }
  protected override async afterInsert(): Promise<boolean> {
    const mapdtl = new BSEntity('BP.Sys.MapDtl', this.No);
    await mapdtl.Init();
    await mapdtl.RetrieveFromDBSources();
    await mapdtl.DoMethodReturnString('IntMapAttrs');

    return Promise.resolve(true);
  }
}

//从表s
export class MapDtls extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MapDtl();
  }
  constructor() {
    super();
  }
}
