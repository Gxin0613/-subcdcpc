import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '../en/Map/UAC';
import { StationType } from './StationType';
import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '../web/WebUser';
import DBAccess from '/@/utils/gener/DBAccess';
import { GL_StationRole } from '/@/WF/TSClass/GL_StationRole';
import { DeptEmpStations } from '/@/bp/port/DeptEmpStation';
import { DeptEmps } from '/@/bp/port/DeptEmp';
import { useI18n } from '/@/hooks/web/useI18n';
// 角色
export class Station extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.Station');
    if (!!no) this.setPKVal(no);
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
    const { t } = useI18n();
    const map = new Map('Port_Station', t('treeens.oper.role'));
    //map.CodeStruct = `3`;
    map.AddTBStringPK('No', null, t('treeens.oper.no'), true, true, 3, 3, 3);
    map.AddTBString(`Name`, null, t('treeens.oper.name'), true, false, 0, 50, 200);
    //map.AddTBString(StationAttr.FK_StationType, null, `类型`, true, false, 0, 50, 200);
    map.AddDDLEntities(`FK_StationType`, null, t('treeens.oper.type'), new StationType(), true);
    // map.AddTBString('FK_StationTypeText', null, `类型标记`, false, false, 0, 50, 200);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    map.AddTBInt(`Idx`, 0, `Idx`, true, false);
    map.AddSearchAttr(`FK_StationType`);

    //查询角色下的人员
    map.AddRM_GL(new GL_StationRole());

    // console.log(WebUser.CCBPMRunModel, WebUser.CCBPMRunModel);
    // if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    if (!this.OrgNo) this.SetValByKey('OrgNo', WebUser.OrgNo);
    if (!this.No) this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }

  /**
   * 删除后事件
   */
  override async afterDelete(): Promise<boolean> {
    //删除角色需要把相关的Port_DeptEmp的数据删除
    const deptEmps = new DeptEmps();
    await deptEmps.RetrieveLikeKey(this.No, 'StationNo');
    const updateQueue = deptEmps.map((deptEmp) => {
      deptEmp.StationNo = deptEmp.StationNo.replace(',' + this.No, '').replace(this.No, '');
      deptEmp.StationNoT = deptEmp.StationNoT.replace(',' + this.Name, '').replace(this.Name, '');
      return deptEmp.Update();
    });
    await Promise.all(updateQueue);
    //删除Port_DeptEmpStation中的数据
    const dempStations = new DeptEmpStations();
    await dempStations.Delete('FK_Station', this.No);
    return Promise.resolve(true);
  }
}

//角色s
export class Stations extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Station();
  }
  constructor() {
    super();
  }

  //查询全部
  override async RetrieveAll() {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return await super.RetrieveAll('Idx');
    else return await this.Retrieve('OrgNo', WebUser.OrgNo, 'Idx');
  }
}
