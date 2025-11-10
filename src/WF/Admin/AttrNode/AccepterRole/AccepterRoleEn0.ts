import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { Stations } from '/@/bp/port/Station';
import { StationTypes } from '/@/bp/port/StationType';
import { Depts } from '/@/bp/port/Dept';
import { Emps } from '/@/bp/port/Emp';
import { Teams } from '/@/bp/port/Team';
import { NodeEmpAttr, NodeEmps } from '../NodeEmp';
import { NodeDeptAttr, NodeDepts } from '../NodeDept';
import { NodeTeamAttr, NodeTeams } from '../NodeTeam';
import { NodeStationAttr, NodeStations } from '../NodeStation';
import { NodeToolbarAttr, NodeToolbars } from '../NodeToolbar';

// 节点属性
export class AccepterRoleEn0 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleEn0');
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
    const map = new Map('WF_Node', '表单方案');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    // map.AddTBString(NodeExtAttr.Name, null, '名称', true, false, 0, 50, 200);

    map.AddGroupMethod('表单字段');

    const urlEnum = `/src/WF/Comm/En?EnName=TS.FrmUI.MapAttrEnum&PKVal=ND101_QingJiaYuanYin`;
    map.AddRM_UrlTabOpen('Date', urlEnum, 'icon-file');

    const urlDate = `/src/WF/Comm/En?EnName=TS.FrmUI.MapAttrDate&PKVal=ND101_QingJiaYuanYin`;
    map.AddRM_UrlTabOpen('Date', urlDate, 'icon-file');

    const urlInt = `/src/WF/Comm/En?EnName=TS.FrmUI.MapAttrNum&PKVal=ND101_QingJiaYuanYin`;
    map.AddRM_UrlTabOpen('Int', urlInt, 'icon-file');

    const _mapAttrString = `/src/WF/Comm/En?EnName=TS.FrmUI.MapAttrString&PKVal=ND101_QingJiaYuanYin`;
    map.AddRM_UrlTabOpen('String', _mapAttrString, 'icon-file');

    map.AddGroupMethod('GenerList测试');
    const url132 = `/src/WF/views/GenerList.vue?EnName=GL_Start`;
    map.AddRM_UrlTabOpen('发起GL', url132, 'icon-file');

    const url1332 = `/src/WF/Comm/PanelGroup?EnName=PG_FlowSort2Flow`;
    map.AddRM_UrlTabOpen('发起PG', url1332, 'icon-file');

    const url12 = `/src/WF/views/GenerList.vue?EnName=GL_Todolist`;
    map.AddRM_UrlTabOpen('待办', url12, 'icon-file');

    const url14 = `/src/WF/views/GenerList.vue?EnName=GL_Runing`;
    map.AddRM_UrlTabOpen('在途', url14, 'icon-file');

    const url3414 = `/src/WF/views/GenerList.vue?EnName=GL_Draft`;
    map.AddRM_UrlTabOpen('草稿', url3414, 'icon-file');

    //测试链接.
    const url2 = `/src/WF/newWindow/En?EnName=TS.CCBill.FrmDict&PKVal=Dict_WoDeShiTi`;
    map.AddRM_UrlLinkeWinOpen('LinkeWinOpen', url2, 'icon-file');

    const url3 = `/src/WF/newWindow/En?EnName=TS.CCBill.FrmDict&PKVal=Dict_WoDeShiTi`;
    map.AddRM_UrlRightFrameOpen('RightFrameOpen', url3, 'icon-file');

    map.AddGroupMethod('从表测试');
    const url = `/src/WF/Comm/Ens.vue?EnName=TS.Port.Station`;
    map.AddRM_UrlTabOpen('Ens', url, 'icon-file');

    const url1 = `/src/WF/Comm/Tree.vue?EnName=TS.Port.Dept&RootNo=0`;
    map.AddRM_UrlTabOpen('Tree', url1, 'icon-file');

    //测试.
    //节点工具栏,主从表映射.
    map.AddRM_DtlBatch('工具栏-Batch标准', new NodeToolbars(), NodeToolbarAttr.FK_Node, '', '', 'icon-file');

    //节点工具栏,主从表映射.
    //map.AddRM_DtlBatch('工具栏-列表编辑', new NodeToolbars(), NodeToolbarAttr.FK_Node, 'DDD,EEE', 'XX,BB', 'icon-file');

    //节点工具栏,主从表映射.
    map.AddRM_DtlSearch('工具栏-Search标准', new NodeToolbars(), NodeToolbarAttr.FK_Node, '', '', '', 'icon-file');
    //节点工具栏,主从表映射.
    // map.AddRM_DtlSearch('工具栏-列表编辑', new NodeToolbars(), NodeToolbarAttr.FK_Node, 'AA,BB', 'CC,DD', 'Title,ExcType', 'icon-file');

    //绑定角色.
    map.AddGroupMethod('绑定角色');
    map.AddRM_One2Many_List('平铺', new NodeStations(), new Stations(), NodeStationAttr.FK_Node, NodeStationAttr.FK_Station, 'icon-file');

    map.AddRM_One2Many_GroupList(
      '分组',
      new NodeStations(),
      new Stations(),
      NodeStationAttr.FK_Node,
      NodeStationAttr.FK_Station,
      new StationTypes(),
      'FK_StationType',
      'icon-file',
    );

    //绑定人员.
    map.AddGroupMethod('绑定人员');
    map.AddRM_One2Many_TreeEns(
      '部门树结构',
      new NodeEmps(),
      new Depts(),
      NodeDeptAttr.FK_Node,
      NodeEmpAttr.FK_Emp,
      '0',
      false,
      new Emps(),
      'FK_Dept',
      'No=编号,Name=名称,Tel=电话',
      'icon-tree',
    );
    map.AddRM_One2Many_GroupList('部门分组结构', new NodeEmps(), new Emps(), NodeEmpAttr.FK_Node, NodeEmpAttr.FK_Emp, new Depts(), 'FK_Dept', 'icon-file');

    //绑定部门.
    map.AddGroupMethod('绑定部门');
    map.AddRM_One2Many_Tree('树结构', new NodeDepts(), new Depts(), NodeDeptAttr.FK_Node, NodeDeptAttr.FK_Dept, '0', false, 'icon-tree');
    map.AddRM_One2Many_List('平铺模式', new NodeDepts(), new Depts(), NodeDeptAttr.FK_Node, NodeDeptAttr.FK_Dept, null);

    //绑定权限组.
    map.AddGroupMethod('绑定权限组');
    map.AddRM_One2Many_List('平铺', new NodeTeams(), new Teams(), NodeTeamAttr.FK_Node, NodeTeamAttr.FK_Team, 'icon-file');

    this._enMap = map;
    return this._enMap;
  }
}
