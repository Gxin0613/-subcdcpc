/// 操作员 属性
import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { DataType } from '/@/bp/en/DataType';
import { Exception } from '/@/views/sys/exception';

export class UserAttr extends EntityNoNameAttr {
  public static readonly UserID = 'UserID';
  /// <summary>
  /// 部门
  /// </summary>
  public static readonly FK_Dept = 'FK_Dept';

  /// <summary>
  /// sid
  /// </summary>
  public static readonly SID = 'Token';
  /// <summary>
  /// 电话
  /// </summary>
  public static readonly Tel = 'Tel';
  /// <summary>
  /// 邮箱
  /// </summary>
  public static readonly Email = 'Email';
  /// <summary>
  /// 序号
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// 拼音
  /// </summary>
  public static readonly PinYin = 'PinYin';

  /// <summary>
  /// 组织结构编码
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// 组织名称
  /// </summary>
  public static readonly OrgName = 'OrgName';
  /// <summary>
  /// 微信ID
  /// </summary>
  public static readonly unionid = 'unionid';
  public static readonly OpenID = 'OpenID';
  public static readonly OpenID2 = 'OpenID2';
}

/// 操作员
export class User extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.User');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_User', '用户');
    // map.EnType = EnType.App;
    // map.IndexField = UserAttr.FK_Dept;

    map.AddTBStringPK(UserAttr.No, null, '手机号/ID', true, false, 1, 150, 90);
    map.AddTBString(UserAttr.Name, null, '姓名', true, false, 0, 500, 130);
    map.AddTBString(UserAttr.FK_Dept, null, '部门', false, false, 0, 100, 10);
    map.AddTBString(UserAttr.SID, null, 'Token', false, false, 0, 36, 36);
    map.AddTBString(UserAttr.Tel, null, '电话', true, false, 0, 20, 130);
    map.AddTBString(UserAttr.Email, null, '邮箱', true, false, 0, 100, 132, true);
    map.AddTBString(UserAttr.PinYin, null, '拼音', true, false, 0, 1000, 132, true);

    map.AddTBString(UserAttr.OrgNo, null, 'OrgNo', true, false, 0, 500, 132, true);
    map.AddTBString(UserAttr.OrgName, null, 'OrgName', true, false, 0, 500, 132, true);
    map.AddTBString(UserAttr.unionid, null, 'unionid', true, false, 0, 500, 132, true);
    map.AddTBString(UserAttr.OpenID, null, '小程序的OpenID', true, false, 0, 500, 132, true);
    map.AddTBString(UserAttr.OpenID2, null, '公众号的OpenID', true, false, 0, 500, 132, true);

    map.AddTBInt(UserAttr.Idx, 0, '序号', true, false);
    this._enMap = map;
    return this._enMap;
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    if (DataType.IsNullOrEmpty(this.Name) == true) throw new Exception('err@名称不能为空.');

    // const pinyinQP = DataType.ParseStringToPinyin(this.Name).ToLower();
    // const pinyinJX = DataType.ParseStringToPinyinJianXie(this.Name).ToLower();
    // this.PinYin = "," + pinyinQP + "," + pinyinJX + ",";

    return true;
  }
  //   protected override bool beforeUpdateInsertAction()
  //   {
  //       //增加拼音，以方便查找.
  //       if (DataType.IsNullOrEmpty(this.Name) == true)
  //           throw new Exception("err@名称不能为空.");

  //       string pinyinQP = BP.DA.DataType.ParseStringToPinyin(this.Name).ToLower();
  //       string pinyinJX = BP.DA.DataType.ParseStringToPinyinJianXie(this.Name).ToLower();
  //       this.PinYin = "," + pinyinQP + "," + pinyinJX + ",";
  //       return base.beforeUpdateInsertAction();
  //   }
  //   protected override bool beforeDelete()
  //   {
  //       if (this.OrgNo != BP.Web.WebUser.OrgNo)
  //           throw new Exception("err@您不能删除别人的数据.");

  //       return base.beforeDelete();
  //   }
  //   /// <summary>
  //   /// 删除之后要做的事情
  //   /// </summary>
  //   protected override void afterDelete()
  //   {
  //       base.afterDelete();
  //   }

  //   public static string GenerPinYin(string no, string name)
  //   {
  //       //增加拼音，以方便查找.
  //       string pinyinQP = BP.DA.DataType.ParseStringToPinyin(name).ToLower();
  //       string pinyinJX = BP.DA.DataType.ParseStringToPinyinJianXie(name).ToLower();
  //       string py = "," + pinyinQP + "," + pinyinJX + ",";

  //       return py;
  //   }

  //   /// <summary>
  //   /// 向上移动
  //   /// </summary>
  //   public string DoUp()
  //   {
  //       this.DoOrderUp(UserAttr.FK_Dept, this.FK_Dept, UserAttr.Idx);
  //       return "执行成功.";
  //   }
  //   /// <summary>
  //   /// 向下移动
  //   /// </summary>
  //   public string DoDown()
  //   {
  //       this.DoOrderDown(UserAttr.FK_Dept, this.FK_Dept, UserAttr.Idx);
  //       return "执行成功.";
  //   }

  //   public string DoResetpassword(string pass1, string pass2)
  //   {
  //       if (pass1.Equals(pass2) == false)
  //           return "两次密码不一致";

  //       if (BP.Difference.SystemConfig.IsEnablePasswordEncryption == true)
  //           pass1 = BP.Tools.Cryptography.EncryptString(pass1);

  //       this.Pass = pass1;

  //       this.Update();
  //       return "密码设置成功";
  //   }
  //   /// <summary>
  //   /// 获取集合
  //   /// </summary>
  //   public override Entities GetNewEntities
  //   {
  //       get { return new Users(); }
  //   }
}

// 操作员s
export class Users extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new User();
  }
  constructor() {
    super();
  }
}
