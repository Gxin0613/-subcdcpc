// 分组
export class Group {
  public No = '';
  public Name = '';
  public Icon = '';
  public Help = '';
}

// 属性集合
export class Groups extends Array<Group> {
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
  public Add(Group: Group) {
    this.push(Group);
  }
}
