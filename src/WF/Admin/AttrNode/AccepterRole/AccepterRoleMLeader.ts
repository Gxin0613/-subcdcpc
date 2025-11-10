import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { NodeDept, NodeDepts } from '../NodeDept';
import { GloWF } from '../../GloWF';
import { NodeStation, NodeStations } from '../NodeStation';

// 节点属性
export class AccepterRoleMLeader extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleMLeader');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.NodeID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '连续多级主管');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    //角色选择. NodeStationsT
    map.AddTBString('NodeStations', null, '角色', true, false, 0, 100, 100, true);
    map.SetPopGroupList('NodeStations', GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择角色', 'icon-people', '1');
    map.AddBoolean('JiBieModel', false, '同时不超过发起人向上的', true, true);
    map.AddTBInt('JiBieLevel', 0, '级别', true, false);
    map.AddBoolean('CutEnderEmp', false, '去尾部(去掉最后一个接收人).', true, true);
    map.AddDDLSysEnum('LeaderType', 1, '判断领导类型', true, true, 'LeaderType', '@0=智能岗位判断@1=仅按部门领导@2=仅按人员直属领导', null, false);
    map.SetHelperAlert('CutEnderEmp', '是指不包含选择岗位的人员，长沙律所的需求:到主任岗位，但是要去掉主任.');

    map.AddTBAtParas(4000);
    map.ParaFields = ',JiBieModel,JiBieLevel,LeaderType,';
    // map.AddRM_GPE(new GPE_ShenFenModel(), 'icon-drop');
    this._enMap = map;
    return this._enMap;
  }

  protected override async afterUpdate(): Promise<boolean> {
    //删除原来的数据. liyongchao, 2022-12-19
   // debugger;
    const ens = new NodeStations();
    await ens.Delete('FK_Node', this.NodeID);
    if (typeof this.NodeStations !== 'string') {
      return Promise.resolve(true);
    }
    const strs = this.NodeStations.split(',');
    strs.forEach(async (str) => {
      const en = new NodeStation();
      en.FK_Node = this.NodeID;
      en.FK_Station = str;
      en.MyPK = this.NodeID + '_' + str;
      await en.Insert(); //插入到数据表.
    });

    return Promise.resolve(true);
  }
}
