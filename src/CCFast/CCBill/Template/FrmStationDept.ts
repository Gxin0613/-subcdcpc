import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { Entity } from '/@/bp/en/Entity';
import { Dept } from '/@/bp/port/Dept';
import { Station } from '/@/bp/port/Station';

export class FrmStationDeptAttr {
  public static readonly FK_Frm = 'FK_Frm';
  public static readonly FK_Dept = 'FK_Dept';
  public static readonly FK_Station = 'FK_Station';
}

/// <summary>
/// 单据角色部门
/// </summary>
export class FrmStationDept extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.CCBill.FrmStationDept');
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
    const map = new Map('Frm_StationDept', '单据角色部门');

    map.AddTBStringPK(FrmStationDeptAttr.FK_Frm, null, '单据编号', false, false, 1, 190, 20);

    map.AddDDLEntities(FrmStationDeptAttr.FK_Station, null, '工作角色', new Station(), true);

    map.AddDDLEntities(FrmStationDeptAttr.FK_Dept, null, '部门', new Dept(), true);

    // AddDDLEntitiesPK
    this._enMap = map;
    return this._enMap;
  }
}

//单据角色部门s
export class FrmStationDepts extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new FrmStationDept();
  }
  constructor() {
    super();
  }

  // public class FrmStationDepts : EntitiesMM
  // {

  //     /// <summary>
  //     /// 单据查询角色
  //     /// </summary>
  //     public FrmStationDepts() { }
  //     /// <summary>
  //     /// 单据查询角色
  //     /// </summary>
  //     /// <param name="frmID">单据ID</param>
  //     public FrmStationDepts(string frmID)
  //     {
  //         QueryObject qo = new QueryObject(this);
  //         qo.AddWhere(FrmStationDeptAttr.FK_Frm, frmID);
  //         qo.DoQuery();
  //     }

  //     /// <summary>
  //     /// 得到它的 Entity
  //     /// </summary>
  //     public override Entity GetNewEntity
  //     {
  //         get
  //         {
  //             return new FrmStationDept();
  //         }
  //     }

  //     #region 为了适应自动翻译成java的需要,把实体转换成 List.
  //     /// <summary>
  //     /// 转化成 java list,C#不能调用.
  //     /// </summary>
  //     /// <returns>List</returns>
  //     public System.Collections.Generic.IList<FrmStationDept> ToJavaList()
  //     {
  //         return (System.Collections.Generic.IList<FrmStationDept>)this;
  //     }
  //     /// <summary>
  //     /// 转化成list
  //     /// </summary>
  //     /// <returns>List</returns>
  //     public System.Collections.Generic.List<FrmStationDept> Tolist()
  //     {
  //         System.Collections.Generic.List<FrmStationDept> list = new System.Collections.Generic.List<FrmStationDept>();
  //         for (int i = 0; i < this.Count; i++)
  //         {
  //             list.Add((FrmStationDept)this[i]);
  //         }
  //         return list;
  //     }
  //     #endregion 为了适应自动翻译成java的需要,把实体转换成 List.
  // }
}
