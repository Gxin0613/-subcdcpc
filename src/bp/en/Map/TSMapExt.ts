/// <summary>
/// 业务逻辑
/// </summary>
export class TSMapExt {
  // 标签
  public Lab = 'Lab';
  /// <summary>
  /// 表单ID
  /// </summary>
  public FK_MapData = 'FK_MapData';
  /// <summary>
  /// ExtType
  /// </summary>
  public ExtType = 'ExtType';
  /// <summary>
  /// 插入表单的位置
  /// </summary>
  public RowIdx = 'RowIdx';
  /// <summary>
  /// GroupID
  /// </summary>
  public GroupID = 'GroupID';
  /// <summary>
  /// 高度
  /// </summary>
  public H = 'H';
  /// <summary>
  /// 宽度
  /// </summary>
  public W = 'W';
  /// <summary>
  /// 是否可以自适应大小
  /// </summary>
  public IsAutoSize = 'IsAutoSize';
  /// <summary>
  /// 设置的属性
  /// </summary>
  public AttrOfOper = 'AttrOfOper';
  //模式
  public ExtModel = 'ExtModel';
  /// <summary>
  /// 激活的属性
  /// </summary>
  public AttrsOfActive = 'AttrsOfActive';
  /// <summary>
  /// 执行方式
  /// </summary>
  public DoWay = 'DoWay';
  /// <summary>
  /// Tag
  /// </summary>
  public Tag = 'Tag';
  /// <summary>
  /// Tag1
  /// </summary>
  public Tag1 = 'Tag1';
  /// <summary>
  /// Tag2
  /// </summary>
  public Tag2 = 'Tag2';
  /// <summary>
  /// Tag3
  /// </summary>
  public Tag3 = 'Tag3';
  /// <summary>
  /// tag4
  /// </summary>
  public Tag4 = 'Tag4';
  /// <summary>
  /// tag5
  /// </summary>
  public Tag5 = 'Tag5';
  /// <summary>
  /// 数据源
  /// </summary>
  public DBType = 'DBType';
  /// <summary>
  /// Doc
  /// </summary>
  public Doc = 'Doc';
  /// <summary>
  /// 参数
  /// </summary>
  public AtPara = 'AtPara';
  /// <summary>
  /// 计算的优先级
  /// </summary>
  public PRI = 'PRI';
  /// <summary>
  /// 数据源
  /// </summary>
  public FK_DBSrc = 'FK_DBSrc';
  /// <summary>
  /// 排序
  /// </summary>
  public Idx = 'Idx';
}
/// <summary>
/// 业务逻辑s
/// </summary>
export class TSMapExts extends Array {
  constructor() {
    super();
  }

  public Add(mapExt: TSMapExt) {
    this.push(mapExt);
  }
}
