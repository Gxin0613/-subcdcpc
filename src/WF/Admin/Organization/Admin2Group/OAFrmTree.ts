/// <summary>
/// 表单目录权限 属性
/// </summary>
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { OrgAdminer } from './OrgAdminer';

export class OAFrmTreeAttr {
  /// 关联的二级管理员
  /// </summary>
  public static readonly RefOrgAdminer = 'RefOrgAdminer';
  /// <summary>
  /// 管理员
  /// </summary>
  public static readonly FK_Emp = 'FK_Emp';
  /// <summary>
  /// 组织
  /// </summary>
  public static readonly OrgNo = 'OrgNo';

  public static readonly FrmTreeNo = 'FrmTreeNo';
}

/// <summary>
/// 表单目录权限
/// </summary>
export class OAFrmTree extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Port.OAFrmTree');
    if (!!mypk) {
      this.MyPK = mypk;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Port_OrgAdminerFrmTree', '表单目录权限');
    map.AddMyPK();
    map.AddTBString(OAFrmTreeAttr.OrgNo, null, '组织', true, false, 0, 50, 20);
    map.AddTBString(OAFrmTreeAttr.FK_Emp, null, '管理员', true, false, 0, 50, 20);
    map.AddTBString(OAFrmTreeAttr.RefOrgAdminer, null, '组织管理员', true, false, 0, 50, 20);
    // map.AddDDLEntities(OAFrmTreeAttr.FrmTreeNo, null, '表单目录', new OAFrmTrees(), false);
    // map.AddDDLEntities(OAFrmTreeAttr.FrmTreeNo, null, "表单目录", new BP.Sys.FrmTrees(), false);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    const str = this.GetValStringByKey('RefOrgAdminer');
    this.MyPK = this.GetValStringByKey('RefOrgAdminer') + '_' + this.GetValStringByKey('FrmTreeNo');
    const oa = new OrgAdminer(str);
    this.OrgNo = oa.OrgNo;
    this.FK_Emp = oa.FK_Emp;

    return Promise.resolve(true);
  }
}

// protected override bool beforeInsert()
// {
//     string str = this.GetValStringByKey("RefOrgAdminer");

//     this.MyPK = this.GetValStringByKey("RefOrgAdminer") + "_" + this.GetValStringByKey("FrmTreeNo");

//     OrgAdminer oa = new OrgAdminer(str);

//     this.OrgNo = oa.OrgNo;
//     this.FK_Emp = oa.FK_Emp;

//     return base.beforeInsert();
// }
//学生科目s
export class OAFrmTrees extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new OAFrmTree();
  }
  constructor() {
    super();
  }
}
