/// <summary>
/// 用户部门岗位 属性
/// </summary>
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import WebUser from '../web/WebUser';
import { CCBPMRunModel } from '../difference/SystemConfig';
import { Dept } from './Dept';

export class DeptEmpStationAttr {
  public static readonly FK_Dept = 'FK_Dept';
  public static readonly FK_Emp = 'FK_Emp';
  public static readonly FK_Station = 'FK_Station';
}

/// <summary>
/// 用户部门岗位
/// </summary>

export class DeptEmpStation extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Port.DeptEmpStation');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Port_DeptEmpStation', '用户部门岗位');
    map.CodeStruct = '2';
    map.AddMyPK();
    map.AddTBString(DeptEmpStationAttr.FK_Emp, null, '人员', true, true, 0, 50, 200);
    map.AddTBString(DeptEmpStationAttr.FK_Dept, null, '部门编号', true, true, 0, 50, 200);
    map.AddTBString(DeptEmpStationAttr.FK_Station, null, '角色编号', true, true, 0, 50, 200);

    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    //debugger;
    if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
      const deptP = new Dept(this.FK_Dept);
      deptP.No = this.FK_Dept;
      await deptP.Retrieve();
      this.OrgNo = deptP.OrgNo;
    } else this.OrgNo = WebUser.OrgNo;
    return true;
  }
}

//用户部门岗位s
export class DeptEmpStations extends EntitiesMyPK {
  get GetNewEntity(): DeptEmpStation {
    return new DeptEmpStation();
  }
  constructor() {
    super();
  }
}
