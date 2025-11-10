// 分组
export class Help {
  public No = '';
  public Name = '';
  public Url = '';
  public MM = 3;
}

// 属性集合
export class Helps extends Array<Help> {
  /// <summary>
  /// 是否包含属性key。
  /// </summary>
  /// <param name="key"></param>
  /// <returns></returns>
  public Contains(key: string) {
    return this.find((item) => item.No === key);
  }

  public GetGroupByKey(key: string) {
    return this.find((item) => item.No === key);
  }
  // 增加分组.
  public Add(Help: Help) {
    this.push(Help);
  }
}
