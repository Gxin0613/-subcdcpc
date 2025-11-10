import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr } from '/@/WF/TSClass/Node';
import { DeliveryWay } from '/@/WF/Admin/AttrNode/AccepterRole/DeliveryWay';
import { AccepterRoleBindStation } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleBindStation';
import { SelecterFix } from '/@/WF/Admin/AttrNode/AccepterRole/SelecterFix';
import { SelecterFree } from '/@/WF/Admin/AttrNode/AccepterRole/SelecterFree';
import { AccepterRoleBindEmp } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleBindEmp';
import { AccepterRoleBindDept } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleBindDept';
import { AccepterRoleBindDeptOrg } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleBindDeptOrg';
import { AccepterRoleBindDeptStation } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleBindDeptStation';
import { AccepterRoleBindSFTable } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleBindSFTable';
import { AccepterRoleByEmpsFrmDtl } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleByEmpsFrmDtl';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { ARBindWebApi } from '/@/WF/Admin/AttrNode/AccepterRole/ARBindWebApi';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPE_ShenFenModel } from '/@/WF/Admin/AttrNode/AccepterRole/GPE_ShenFenModel';
import { ARBindStationSpecDept } from '/@/WF/Admin/AttrNode/AccepterRole/ARBindStationSpecDept';
import { GPE_ARDeptModel } from '/@/WF/Admin/AttrNode/AccepterRole/GPE_ARDeptModel';
import { GPE_ARStaModel } from '/@/WF/Admin/AttrNode/AccepterRole/GPE_ARStaModel';
import { ARStation } from '/@/WF/Admin/AttrNode/AccepterRole/ARStation';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import { AR501 } from '/@/WF/Admin/AttrNode/AccepterRole/AR501';
import { GPE_SelectorModel } from '/@/WF/Admin/AttrNode/AccepterRole/GPE_SelectorModel';
import { AccepterRoleMLeader } from '/@/WF/Admin/AttrNode/AccepterRole/AccepterRoleMLeader';
import { DataType } from '/@/bp/en/DataType';
import { ARBindStationSpecSta } from '/@/WF/Admin/AttrNode/AccepterRole/ARBindStationSpecSta';
import { ARWebAPI } from '/@/WF/Admin/AttrNode/AccepterRole/ARWebAPI';
import { RouteAttr2Emp } from '/@/WF/Admin/AttrNode/AccepterRole/RouteAttr2Emp';
import { CCRole } from '/@/WF/Admin/AttrNode/CCRole/CCRole';
import { NodeExt } from '/@/WF/Admin/AttrNode/NodeExt';
import { message } from 'ant-design-vue';
import BSEntity from '/@/utils/gener/BSEntity';
import WebUser from '/@/bp/web/WebUser';
import { NodeFormType } from '/@/WF/Admin/EnumLab';
import { GloWF } from '../../GloWF';
import { AccepterRoleMLeader2 } from './AccepterRoleMLeader2';

export class GPE_AccepterRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_AccepterRole');
    this.PageTitle = '接收人规则';
  }
  async Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.DeliveryWay; // 'StartLimitRole'; //对应的字段.
    this.Icon = 'icon-user-following';

    this.entity.setPKVal(this.PKVal);
    await this.entity.Retrieve();

    const nodeStr = !!this.PKVal ? (this.PKVal.toString() as string) : '';

    if (!nodeStr || typeof nodeStr != 'string') {
      throw new Error('初始化失败，未获取到主键');
    }
    if (nodeStr.endsWith('01')) {
      this.PageTitle = '发起人规则';
      //增加子页面.
      this.AddGroup('A', '流程发起人设置'); //增加分组.
      this.Blank(DeliveryWay.BySelected, '所有人都可以发起(默认)', this.Starter_AnyOne);
      this.AddEntity(DeliveryWay.ByStation, '绑定角色计算', new ARStation(), this.Starter_Station);
      this.AddEntity(DeliveryWay.ByBindEmp, '按绑定人员计算', new AccepterRoleBindEmp(), this.Starter_Emps);
      this.AddEntity(DeliveryWay.ByDept, '按绑定部门计算', new AccepterRoleBindDept(), this.Starter_Dept);
      this.AddEntity(DeliveryWay.ByDeptAndStation, '按绑定的角色与部门交集计算', new AccepterRoleBindDeptStation(), this.Starter_DeptAndStation);
      return;
    }

    this.Btns = [
      //{ pageNo: DeliveryWay.ByAPIUrl.toString(), list: ['设置WebApi'] },
      { pageNo: DeliveryWay.ByStation.toString(), list: ['身份规则'] },
      { pageNo: DeliveryWay.ByMLeader0.toString(), list: ['身份规则'] },
      { pageNo: DeliveryWay.ByStationSpecDepts.toString(), list: ['部门范围规则'] },
      { pageNo: DeliveryWay.ByFromDeptToEmp.toString(), list: ['部门范围规则'] },
      { pageNo: DeliveryWay.ByStationSpecDepts.toString(), list: ['部门范围规则'] },
      { pageNo: DeliveryWay.ByDeptLeader.toString(), list: ['部门范围规则'] },
      { pageNo: DeliveryWay.ByDeptSpecer.toString(), list: ['部门范围规则'] },
      { pageNo: DeliveryWay.BySelected_2.toString(), list: ['设置范围'] },
      { pageNo: DeliveryWay.PreplaceWokerFix.toString(), list: ['设置范围'] },
    ];

    // this.Btns = '通用设置';
    //增加子页面.
    this.AddGroup('A', '按组织结构绑定');
    this.AddEntity(DeliveryWay.ByStation, '按角色智能计算', new AccepterRoleBindStation(), this.ByStation);
    this.AddEntity(DeliveryWay.ByStationOnly, '仅按绑定的角色计算', new ARStation(), this.ByStationOnly);

    this.AddEntity(DeliveryWay.ByBindEmp, '按绑定的人员计算', new AccepterRoleBindEmp(), this.ByBindEmp);
    this.AddEntity(DeliveryWay.ByDeptAndStation, '按绑定的角色与部门交集计算', new AccepterRoleBindDeptStation(), this.ByDeptAndStation);
    // this.AddEntity(DeliveryWay.ByStationAndEmpDept, '按绑定的角色计算并且以绑定的部门集合为纬度', new AccepterRoleEntity0(), this.ByStationAndEmpDept);
    this.SingleTB(DeliveryWay.BySpecNodeEmpStation, '按指定节点的人员角色计算', NodeAttr.DeliveryParas, this.BySpecNodeEmp, '请输入节点ID');
    this.AddEntity(DeliveryWay.BySetDeptAsSubthread, '按绑定部门计算，该部门一人处理标识该工作结束(子线程)', new AccepterRoleBindDept(), this.BySetDeptAsSubthread);
    this.AddEntity(DeliveryWay.FindSpecDeptEmps, '找本部门范围内的角色集合里面的人员', new AccepterRoleBindDept(), this.FindSpecDeptEmps);
    this.Blank(DeliveryWay.ByDeptLeader, '找部门的领导(主管,负责人,Port_Dept.Leader)', this.ByDeptLeader);
    this.Blank(DeliveryWay.ByDeptSpecer, '找部门的分管领导(Port_Dept.Specer)', this.ByDeptSpecer);

    // this.SingleEnumDDL(DeliveryWay.ByMLeader1, '指定通讯录模式', 'DeliveryParas', this.HelpUn, '');
    // this.Blank(DeliveryWay.ByEmpLeader, '找直属主管(主管,负责人,Port_Emp.Leader)', this.ByDeptLeader);
    //选择节点.
    //const sql = `SELECT NodeID as No, Name FROM WF_Node WHERE FK_Flow='@FK_Flow'`;
    this.SingleDDLSQL(DeliveryWay.ByEmpLeader, '找指定节点的人员直属领导(主管,负责人,Port_Emp.Leader)', 'DeliveryParas', this.ByEmpLeader, GloWF.SQLOfNodesOfFlowNoPara, true);
    this.AddEntity(DeliveryWay.ByDept, '按绑定的部门计算', new AccepterRoleBindDept(), this.ByDept);

    this.AddEntity(DeliveryWay.ByStationSpecDepts, '按指定的部门集合规则与绑定的角色交集计算', new ARBindStationSpecDept(), this.ByStationSpecDepts);
    this.AddEntity(DeliveryWay.ByStationSpecStas, '按指定的角色集合规则与绑定的部门交集计算', new ARBindStationSpecSta(), this.HelpUn);

    this.AddGroup('Y', '连续多级主管');
    this.AddEntity(DeliveryWay.ByMLeader0, '指定角色模式', new AccepterRoleMLeader(), this.ByMLeader0);
    this.SingleTB(DeliveryWay.ByMLeader1, '指定通讯录模式', 'DeliveryParas', this.ByMLeader1, '请输入级别', DataType.AppInt);
    this.AddEntity(DeliveryWay.ByMLeader2, '按顶级部门计算', new AccepterRoleMLeader2(), this.ByMLeader2);
    if (SystemConfig.CustomNo == 'CCFlow') {
      this.AddEntity(DeliveryWay.ZhieJieShangJi601, '直接上级', new AR501(), this.ByStationOnly);
      this.AddEntity(DeliveryWay.ZhieJieShangJi602, '直接上2级', new AR501(), this.ByStationOnly);
      //  this.Blank(DeliveryWay.ZhieJieShangJi501, '直接上级', this.ByAPIUrl);
      // this.Blank(DeliveryWay.ZhieJieShangJi502, '直接上2级', this.ByAPIUrl);
    }

    //this.AddEntity(DeliveryWay.ByDeptAndEmpField, "按绑定的部门人员选择器计算", new AccepterRoleEntity0(), this.Desc14);
    this.AddGroup('B', '按上一个节点的处理人身份'); //增加分组.
    this.Blank(DeliveryWay.BySenderParentDeptLeader, '发送人上级部门的负责人', this.ByDeptLeader);
    this.Blank(DeliveryWay.BySenderParentDeptStations, '发送人上级部门角色下的人员(需绑定角色)', this.ByDeptLeader);

    this.AddGroup('C', '按指定节点处理人'); //增加分组.
    this.Blank(DeliveryWay.ByStarter, '与开始节点处理人相同', this.ByStarter);
    this.Blank(DeliveryWay.ByPreviousNodeEmp, '与上一节点处理人相同', this.ByPreviousNodeEmp);
    //  this.SingleTB(DeliveryWay.BySpecNodeEmp, '与指定节点处理人相同', NodeAttr.DeliveryParas, this.BySpecNodeEmp, '请输入节点ID');
    this.SingleDDLSQL(DeliveryWay.BySpecNodeEmp, '与指定节点处理人相同', 'DeliveryParas', this.BySpecNodeEmp, GloWF.SQLOfNodesOfFlowNoPara, true);
    //this.SelectItemsByList(DeliveryWay.BySpecNodeEmp, '与指定节点处理人相同', 'DeliveryParas',false,  sql,true);

    this.AddGroup('D', '技术实现'); //增加分组.
    this.SingleTBSQL(DeliveryWay.BySQL, '按设置的SQL获取接受人计算', NodeAttr.DeliveryParas, this.BySQL);

    this.SingleTBSQL(DeliveryWay.BySQLAsSubThreadEmpsAndData, '按SQL确定子线程接受人与数据源', NodeAttr.DeliveryParas, this.BySQLAsSubThreadEmpsAndData);
    this.AddEntity(DeliveryWay.BySFTable, '绑定字典(多参数)', new AccepterRoleBindSFTable(), this.BySQL);
    //this.Blank(DeliveryWay.ByAPIUrl, '按照WebAPI计算', this.ByAPIUrl);
    this.AddEntity(DeliveryWay.ByAPIUrl, '按照WebAPI计算', new ARWebAPI(), this.ByAPIUrl);

    this.AddGroup('X', '按照组结构绑定');
    this.AddEntity(DeliveryWay.ByTeamStationOnly, '仅按绑定的角色计算', new ARStation(), this.ByTeamStationOnly);
    this.AddEntity(DeliveryWay.BySelected_3, '固定范围选择-指能选择组中的人员', new SelecterFree(), this.BySelected);
    // this.SingleTB(DeliveryWay.ByAPIUrl, '按照WebAPI', NodeAttr.DeliveryParas, this.ByAPIUrl, '请输入URL');
    // this.AddEntity(DeliveryWay.BySQLAsSubThreadEmpsAndData, '按SQL确定子线程接受人与数据源', new AccepterRoleEntity0(), this.BySQLAsSubThreadEmpsAndData);

    this.AddGroup('E', '使用人员选择器-主观选择');
    this.AddEntity(DeliveryWay.BySelected, '自由选择(海选)', new SelecterFree(), this.BySelected);
    this.AddEntity(DeliveryWay.BySelected_2, '固定范围选择', new SelecterFix(), this.BySelectedFix);
    //this.AddEntity(DeliveryWay.BySelectEmpByOfficer, '选择其他组织的联络员', new SelecterFix(), this.BySelectedFix3);
    this.SingleTB(DeliveryWay.BySelfUrl, '自定义人员选择器', NodeAttr.DeliveryParas, this.BySelfUrl, '请输入自定义的url');

    this.AddGroup('F', '使用人员选择器-预先选择');
    this.AddEntity(DeliveryWay.PreplaceWokerFree, '自由选择(预置海选)', new SelecterFree(), this.BySelected);
    this.AddEntity(DeliveryWay.PreplaceWokerFix, '(预置)固定范围选择', new SelecterFix(), this.BySelectedFix);

    this.AddGroup('G', '节点表单字段'); //增加分组.
    const flowNo = this.GetRequestVal('FlowNo') || this.entity.FK_Flow || this.GetRequestVal('PKVal');
    let frmID = 'ND' + Number.parseInt(flowNo) + 'Rpt';
    if (this.entity.FormType === NodeFormType.RefOneFrmTree) frmID = this.entity.NodeFrmID;
    const sql1 = GloWF.SQLOfArrtOfNode(frmID);
    // `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='${frmID}' AND KeyOfEn Not IN ('AtPara','OID','RDT','GUID','Title','Rec','CDT')`;

    this.SelectItemsByList(DeliveryWay.ByPreviousNodeFormEmpsField, '主表字段是人员编号', this.ByPreviousNodeFormEmpsField, false, sql1, 'DeliveryParas');
    this.AddEntity(DeliveryWay.ByPreviousNodeFormEmpsFrmDtl, '从表里字段是人员编号', new AccepterRoleByEmpsFrmDtl(), this.ByPreviousNodeFormEmpsField);
    this.SingleDDLSQL(DeliveryWay.ByPreviousNodeFormDepts, '字段是部门编号(按部门的领导计算)', 'DeliveryParas', this.ByFieldAsDeptNo, sql1, true);
    this.SingleDDLSQL(DeliveryWay.ByPreviousNodeFormStationsAI, '字段是角色编号(按角色智能计算)', 'DeliveryParas', this.ByFieldAsStationNo, sql1, true);
    this.SingleDDLSQL(DeliveryWay.ByPreviousNodeFormStationsOnly, '字段是角色编号(仅按角色计算)', 'DeliveryParas', this.ByFieldAsStationNo, sql1, true);
    this.SingleDDLSQL(DeliveryWay.ByPreviousNodeFormEmpsTeam, '字段是权限组', 'DeliveryParas', this.ByPreviousNodeFormEmpsField, sql1, true);
    //this.SingleDDLSQL(DeliveryWay.ByDtlAsSubThreadEmps, '由上一节点的明细表来决定子线程的接受人', 'DeliveryParas', this.ByDtlAsSubThreadEmps, sql1, true);
    this.SingleTB(DeliveryWay.ByDtlAsSubThreadEmps, '由上一节点的明细表来决定子线程的接受人', 'DeliveryParas', this.ByDtlAsSubThreadEmps, '输入从表人员字段');
    this.AddGroup('W', '路由配置'); //增加分组.
    this.SingleTextArea(DeliveryWay.ByFromEmpToEmp, '人员路由列表', NodeAttr.DeliveryParas, '请阅读帮助规则输入参数', this.ByFromEmpToEmp);
    this.SingleTextArea(DeliveryWay.ByFromDeptToEmp, '部门路由列表', NodeAttr.DeliveryParas, '请阅读帮助规则输入参数', this.ByFromEmpToEmp);
    this.AddEntity(DeliveryWay.ByFromAttrToEmp, '字段路由列表', new RouteAttr2Emp(), this.ByRouteAttr2Emp);

    //  this.TextBox2(DeliveryWay.ByFromAttrToEmp, '字段路由列表', NodeAttr.DeliveryParas, '请阅读帮助规则输入参数', this.ByFromEmpToEmp);

    // this.AddGroup('J', '项目组计算');
    // this.AddEntity(999, '绑定的角色计算', new ARStation(), this.ByStationOnly);
    // this.AddEntity(888, '自由选择(海选)', new SelecterFree(), this.BySelected);

    this.AddGroup('Z', '其它方式'); //增加分组.
    this.Blank(DeliveryWay.ByFEE, '由FEE来决定', this.ByFEE);
  }
  public async AfterSave(pageID: string, pageVal: any) {
    const nodeStr = this.PKVal as string;
    if (nodeStr.toString().endsWith('01')) {
      const nd = new NodeExt();
      nd.NodeID = this.PKVal;
      await nd.RetrieveFromDBSources();

      const fl = new BSEntity('BP.WF.Flow', nd.FK_Flow);
      fl.No = nd.FK_Flow;
      await fl.RetrieveFromDBSources();
      await fl.DoMethodReturnString('ClearStartFlows');
      message.info('保存成功，缓存清除了。');
    }

    const ccrole = new CCRole();
    ccrole.setPKVal(this.PKVal);
    const i = await ccrole.RetrieveFromDBSources();
    if (i == 1) {
      ccrole.EnIDs = pageID;
      ccrole.EnIDsT = pageVal;
      await ccrole.Update();
    }
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (btnName === '身份规则') {
      const url = GloComm.UrlGPE(new GPE_ShenFenModel(), this.PKVal);
      //const url = GloComm.UrlEn('TS.WF.AccepterRoleBindStation', this.PKVal);
      // alert(url);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }

    if (btnName === '部门范围规则') {
      const url = GloComm.UrlGPE(new GPE_ARDeptModel(), this.PKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }

    if (btnName === '角色范围规则') {
      const url = GloComm.UrlGPE(new GPE_ARStaModel(), this.PKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }

    if (btnName === '设置范围') {
      const url = GloComm.UrlGPE(new GPE_SelectorModel(), this.PKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }

    //设置webapi
    if (pageID == DeliveryWay.ByAPIUrl.toString() && btnName == '设置WebApi') {
      const nodeID = this.PKVal;
      const mypk = 'AR' + nodeID;
      const en = new ARBindWebApi();
      await en.Init();
      en.setPKVal(mypk);
      en.MyPK = mypk;
      const num = await en.RetrieveFromDBSources();
      if (num == 0) {
        const node = new Node();
        node.NodeID = nodeID;
        await node.RetrieveFromDBSources();
        en.NodeID = nodeID;
        en.FlowNo = node.FK_Flow;
        en.MyPK = mypk;
        await en.Insert();
      }
      const url = GloComm.UrlEn(en.classID, mypk);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Starter_Station = `
  #### 帮助
  - **定义**：发起人规则按照绑定的角色来计算，只有指定角色的人员才能发起该流程。
  - **配置方法**：请在此页面中点击「角色」后面的小齿轮选择角色。
  - **组织维护**：请在组织结构中维护角色数据，管理员可在组织页面创建角色，并在人员详情中为人员绑定角色。
  - **适用场景**：适用于仅允许特定岗位或角色人员发起流程的业务需求。
  - **注意事项**：如需调整可发起人员，请及时维护角色与人员的绑定关系。
  #### 维护角色（添加、删除）
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/EditStation.png "屏幕截图.png")
  #### 为人员添加角色
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/AddStation.png "屏幕截图.png")
  `;
  public readonly Starter_Dept = `
  #### 帮助
  - **定义**：发起人规则按照绑定的部门来计算，只有指定部门的人员才能发起该流程。
  - **配置方法**：请在此页面中点击「部门」后面的小齿轮选择部门。
  - **组织维护**：请在组织结构中维护部门数据，管理员可在组织页面创建部门，并在人员详情中为人员绑定部门。
  - **适用场景**：适用于仅允许特定部门人员发起流程的业务需求。
  - **注意事项**：如需调整可发起人员，请及时维护部门与人员的绑定关系。
  #### 维护部门（添加、删除）
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/EditDept.png "屏幕截图.png")
  #### 为人员添加部门
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/AddDept.png "屏幕截图.png").
  `;
  public readonly Starter_DeptAndStation = `
  #### 帮助
  - 角色下的人员集合与部门下的人员集合的交集可以发起.
  `;
  public readonly Starter_Orgs = `
  #### 帮助
  - 对于集团版一个组织设计一个流程如果要共享给其他组织使用，就可以启用该功能.
  - 这就叫流程模板共享, 共享的流程都必须是任何人都可以发起的流程.
  ##### 其他
  - 关于ccbpm的工作模式，请参考doc.ccbpm.cn 手册. 
  `;
  public readonly Starter_Guests = `
  #### 帮助
  - 我们把用户分为外部用户与内部用户.
  - 内部用户就是组织内的用户，存储在Port_Emp表里, 就是组织内的工作人员.
  - 外部用户有多种, 比如:供应商、销售商、合作伙伴这些人员可以存储自己指定的表里.
  - 更多信息请参考操作手册 doc.ccbpm.cn
  #### 学生请假系统
  - 流程图: 
  - 教职工就是内部用户，家长为孩子请假，家长登录就是外部用户.
  - ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/StartGuest.png "屏幕截图")
  - 外部用户也有待办、在途、发起、流程操作，接口与内部用户不同.
  #### 外部用户发起流程的API接口.
  - BP.WF.Dev2InterfaceGuest.*.* 
  - ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/StarterDev2.png "屏幕截图.png")

  `;
  public readonly Starter_AnyOne = `
  #### 流程发起人（流程启动权限）
  - **默认设置**：所有用户均可发起流程，无限制。
  - **定义**：流程发起人即具有启动特定流程权限的人员。
  #### 其他说明
  - 某些流程不应出现在「发起流程」的列表中（例如子流程）。
  \`\`\`tex
  示例：子流程不能被单独调用，应在其主流程中触发。
  \`\`\`
  - 在流程属性中，提供「是否可独立启动」的开关选项:
  \`\`\`tex 
  开启：正常显示在发起流程列表中。
  关闭：即使用户拥有发起权限，也不会显示在列表中。
  \`\`\`
  #### 发起流程列表接口
  - 系统可通过调用接口获取当前用户可以发起的流程列表。
  - 接口逻辑会自动过滤掉不可见或不可独立启动的流程。
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/StarterAnyOne.png "屏幕截图.png")
  #### 独立启动
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/FlowStartRule.png "屏幕截图.png")
  `;
  public readonly Starter_Emps = `
  #### 帮助
  - 按绑定的人员计算, 绑定的人才能发起流程.
  `;

  //按角色职能计算.
  public readonly ByStation = `
  #### 帮助
  - 定义: 接受人规则,就是A节点发到B节点, B节点上那些人可以处理B节点上的工作,根据不同的情况下，我们做不同的处理，这就叫接受人规则.
  - 接收人规则,分为两大类:主观选择与自动计算.
  - 功能拓扑图

  #### 找人算法
  
   -  第0步：首先从本级部门内的人员寻找，该节点绑定的角色，如果找不到人就进入下一步寻找。
   -  第1步：直线上级寻找，一直查询到根节点，如果找不到人就进入下一步寻找。
   -  第2步：直线上级的平级部门寻找，一直查询到根节点，如果找不到人就进入下一步寻找。
   -  第3步：当前部门的下一级所有的部门寻找。
   -  第4步：查找全局角色人员。
   
  #### 什么是人员身份? 
   -  就是按照那个人员来计算当前节点的接受人规则，默认是谁操作的按照谁的身份计算。
   -  比如：我要请假，找部门负责人，就按照当前操作员的身份计算。
   -  有的环境下并不是按照当前人员计算。 
   -  比如：我要为别人请假，找部门负责人，要按照指定的字段（该字段就是被请假人员的账号）作为人员身份。
   -  详见Entity内说明。
   #### 其他说明
   - 该选项与仅按照角色计算有区别.
   - 仅按照角色计算，就是发送给选择的角色下的所有的人。
  `;
  public readonly ByStationSpecDepts = `
  #### 帮助
   - 当前节点设置角色集合，设置部门集合规则.
   - 系统在计算的时候，就可以根据部门规则求出部门集合，加上角色集合求出他们的交集。
  #### 其他
  - 为天宇集团开发,
  - 开发日期: 2023.07.18
  #### 累加场景
  - 一个单子，需要子公司的主管审批,也需要总公司的主管审批,根据指定的部门一步步的寻找,然后按照主线直线寻找.
  - 在每个部门寻找出来的人员就累加起来.
    `;
  public readonly ByMLeader0 = `
  #### 帮助
   - 连续多级主管-指定角色模式
   - 使用此功能前请先维护好组织结构与角色.在组织页面为每个人员配置直接主管，或者在部门里配置部门领导.
   - 该功能会首先去找上一节点发送人的直接主管，如果找不到就去找发送人所在部门的部门领导，如果还找不到就去找上一级部门的领导。
  #### 配置项说明
  - 角色：表示找出来的主管还必须具备指定的角色才行，如果没有指定角色，就不做角色的限制。 
  - 级别：表示找几级主管，1表示直接主管，2表示上2级主管，依次类推。 
   
   - 如果没有找到人，就会报错，提示没有找到符合要求的人员。
  #### 其他
   - 该功能与指定通讯录模式有区别.
   - 指定角色模式是按照角色与级别去寻找人员.
   - 指定通讯录模式是按照人员编号去寻找人员.
    `;
  public readonly ByMLeader1 = `
  #### 帮助
   - 连续多级主管,指定通讯录模式.
   - 该功能是为天宇集团开发的,2023.07.18
   - 该功能是为了解决一个单子需要多个部门的主管审批.
   - 比如:一个单子需要财务部主管,人力资源部主管,总经理,总经理助理,法务部主管等多个部门的主管审批.
   - 这种情况就可以使用该功能.
   - 该功能可以指定多个级别.
   - 系统就会按照指定的级别去寻找人员.
   - 如果没有找到就会报错.
  #### 其他
   - 该功能与指定角色模式有区别.
   - 指定角色模式是按照角色与级别去寻找人员.
   - 指定通讯录模式是按照人员编号去寻找人员.
    `;
  public readonly ByMLeader2 = `
#### 帮助
- **连续多级主管（按顶级部门计算）**：系统会从当前部门开始，逐级向上查找部门领导，直到找到指定的顶级部门为止。
- 若某级部门未设置领导，则继续向上级部门查找，直至找到为止。

#### 应用场景
1. 集团公司：单据需经过各子公司主管审批，最终由总公司主管审批。
2. 普通公司：单据需经过各部门主管审批，最终由总经理审批。

#### 配置说明
- **选择部门**：设置后，查找部门领导时遇到该部门即停止向上查找。
- 请确保组织结构和部门领导信息已维护完整，否则可能导致审批链中断。

`;
  public readonly ByStationOnly = `
  #### 帮助

   - 当前节点绑定角色的集合下面的人员集合作为接受人。
   - 比如：一个省级的公安系统应用里，当前节点绑定派出所所长角色, 如果仅按照角色计算，就会投递到全省的所有派出所所长。
   - 如果按照角色智能计算，就会投递到该警察所在部门的派出所所长。
   #### 其他
   - 全局的按照角色寻找接收人，不考虑部门的维度。

    `;
  public readonly ByTeamStationOnly = `
  #### 帮助

   - 当前节点绑定的组中角色集合下的所有人员。
   #### 其他

    `;
  //按绑定的人员计算ByBindEmp

  public readonly ByBindEmp = `
  #### 帮助
   - 绑定的所有的人员，都可以处理该节点的工作。
   - 绑定多少个人，当前节点就有多少个人处理，这一种是最简洁最直接的方式。
   - 适用于当前节点人员比较稳定，一般不会变化的情况。
   - 如果人员变化比较频繁，就需要设置角色，让角色设置人员。     
`;
  // 按绑定的角色与部门交集计算ByDeptAndStation
  public readonly ByDeptAndStation = `
  #### 帮助
   - 取既具备此角色集合的又具备此部门集合的人员，做为本节点的接受人员。
   - 部门人员是一个集合，角色人员是一个集合，两个集合相交的人员集合就是当前节点要投递的对象。
`;

  // 按绑定的角色计算并且以绑定的部门集合为纬度 ByStationAndEmpDept

  public readonly ByStationAndEmpDept = `

  #### 帮助

   - 该操作需要设置部门与设置角色，两个设置。
   - 当前节点的处理人员需要求两个集合的交集。
   - 比如:在角色里设置部门经理角色，在部门里设置财务与人力资源两个部门。
   - 系统就会得到两个人员集合，第一个集合是所有具有部门经理角色的人员，第2个集合就是财务部，人力资源部所有的人员。
   - 两个的交集就是一个财务部经理于一个人力资源部经理。

`;
  //'按指定节点的人员角色计算'

  public readonly BySpecNodeEmpStation = `
  #### 帮助
   - 指定节点处理人员的身份的角色做为计算规则。
   - 与当前操作员角色身份不同的是，以以前的节点处理人的身份信息，部门信息，角色信息来计算。
`;

  //按绑定部门计算，该部门一人处理标识该工作结束(子线程) BySetDeptAsSubthread
  public readonly BySetDeptAsSubthread = `

  #### 帮助

  - 仅适用于子线程节点，按照部门分组子线程上的处理人员。
  - 每个部门一个任务，如果该部门的其中有一个人处理了，就标识该部门的工作完成，可以流转到下一步。
`;

  //FindSpecDeptEmps, '找本部门范围内的角色集合里面的人员'
  public readonly FindSpecDeptEmps = `
  #### 帮助
  - 绑定的所有的人员，都可以处理该节点的工作。
  - 绑定多少个人，当前节点就有多少个人处理，这一种是最简洁最直接的方式。
  - 适用于当前节点人员比较稳定，一般不会变化的情况。
  - 如果人员变化比较频繁，就需要设置角色，让角色设置人员。
`;

  //找本部门的领导(主管,负责人).
  public readonly ByDeptLeader = `
        
  #### 帮助
          
   - 就是按照那个人员来计算当前节点的接受人规则，默认是谁操作的按照谁的身份计算。 
   - 比如：我要请假，找部门负责人，就按照当前操作员的身份计算。 
   - 有的环境下并不是按照当前人员计算。 
   - 比如：我要为别人请假，找部门负责人，要按照指定的字段（该字段就是被请假人员的账号）作为人员身份。 

        
  #### 说明
  
   - 上一个节点发送人的直属领导，处理该工作。 
   - 部门负责人信息，存储到表 Port_Dept 字段：Leader 中.  
   - 注意:Leader 字段是登录人员的帐号，不是人员名称，如果没有此列系统就报错。   
   - 说明：如果当前部门没有负责人，就向上一级部门去找负责人，如果在没有，就提示错误。  
        
    `;
  public readonly ByDeptSpecer = `
        
    #### 帮助
            
     - 就是按照那个人员来计算当前节点的接受人规则，默认是谁操作的按照谁的身份计算。 
     - 比如：我要请假，找部门部门分管领导，就按照当前操作员的身份计算。 
     - 有的环境下并不是按照当前人员计算。 
     - 比如：我要为别人请假，找部门分管领导，要按照指定的字段（该字段就是被请假人员的账号）作为人员身份。 
          
    #### 说明
    
     - 上一个节点发送人的分管领导，处理该工作。 
     - 部门负责人信息，存储到表 Port_Dept 字段：Specer 中.  
     - 注意:Leader 字段是登录人员的帐号，不是人员名称，如果没有此列系统就报错。   
     - 说明：如果当前部门没有分管领导，就向上一级部门去找负责人，如果在没有，就提示错误。  
          
      `;

  //绑定的部门计算.
  public readonly ByDept = `
  #### 说明  
   - 节点绑定部门就是该节点下绑定部门里面的所有人员都可以接受该工作.
          
  `;

  //找指定节点的人员直属领导(主管,负责人)..
  public readonly ByEmpLeader = `
 
  #### 说明
   - 指定节点发送人的直属领导，处理该工作。 
   - 信息，存储到表 Port_Emp 字段：Leader 中.  
   - 说明：使用本规则前，请配置相应人员的直属部门的Leader！ 
   #### 技术说明
  - Port_Emp 是人员表, Leader 字段就是本部门的负责人.
  - Port_Emp.Leader 是存储的部门领导登录账号.
  - 如果找不到(没有设置)，部门的领导，系统默认会向部门领导去找.
  `;
  //BySenderParentDeptLeader, '发送人上级部门的负责人'
  public readonly BySenderParentDeptLeader = `
  #### 什么是人员身份
   - 就是按照那个人员来计算当前节点的接受人规则，默认是谁操作的按照谁的身份计算。
   - 比如：我要请假，找部门负责人，就按照当前操作员的身份计算。
   - 有的环境下并不是按照当前人员计算。
   - 比如：我要为别人请假，找部门负责人，要按照指定的字段（该字段就是被请假人员的账号）作为人员身份。 
  #### 说明
   - 上一个节点发送人的直属领导，处理该工作。
   - 部门负责人信息，存储到表 Port_Dept 字段：Leader 中.
   - 注意:Leader 字段是登录人员的帐号，不是人员名称，如果没有此列系统就报错。
   - 如果当前部门没有负责人，就向上一级部门去找负责人，如果还没有，就提示错误。 
`;

  //BySenderParentDeptStations, '发送人上级部门角色下的人员(需绑定角色)';
  public readonly BySenderParentDeptStations = `
  #### 帮助   
   - 指定节点发送人的上级部门所在角色下的所有人员。 
   - 注意：上级部门必须绑定角色 
`;
  //ByStarter, '与开始节点处理人相同'
  public readonly ByStarter = `
  #### 帮助       
   - 当前节点的处理人与开始节点一致，发起人是 zhangsan,现在节点的处理人也是zhangsan。   
   - 多用于反馈给申请人节点，通知申请人审批审核结果，此工作已经审核审批完毕。
   #### 图例
   
   - ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingFlow3.png "屏幕截图")

`;
  //ByPreviousNodeEmp, '与上一节点处理人相同'
  public readonly ByPreviousNodeEmp = `
  #### 帮助      
   - 节点A是zhangsan处理，发送到节点B,也是需要zhangsan处理。 
   - 就是自己发送给自己的模式。 
`;

  //BySpecNodeEmp, '与指定节点处理人相同'
  public readonly BySpecNodeEmp = `
  #### 帮助  
   - 当前节点的处理人与指定的节点处理人相同。
   - 所指定的节点一般都是当前节点以前的节点，由于分支原因会导致历史的节点有多个。
   - 如果出现多个，系统就会按照节点的发生时间排序的第一个节点计算。  
      
`;
  public readonly BySFTable = `
#### 帮助
 -  绑定的字典计算.
 - 请参考字典的概念，并定义字典表.
 -  字典维护: 系统设置=>字典维护.
`;

  //BySQL, '按设置的SQL获取接受人计算'
  public readonly BySQL = `
  #### 帮助
   -  该SQL是需要返回No,Name两个列，分别是人员编号,人员名称，返回的数据必须按照顺序来。
   -  SQL语句支持ccbpm表达式, 比如：SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
   -  比如：SELECT No,Name FROM Port_Emp WHERE FK_Dept='@MyFieldName' MyFieldName 必须是节点表单字段.
   -  什么是ccbpm表达式，请百度：ccbpm 表达式。
   -  注意：1. 区分大小写。2. 顺序不能变化, No,Name 
   #### 其他1
   - 复杂的，常用的sql,可以使用 '按设置的SQLTempate获取接受人计算' .
   #### 其他2
   - 如果是队列模式SQL语句的写法: SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo' ORDER BY Idx  
   - Idx 是顺序号.
      
`;

  //BySQLTemplate, '按设置的SQLTempate获取接受人计算',
  public readonly BySQLTemplate = `
  #### 帮助
   - 对于经常使用的、复杂的用sql表达的接收人场景，保存起来，在其他节点上可以调用.
   - SQL模板变化后，其他节点跟着变化. 是引用关系，而不是复制关系.
   - 场景: 开发人员把规则配置好，业务人员可以调用.
   #### 技术信息
   - 数据存储在 wf_sqltemplate 里面. 
   - 可以手工的维护上.
`;

  //BySQLAsSubThreadEmpsAndData, '按SQL确定子线程接受人与数据源'
  public readonly BySQLAsSubThreadEmpsAndData = `
 
  #### 帮助
   - 此方法与分合流相关，只有当前节点是子线程才有意义。
              
`;

  //BySelected, '由上一节点发送人通过“人员选择器”选择接受人'
  public readonly BySelected = `
#### 接收人规则 - 自由选择

- 这一模式依赖于上一个节点的发送人的主观选择，而非自动计算。
- 在“海选”模式下，您可以自由选择任何人作为接收者。就像在下图中看到的那样，您可以在\`通用的人员选择器\`中进行搜索。
- 例如，当A节点发送到B节点时，如果B节点的接收人规则由A来选择，这种操作方式类似于发送邮件——即您选择谁，审批信息就发送给谁。
- **加载节点默认接收人**：启用此选项后，当前节点的接收人将默认采用下方选定的人员，但在发送时仍可进行调整或增加其他接收人。此功能需结合下方的人员选择功能使用。
  - 启用“加载节点默认接收人”后，请在人员选择框中指定要默认加载的接收人。

#### 通用人员选择器示意图

- ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/BySelected.png "屏幕截图.png")
      
`;
  //BySelected, '由上一节点发送人通过“人员选择器”选择接受人'
  public readonly BySelectedFix = `
  #### 帮助
   - A节点发送到B节点，如果B节点的接受人规则是由A来选择的,这样的行为类似于发送邮件模式，就是我选择谁就发送给谁.
   - 这种模式是有上一个节点的发送人主观判断的，而非自动计算。
   - 固定范围的选择:就是需要设置选择人的范围，比如：按照SQL,部门，人员设定仅仅选择副局长，副部长.
  #### 固定范围人员选择器效果图
  - ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/BySelectedFix.png "屏幕截图.png")
      
`;

  //BySelected, '选择其他组织的联系人'
  public readonly BySelectedFix3 = `
 #### 帮助
  - 选择其他组织的联系人，就是用户选择谁就发送给谁.
  - 这种模式是有上一个节点的发送人主观判断的，而非自动计算。
 #### 固定范围人员选择器效果图
 - ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/BySelectedFix.png "屏幕截图.png")
     
`;
  //ByRouteAttr2Emp, '由上一节点发送人通过“人员选择器”选择接受人'
  public readonly ByRouteAttr2Emp = `
  #### 帮助
   - 是由填写表单里的枚举字段值控制的，根据对应枚举字段值不同，所处理人不一样这样的行为使用这个字段路由.
   - 字段名称的配置：字段ID(示例：请假类型枚举字段，对应的字段ID是QJLX)
   - 配置格式是：@ + 枚举key + , + 人员账号No（示例：@0,admin）
      
`;
  //BySelfUrl, '自定义人员选择器'
  public readonly BySelfUrl = `

  #### 帮助
   -  该URL是点击发送直接弹出自定义的人员选择的页面，需要开发人员将接收人的信息保存到 WF_SelectAccepter表里.
   -  系统将会把当前节点的信息传入到您的url里面去，比如：FK_Node,WorkID,FK_Flow
   -  在选择完毕后,您需要将选择的用户ID,存储到到接口里面去。

  #### DEMO 
   - /DataUser/PopSelf.htm
      
`;
  //ByAPIUrl, '按照设置的WebAPI接口获取的数据计算'
  public readonly ByAPIUrl = `
 
  #### 帮助
   - 请设置webpai， 点击webApi设置按钮.
   - 返回的数据格式为: zhangsan,lisi,wangwu
   - 多个人员用逗号分开.
      
`;
  //ByPreviousNodeFormEmpsField, '按上一节点表单指定的字段值作为本步骤的接受人'
  public readonly ByFieldAsDeptNo = `
  #### 帮助
   - 表单里采集的是部门编号，按照部门编号寻找部门负责人。
   - 部门表:Port_Dept  负责人字段 Leader
`;
  public readonly ByFieldAsStationNo = `
#### 帮助
 - 表单里采集的是岗位编号，按照岗位编号该岗位下的人员。
 - 岗位表:Port_Station  岗位人员部门对应关系表: Port_DeptEmpStation 
 - 在ccbpm中岗位与角色是同一个概念.
#### 仅按角色计算.
- 该角色下所有的人员，作为接受人的对象。

#### 按角色智能计算
- 首先从登录人员的部门里寻找具有该角色的人员集合，如果没有找到，就到当前部门的上一级部门寻找。
- 任何一级寻找到，就把这些人员作为投递对象。
- 如果寻找到根目录仍然没有找到，系统就会抛出异常.
- 更多详细的算法说明，参考按照岗位智能计算说明。
`;

  //ByPreviousNodeFormEmpsField, '按上一节点表单指定的字段值作为本步骤的接受人'
  public readonly ByPreviousNodeFormEmpsField = `
  #### 帮助
   - 在设计节点表单时，请添加一个用于保存人员信息的字段（如“部门负责人”），该字段将作为本节点的指定接收人。
  #### 运行图
  -  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/EmpsField.png "屏幕截图.png")
      
`;
  //ByDtlAsSubThreadEmps, '由上一节点的明细表来决定子线程的接受人'
  public readonly ByDtlAsSubThreadEmps = `
 
  #### 帮助
   - 适用于分合流场景，当前节点的上一个节点是分流节点, 当前节点是子线程有效.
   - 上一个节点在从表里采集到接收人信息，做为当前节点的接收人.
   - 此方法与分合流相关，只有当前节点是子线程才有意义。
   - 当前参数为明细表的字段列，如果不填写，就默认为 UserNo 。
      
`;
  //ByFEE, '由FEE来决定'
  public readonly ByFEE = `
 
  #### 帮助

  - 用流程事件,通过调用设置接受的接口,来设置当前节点的接收人,实现的把接受人信息写入接收人列表里。
  - 这里需要启动流程事件,在事件里动态的,用程序来计算接受人.
`;
  //ByFromEmpToEmp, '按照配置的人员路由列表计算'
  public readonly ByFromEmpToEmp = `
 
  #### 帮助
  - 定义: 按照格式配置人员到人员的接收人的路径,每个人员的下一个节点的处理人是固定的.
  - 格式为 @zhangsan,lisi@wangwu,zhaoliu 说明：如果是张三发送的就发送到李四身上. 多个人员对用@分开。
  - 默认接受人列表，就按照默认值寻找: @Defualt,zhangsan 着一样配置表示，没有找到人就按照默认值投递。
  - 应用场景: 1. 人员规则比较固定. 2.数据量较小.  3. 临时性的项目组工作.
  #### 配置效果图
  -  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ByFromEmpToEmp.png "屏幕截图.png")

      
`;
}
