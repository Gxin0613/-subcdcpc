import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { EntityTreeAttr } from '/@/bp/en/EntityTree';
import WebUser from '/@/bp/web/WebUser';
import { DataType } from '/@/bp/en/DataType';
import DBAccess from '/@/utils/gener/DBAccess';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { GloWF } from '/@/WF/Admin/GloWF';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';

/// 任务 属性
export class TaskAttr extends EntityTreeAttr {
  /// <summary>
  /// 模式
  /// </summary>
  public static readonly TaskPRI = 'TaskPRI';
  /// <summary>
  /// 内容1
  /// </summary>
  public static readonly Docs = 'Docs';
  public static readonly Title = 'Title';
  /// <summary>
  /// 内容2
  /// </summary>
  public static readonly TaskSta = 'TaskSta';
  /// <summary>
  /// 内容3
  /// </summary>
  public static readonly FZR = 'FZR';
  /// <summary>
  /// 负责人
  /// </summary>
  public static readonly ManagerEmpName = 'ManagerEmpName';

  public static readonly RefLabelNo = 'RefLabelNo';
  public static readonly RefLabelName = 'RefLabelName';

  /// <summary>
  /// 组织编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly RecNo = 'RecNo';
  /// <summary>
  /// 记录人名称
  /// </summary>
  public static readonly RecName = 'RecName';
  /// <summary>
  /// 记录日期
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 隶属日期
  /// </summary>
  public static readonly RiQi = 'RiQi';
  /// <summary>
  /// 年月
  /// </summary>
  public static readonly DTFrom = 'DTFrom';
  /// <summary>
  /// 项目数
  /// </summary>
  public static readonly Worker = 'Worker';
  /// <summary>
  /// 第几周
  /// </summary>
  public static readonly RefEmpsName = 'RefEmpsName';
  /// <summary>
  /// 年度
  /// </summary>
  public static readonly DTTo = 'DTTo';
  /// <summary>
  /// 负责人.
  /// </summary>
  public static readonly Manager = 'Manager';
  public static readonly IsSubTask = 'IsSubTask';
}

/// 任务
export class Task extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCOA.Task');
    if (!!pkVal) {
      this.No = pkVal;
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
    const map = new Map('OA_Task', '任务');
    map.AddMyPK();

    map.AddGroupAttr('基本信息');
    map.AddTBString(TaskAttr.FZR, '@WebUser.No', '负责人', true, false, 0, 30, 10);
    map.AddTBString(TaskAttr.Worker, null, '参与人', true, false, 0, 3000, 10);
    map.AddDDLSysEnum(TaskAttr.TaskPRI, 0, '优先级', true, true, 'TaskPRI', '@0=高@1=中@2=低');
    map.AddDDLSysEnum(TaskAttr.TaskSta, 0, '状态', true, true, 'TaskSta', '@0=未完成@1=已完成');

    map.AddTBString(TaskAttr.Title, null, '标题', true, false, 0, 500, 10, true);
    map.AddTBStringDoc(TaskAttr.Docs, null, '内容', true, false, true);

    map.AddTBDateTime(TaskAttr.DTFrom, null, '日期从', false, false);
    map.AddTBDateTime(TaskAttr.DTTo, null, '到', false, false);

    // map.AddTBString(TaskAttr.RefLabelNo, null, '标签标号', true, false, 0, 3000, 10);
    // map.AddTBString(TaskAttr.RefLabelName, null, '标签名称', true, false, 0, 3000, 10);

    map.AddGroupAttr('记录信息');
    map.AddTBString(TaskAttr.OrgNo, null, '组织编号', false, false, 0, 100, 10);
    map.AddTBString(TaskAttr.RecNo, null, '记录人', false, false, 0, 100, 10);
    map.AddTBString(TaskAttr.RecName, null, '记录人名称', false, false, 0, 100, 10, true);
    map.AddTBDateTime(TaskAttr.RDT, null, '记录时间', false, false);

    //逻辑字段.
    map.AddTBString(TaskAttr.ParentNo, null, '父节点ID', false, false, 0, 50, 10);
    // map.AddTBInt(TaskAttr.IsSubTask, 0, '是否是子任务', true, false);
    let searchSQL = `SELECT A.No,A.Name,B.Name AS DeptName FROM Port_Emp A,Port_Dept B WHERE A.FK_Dept=B.No AND ( A.No LIKE '%@Key%' OR A.Name LIKE '%@Key%' OR PinYin LIKE  '%@Key%' AND A.OrgNo='@WebUser.OrgNo') AND A.EmpSta = 0 Order By A.Idx `;
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) {
      searchSQL = `SELECT A.No,A.Name,B.Name AS DeptName FROM Port_Emp A,Port_Dept B WHERE A.FK_Dept=B.No AND ( A.No LIKE '%@Key%' OR A.Name LIKE '%@Key%' OR PinYin LIKE  '%@Key%') AND A.EmpSta = 0 Order By A.Idx`;
    }
    //负责人.
    map.SetPopTreeEns(TaskAttr.FZR, GloWF.srcDeptLazily, '@WebUser.DeptNo', GloWF.srcEmpLazily, searchSQL, false, '800px', '400px', '选择负责人', 'icon-people', '0', true, true);
    //参与人.
    map.SetPopTreeEns(TaskAttr.Worker, GloWF.srcDeptLazily, '@WebUser.DeptNo', GloWF.srcEmpLazily, searchSQL, true, '800px', '400px', '选择参与人', 'icon-people', '0', true, true);

    //查询条件.
    map.DTSearchKey = 'RDT';
    map.DTSearchWay = DTSearchWay.ByDateRange;
    map.AddSearchAttr(TaskAttr.TaskPRI);
    map.AddSearchAttr(TaskAttr.TaskSta);

    map.AddHidden(TaskAttr.RecNo, '=', '@WebUser.No');
    // map.AddHidden(TaskAttr.Worker, '=', '@WebUser.No');

    //  map.AddMyFileS("附件");
    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.OrgNo = WebUser.OrgNo;
    this.RecNo = WebUser.No; //记录人
    this.RecName = WebUser.Name;
    this.RDT = DataType.CurrentDateTime;
    this.FZR = WebUser.No; //负责人
    this.FZRT = WebUser.Name;
    this.OrgNo = WebUser.OrgNo;
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 任务 s
 */
export class Tasks extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Task();
  }
  constructor() {
    super();
  }
}
