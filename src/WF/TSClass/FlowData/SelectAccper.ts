import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

//属性列表
export class SelectAccperAttr {
  /// <summary>
  /// 工作ID
  /// </summary>
  public static readonly WorkID = 'WorkID';
  /// <summary>
  /// 节点
  /// </summary>
  public static readonly FK_Node = 'FK_Node';
  /// <summary>
  /// 到人员
  /// </summary>
  public static readonly FK_Emp = 'FK_Emp';
  /// <summary>
  /// 操作员名称
  /// </summary>
  public static readonly EmpName = 'EmpName';
  /// <summary>
  /// 部门编号
  /// </summary>
  public static readonly FK_Dept = 'FK_Dept';
  /// <summary>
  /// 部门名称
  /// </summary>
  public static readonly DeptName = 'DeptName';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly Rec = 'Rec';
  /// <summary>
  /// 办理意见  信息
  /// </summary>
  public static readonly Info = 'Info';
  /// <summary>
  /// 以后发送是否按此计算
  /// </summary>
  public static readonly IsRemember = 'IsRemember';
  /// <summary>
  /// 顺序号
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// 类型(@0=接受人@1=抄送人)
  /// </summary>
  public static readonly AccType = 'AccType';
  /// <summary>
  /// 维度标记
  /// </summary>
  public static readonly Tag = 'Tag';
  /// <summary>
  /// 时限天
  /// </summary>
  public static readonly TimeLimit = 'TimeLimit';
  /// <summary>
  /// 时限小时
  /// </summary>
  public static readonly TSpanHour = 'TSpanHour';
  /// <summary>
  /// 接受日期(计划)
  /// </summary>
  public static readonly PlanADT = 'ADT';
  /// <summary>
  /// 应完成日期(计划)
  /// </summary>
  public static readonly PlanSDT = 'SDT';
  /// <summary>
  /// 节点顺序
  /// </summary>
  public static readonly NodeIdx = 'NodeIdx';
}

// 流程实例查询
export class SelectAccper extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FlowData.Selectaccper');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('WF_Selectaccper', '选择接受/抄送人信息');
    map.AddMyPK();

    map.AddTBInt(SelectAccperAttr.FK_Node, 0, '接受人节点', true, false);

    map.AddTBInt(SelectAccperAttr.WorkID, 0, 'WorkID', true, false);
    map.AddTBString(SelectAccperAttr.FK_Emp, null, 'FK_Emp', true, false, 0, 100, 10);
    map.AddTBString(SelectAccperAttr.EmpName, null, 'EmpName', true, false, 0, 60, 10);
    map.AddTBString(SelectAccperAttr.FK_Dept, null, '部门编号', true, false, 0, 400, 10);
    map.AddTBString(SelectAccperAttr.DeptName, null, '部门名称', true, false, 0, 400, 10);
    map.AddTBInt(SelectAccperAttr.AccType, 0, '类型(@0=接受人@1=抄送人)', true, false);
    map.AddTBString(SelectAccperAttr.Rec, null, '记录人', true, false, 0, 100, 10);
    map.AddTBString(SelectAccperAttr.Info, null, '办理意见信息', true, false, 0, 200, 10);

    map.AddTBInt(SelectAccperAttr.IsRemember, 0, '以后发送是否按本次计算', true, false);
    map.AddTBInt(SelectAccperAttr.Idx, 0, '顺序号(可以用于流程队列审核模式)', true, false);
    /*
     *  add 2015-1-12.
     * 为了解决多维度的人员问题.
     * 在分流点向下发送时, 一个人可以分配两次任务，但是这个任务需要一个维度来区分。
     * 这个维度，有可能是一个类别，批次。
     */
    map.AddTBString(SelectAccperAttr.Tag, null, '维度信息Tag', true, false, 0, 200, 10);

    map.AddTBInt(SelectAccperAttr.TimeLimit, 0, '时限-天', true, false);
    map.AddTBFloat(SelectAccperAttr.TSpanHour, 0, '时限-小时', true, false);
    map.AddTBInt(SelectAccperAttr.NodeIdx, 0, '节点的顺序', true, false);

    //应该完成日期，为了自动计算未来的日期.
    map.AddTBDateTime(SelectAccperAttr.PlanADT, null, '到达日期(计划)', true, false);
    map.AddTBDateTime(SelectAccperAttr.PlanSDT, null, '应完成日期(计划)', true, false);
    map.AddTBAtParas();

    this._enMap = map;
    return this._enMap;
  }
}

//流程实例查询s
export class SelectAccpers extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new SelectAccper();
  }
  constructor() {
    super();
  }
}
