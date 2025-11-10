import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { Conds } from './Cond';
export class DirectionAttr {
  public static readonly Node = 'Node';
  public static readonly ToNode = 'ToNode';
  public static readonly ToNodeName = 'ToNodeName';
  public static readonly FK_Flow = 'FK_Flow';
  public static readonly Vertices = 'Vertices';
  public static readonly FromPort = 'FromPort';
  public static readonly ToPort = 'ToPort';
  public static readonly Des = 'Des';
  public static readonly NodeType = 'NodeType';
}

// 方向
export class Direction extends EntityMyPK {
  get FK_Flow() {
    return this.GetValByKey(DirectionAttr.FK_Flow);
  }

  get Node() {
    return this.GetValByKey(DirectionAttr.Node);
  }

  get ToNode() {
    return this.GetValByKey(DirectionAttr.ToNode);
  }

  get ToNodeName() {
    return this.GetValByKey(DirectionAttr.ToNodeName);
  }

  constructor(pkval?: string) {
    super('TS.WF.Direction');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('WF_Direction', '方向');

    map.AddMyPK();
    map.AddTBInt(DirectionAttr.Node, 0, '节点ID', true, true);
    map.AddTBInt(DirectionAttr.ToNode, 0, '到达节点ID', true, true);
    map.AddTBString(DirectionAttr.ToNodeName, null, '到达节点名称', true, true, 0, 50, 200);
    map.AddTBString(DirectionAttr.FK_Flow, null, '流程No', true, true, 0, 50, 200);
    map.AddTBString(DirectionAttr.Des, '', '标签', true, true, 0, 50, 200);
    map.AddTBString(DirectionAttr.Vertices, '', '路径数据', false, true, 0, 200, 200);
    map.AddTBString(DirectionAttr.FromPort, '', '出发点连接桩位置', false, true, 0, 50, 200);
    map.AddTBString(DirectionAttr.ToPort, '', '到达点连接桩位置', false, true, 0, 50, 200);
    map.AddTBInt('Idx', 0, '序号', true, true);
    map.AddTBInt(DirectionAttr.NodeType, 0, 'ToNode类型', true, true, true, '0=工作,1=路由,2=抄送,3=子流程,4=结束');

    const attrs = `DataFromText,Note,`;
    map.AddRM_DtlSearch('方向条件', new Conds(), 'RefPKVal', '方向条件', '移动,设置条件', attrs, 'icon-drop', true, '&FK_Node=@Node');
    //map.AddRM_DtlSearch('设置方向条件', new Conds(), 'RefPKVal', '检查条件正确性', '', attrs, 'icon-drop', true, '');

    // map.AddTBInt('NodePort', 0, 'NodePort', true, true);
    // map.AddTBInt('ToNodePort', 0, 'ToNodePort', true, true);
    //  map.AddRM_DtlSearch('方向条件', new Conds(), 'RefPKVal', '方向条件', '移动,设置条件', attrs, 'icon-drop', true, '');
    // // //设置条件.
    // const rm = new RefMethod();
    // rm.Title = '检查合法性';
    // rm.ClassMethod = 'CheckIt';
    // rm.RefMethodType = RefMethodType.FuncToolbar;
    // rm.IsCanBatch = true;
    // map.AddRefMethod(rm); //增加条件.

    this._enMap = map;
    return this._enMap;
  }
  // public CheckIt() {
  //   return '执行成功.';
  // }
}

//方向s
export class Directions extends EntitiesMyPK {
  get GetNewEntity(): Direction {
    return new Direction();
  }

  constructor() {
    super();
  }
}
