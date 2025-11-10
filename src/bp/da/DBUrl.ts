/**
 * 前端不处理数据库链接
 *   /// <summary>
 *   ///　连接到哪个库上．
 *   ///  他们存放在 web.config 的列表内．
 *   /// </summary>
 */
export enum DBUrlType {
  /// <summary>
  /// 主应用程序
  /// </summary>
  AppCenterDSN,
}

/// <summary>
/// DBUrl 的摘要说明。
/// </summary>
export class DBUrl {
  public DBUrlType: DBUrlType = DBUrlType.AppCenterDSN;
  /// <summary>
  /// 连接
  /// </summary>
  constructor(type: DBUrlType) {
    this.DBUrlType = type;
  }
}
