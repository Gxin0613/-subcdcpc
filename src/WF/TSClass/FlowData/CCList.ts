import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';

//属性列表
export class CCListAttr {
  /// <summary>
  /// 标题
  /// </summary>
  public static readonly Title = 'Title';
  /// <summary>
  /// 抄送内容
  /// </summary>
  public static readonly Doc = 'Doc';
  /// <summary>
  /// 部门编号
  /// </summary>
  public static readonly DeptNo = 'DeptNo';
  /// <summary>
  /// 部门名称
  /// </summary>
  public static readonly DeptName = 'DeptName';
  /// <summary>
  /// 从节点
  /// </summary>
  public static readonly NDFrom = 'NDFrom';
  /// <summary>
  /// 流程
  /// </summary>
  public static readonly FK_Flow = 'FK_Flow';
  public static readonly FlowName = 'FlowName';
  /// <summary>
  /// 工作节点ID
  /// </summary>
  public static readonly NodeIDWork = 'NodeIDWork';
  /// <summary>
  /// 工作节点Name
  /// </summary>
  public static readonly NodeName = 'NodeName';
  /// <summary>
  /// 抄送节点ID
  /// </summary>
  public static readonly NodeIDCC = 'NodeIDCC';
  /// <summary>
  /// 是否读取
  /// </summary>
  public static readonly Sta = 'Sta';
  public static readonly StaText = 'StaText';
  public static readonly WFSta = 'WFSta';
  public static readonly WFState = 'WFState';
  public static readonly WorkID = 'WorkID';
  public static readonly FID = 'FID';
  /// <summary>
  /// 抄送给
  /// </summary>
  public static readonly CCTo = 'CCTo';
  /// <summary>
  /// 抄送给人员名称
  /// </summary>
  public static readonly CCToName = 'CCToName';
  /// <summary>
  /// 审核时间（回复时间）
  /// </summary>
  public static readonly CDT = 'CDT';
  /// <summary>
  /// 阅读时间
  /// </summary>
  public static readonly ReadDT = 'ReadDT';
  /// <summary>
  /// 抄送人员
  /// </summary>
  public static readonly RecEmpNo = 'RecEmpNo';
  /// <summary>
  /// 抄送人员名称
  /// </summary>
  public static readonly RecEmpName = 'RecEmpName';
  /// <summary>
  /// RDT
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 父流程ID
  /// </summary>
  public static readonly PWorkID = 'PWorkID';
  /// <summary>
  /// 父流程编号
  /// </summary>
  public static readonly PFlowNo = 'PFlowNo';
  /// <summary>
  /// 优先级
  /// </summary>
  public static readonly PRI = 'PRI';
  /// <summary>
  /// 是否加入待办列表
  /// </summary>
  public static readonly InEmpWorks = 'InEmpWorks';
  /// <summary>
  /// domainExt
  /// </summary>
  public static readonly DomainExt = 'DomainExt';
  /// <summary>
  /// 组织编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
}

// 抄送列表
export class CCList extends EntityMyPK {
  constructor(pkval?: number) {
    super('TS.FlowData.CCList');
    if (!!pkval) this.WorkID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_CCList', '抄送列表');

    map.AddMyPK(); //组合主键 WorkID+"_"+FK_Node+"_"+FK_Emp
    map.AddTBInt(CCListAttr.WorkID, 0, '工作ID', false, true);
    map.AddTBInt(CCListAttr.FID, 0, 'FID', false, false);
    map.AddTBString(CCListAttr.FK_Flow, null, '流程编号', false, false, 0, 5, 10, true);

    map.AddTBString(CCListAttr.Title, null, '标题', true, true, 0, 500, 200, true);
    map.AddDDLSysEnum(CCListAttr.Sta, 0, '状态', true, false, 'CCSta', '@0=未读@1=已读@2=已回复@3=删除');
    map.AddTBString(CCListAttr.StaText, null, '状态', false, true, 0, 200, 10, true);

    map.AddTBString(CCListAttr.FlowName, null, '流程', true, true, 0, 200, 10, true);
    map.AddTBInt(CCListAttr.NodeIDWork, 0, '工作节点', false, true); //工作节点.
    map.AddTBString(CCListAttr.NodeName, null, '节点', true, true, 0, 500, 10, true);
    map.AddTBInt(CCListAttr.NodeIDCC, 0, '抄送节点ID', true, true); //工作节点.
    map.AddTBString(CCListAttr.RecEmpNo, null, '抄送人', false, false, 0, 50, 10, false);
    map.AddTBString(CCListAttr.RecEmpName, null, '抄送人', true, false, 0, 50, 10, true);
    map.AddTBDateTime(CCListAttr.RDT, null, '抄送日期', true, true);

    map.AddTBString(CCListAttr.CCTo, null, '抄送给', false, false, 0, 50, 10, true);
    map.AddTBString(CCListAttr.CCToName, null, '抄送给(人员名称)', false, false, 0, 50, 10, true);

    map.AddTBString(CCListAttr.DeptNo, null, '被抄送人部门', false, false, 0, 50, 10, true);
    map.AddTBString(CCListAttr.DeptName, null, '被抄送人部门', true, false, 0, 50, 10, true);

    map.AddTBString(CCListAttr.OrgNo, null, '组织', false, false, 0, 50, 10, true);
    map.AddTBDateTime(CCListAttr.CDT, null, '打开时间', false, true);
    map.AddTBDateTime(CCListAttr.ReadDT, null, '阅读时间', true, true);

    map.AddTBString(CCListAttr.DomainExt, null, 'DomainExt', false, true, 0, 50, 10, true);
    map.AddTBString(CCListAttr.OrgNo, null, 'OrgNo', false, true, 0, 50, 10, true);

    map.DTSearchLabel = '抄送日期';
    map.DTSearchKey = CCListAttr.RDT;
    map.DTSearchWay = DTSearchWay.ByDateRange;

    map.AddSearchAttr(CCListAttr.Sta);

    //增加隐藏条件.
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single || WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
      map.AddHidden(CCListAttr.CCTo, '=', '@WebUser.No');
    } else {
      map.AddHidden(CCListAttr.OrgNo, '=', '@WebUser.OrgNo');
      map.AddHidden(CCListAttr.CCTo, '=', '@WebUser.No');
    }
    //#endregion 查询条件.

    this._enMap = map;
    return this._enMap;
  }
}

//抄送列表S
export class CCLists extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new CCList();
  }
  constructor() {
    super();
  }
}
