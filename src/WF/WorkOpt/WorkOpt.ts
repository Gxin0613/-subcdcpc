import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';

//属性.
export class WorkOptAttr {
  /// 标签 MyPK
  public static readonly MyPK = 'MyPK';
  /// 当前节点
  public static readonly NodeID = 'NodeID';
  public static readonly NodeName = 'NodeName';
  //到节点.
  public static readonly ToNodeID = 'ToNodeID';
  public static readonly ToNodeName = 'ToNodeName';
  public static readonly SenderName = 'SenderName';
  public static readonly SendRDT = 'SendRDT';
  public static readonly SendSDT = 'SendSDT';
  // 工作ID
  public static readonly WorkID = 'WorkID';
  // 操作员.
  public static readonly EmpNo = 'EmpNo';

  public static readonly EmpName = 'EmpName';
  // 当前处理人.
  public static readonly TodoEmps = 'TodoEmps';
  // 到角色
  public static readonly CCStations = 'CCStations';
  // 到部门.
  public static readonly CCDepts = 'CCDepts';
  // 到人员
  public static readonly CCEmps = 'CCEmps';
  //抄送标题
  public static readonly CCTitle = 'CCTitle';
  // 抄送小纸条.
  public static readonly CCNote = 'CCNote';
  // 到角色
  public static readonly SendStations = 'SendStations';
  // 到部门领导
  public static readonly SendDeptLeaders = 'SendDeptLeaders';
  // 到部门.
  public static readonly SendDepts = 'SendDepts';
  // 到人员
  public static readonly SendEmps = 'SendEmps';
  // 发送小纸条.
  public static readonly SendNote = 'SendNote';
  //标题
  public static readonly Title = 'Title';
  //发起人名称.
  public static readonly StarterName = 'StarterName';
  //发起日期.
  public static readonly StartRDT = 'StartRDT';
  //耗时.
  public static readonly UseTimeNode = 'UseTimeNode';
  public static readonly UseTimeFlow = 'UseTimeFlow';
}

/// <summary>
/// 工作处理器
/// </summary>
export class WorkOpt extends EntityMyPK {
  constructor(pkval?: number) {
    super('TS.WorkOpt.WorkOpt');
    if (!!pkval) {
      this.NodeID = pkval;
    }
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
    const map = new Map('WF_WorkOpt', '工作处理器');
    map.AddMyPK();
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', false, true, false, null);
    map.AddTBInt(WorkOptAttr.WorkID, 0, 'WorkID', false, true, false, null);
    map.AddTBString(WorkOptAttr.EmpNo, null, '操作员', true, true, 0, 100, 10);

    this._enMap = map;
    return this._enMap;
  }
}
