import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { WorkOptAttr } from '../WorkOpt';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
/// <summary>
/// 抄送
/// </summary>
export class CC extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WorkOpt.CC');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_WorkOpt', '抄送');
    map.AddGroupAttr('抄送');
    map.AddMyPK();
    map.AddTBInt(WorkOptAttr.WorkID, 0, '工作ID', false, true, false, null);
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', true, true, false, null);
    map.AddTBString(WorkOptAttr.EmpNo, null, '操作员', false, true, 0, 100, 10);
    map.AddTBString(WorkOptAttr.EmpName, null, '操作员', true, true, 0, 100, 10);

    map.AddTBString(WorkOptAttr.CCEmps, null, '抄送到人员', true, false, 0, 100, 10, true, null);
    map.AddTBString(WorkOptAttr.CCDepts, null, '抄送到部门', true, false, 0, 100, 10, true, null);
    map.AddTBString(WorkOptAttr.CCStations, null, '抄送到岗位', true, false, 0, 100, 10, true, null);
    map.AddTBStringDoc(WorkOptAttr.CCTitle, null, '抄送标题', true, false, true);
    map.AddTBStringDoc(WorkOptAttr.CCNote, null, '抄送内容', true, false, true);
    //map.AddGroupAttr('工作信息');
    //map.AddTBString(WorkOptAttr.Title, null, '标题', true, true, 0, 200, 10, true);
    //map.AddTBString(WorkOptAttr.NodeName, null, '当前节点', true, true, 0, 500, 10, false, null);

    //人员选择. - 抄送.
    map.SetPopTreeEns(
      WorkOptAttr.CCEmps,
      GloWF.srcDeptLazily,
      GloWF.srcDeptRoot,
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '400px',
      '选择接收人',
      'icon-people',
      '1',
      true,
      true,
    );
    //部门选择
    map.SetPopTree(WorkOptAttr.CCDepts, GloWF.srcDepts, GloWF.srcDeptRoot, true, '800px', '500px', '选择部门', 'icon-people');
    //角色选择.
    map.SetPopGroupList(WorkOptAttr.CCStations, GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择发送到的角色', 'icon-people');

    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeInsert(): Promise<boolean> {
    //说明: 再插入这笔数据的事后，要把以前的发送过的加载出来.
    const gwf = new GenerWorkFlowExt(this.WorkID);
    await gwf.RetrieveFromDBSources();
    this.Title = gwf.Title;
    this.NodeID = gwf.FK_Node;
    this.NodeName = gwf.NodeName;
    this.SetValByKey(WorkOptAttr.Title, gwf.Title);
    this.SetValByKey(WorkOptAttr.NodeID, gwf.FK_Node);
    this.SetValByKey(WorkOptAttr.NodeName, gwf.NodeName);
    return Promise.resolve(true);
  }
}
