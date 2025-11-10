import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '../../Comm/GloComm';
import { NodeAccepters } from '../AttrNode/NodeAccepter';
import { GPE_AccepterRole } from '../AttrNode/AccepterRole/GPE_AccepterRole';
import { GPE_FrmSln } from '../AttrNode/FrmSln/GPE_FrmSln';
import { FormSlnType } from '../AttrNode/EnumLab';
import { Flow } from '../../TSClass/Flow';
import { MapData } from '../FrmLogic/MapData';

export class GL_BatchFlow extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_BatchFlow');
    this.PageTitle = '流程设计';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    const flowNo = this.RequestVal('FlowNo');
    const doType = this.RequestVal('DoType');

    this.BodyWidth = '80%'; //解析.

    const nodeWorkTypeList = new Map([
      [0, '线性节点'],
      [1, '开始节点'],
      [2, '开始节点分流'],
      [3, '合流节点'],
      [4, '分流节点'],
      [5, '分合流'],
      [6, '子流程'],
    ]);

    if (doType == 'Frm') {
      const nodes = new NodeAccepters();
      await nodes.Retrieve('FK_Flow', flowNo, 'NodeID');
      this.GroupFields = ''; //分组字段.
      this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
      this.BtnOfToolbar = '帮助';
      this.BtnsOfRow = '设置规则';
      this.LinkField = 'Name';
      this.Columns = [
        { Key: 'NodeID', Name: '节点ID', IsShow: true, width: '10%' },
        { Key: 'Name', Name: '节点名称', IsShow: true, width: '30%' },
        { Key: 'NodeWorkType', Name: '节点类型', IsShow: true, width: '10%' },
        // { Key: 'FormType', Name: '表单方案', IsShow: true, width: '35%' },
        { Key: 'FormTypeT', Name: '表单方案', IsShow: true, width: '35%' },
        { Key: 'NodeFrmID', Name: '表单ID', IsShow: true, width: '10%' },
        { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
      ];
      const nodeFrmList: any = [];
      for (const node of nodes) {
        const nodeFrm = Object.fromEntries(node.Row);
        nodeFrmList.push(nodeFrm);
      }
      const FormTypeMap = new Map([
        [0, '内置表单'],
        [1, '自由表单'],
        [2, '嵌入式表单'],
        [3, 'SDK表单'],
        [4, 'SL表单'],
        [5, '多表单'],
        [6, '动态表单树'],
        [7, '公文表单'],
        [8, 'Excel表单'],
        [9, 'Word表单'],
        [10, '傻瓜轨迹表单'],
        [11, '单表单(绑定独立表单)'],
        [12, '开发者表单'],
        [13, '智能SDK表单'],
        [14, '引用其它节点表单'],
        [15, '绑定高代码TS'],
        [100, '禁用(对多表单流程有效)'],
      ]);

      nodeFrmList.forEach((nd) => {
        nd.NodeWorkType = nodeWorkTypeList.get(nd.NodeWorkType);
        nd.FormTypeT = FormTypeMap.get(nd.FormType);
        if (nd.NodeFrmID === '') nd.NodeFrmID = 'ND' + nd.NodeID;
        nd.Btns = '设计表单';
      });
      //设置数据源.
      this.Data = nodeFrmList;
    }

    //如果是接收人规则
    if (doType == 'Accepter') {
      const nodes = new NodeAccepters();
      await nodes.Retrieve('FK_Flow', flowNo, 'NodeID');
      this.GroupFields = ''; //分组字段.
      this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
      this.BtnOfToolbar = '帮助';
      this.BtnsOfRow = '设置规则';
      this.LinkField = 'Name';
      this.Columns = [
        { Key: 'NodeID', Name: '节点ID', IsShow: true, width: '10%' },
        { Key: 'Name', Name: '节点名称', IsShow: true, width: '30%' },
        { Key: 'NodeWorkType', Name: '节点类型', IsShow: true, width: '10%' },
        // { Key: 'DeliveryWay', Name: '规则', IsShow: true, width: '35%' },
        { Key: 'DeliveryWayText', Name: '接收人规则', IsShow: true, width: '35%' },
        { Key: 'DeliveryParas', Name: '部门/角色/人员/参数', IsShow: true, width: '10%' },
      ];
      //如何获得里面的pages?
      // const gpe = new GPE_AccepterRole();
      // gpe.PKVal = flowNo + '02';
      // gpe.Init();
      const AccepterList: any = [];
      for (const node of nodes) {
        const nodeFrm = Object.fromEntries(node.Row);
        // if (!node.NodeID?.toString()?.endsWith('01'))
        AccepterList.push(nodeFrm);
      }
      const ruleList = new Map([
        [0, '按角色智能计算'],
        [14, '仅按绑定的角色计算'],
        [3, '按绑定的人员计算'],
        [4, '主观选择-自由选择(海选)'],
        [9, '按绑定的角色与部门交集计算'],
        [11, '按指定节点的人员角色计算'],
        [16, '按绑定部门计算，该部门一人处理标识该工作结束(子线程)'],
        [19, '找本部门范围内的角色集合里面的人员'],
        [23, '找部门的领导(主管,负责人,Port_Dept.Leader)'],
        [58, '找部门的分管领导(Port_Dept.Specer)'],
        [50, '找指定节点的人员直属领导(主管,负责人,Port_Emp.Leader)'],
        [1, '按绑定的部门计算'],
        [56, '按指定的部门集合规则与绑定的角色交集计算'],
        [57, '按指定的角色集合规则与绑定的部门交集计算'],
        [701, '指定角色模式'],
        [702, '指定通讯录模式'],
        [46, '发送人上级部门的负责人'],
        [47, '发送人上级部门角色下的人员(需绑定角色)'],
        [7, '与开始节点处理人相同'],
        [6, '与上一节点处理人相同'],
        [8, '与指定节点处理人相同'],
        [2, '按设置的SQL获取接受人计算'],
        [12, '按SQL确定子线程接受人与数据源'],
        [52, '绑定字典(多参数)'],
        [45, '按照WebAPI计算'],
        [601, '直接上级'],
        [602, '直接上2级'],
        [30, '仅按绑定的角色计算'],
        [61, '固定范围选择-指能选择组中的人员'],
        [60, '主观选择-固定范围选择'],
        [44, '主观选择-自定义人员选择器'],
        [710, '预先选择-自由选择(海选)'],
        [703, '多级领导审批-按顶级部门计算'],
        [711, '预先选择-固定范围选择'],
        [5, '主表字段是人员编号'],
        [501, '从表里字段是人员编号'],
        [503, '字段是部门编号(按部门的领导计算)'],
        [53, '字段是角色编号(按角色智能计算)'],
        [54, '字段是角色编号(仅按角色计算)'],
        [502, '字段是权限组,DeliveryParas'],
        [13, '由上一节点的明细表来决定子线程的接受人,DeliveryParas'],
        [18, '人员路由列表'],
        [1801, '部门路由列表'],
        [1802, '字段路由列表'],
        [999, '绑定的角色计算'],
        [888, '项目组计算-自由选择(海选)'],
        [15, '由FEE来决定'],
      ]);
      //根据DeliveryWay判断接收人类型，然后处理接收人赋值给DeliveryParas
      AccepterList.forEach((accepter) => {
        accepter.NodeWorkType = nodeWorkTypeList.get(accepter.NodeWorkType);
        accepter.DeliveryWayText = ruleList.get(accepter.DeliveryWay);
        switch (accepter.DeliveryWay) {
          case 2: // 按设置的SQL获取接受人计算
          case 8: // 与指定节点处理人相同
          case 23: // 找部门的领导(主管,负责人,Port_Dept.Leader)
          case 58: // 找部门的分管领导(Port_Dept.Specer)
          case 50: // 找部门的分管领导(Port_Dept.Specer)
          case 702: // 指定通讯录模式
          case 46: // 发送人上级部门的负责人
          case 47: // 发送人上级部门角色下的人员(需绑定角色)
          case 7: // 与开始节点处理人相同
          case 6: // 与上一节点处理人相同
          case 12: // 按SQL确定子线程接受人与数据源
          case 601: // 直接上级
          case 602: // 直接上2级
          case 60: // 固定范围选择
          case 44: // 自定义人员选择器
          case 711: // 固定范围选择
          case 5: // 主表字段是人员编号
          case 501: // 从表里字段是人员编号
          case 503: // 字段是部门编号(按部门的领导计算)
          case 53: // 字段是角色编号(按角色智能计算)
          case 54: // 字段是角色编号(仅按角色计算)
          case 502: // 字段是权限组
          case 13: // 由上一节点的明细表来决定子线程的接受人;
          case 18: // 人员路由列表
          case 1801: // 部门路由列表
          case 1802: // 字段路由列表
          case 15: // 由FEE来决定
            break;
          case 0: //按角色智能计算
            accepter.DeliveryParas = accepter.NodeStationsT;
            break;
          case 1: // 按绑定的部门计算
            accepter.DeliveryParas = accepter.NodeDeptsT;
            break;
          case 3: //按绑定的人员计算
            accepter.DeliveryParas = accepter.NodeEmpsT;
            break;
          case 9: //按绑定的角色与部门交集计算
            accepter.DeliveryParas = `部门：${accepter.NodeDeptsT},<br>角色：${accepter.NodeStationsT}`;
            break;
          case 11: //按指定节点的人员角色计算
            accepter.DeliveryParas = accepter.DeliveryParas;
            break;
          case 14: //仅按绑定的角色计算
            accepter.DeliveryParas = accepter.NodeStationsT;
            break;
          case 16: // 按绑定部门计算，该部门一人处理标识该工作结束(子线程)
            accepter.DeliveryParas = accepter.NodeDeptsT;
            break;
          case 19: // 找本部门范围内的角色集合里面的人员
            accepter.DeliveryParas = accepter.NodeDeptsT;
            break;
          case 56: // 按指定的部门集合规则与绑定的角色交集计算
            accepter.DeliveryParas = accepter.NodeStationsT;
            break;
          case 57: // 按指定的角色集合规则与绑定的部门交集计算
            accepter.DeliveryParas = accepter.NodeDeptsT;
            break;
          case 701: // 指定角色模式
            accepter.DeliveryParas = accepter.NodeStationsT;
            break;
          case 52: // 绑定字典(多参数)
            accepter.DeliveryParas = accepter.DeliveryParasT;
            break;
          case 45: // 按照WebAPI计算
            accepter.DeliveryParas = accepter.NodeWebAPIT;
            break;
          case 30: // 仅按绑定的角色计算
            accepter.DeliveryParas = accepter.NodeStationsT;
            break;
          case 61: // 固定范围选择-指能选择组中的人员
            accepter.DeliveryParas = accepter.NodeEmpsT;
            break;
          // 使用人员选择器-主观选择
          case 4: // 自由选择(海选)
            accepter.DeliveryParas = accepter.NodeEmpsT;
            break;
          // 使用人员选择器 - 预先选择;
          case 710: // 自由选择(海选)
            accepter.DeliveryParas = accepter.NodeEmpsT;
            break;
          // 项目组计算
          case 999: // 绑定的角色计算
            accepter.DeliveryParas = accepter.NodeStationsT;
            break;
          case 888: // 自由选择(海选)
            accepter.DeliveryParas = accepter.NodeEmpsT;
            break;
        }
      });

      //设置数据源.
      this.Data = AccepterList;
    }
  }

  //打开页面.
  async LinkFieldClick(record: Record<string, any>) {
    //如果是接收人规则.
    if (this.RequestVal('DoType') == 'Accepter') {
      const nodeID = record.NodeID;
      const url = GloComm.UrlGPE(new GPE_AccepterRole(), nodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    //如果是表单.
    if (this.RequestVal('DoType') == 'Frm') {
      const nodeID = record.NodeID;
      const url = GloComm.UrlGPE(new GPE_FrmSln(), nodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    const flowNo = this.RequestVal('FlowNo');
    if (btnName == '测试运行') {
      const url = GloComm.UrlGenerList('GL_FlowTester', '&FlowNo=' + flowNo);
      return new GPNReturnObj(GPNReturnType.Replace, url);
    }
    if (btnName == '设计表单') {
      const flow = new Flow();
      await flow.Init();
      flow.No = flowNo;
      await flow.RetrieveFromDBSources();
      let frmID = flow.FrmUrl;
      if (frmID == null || frmID == '') frmID = 'ND' + object.NodeID;
      const md = new MapData(frmID);
      await md.RetrieveFromDBSources();
      //绑定多表单打开多表单设置
      if (object.FormType == FormSlnType.SheetTree) {
        const url = GloComm.UrlEn('TS.AttrNode.Sln5', object.NodeID);
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '设置');
      }
      //专业模式等其他模式，打开表单设计器
      const url = md.UrlDesigner() + '&FlowNo=' + flow.No;
      return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer90, url, frmID + ',' + object.Name);
    }
  }
}
