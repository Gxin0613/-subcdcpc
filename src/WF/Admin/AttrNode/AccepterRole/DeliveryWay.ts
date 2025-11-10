export class DeliveryWay {
  // 按角色(以部门为纬度)
  public static readonly ByStation = 0;
  //在指定的部门里按照角色计算.
  public static readonly FindSpecDeptEmpsInStationlist = 19;
  // 按部门
  public static readonly ByDept = 1;
  // 按绑定其他组织的部门
  public static readonly ByDeptOrg = 101;
  // 按SQL
  public static readonly BySQL = 2;
  // 按本节点绑定的人员
  public static readonly ByBindEmp = 3;
  // 由上一步发送人选择
  public static readonly BySelected = 4;
  //所有人员都可以发起
  public static readonly BySelected_1 = 41;
  // 固定范围的选择
  public static readonly BySelected_2 = 60;
  //组固定范围选择
  public static readonly BySelected_3 = 61;
  // 按表单选择人员
  public static readonly ByPreviousNodeFormEmpsField = 5;
  public static readonly ByPreviousNodeFormEmpsFrmDtl = 501; //字段是从表.
  public static readonly ByPreviousNodeFormEmpsTeam = 502; // 字段是权限组.

  public static readonly ByPreviousNodeFormDepts = 503; // 字段是部门编号.
  public static readonly ByPreviousNodeFormStationsAI = 53; // 字段是权限组.
  public static readonly ByPreviousNodeFormStationsOnly = 54; // 字段是权限组.

  // 与上一节点的人员相同
  public static readonly ByPreviousNodeEmp = 6;
  // 与开始节点的人员相同
  public static readonly ByStarter = 7;
  // 与指定节点的人员相同
  public static readonly BySpecNodeEmp = 8;
  // 按角色与部门交集计算
  public static readonly ByDeptAndStation = 9;
  // 按角色计算(以部门集合为纬度)
  public static readonly ByStationAndEmpDept = 10;
  // 按指定节点的人员或者指定字段作为人员的角色计算
  public static readonly BySpecNodeEmpStation = 11;
  // 按SQL确定子线程接受人与数据源
  public static readonly BySQLAsSubThreadEmpsAndData = 12;
  // 按明细表确定子线程接受人
  public static readonly ByDtlAsSubThreadEmps = 13;
  // 仅按角色计算
  public static readonly ByStationOnly = 14;
  // FEE计算
  public static readonly ByFEE = 15;
  // 按绑定部门计算,该部门一人处理标识该工作结束(子线程)
  public static readonly BySetDeptAsSubthread = 16;
  // 按SQL模版计算
  public static readonly BySQLTemplate = 17;
  // 从人员到人员
  public static readonly ByFromEmpToEmp = 18;
  public static readonly ByFromDeptToEmp = 1801;
  public static readonly ByFromAttrToEmp = 1802;

  //找本部门范围内的角色集合里面的人员
  public static readonly FindSpecDeptEmps = 19;
  //按项目组内的角色计算
  public static readonly ByStationForPrj = 20;
  //由上一节点发送人通过“人员选择器”选择接受人
  public static readonly BySelectedForPrj = 21;
  public static readonly BySelectedOrgs = 22;
  //找部门负责人
  public static readonly ByDeptLeader = 23;
  //找直属领导.
  public static readonly ByEmpLeader = 50;
  //选择其他组织的联络员
  public static readonly BySelectEmpByOfficer = 55;
  //找分管领导 - ShipLeader ccflow不负责维护.
  public static readonly ByDeptShipLeader = 28;
  //按照用户组计算(全集团)
  public static readonly ByTeamOrgOnly = 24;
  //仅按用户组计算.
  public static readonly ByTeamOnly = 25;
  // 按照用户组计算(本部门范围内)
  public static readonly ByTeamDeptOnly = 26;
  //按照用户组岗位计算
  public static readonly ByTeamStationOnly = 30;

  //按照集团模式的选择人接收器. 2020.06 for xinxizhongxin.
  public static readonly BySelectedEmpsOrgModel = 43;
  //按照自定义url.
  public static readonly BySelfUrl = 44;
  //按API/URL
  public static readonly ByAPIUrl = 45;
  //发送人的上级部门的负责人
  public static readonly BySenderParentDeptLeader = 46;
  //发送人上级部门指定的角色
  public static readonly BySenderParentDeptStations = 47;
  //外部用户可以发起
  public static readonly ByGuest = 51;

  //按字典计算.
  public static readonly BySFTable = 52;

  //按指定的部门集合与设置的岗位交集
  public static readonly ByStationSpecDepts = 56;
  // 按指定的岗位集合与设置的部门交集
  public static readonly ByStationSpecStas = 57;

  //分管领导
  public static readonly ByDeptSpecer = 58;

  // 按照ccflow的BPM模式处理
  public static readonly ByCCFlowBPM = 100;

  //直接上级
  public static readonly ZhieJieShangJi601 = 601;
  //直接上2级
  public static readonly ZhieJieShangJi602 = 602;
  //连续多级主管
  public static readonly ByMLeader0 = 701;
  public static readonly ByMLeader1 = 702;
  public static readonly ByMLeader2 = 703;

  //预制处理人:海选.
  public static readonly PreplaceWokerFree = 710;
  //预制处理人:固定范围选择.
  public static readonly PreplaceWokerFix = 711;
}
