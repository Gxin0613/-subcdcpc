import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GloWF } from '../../GloWF';
import { NodeEmps } from '../NodeEmp';
import { NodeStation, NodeStations } from '../NodeStation';
import { NodeDept, NodeDepts } from '../NodeDept';

// 节点属性
export class AccepterRoleBindDeptStation extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleBindDeptStation');
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
    const map = new Map('WF_Node', '绑定部门角色');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);

    // //部门选择
    // map.AddTBString('NodeEmps', null, '人员', true, false, 0, 1000, 100, true);
    // map.SetPopTreeEns('NodeEmps', GloWF.srcDeptLazily, '@WebUser.DeptNo', GloWF.srcEmpLazily, GloWF.srcEmpSearchKey, true, '300px', '500px', '选择接收人', 'icon-people', '0', '1');

    //部门选择
    map.AddTBString('NodeDepts', null, '部门', true, false, 0, 1000, 100, true);
    map.SetPopTree('NodeDepts', GloWF.srcDepts, GloWF.srcDeptRoot, true, '300px', '500px', '选择部门', 'icon-people', '1');

    //角色选择.
    map.AddTBString('NodeStations', null, '角色', true, false, 0, 100, 100, true);
    map.SetPopGroupList('NodeStations', GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择角色', 'icon-people', '1');

    map.AddBoolean('AccepterRoleSubDepts', false, '是否计算子部门', true, true, true, '递归寻找子部门的数据,一直找到叶子节点.');
    map.AddTBAtParas(4000);
    map.ParaFields = ',AccepterRoleSubDepts,';
    // //绑定部门.
    // map.AddGroupMethod('绑定部门');
    // map.AddRM_One2Many_Tree('树结构', new NodeDepts(), new Depts(), NodeDeptAttr.FK_Node, NodeDeptAttr.FK_Dept, '0', false, 'icon-tree');
    // map.AddRM_One2Many_List('平铺模式', new NodeDepts(), new Depts(), NodeDeptAttr.FK_Node, NodeDeptAttr.FK_Dept, null);

    // //绑定角色.
    // map.AddGroupMethod('绑定角色');
    // map.AddRM_One2Many_List('平铺', new NodeStations(), new Stations(), NodeStationAttr.FK_Node, NodeStationAttr.FK_Station, 'icon-file');
    // map.AddRM_One2Many_GroupList(
    //   '分组',
    //   new NodeStations(),
    //   new Stations(),
    //   NodeStationAttr.FK_Node,
    //   NodeStationAttr.FK_Station,
    //   new StationTypes(),
    //   'FK_StationType',
    //   'icon-file',
    // );

    this._enMap = map;
    return this._enMap;
  }
  protected override async afterUpdate(): Promise<boolean> {
    //删除原来的数据(NodeEmps). liyongchao, 2022-12-19
    let ens = new NodeEmps();
    // await ens.Delete('FK_Node', this.NodeID);
    let strs: string[] = [];
    // if (typeof this.NodeEmps === 'string') {
    //   this.NodeEmps.split(',');
    //   strs.forEach(async (str: string) => {
    //     const en = new NodeEmp();
    //     en.FK_Node = this.NodeID;
    //     en.FK_Emp = str;
    //     en.MyPK = this.NodeID + '_' + str;
    //     await en.Insert(); //插入到数据表.
    //   });
    // }

    //删除原来的数据(NodeStations). liyongchao, 2022-12-19
    ens = new NodeStations();
    await ens.Delete('FK_Node', this.NodeID);
    if (typeof this.NodeStations === 'string') {
      strs = this.NodeStations.split(',');
      strs.forEach(async (str) => {
        const en = new NodeStation();
        en.FK_Node = this.NodeID;
        en.FK_Station = str;
        en.MyPK = this.NodeID + '_' + str;
        await en.Insert(); //插入到数据表.
      });
    }

    //删除原来的数据(NodeDepts). liyongchao, 2022-12-19
    ens = new NodeDepts();
    await ens.Delete('FK_Node', this.NodeID);
    if (typeof this.NodeDepts === 'string') {
      strs = this.NodeDepts.split(',');
      strs.forEach(async (str: string) => {
        const en = new NodeDept();
        en.FK_Node = this.NodeID;
        en.FK_Dept = str;
        en.MyPK = this.NodeID + '_' + str;
        await en.Insert(); //插入到数据表.
      });
    }

    return Promise.resolve(true);
  }
}
