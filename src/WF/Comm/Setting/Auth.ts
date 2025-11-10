import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import WebUser from '/@/bp/web/WebUser';
import { DataType } from '/@/bp/en/DataType';
import { GloWF } from '/@/WF/Admin/GloWF';

// 属性
export class AuthAttr {
  /// <summary>
  /// 流程编号
  /// </summary>
  public static readonly MyPK = 'MyPK';
  /// <summary>
  /// 类型(0=全部流程1=指定流程)
  /// </summary>
  public static readonly AuthType = 'AuthType';
  /// <summary>
  /// 授权人
  /// </summary>
  public static readonly Auther = 'Auther';
  public static readonly AutherName = 'AutherName';
  /// <summary>
  /// 流程编号
  /// </summary>
  public static readonly FlowNo = 'FlowNo';
  /// <summary>
  /// 流程名称
  /// </summary>
  public static readonly FlowName = 'FlowName';
  /// <summary>
  /// 取回日期
  /// </summary>
  public static readonly TakeBackDT = 'TakeBackDT';
  /// <summary>
  /// 人员编号.
  /// </summary>
  public static readonly AutherToEmpNo = 'AutherToEmpNo';
  /// <summary>
  /// 人员名称
  /// </summary>
  public static readonly AutherToEmpName = 'AutherToEmpName';
  /// <summary>
  /// 记录日期
  /// </summary>
  public static readonly RDT = 'RDT';
}

// 人员
export class Auth extends EntityMyPK {
  constructor(no?: string) {
    super('TS.User.Auth');
    if (!!no) {
      this.MyPK = no;
    }
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
    const map = new Map('WF_Auth', '授权');
    map.AddMyPK();

    map.AddTBString(AuthAttr.Auther, null, '授权人', false, false, 0, 100, 10);
    map.AddTBString(AuthAttr.AutherName, null, '授权人', false, false, 0, 100, 10);

    map.AddTBString(AuthAttr.AutherToEmpNo, null, '授权给', true, true, 0, 100, 100);
    map.AddTBString(AuthAttr.AutherToEmpName, null, '名称', true, true, 0, 100, 100);

    //map.AddTBInt(AuthAttr.AuthType, 0, '类型(0=全部流程1=指定流程2=取消)', true, false);
    map.AddDDLSysEnum(AuthAttr.AuthType, 0, '授权方式', true, true, AuthAttr.AuthType, '@0=全部流程@1=指定流程@2=指定流程+部门', null, false);
    map.AddTBString(AuthAttr.FlowNo, null, '流程', true, false, 0, 100, 100, true);
    map.SetPopGroupList(AuthAttr.FlowNo, GloWF.srcFlowSorts, GloWF.srcFlows, true, '800px', '500px', '选择流程', 'icon-people');

    map.AddTBString('Depts', null, '部门', true, false, 0, 100, 100, true);
    map.SetPopTree('Depts', GloWF.srcDepts, GloWF.srcDeptRoot, true, '500px', '600px', '选择部门', 'icon-people');

    map.AddTBDate('DTFrom', null, '授权开始日期(默认当前日期)', true, false);
    map.AddTBDate(AuthAttr.TakeBackDT, null, '取回日期', true, false);
    map.SetHelperAlert(AuthAttr.TakeBackDT, '取回日期也可称为授权截至日期，是必填项，否则授权不生效。');
    map.AddTBDate(AuthAttr.RDT, '@RDT', '记录日期', true, true);

    //设置委托
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.Auther = WebUser.No;
    this.AutherName = WebUser.Name;
    this.RDT = DataType.CurrentDateTime; // WebUser.Name;
    this.TakeBackDT = DataType.CurrentDate;
    return Promise.resolve(true);
  }
}

//授权s
export class Auths extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Auth();
  }
  constructor() {
    super();
  }
}
