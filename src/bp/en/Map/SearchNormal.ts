import { Attr } from './Attr';

export enum DTSearchWay {
  //不设置
  None,
  // 按日期
  ByDate,
  // 范围
  ByDateRange,
  // 废弃
  ByDateTime,
  ByYearMonth,
  ByYear,
}
/// <summary>
/// 查询属性
/// </summary>
export class SearchNormal {
  /// <summary>
  /// 查询属性
  /// </summary>
  public HisAttr: Attr | null = null;
  /// <summary>
  /// 是否显示全部
  /// </summary>
  public IsShowAll = true;
  /// <summary>
  /// 及联子菜单
  /// </summary>
  public RelationalDtlKey: null | string = null;
  /// <summary>
  /// 查询的字段
  /// </summary>
  public Key = '';
  public Lab = '';
  public RefAttrKey = '';
  public DefaultSymbol = '';
  public TBWidth = 100;
  public IsHidden = false;
  public DefaultVal = '';
  public Width = 120;

  /**
   * 构造方法
   * @param key 字段
   * @param lab 标签
   * @param refAttr 属性
   * @param DefaultSymbol 符号
   * @param defaultValue 默认值
   * @param tbwidth 宽度
   * @param isHidden 是否隐藏.
   */
  public constructor(key?: string, lab?: string, refAttr?: string, DefaultSymbol?: string, defaultValue?: string, tbwidth?: number, isHidden?: boolean) {
    this.Key = key || '';
    this.Lab = lab || '';
    this.RefAttrKey = refAttr || '';
    this.DefaultSymbol = DefaultSymbol || '';
    this.DefaultVal = defaultValue || '';
    this.TBWidth = tbwidth || 120;
    this.IsHidden = !!isHidden;
  }
}
/// <summary>
/// 查询属性s
/// </summary>
export class SearchNormals extends Array<SearchNormal> {
  constructor() {
    super();
  }

  public AddSearchAttr(searchAttr: SearchNormal) {
    this.push(searchAttr);
  }
}
