import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FlowSort } from '/@/WF/TSClass/Admin/FlowSort';
import { OrgAdminer } from './OrgAdminer';

export class OAFlowSortAttr {
  public static readonly RefOrgAdminer = 'RefOrgAdminer';
  /// <summary>
  /// 管理员
  /// </summary>
  public static readonly FK_Emp = 'FK_Emp';
  /// <summary>
  /// 组织
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// FlowSortNo
  /// </summary>
  public static readonly FlowSortNo = 'FlowSortNo';
}

/// <summary>
/// 组织管理员
/// </summary>
export class OAFlowSort extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Port.OAFlowSort');
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
    const map = new Map('Port_OrgAdminerFlowSort', '流程目录权限');
    map.AddMyPK();
    map.AddTBString(OAFlowSortAttr.OrgNo, null, '组织', true, false, 0, 50, 20);
    map.AddTBString(OAFlowSortAttr.FK_Emp, null, '管理员', true, false, 0, 50, 20);
    map.AddTBString(OAFlowSortAttr.RefOrgAdminer, null, '组织管理员', true, false, 0, 50, 20);
    map.AddDDLEntities(OAFlowSortAttr.FlowSortNo, null, '流程目录', new FlowSort(), false);
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    const str = this.GetValStringByKey('RefOrgAdminer');
    this.MyPK = str + '_' + this.GetValStringByKey('FlowSortNo');
    const oa = new OrgAdminer(str);
    await oa.RetrieveFromDBSources();
    this.OrgNo = oa.OrgNo;
    this.FK_Emp = oa.FK_Emp;

    return Promise.resolve(true);
  }
}

// 为了适应自动翻译成java的需要,把实体转换成List.
//   public System.Collections.Generic.IList<OAFlowSort> ToJavaList()
//         {
//             return (System.Collections.Generic.IList<OAFlowSort>)this;
//         }
//         /// <summary>
//         /// 转化成list
//         /// </summary>
//         /// <returns>List</returns>
//         public System.Collections.Generic.List<OAFlowSort> Tolist()
//         {
//             System.Collections.Generic.List<OAFlowSort> list = new System.Collections.Generic.List<OAFlowSort>();
//             for (int i = 0; i < this.Count; i++)
//             {
//                 list.Add((OAFlowSort)this[i]);
//             }
//             return list;
//         }

//组织管理员s
export class OAFlowSorts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new OAFlowSort();
  }
  constructor() {
    super();
  }
}
