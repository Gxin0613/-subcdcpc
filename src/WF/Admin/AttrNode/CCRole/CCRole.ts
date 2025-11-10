import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';

export class CCRoleAttr {
  public static readonly OID = 'OID';
  /// <summary>
  /// 节点
  /// </summary>
  public static readonly NodeID = 'NodeID';
  public static readonly FlowNo = 'FlowNo';
  public static readonly EnIDs = 'EnIDs';
  public static readonly Tag2 = 'Tag2';
  public static readonly DBSrc = 'DBSrc';

  //按角色的规则.
  public static readonly CCStaWay = 'CCStaWay';
  /// 执行类型
  /// </summary>
  public static readonly CCRoleExcType = 'CCRoleExcType';
  public static readonly Idx = 'Idx';
}

/// <summary>
/// 抄送规则
/// </summary>
export class CCRole extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.CCRole');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_CCRole', '抄送规则');

    map.AddMyPK();
    map.AddTBInt(CCRoleAttr.NodeID, 0, '节点', false, true);
    map.AddTBString(CCRoleAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    // 执行类型.
    const val = '@0=按表单字段计算@1=按人员计算@2=按角色计算@3=按部门计算@4=按SQL计算@5=按接受人规则计算';
    map.AddDDLSysEnum(CCRoleAttr.CCRoleExcType, 0, '执行类型', true, true, null, val);

    map.AddTBString(CCRoleAttr.DBSrc, null, 'DBSrc', false, false, 0, 10, 50, true);
    map.AddTBStringDoc(CCRoleAttr.EnIDs, null, '执行内容1', true, false, true);
    map.AddTBStringDoc('EnIDsT', null, '执行内容1', true, false, true);
    map.AddTBInt(CCRoleAttr.Idx, 0, '序号', true, false);
    map.AddTBAtParas(4000);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}

/**
 * 抄送规则s
 */
export class CCRoles extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new CCRole();
  }
  constructor() {
    super();
  }
}
