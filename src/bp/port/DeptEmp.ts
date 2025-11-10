/// 用户部门 属性
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';
import { DeptEmpStation, DeptEmpStations } from './DeptEmpStation';
import { Dept } from './Dept';
import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
export class DeptEmpAttr {
  public static readonly FK_Dept = 'FK_Dept';
  public static readonly FK_Emp = 'FK_Emp';
  public static readonly OrgNo = 'OrgNo';
}

/// 用户部门
export class DeptEmp extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Port.DeptEmp');
    if (!!mypk) {
      this.setPKVal(mypk);
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
    const map = new Map('Port_DeptEmp', '用户部门');
    map.CodeStruct = '2';
    map.AddMyPK();
    map.AddTBString('FK_Emp', null, '人员', false, false, 0, 50, 100);
    map.AddTBString('FK_Dept', null, '部门', true, true, 0, 50, 50);
    map.AddTBString('DeptName', null, '部门名称', true, true, 0, 50, 100);
    map.AddTBString('StationNo', null, '角色名称', true, false, 0, 300, 50, true);
    //角色选择.
    map.SetPopGroupList('StationNo', GloWF.srcStationTypes, GloWF.srcStations, true, '600px', '500px', '选择角色', 'icon-people');
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
  protected override async afterDelete(): Promise<boolean> {
    //删除岗位信息.
    const des = new DeptEmpStations();
    await des.Delete('FK_Emp', this.FK_Emp, 'FK_Dept', this.FK_Dept);
    return true;
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    //部门名称,是否为空.
    const empNo = this.GetValByKey('FK_Emp');
    const deptNo = this.GetValByKey('FK_Dept');
    //const deptName = this.GetValByKey('DeptName');
    const stationNo = this.GetValByKey('StationNo');
    const dept = new Dept(deptNo);
    await dept.Retrieve();
    this.DeptName = dept.Name;
    if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) this.OrgNo = dept.OrgNo;

    //转成数组. 1,2,3,
    //判断this.StationNo是否存在，不存在删除掉Port_DeptEmpStation的数据
    if (!!stationNo) {
      const ids = stationNo.split(',').filter((item) => !!item);
      // 如果是编辑的某个部门，先删除这个部门下的所有角色
      const stations = new DeptEmpStations();
      await stations.Delete('FK_Dept', deptNo, 'FK_Emp', empNo);

      /*if (WebUser.No === 'admin' && WebUser.CCBPMRunModel == CCBPMRunModel.Single) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
        handler.AddPara('stationIds', stationNo);
        handler.AddPara('deptNo', deptNo);
        handler.AddPara('empNo', empNo);
        //const data = await handler.DoMethodReturnJson('DoSetSecondAdminer');
      } else {*/
      for (const id of ids) {
        const station = new DeptEmpStation();
        station.MyPK = `${deptNo}_${empNo}_${id}`;
        station.FK_Dept = deptNo;
        station.FK_Emp = empNo;
        station.FK_Station = id;
        if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) station.OrgNo = dept.OrgNo;
        else station.OrgNo = WebUser.OrgNo;
        await station.Insert();
        //}
      }
    } else {
      const stations = new DeptEmpStations();
      await stations.Delete('FK_Dept', deptNo, 'FK_Emp', empNo);
    }
    return true;
  }
}

//用户部门s
export class DeptEmps extends EntitiesMyPK {
  get GetNewEntity(): DeptEmp {
    return new DeptEmp();
  }
  constructor() {
    super();
  }
}
