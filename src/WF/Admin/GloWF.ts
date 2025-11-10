import { AtPara } from '/@/bp/da/AtPara';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import { Entity } from '/@/bp/en/Entity';
import WebUser from '/@/bp/web/WebUser';
import { getVstoHost } from '/@/utils/VstoUtils';

///** 数据box */
// export class DBank_GloWF extends DataBankBase {
//   constructor() {
//     super('DBank_GloWF', 'local', '本机数据源'); //连接到本机数据源获取数据.
//     DataBankBase.register('DBank_GloWF', DBank_GloWF);
//   }
//   //重写的构造方法，初始化参数.
//   public override async Init() {
//     this.AddSFTable('DeptLazily', '部门树懒加载', `SELECT No,Name,ParentNo FROM Port_Dept WHERE ParentNo='@Key' OR No='@Key' Order By Idx`);
//     this.AddSFTable('GetEmpsByDeptNoSaaS', '根据部门获得人员SAAS', `SELECT UserID as No,Name FROM Port_Emp WHERE FK_Dept='@Key' Order By Idx`);
//     this.AddSFTable('GetEmpsByDeptNo', '根据部门获得人员', ` SELECT B.No,B.Name FROM port_deptemp a, Port_Emp B  where A.FK_Emp=B.No and A.FK_Dept ='@Key' Order By B.Idx `);

//     this.AddSFTable('EmpSearchKeySaaS', '搜索人员账号', ` SELECT UserID as No,Name FROM Port_Emp WHERE Name LIKE '%@Key%' AND OrgNO='@WebUser.OrgNo' Order By Idx  `);
//     this.AddSFTable('EmpSearchKey', '搜索人员账号', ` SELECT B.No,B.Name FROM port_deptemp a, Port_Emp B WHERE A.FK_Emp=B.No AND Name LIKE '%@Key%' Order By B.Idx `);

//     this.AddSFTable('SQLEnumMainSingle', '枚举列表Single', `SELECT No,Name FROM Sys_EnumMain WHERE Name!='' `);
//     this.AddSFTable('SQLEnumMain', '枚举列表', `SELECT No,Name FROM Sys_EnumMain WHERE OrgNO='@WebUser.OrgNo' AND Name!='' `);

//     this.AddSFTable('SQLSFTableSingle', '字典', ` SELECT No, Name, FK_SFDBSrc as GroupNo FROM Sys_SFTable `);
//     this.AddSFTable('SQLSFTable', '字典', ` SELECT No,Name, FK_SFDBSrc as GroupNo FROM Sys_SFTable WHERE OrgNO='@WebUser.OrgNo'  `);

//     this.AddSFTable('SQLSFTableSysDictSingle', '字典', ` SELECT No, Name, FK_SFDBSrc as GroupNo FROM Sys_SFTable WHERE DBSrcType='SysDict'   `);
//     this.AddSFTable('SQLSFTableSysDict', '字典', ` SELECT No,Name, FK_SFDBSrc as GroupNo FROM Sys_SFTable WHERE OrgNO='@WebUser.OrgNo' AND DBSrcType='SysDict'  `);

//     this.AddSFTable('NodeFrmListMySQL', '节点编号', `SELECT CONCAT('ND',NodeID) as No, Name FROM WF_Node WHERE FK_Flow='@FK_Flow'`);
//     this.AddSFTable('NodeFrmListOracle', '节点编号', `SELECT CONCAT("ND",NodeID) as No, Name FROM WF_Node WHERE FK_Flow='@FK_Flow'`);
//     this.AddSFTable('NodeFrmListEtc', '节点编号', `SELECT  CONCAT('ND',NodeID) as No, Name FROM WF_Node WHERE FK_Flow='@FK_Flow'`);

//     this.AddSFTable('FrmListSingle', '表单列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData `);
//     this.AddSFTable('FrmList', '表单列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE OrgNo='@WebUser.OrgNo'`);

//     this.AddSFTable('FrmTreeSingle', '表单树', `SELECT No, Name, ParentNo FROM Sys_FormTree `);
//     this.AddSFTable('FrmTree', '表单树', `SELECT No, Name,ParentNo FROM Sys_FormTree WHERE OrgNo='@WebUser.OrgNo'`);

//     this.AddSFTable('FrmListByEntityTypeSingle', '根据EntityType表单列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType IN (0,1)`);
//     this.AddSFTable('FrmListByEntityType', '根据EntityType表单列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType IN (0,1) AND OrgNo='@WebUser.OrgNo'`);

//     this.AddSFTable('FrmEntityNoNameSingle', '表单实体', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType=5`);
//     this.AddSFTable('FrmEntityNoName', '表单实体', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE  EntityType=5 AND OrgNo='@WebUser.OrgNo'`);

//     this.AddSFTable(
//       'BindFrmListSingle',
//       '绑定表单列表',
//       `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType=1 or EntityType=1 or EntityType=2 or EntityType=0`,
//     );
//     this.AddSFTable(
//       'BindFrmList',
//       '绑定表单列表',
//       `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE OrgNo='@WebUser.OrgNo' AND  (EntityType=1 or EntityType=1 or EntityType=2)`,
//     );

//     this.AddSFTable('FrmListOfDictBillSingle', '单据表单列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType=1 OR EntityType=5`);
//     this.AddSFTable(
//       'FrmListOfDictBill',
//       '单据表单列表',
//       `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE OrgNo='@WebUser.OrgNo'  AND (EntityType=1 OR EntityType=5) `,
//     );

//     this.AddSFTable('FrmListOfBillSingle', '单据引用列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType=1`);
//     this.AddSFTable('FrmListOfBill', '单据引用列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE OrgNo='@WebUser.OrgNo' AND EntityType=1 `);

//     this.AddSFTable('FrmDictList', '实体列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType=2 OR EntityType=5`);

//     this.AddSFTable('FrmListBill', '单据表单列表', `SELECT No,Name,FK_FormTree AS GroupNo FROM Sys_MapData WHERE EntityType=1`);

//     this.AddSFTable('SFTableSingle', '单机版数据源', `SELECT No,Name FROM Sys_SFTable`);
//     this.AddSFTable('SFTable', '数据源', `SELECT No,Name FROM Sys_SFTable  WHERE OrgNo='@WebUser.OrgNo'`);

//     this.AddSFTable('EnumsSingle', '单机版枚举', `SELECT No,Name FROM Sys_EnumMain`);
//     this.AddSFTable('Enums', '枚举', `SELECT No,Name FROM Sys_EnumMain WHERE OrgNo='@WebUser.OrgNo' `);

//     this.AddSFTable('DeptsSingle', '单机版部门', `SELECT No,Name,ParentNo FROM Port_Dept Order by Idx `);
//     this.AddSFTable('Depts', '部门', `SELECT No,Name,ParentNo FROM Port_Dept WHERE OrgNo='@WebUser.OrgNo' Order by Idx `);

//     this.AddSFTable('EmpsSingle', '单机版人员信息', `SELECT No,Name,FK_Dept GroupNo FROM Port_Emp Order By Idx`);
//     this.AddSFTable('Emps', '人员信息', `SELECT No,Name,FK_Dept GroupNo FROM Port_Emp WHERE OrgNo='@WebUser.OrgNo' Order By Idx`);

//     this.AddSFTable('StationTypesSingle', '单机版岗位类型', `SELECT No,Name FROM Port_StationType Order by Idx `);
//     this.AddSFTable('StationTypes', '岗位类型', `SELECT No,Name FROM Port_StationType WHERE OrgNo='@WebUser.OrgNo' Order by Idx `);

//     this.AddSFTable('StationsSingle', '单机版岗位', `SELECT No,Name,FK_StationType AS GroupNo FROM Port_Station Order By Idx `);
//     this.AddSFTable('Stations', '岗位', `SELECT No,Name,FK_StationType AS GroupNo FROM Port_Station WHERE OrgNo='@WebUser.OrgNo' Order By Idx `);

//     this.AddSFTable('DeptLazily1', '部门树懒加载', `SELECT No,Name,ParentNo FROM Port_Dept WHERE ParentNo='@Key' OR No='@Key' Order By Idx `);

//     this.AddSFTable('EmpLazilyBakSaas', 'SAAS版人员懒加载', `SELECT UserID as No,Name FROM Port_Emp WHERE FK_Dept='@Key' Order By Idx `);
//     this.AddSFTable('EmpLazilyBak', '人员懒加载', `SELECT B.No,B.Name FROM port_deptemp a, Port_Emp B  where A.FK_Emp=B.No and A.FK_Dept ='@Key' Order By B.Idx `);

//     this.AddSFTable(
//       'MapAttrNumberFields',
//       '数值类型的字段',
//       `SELECT KeyOfEn as No, CONCAT(KeyOfEn,' ',Name) Name FROM Sys_MapAttr WHERE FK_MapData='@Doc' AND UIContralType=0 AND MyDataType IN (2,3,5,8)  AND KeyOfEn NOT IN ('OID','FID') `,
//     );
//     this.AddSFTable(
//       'MapAttrDTFields',
//       '选择字段',
//       `SELECT KeyOfEn as No, CONCAT(KeyOfEn,' ',Name) Name FROM Sys_MapAttr WHERE FK_MapData='@Doc' AND UIContralType=0 AND MyDataType IN (6,7)  AND KeyOfEn NOT IN ('OID','FID') `,
//     );

//     this.AddSFTable('DBSrc', '数据源', `SELECT No,Name FROM Sys_SFDBSrc  `);

//     this.AddSFTable('DBSFSearch', '查询', `SELECT No,Name, FK_SFDBSrc FROM Sys_SFSearch `);

//     this.AddSFTable('SFProc', '过程', `SELECT No,Name, FK_SFDBSrc FROM Sys_SFProc`);

//     this.AddSFTable('FrmFields', '表单字段', `SELECT KeyOfEn as No, Name, GroupID FROM Sys_MapAttr WHERE FK_MapData='@FrmID' AND UIVisible=1 ORDER BY GroupID, Idx`);

//     this.AddSFTable('FrmGroups', '分组', `SELECT OID as No, Lab as Name  FROM Sys_GroupField WHERE FrmID='@Key' ORDER BY OID, Idx`);

//     this.AddSFTable('FlowSortsSingle', '单机版流程类别', `SELECT No,Name,ParentNo FROM WF_FlowSort Order by Idx `);
//     this.AddSFTable('FlowSorts', '流程类别', `SELECT No,Name,ParentNo FROM WF_FlowSort WHERE OrgNo='@WebUser.OrgNo' Order by Idx `);

//     this.AddSFTable('FlowsSingle', '单机版流程列表', `SELECT No,Name,FK_FlowSort GroupNo FROM WF_Flow Order By Idx`);
//     this.AddSFTable('Flows', '流程列表', `SELECT No,Name,FK_FlowSort GroupNo FROM WF_Flow WHERE OrgNo='@WebUser.OrgNo' Order By Idx`);

//     this.AddSFTable('Nodes', '节点列表', `SELECT NodeID as No,Name FROM WF_Node WHERE FK_Flow='@FK_Flow' Order by Step `);

//     this.AddSFTable('Orgs', '组织列表', `SELECT No,Name FROM Port_Org WHERE No != '@WebUser.OrgNo' `);

//     this.AddSFTable('MapAttrs', '字段列表', `SELECT MyPK as No, CONCAT(MyPK,' ',Name) as Name FROM Sys_MapAttr WHERE FK_MapData='@Key' AND KeyOfEn NOT IN ('OID','FID','AtPara')`);

//     this.AddSFTable('CheckField', '检查', `SELECT KeyOfEn AS No,Name From Sys_MapAttr WHERE UIContralType=14 AND FK_MapData='@FK_Frm'`);

//     this.AddSFTable('GroupField', '字段分组', `SELECT OID as No, Lab as Name  FROM Sys_GroupField WHERE FrmID='@Key'  ORDER BY Idx `);

//     this.AddSFTable(
//       'Fields',
//       '字段',
//       `SELECT KeyOfEn as No, Name, GroupID as GroupNo FROM Sys_MapAttr WHERE FK_MapData='@Key'
//     AND KeyOfEn NOT IN ('OID','Title','StarterName','Starter','FK_Dept','OrgNo','RDT','BillState','BillNo','AtPara','FID')
//     AND UIVisible=1 ORDER BY GroupID, Idx `,
//     );

//     this.AddSFTable(
//       'FrmFields_M',
//       '表单字段',
//       `SELECT KeyOfEn as No, Name, GroupID FROM Sys_MapAttr WHERE FK_MapData='@Key'  AND KeyOfEn NOT IN ('OID','Title','StarterName','Starter','FK_Dept','OrgNo','RDT','BillState','BillNo','AtPara','FID')  AND UIVisible=1 ORDER BY GroupID, Idx `,
//     );

//     this.AddSFTable('DictGroups_M', '单据分组', `SELECT KeyOfEn as No, Name, GroupID FROM Sys_MapAttr WHERE FK_MapData='@Key'  AND UIVisible=1 ORDER BY GroupID, Idx `);
//   }
// }
//DataBankBase.register('DBank_GloWF', DBank_GloWF);
export class GloWF {
  // public db = new DBank_GloWF();
  public static get srcFrmTree() {
    return `Frm_FrmTree`;
  }

  public static get srcFrmList() {
    return `Frm_FrmList`;
  }

  //一个流程的表单列表.
  public static get sqlNodeFrmList() {
    return `Frm_NodeFrmList`;
  }

  public static get SQLEnumMain() {
    return `DBSrc_EnumMain`;
  }
  public static get SQLSFTable() {
    return `DBSrc_SQLSFTable`;
  }
  public static get SQLEnumMainAndSFTable() {
    return `DBSrc_EnumMainAndSFTable`;
  }
  public static get SQLEnumSFTableGroup() {
    return `DBSrc_EnumSFTableGroup`;
  }
  public static get SQLSFTableSysDict() {
    return `DBSrc_SFTableSysDict`;
  }

  public static get srcEmpSearchKey() {
    return `Port_EmpSearchKey`;
  }
  public static get CondTemplate() {
    return `Flow_CondTemplate`;
  }
  /**
   * 根据String转化为json.
   * @param str
   */
  public static AtParaStringToJson(str: string) {
    const ap = new AtPara(str);
    return Object.fromEntries(ap.HisHT);
  }
  public static AtParaStringToJsonNoName(str: string) {
    const ap = new AtPara(str);
    const json = Object.fromEntries(ap.HisHT);
    const jsonKeys = Object.keys(json);
    const list: { No: string; Name: string }[] = [];
    for (const key of jsonKeys) {
      list.push({
        No: key,
        Name: json[key],
      });
    }
    return list;
  }
  /**
   * 处理表达式.
   * @param exp 表达式
   * @param en 实体或JSON
   * @returns 处理后的表达式.
   */
  public static DealExp(exp: string, en: Entity | Recordable) {
    let str = exp;
    str = str.replace('@WebUser.No', WebUser.No as string);
    str = str.replace('@WebUser.DeptNo', WebUser.DeptNo as string);
    // str=str.replace('@WebUser.OrgNo',WebUser.OrgNo );
    if (en instanceof Entity) {
      const row = Object.fromEntries(en.Row);
      const keys = Object.keys(row);
      for (const key of keys) {
        str = str.replace(`@${key}`, en[key]);
      }
      // 如果是实体，替换主键
      while (str.includes(`@${en.PK}`)) {
        str = str.replace(`@${en.PK}`, en.PKVal);
      }
      str = str.replace(/@PKVal/g, en.PKVal);
    }
    const keys = Object.keys(en);
    for (const key of keys) {
      str = str.replace(`@${key}`, en[key]);
    }
    return str;
  }

  // @wanglu,  getWebHostHost: http://localhost:3000    getVstoHost: http
  public static openVSTO(appID: string, frmID: string, workID: string, paras = '') {
    let header = 'excelform';
    if (appID.indexOf('Word') > 0) {
      header = 'wordform';
    }
    return `${header}://-fromccflow,AppID=${appID},WebHostUrl=${location.href},FrmID=${frmID},WorkID=${workID},IsReadonly=0,Token=${WebUser.Token},WSUrl=${getVstoHost()},${paras}`;
  }

  public static get srcFrmListAskFrm() {
    return `Frm_FrmListAskFrm`;
  }
  public static get srcFrmListByEntityType() {
    return `Frm_FrmListByEntityType`;
  }
  public static get srcFrmEntityNoName() {
    return `Frm_FrmEntityNoName`;
  }
  public static get srcBindFrmList() {
    return `Frm_BindFrmList`;
  }

  public static get srcFrmListOfDictBill() {
    return `Frm_FrmListOfDictBill`;
  }

  public static get srcFrmListOfBill() {
    return `Frm_FrmListOfBill`;
  }

  public static get srcFrmDictList() {
    return `Frm_FrmDictList`;
  }

  public static get srcFrmListBill() {
    return `Frm_FrmListBill`;
  }

  public static get srcDeptRoot() {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return '0';
    return WebUser.OrgNo || '';
  }
  public static get srcSFTable() {
    return `DBSrc_SFTable`;
  }
  public static get srcEnums() {
    return `DBSrc_Enums`;
  }
  public static get srcDepts() {
    return `Port_Depts`;
  }
  public static get srcEmps() {
    return `Port_Emps`;
  }
  public static get srcStationTypes() {
    return `Port_StationTypes`;
  }
  public static get srcStations() {
    return `Port_Stations`;
  }
  public static get srcTreeDept() {
    return `Port_TreeDept`;
  }

  public static readonly srcDeptLazily1 = `Port_DeptLazily`;
  public static readonly srcDeptLazily = `Port_DeptLazily`;

  public static get srcEmpLazily() {
    return `Port_EmpsByDeptNo`;
  }

  //数值类型的字段.
  public static readonly sqlMapAttrNumberFields = `Frm_MapAttrNumberFields`;
  //数值类型的字段.
  public static readonly sqlMapAttrDTFields = `Frm_MapAttrDTFields`;

  public static readonly srcDBSrc = `DBSrc_DBSrc`;
  public static readonly srcDBSFSearch = `DBSrc_DBSFSearch`;
  public static readonly srcBindSFTable = `DBSrc_BindSFTable`;
  public static readonly srcSFProc = `DBSrc_SFProc`;
  public static readonly srcWebAPISFTable = `DBSrc_WebAPISFTable`;

  public static readonly srcFrmFields = `Frm_FrmFields`;
  public static readonly srcFrmGroups = `Frm_FrmGroups`;

  public static srcFrmFields_M(frmID: string) {
    return `Frm_FrmFields_M@Key=` + frmID;
  }

  public static srcDictGroups_M(frmID: string) {
    return `Frm_DictGroups_M@Key=` + frmID;
  }

  public static sqlGroupField(frmID: string) {
    return `Frm_GroupField@Key=` + frmID;
  }
  public static sqlFields(frmID: string) {
    return `Frm_Fields@Key=` + frmID;
  }
  public static sqlBillOrEnFields(frmID: string) {
    return `Frm_BillOrEnFields@Key=` + frmID;
  }

  public static get srcFlowSorts() {
    return `Flow_FlowSorts`;
  }

  public static get srcFlows() {
    return `Flow_Flows`;
  }
  public static readonly srcNodes = `Flow_Nodes`;
  public static SQLOfNodes(flowNo: string) {
    return `Flow_NodesByKey@Key=` + flowNo;
  }
  public static readonly srcOrgs = `Port_Orgs`;
  public static readonly srcSelectOrgs = `Port_SelectOrgs`;
  /**
   * 根据URl请求返回字符串数据
   * @param url
   * @constructor
   */
  public static SQLOfMapAttrsGener(frmID: string) {
    return `Frm_MapAttrs@Key=` + frmID;
  }
  public static OperName(oper: string) {
    if (oper === 'dayu') return '大于';
    if (oper === 'dayudengyu') return '大于等于';

    if (oper === 'xiaoyu') return '小于';
    if (oper === 'xiaoyudengyu') return '小于等于';

    if (oper === 'budengyu') return '不等于';
    if (oper === 'dengyu') return '等于';
    if (oper === 'like') return '包含';
    return oper;
  }
  public static readonly SQLOfMapAttrs = `Frm_MapAttrs`;

  public static readonly SQLOfCheckField = `Frm_CheckField`;

  public static SysEnum() {
    const AppCenterDBType = SystemConfig.AppCenterDBType;
    if (AppCenterDBType === 'KingBaseR6' || AppCenterDBType === 'KingBaseR3') return 'Sys_Enums';
    return 'Sys_Enum';
  }

  //日期查询GPE_DTSearchWay
  public static SQLOfGpeDTSearchWay(key: string) {
    return 'Frm_GpeDTSearchWay@Key=' + key;
  }

  //展现方式GPE_ListShowWay
  public static SQLOfGpeListShowWay(key: string) {
    return 'Frm_GpeListShowWay@Key=' + key;
  }

  //展关键字查询GPE_SearchKey
  public static SQLOfGpeSearchKey(key: string) {
    return 'Frm_GpeSearchKey@Key=' + key;
  }

  //新建查询条件GPN_SearchFKEnum
  public static SQLOfGpnSearchFKEnum(key: string) {
    return 'Frm_GpnSearchFKEnum@Key=' + key;
  }

  //展新建列表组件GPN_Collection  需要集合支持
  public static SQLOfGpnCollection(key: string) {
    return 'Frm_GpnCollectiony@Key=' + key;
  }

  //单记录只读规则GPN_RecReadonly  按照字段计算.
  public static SQLOfGpnRecReadonly(key: string) {
    return 'Frm_GpnRecReadonly@Key=' + key;
  }

  //人员信息 GenerListEn  beforeInsert 含有tel、email
  public static readonly SQLOfEmpByDept = 'Port_EmpByDept';
  //人员信息 不含有tel、email
  public static readonly SQLOfEmpByDeptS = 'Port_EmpByDeptSql';
  // 数据列表GL_DBList
  public static SQLOfDBList(Ptable: string, OID: string) {
    return 'Frm_GlDBList@Ptable=' + Ptable + '@OID=' + OID;
  }
  public static SQLOfDBListByNo(ptable: string, no: string) {
    return 'Frm_GLDBListByNo@PTable=' + ptable + '@No=' + no;
  }
  //新建实体方法GPN_Method  groupSQL.
  public static SQLOfGpnMethodGroupSQL(key: string) {
    return 'Frm_GpnMethodGroupSQL@Key=' + key;
  }
  //新建实体方法GPN_Method  attrSQL.
  public static SQLOfGpnMethodAttrSQL(key: string) {
    return 'Frm_GpnMethodAttrSQL@Key=' + key;
  }

  //审核退回  退回到  GenerWorkerReturn
  public static readonly SQLOfGenerWorkerReturn = 'Frm_GenerWorkerReturn';

  //数据篡改  GPN_BillRecJuggle
  public static SQLOfGpnBillRecJuggle(WorkID: string) {
    return 'Frm_GpnBillRecJuggle@WorkID=' + WorkID;
  }
  //选择从表   1、数据篡改 选择从表修改 GPN_BillRecJuggle  2、新建菜单 GPN_Menu 选择从表
  public static SQLOfDtls(key: string) {
    return 'Frm_Dtls@Key=' + key;
  }

  //获取系统    1、菜单迁移到其他系统 GPN_MenuToSystem  系统
  public static SQLOfSystems() {
    return 'Frm_Systems';
  }
  //获取菜单  1、菜单迁移到其他系统 GPN_MenuToSystem  模板
  public static SQLOfModules(key: string) {
    return 'Frm_Modules@Key=' + key;
  }
  //获取菜单  不传参
  public static SQLOfModuleNo() {
    return 'Frm_ModuleNo';
  }

  //数据源向导 GPN_WindowDBSrc  查询需要的字段
  public static SQLOfWindowDBSrcAttrsSQL(key: string) {
    return 'Frm_WindowDBSrcAttrsSQL@Key=' + key;
  }
  //数据源向导 GPN_WindowDBSrc  查询需要的字段
  public static SQLOfWindowDBSrcAttrsSQL1(key: string) {
    return 'Frm_WindowDBSrcAttrsSQL1@Key=' + key;
  }

  //数据源向导 GPN_WindowDBSrc  查询需要的字段
  public static SQLOfWindowFrmNumberSQL(key: string) {
    return 'Frm_WindowFrmNumberSQL@Key=' + key;
  }
  //数据源向导 GPN_WindowDBSrc  查询需要的字段
  public static SQLOfWindowFrmFkEnumSQL(key: string) {
    return 'Frm_WindowFrmFkEnumSQL@Key=' + key;
  }

  //业务字段 GPE_FlowBuessFields  attrSQL.
  public static SQLOfGpeFlowBuessFields(key: string) {
    return 'Frm_GpeFlowBuessFields@Key=' + key;
  }
  //获取流程的节点   1、同步数据规则  GPE_SyncRole 指定的节点发送后
  public static SQLOfNodesOfFlow(key: string) {
    return 'Frm_NodesOfFlow@Key=' + key;
  }
  //获取流程的节点   1、同步数据规则  GPE_SyncRole 指定的节点发送后
  public static SQLOfSelectTableAndFields(key: number) {
    return 'Frm_SelectTableAndFields@Key=' + key;
  }

  //选择要同步的表单  GPN_SyncData 数据源表单
  public static SQLOfFrmsFields(flowNo: string, frmIDRpt: string) {
    return 'Frm_FrmsFields@flowNo=' + flowNo + '@frmIDRpt=' + frmIDRpt;
  }
  //字段同步  SyncDataField 选字段
  public static SQLOfToFieldKey() {
    return 'Frm_ToFieldKey';
  }

  //审核组件 NodeWorkCheck 签批字段
  public static SQLOfNodeWorkCheckField() {
    return 'Frm_NodeWorkCheckField';
  }
  //从表里的人员编号字段 AccepterRoleByEmpsFrmDtl  从表
  public static SQLOfFrmMapDtl() {
    return 'Frm_FrmMapDtl';
  }
  //从表里的人员编号字段 AccepterRoleByEmpsFrmDtl  从表列 选择字段
  public static SQLOfFrmMapDtlColumn() {
    return 'Frm_FrmMapDtlColumn';
  }
  //从表里的外键枚举字段 从表属性 行初始化字段
  public static SQLOfFrmMapDtlFKEnumColumn(key: string) {
    return 'Frm_FrmMapDtlFKEnumColumn@Key=' + key;
  }

  //获取流程的节点  GPE_AccepterRole 接收人规则 不传参
  public static readonly SQLOfNodesOfFlowNoPara = 'Frm_NodesOfFlowNoPara';

  //从表里的人员编号字段 AccepterRoleByEmpsFrmDtl  从表列 选择字段
  public static SQLOfArrtOfNode(key: string) {
    return 'Frm_ArrtOfNode@Key=' + key;
  }
  //获取流程节点 部门集合范围 GPE_ARDeptModel 按指定节点提交人计算
  public static SQLOfNodesAcceptRole(key: string) {
    return 'Frm_NodesAcceptRole@Key=' + key;
  }

  public static readonly SQLOfSQLTemplate = 'Frm_SQLTemplate';

  //指定字段的时间考核 EvaluationRole4   选字段(对表单字段有效)
  public static readonly SQLOfRoleField = 'Frm_RoleField';

  //附件权限  GPN_FrmNewAttachment 影响的附件
  public static SQLOfNewAthSQL(key: string) {
    return 'Frm_NewAthSQL@Key=' + key;
  }
  //从表权限  GPN_FrmNewDtl 影响的从表
  public static SQLOfNewDtlSQL(key: string) {
    return 'Frm_NewDtlSQL@Key=' + key;
  }
  //摘要字段 GPE_FrmSummaryField 选择摘要字段
  public static SQLOfFrmSummaryFields(key: string) {
    return 'Frm_FrmSummaryFields@Key=' + key;
  }

  //推送对象选择方式 GPN_PushMsg  表单字段
  public static SQLOfPushMsgFields(key: string) {
    return 'Frm_PushMsgFields@Key=' + key;
  }
  //推送对象选择方式 GPN_PushMsg 表单上的字段作为接受对象
  public static SQLOfPushMsgSrcList(key: string) {
    return 'Frm_PushMsgSrcList@Key=' + key;
  }
  //超时处理规则 GPE_OvertimeRole 自动跳转到指定节点
  public static SQLOfOvertimeRole() {
    return 'Frm_OvertimeRole';
  }
  //新建子流程 GPN_NewSubFlow  新建子流程时排除父流程
  public static SQLOfSubFlowSrcList(key: string) {
    return 'Flow_SubFlowSrcList@Key=' + key;
  }
  //表单条件 CondFrmEnum const 操作的值.
  public static readonly SQLOfCondFrmEnum = 'DBSrc_CondFrmEnum';

  //表单条件 CondFrmEnumString const 操作的值.
  public static readonly SQLOfCondFrmEnumString = 'DBSrc_CondFrmEnumString';
  //引用单据 GPN_CtrlAutoFullBill 获得表的字段.
  public static SQLOfBillFields(key: string) {
    return 'Frm_BillFields@Key=' + key;
  }
  //新建从表字段 GPN_DtlField 普通类型的字段.
  public static SQLOfDtlFieldMaxIdx(key: string) {
    return 'Frm_DtlFieldMaxIdx@Key=' + key;
  }
  //新建枚举/外键字段 GPN_NewDDL 新建外键字段
  public static readonly SQLOfNewDDLDict = 'Frm_NewDDLDict';
  //新建从表字段 GPN_DtlField 普通类型的字段.
  public static SQLOfMapExtSelectSFTable(isPara: number, codeStruct: number) {
    return 'DBSrc_MapExtSelectSFTable@isPara=' + isPara + '@codeStruct=' + codeStruct;
  }
  public static readonly SQLOfSFSearch = 'DBSrc_SFSearch';

  //新建条件/表达式 GPN_Cond 表单字段条件
  public static SQLOfCondByFrm(nodeID: number, frmIDRpt: string) {
    return 'Frm_CondByFrm@nodeID=' + nodeID + '@frmIDRpt=' + frmIDRpt;
  }
  //新建条件/表达式 GPN_Cond 表选择字段
  public static SQLOfCondSelectField(key: string) {
    return 'Frm_CondSelectField@Key=' + key;
  }
  public static SQLOfCondByFrmSelectField(frmID: string, exp: string) {
    return 'Frm_CondByFrmSelectField@frmID=' + frmID + '@exp=' + exp;
  }
  public static SQLOfGenerDBSrcTabls(frmID: string) {
    return 'Frm_GenerDBSrcTabls@frmID=' + frmID;
  }
  //模板导入 GPN_FrmExpImp 导入表结构
  public static readonly SQLOfSelectItemsByList = 'DBSrc_SelectItemsByList';
  //模板导入导出 GPN_FrmExpImp Office导入
  public static readonly SQLOfFieldModel = 'Frm_FieldModel';
  //模板导入导出 GPN_FrmExpImp 表单模式
  public static readonly SQLOfFrmModel = 'Frm_FrmModel';
  //数据开放规则 GPE_DtlOpenType  从表属性-数据开放规则 -WorkID+指定人员账号字段
  public static SQLOfDtlOpenPara(key: string) {
    return 'Frm_DtlOpenPara@Key=' + key;
  }
  //批量编辑规则 GPE_IsBatchUpdate 从表属性-批量编辑规则-启用
  public static SQLOfIsBatchUpdateAttrs(key: string) {
    return 'Frm_IsBatchUpdateAttrs@Key=' + key;
  }
  //导入实体字段 GPN_ImpDtlAttrs 选择从表
  public static readonly SQLOfMapDtl = 'Frm_MapDtl';
  //导入实体字段 GPN_ImpDtlAttrs 从表属性-导入实体字段
  public static SQLOfMapDtlFields(key: string) {
    return 'Frm_MapDtlFields@Key=' + key;
  }
  //从表属性 MapDtlExt  子线程处理人字段
  public static SQLOfSubThreadWorker() {
    return 'Frm_SubThreadWorker';
  }
  //展示模式 GPE_ListShowModel 损益表模式
  public static SQLOfIncomeStatement(key: string) {
    return 'Frm_IncomeStatement@Key=' + key;
  }
  //级联下拉框 GPEActiveDDL 联动的字段
  public static SQLOfAttrsOfActive() {
    return 'Frm_AttrsOfActive';
  }
  //节点属性 ListShoModel2D 2维表字段
  public static SQLOfListShoModel2D() {
    return 'Frm_ListShoModel2D';
  }
  //节点属性 ListShoModel2D 2维表字段
  public static SQLOfListlNumberField() {
    return 'Frm_ListlNumberField';
  }
  //节点属性 ListShoModel3D 2维表字段
  public static SQLOfListShoModel3D() {
    return 'Frm_ListShoModel3D';
  }
  //表格弹窗 GPEActiveDDLSFTable 级联下拉框
  public static readonly SQLOfActiveDDL = 'Frm_ActiveDDL';

  //表格弹窗 GPEActiveDDLSFTable 级联下拉框
  public static readonly SQLOfActiveDDLSFTable = 'DBSrc_ActiveDDLSFTable';

  //表格弹窗 GPEAutoFullDDLSFTable 填充过滤 字典表
  public static readonly SQLOfActiveDDLDoc = 'DBSrc_ActiveDDLDoc';
  //表格弹窗 GPEAutoFullDtlField 对从表列求值 从表
  public static readonly SQLOfAutoFullDtlField = 'Frm_AutoFullDtlField';
  //填充从表 FullDDLSFTable 查询
  public static readonly SQLOfFullDDL = 'DBSrc_FullDDL';
  //关联更新的类 EnumHidItem 点击事件隐藏选项 联动的控件
  public static readonly SQLOfEnumHidItem = 'Frm_EnumHidItem';
  //选择附件 GPN_FullAth 选择附件
  public static SQLOfFullAth(key: string) {
    return 'Frm_FullAth@Key=' + key;
  }
  //选择下拉框 GPN_FullDataDDL 选择下拉框
  public static SQLOfSelectDDL(key: string) {
    return 'Frm_SelectDDL@Key=' + key;
  }
  //单实体平铺 PopList 字典表(有参1)
  public static readonly SQLOfPopList = 'DBSrc_PopList';
  public static readonly SQLOfChoiceSmall = 'DBSrc_PopList';
  //新增影响的元素 GPN_RBNewAttr 影响的字段
  public static SQLOfRBNewGroup(key: string) {
    return 'Frm_RBNewGroup@Key=' + key;
  }
  //两个日期之差 GPEReqDays 日期
  public static readonly SQLOfGPEReqDays = 'Frm_GPEReqDays';
  //节假日 GPEReqDays
  public static readonly SQLOfReqDaysHolidays = 'Frm_ReqDaysHolidays';
  //日期输入规则 GPEDateFieldInputRole 日期字段
  public static readonly SQLOfDateFieldInputRole = 'Frm_DateFieldInputRole';
  //人民币大写 GPE_RMBDaXie  选择只读的人民币大写字段
  public static readonly SQLOfRMBDaXie = 'Frm_RMBDaXie';
  //参数 SFPara  内参表达式
  public static readonly SQLOfSFPara = 'Frm_SFPara';
  //设置二级管理员 GPN_Adminer 选择管理员
  public static SQLOfSelectAdminer(key: string) {
    return 'Port_SelectAdminer@Key=' + key;
  }
  //设置二级管理员 GPN_Adminer 选择管理员
  public static readonly SQLOfAdminerEmpByDept = 'Port_AdminerEmpByDept';
  //工作批量移交 GPN_WorkShiftBatch  请选择规则
  public static SQLOfWorkShiftBatchFlows(key: string) {
    return 'Flow_WorkShiftBatchFlows@Key=' + key;
  }
  //用户大屏 DBank_OneFlowEmp
  public static SQLOfOneFlowEmp_Todo(key: string) {
    return 'Flow_DataV_OneFlowEmp_Todo@Key=' + key;
  }
  public static SQLOfOneFlowEmp_Return(key: string) {
    return 'Flow_DataV_OneFlowEmp_Return@Key=' + key;
  }
  public static SQLOfOneFlowEmp_Runing(key: string) {
    return 'Flow_DataV_OneFlowEmp_Runing@Key=' + key;
  }
  public static SQLOfOneFlowEmp_Complete(key: string) {
    return 'Flow_DataV_OneFlowEmp_Complete@Key=' + key;
  }
  public static SQLOfOneFlowEmp_TodoFlow(key: string) {
    return 'Flow_DataV_OneFlowEmp_TodoFlow@Key=' + key;
  }
  //Glo.ts中
  public static readonly SQLOfSelectCheckField = 'Frm_SelectCheckField';
  public static readonly SQLOfSelectBillNo = 'Frm_SelectBillNo';

  //数据篡改 GPN_FlowDataRecJuggle 修改记录
  public static SQLOfDataRecHistory(flowNo: number, WorkID: string) {
    return 'Frm_DataRecJuggleHistory@FlowNo=' + flowNo + '@WorkID=' + WorkID;
  }
  //调整 GPN_ReSend 选择节点
  public static SQLOfGenerNode(key: string) {
    return 'Frm_GenerNode@Key=' + key;
  }
  //Org.cs beforeUpdateInsertAction方法使用
  public static readonly SQLOfFlowNums = 'Flow_FlowNums';
  public static readonly SQLOfGWFS = 'Flow_GWFS';
  public static readonly SQLOfGWFSOver = 'Flow_GWFSOver';
  public static readonly SQLOfFrmNums = 'Frm_FrmNums';
  public static readonly SQLOfUsers = 'Port_Users';
  public static readonly SQLOfDepts = 'Port_Depts';

  public static sqlQmsAuditOfficer(Key: string) {
    //alert(`App_QmsAuditOfficer@Key=` + Key);
    return `App_QmsAuditOfficer@leixing=` + Key;
  }
  public static sqlQmsAuditPlanId(Key: string) {
    //alert(`App_QmsAuditOfficer@Key=` + Key);
    return `App_QmsAuditPlanId@leixing=` + Key;
  }
  public static sqlQmsDeptManagerId(Key: string) {
    return `App_QmsAuditDeptManagerId@Key=` + Key;
  }
  public static sqlQmsTaskId(Key: string) {
    return `App_QmsTaskId@Key=` + Key;
  }
  public static sqlQms8DId(Key: string) {
    //alert(`App_QmsAuditOfficer@Key=` + Key);
    return `App_Qms8DId@leixing=` + Key;
  }
}
