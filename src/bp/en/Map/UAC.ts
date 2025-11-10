import WebUser from '/@/bp/web/WebUser';
import HttpHandler from '/@/utils/gener/HttpHandler';
/// <summary>
/// 访问控制
/// </summary>
export class UAC {
  public Readonly() {
    this.IsUpdate = false;
    this.IsDelete = false;
    this.IsInsert = false;
    this.IsAdjunct = false;
    this.IsView = true;
  }
  /// <summary>
  /// 全部开放
  /// </summary>
  public OpenAll() {
    this.IsUpdate = true;
    this.IsDelete = true;
    this.IsInsert = true;
    this.IsAdjunct = false;
    this.IsView = true;
  }

  /// <summary>
  /// 仅仅对管理员
  /// </summary>
  public OpenForSysAdmin() {
    // if (WebUser.No.Equals("admin") == true)
    if (WebUser.IsAdmin) this.OpenAll();
    return this;
  }
  public OpenAllForStation(station:string)
  {
    const handler=new HttpHandler('');
    
  }
  public OpenForAppAdmin() {
    /*if (WebUser.No != null && WebUser.No.Contains("admin") == true)*/
    if (WebUser.IsAdmin) {
      this.OpenAll();
    }
    return this;
  }

  public OpenForAdmin() {
    /*if (WebUser.No != null
               && WebUser.IsAdmin == true)*/
    if (WebUser.IsAdmin) {
      this.OpenAll();
    } else {
      this.Readonly();
    }
    return this;
  }
  /// <summary>
  /// 是否插入
  /// </summary>
  public IsInsert = false;
  /// <summary>
  /// 是否删除
  /// </summary>
  public IsDelete = false;
  /// <summary>
  /// 是否更新
  /// </summary>
  public IsUpdate = false;
  /// <summary>
  /// 是否查看
  /// </summary>
  public IsView = true;
  /// <summary>
  /// 附件
  /// </summary>
  public IsAdjunct = false;
  /// <summary>
  /// 是否可以导出
  /// <para>注意：要启用导出权限控制，请使用uac.IsExp = UserRegedit.HaveRoleForExp(this.ToString());</para>
  /// </summary>
  public IsExp = false;
  /// <summary>
  /// 是否可以导入
  /// <para>注意：要启用导入权限控制，请使用uac.IsImp = UserRegedit.HaveRoleForImp(this.ToString());</para>
  /// </summary>
  public IsImp = false;
  /// 用户访问
  constructor() {}
}
