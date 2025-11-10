import { Attr } from '/@/bp/en/Map/Attr';

/// <summary>
/// 查询属性
/// </summary>
export class SearchFKEnum {
  /// 字段值
  public AttrKey = '';
  /// 是否显示全部
  public IsShowAll = true;
  /// 及联子菜单
  public RelationalDtlKey = '';
  /// 查询的字段
  public Key = '';
  /// 下拉框显示的宽度
  public Width = 120;
  constructor() { }
}

/// <summary>
/// 查询属性s
/// </summary>
export class SearchFKEnums extends Array<SearchFKEnum> {
  constructor() {
    super();
  }
  public Add(attr: Attr, isShowSelectedAll: boolean, relationalDtlKey: string, width = 120) {
    const en = new SearchFKEnum();
    en.AttrKey = attr.Key;
    en.IsShowAll = isShowSelectedAll;
    en.RelationalDtlKey = relationalDtlKey;
    en.Key = attr.Key;
    en.Width = width; //宽度.
    this.push(en);
  }
  public AddAttrSearchFKEnum(asf: SearchFKEnum) {
    this.push(asf);
  }

}
