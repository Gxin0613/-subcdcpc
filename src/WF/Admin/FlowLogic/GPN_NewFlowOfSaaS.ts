import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '../GloWF';
import { message } from 'ant-design-vue';
import { FlowDevModel } from '../EnumLab';
import { useClassFactoryLoader } from '/@/hooks/ens/useClassFactoryLoader';
import { GloComm } from '../../Comm/GloComm';
import { Orgs } from '../SaaS/Org';

export class GPN_NewFlowOfSaaS extends PageBaseGroupNew {
  constructor() {
    super('GPN_NewFlowOfSaaS');
    this.PageTitle = '新建流程';
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '内置表单模式');
    this.TextBox1_Name('JiJian', '极简模式', this.JiJian, '流程名称', '我的极简流程');
    this.TextBox1_Name('Profession', '专业模式', this.Profession, '流程名称', '我的专业流程');
    // this.TextBox1_Name('2', '累加表单', this.Docs2, '流程名称', '我的累加表单流程');
    // this.TextBox1_Name('10', '开发者表单', this.Docs10, '流程名称', '我的开发者表单流程');
    this.AddGroup('B', '绑定表单模式');
    this.TextBox1_Name('RefOneFrmTree', '绑定单表单', this.RefFrm, '流程名称', '我的单表单流程');
    this.SelectItemsByGroupList('RefOneFrmTree.SelectOneFrm', '选择表单', this.RefFrm_SelectOneFrm, false, GloWF.srcFrmTree, GloWF.srcFrmList);

    this.TextBox1_Name('FrmTree', '绑定多表单', this.FrmTree_SelectFrms, '流程名称', '我的多表单流程');
    this.SelectItemsByGroupList('FrmTree.SelectFrms', '选择表单', this.FrmTree_SelectFrms, true, GloWF.srcFrmTree, GloWF.srcFrmList);

    this.AddGroup('C', '使用AI创建');
    this.AddHelp('AI', '使用AI创建', '使用AI创建,调用AI大模型创建流程.');
    const url = GloComm.UrlGPN('GPN_AIFlowNew', '', '&SortNo=123'); // '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
    this.AddGoToUrl('AI.AIFlow', '使用AI创建', url);

    // this.AddGroup('C', '自定义表单模式');
    // this.TextBox2_NameNo('QianRuFrm', '嵌入式表单', this.QianRuFrm, '', '流程名称', 'URL', '');
    // this.TextBox2_NameNo('SDKFrom', 'SDK表单', this.QianRuFrm, '', '流程名称', 'URL', '');

    // this.TextBox3_NameNoNote("3", "绑表单库的表单",this.Docs1, "Frm_", "表单ID", "表单名称", "存储表");
    // this.TextBox3_NameNoNote("4", "表单树",this.Docs1, "Frm_", "表单ID", "表单名称", "存储表");
    //其他类型表单.
    // this.AddGroup('C', '自定义表单');
    // this.TextBox2_NameNo('QianRuFrm', '嵌入式表单', this.QianRuFrm, '', '流程名称', 'URL', '');

    // this.TextBox2_NameNo('SDKFrmWorkID', 'WorkID主键表单', this.SDKFrmWorkID, '', '流程名称', 'URL', '');
    // this.TextBox3_NameNoNote('SDKFrmSelfPK', '自定义主键表单', this.SDKFrmSelfPK, '', '流程名称', 'URL', '主键参数', '');

    //  this.AddGroup('D', '任务树流程(实验中)');
    // this.TextBox1_Name('TaskTreeSimple', '简洁模式', this.TaskTree, '流程名称', '我的任务树-简洁模式');
    // this.TextBox1_Name('TaskTreeFrm', '绑定表单模式', this.TaskTree, '流程名称', '我的任务树-表单模式');

    // this.AddGroup('E', '实验中的功能');
    // this.TextBox1_Name('FrmExcel', 'Excel表单', this.FrmExcel, '流程名称', '我的Excel表单流程', '请输入流程名称');
    // this.TextBox1_Name('FrmWord', 'Word表单', this.FrmExcel, '流程名称', '我的Word表单流程', '请输入流程名称');

    // this.TextBox1_Name('7', '开发者表单', this.Desc100, '流程名称', '物联网-开发者表单');
    // this.FileUpload('100', '导入本机流程模板', '文件模板', this.Desc100);
    // this.FileUpload('101', '导入网络流程模板', '文件模板', this.Desc100);

    //  this.TextBox1_Name('TSEntity', 'TSEntity模式', this.TSEntity, '流程名称', 'TSEntity模式');
    // this.SelectItemsByList('TSEntity.EnName', '选择实体', this.TSEntity, false, await this.GenerEnsList());
    // this.AddGroup('D', '物联网流程模式(规划中)');
    // this.TextBox1_Name('7', '开发者表单', this.Desc100, '流程名称', '物联网-开发者表单');
    // this.TextBox1_Name('8', '其他模式', this.Desc100, '流程名称', '开发者表单-其他模式');
    // this.AddGroup('E', '导入流程模板(规划中)');
    // this.FileUpload('100', '导入本机流程模板', this.Desc100);
    // this.FileUpload('101', '导入网络流程模板', this.Desc100);
  }

  public async GenerEnsList() {
    const factory = await useClassFactoryLoader('ClassFactory');
    return await factory.toJSON([]);
    // return Promise<emps>;
    // return emps;
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts() {
    const ens = new Orgs();
    await ens.RetrieveAll();
    return ens;
    // return Promise.resolve([]);
  }
  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    // this.TextBox2_NameNo('SDKFrm', 'SDK表单', this.Docs5, '', '流程名称', 'URL', '');
    // this.TextBox2_NameNo('QianRuFrm', '嵌入式表单', this.QianRuFrm, '', '流程名称', 'URL', '');
    // alert(pageID);
    if (pageID == 'AI.AIFlow') {
      const url = GloComm.UrlGPN('GPN_AIFlowNew', '', '&SortNo=' + sortNo); // '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    //如果是专业或者极简模式.
    if (pageID === 'Profession' || pageID === 'JiJian') {
      const flowName = tb1;
      const FrmUrl = tb2;
      let model = FlowDevModel.Prefessional;
      if (pageID == 'JiJian') model = FlowDevModel.JiJian;
      const flowNo = await this.creteFlow(sortNo, model, flowName, FrmUrl, tb3);
      if (flowNo == null) return;
      // windowOpen(href, this.PageTitle as string);
      //补充一下代码，如何打开流程设计器.
      // @zhoupeng 抽屉打开 '/@/WF/Admin/FlowDesigner/index.vue?FlowNo=' + flowNo;
      //            return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      // 新窗口打开  '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      //        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      //这里没有解析
      // const { VITE_GLOB_WFPlant } = getAppEnvConfig();
      // if (!!VITE_GLOB_WFPlant || VITE_GLOB_WFPlant == 'CCFlow') {
      //   const url = '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      //   return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
      // }

      // const { VITE_GLOB_WFPlant } = getAppEnvConfig();
      // if (VITE_GLOB_WFPlant == 'Flowable') {
      //   //初始化flowable的流程模板.
      //   const handler = new HttpHandler('bp.flowable.httphandler.flowable_AdminFlow');
      //   handler.AddPara('No', flowNo);
      //   const data = await handler.DoMethodReturnString('CreateFlowableTemplate');
      //   if (data.includes('err@')) {
      //     alert(data);
      //     return;
      //   }
      //   const url = 'http://xxxxxxxxx:9090/WF/Do.html?FlowNo=' + flowNo + '&Token=' + WebUser.Token;
      //   return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
      // }

      //const url = '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      const url = GloComm.UrlFlowD(flowNo);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
      // }
    }

    //自定义表单模式.
    if (pageID == 'SDKFrmWorkID' || pageID == 'SDKFrmWorkID' || pageID == 'QianRuFrm') {
      const flowName = tb2;
      const FrmUrl = tb1;
      const flowNo = await this.creteFlow(sortNo, FlowDevModel.SDKFrm, flowName, FrmUrl, tb3);
      if (flowNo == null) return;

      // const url = '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      const url = GloComm.UrlFlowD(flowNo);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    //绑定单表单流程. RefOneFrmTree.SelectOneFrm
    if (pageID === 'RefOneFrmTree.SelectOneFrm') {
      const flowName = this.RequestVal('tb1', 'RefOneFrmTree');
      const frmID = tb1;
      const flowNo = await this.creteFlow(sortNo, FlowDevModel.RefOneFrmTree, flowName, frmID, tb3);
      if (flowNo == null) return;
      //  const url = '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      const url = GloComm.UrlFlowD(flowNo);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    //绑定表单库的表单.
    if (pageID === 'FrmTree.SelectFrms') {
      const flowName = this.RequestVal('tb1', 'FrmTree');
      const frmID = tb1;
      const flowNo = await this.creteFlow(sortNo, FlowDevModel.FrmTree, flowName, frmID, tb3);
      if (flowNo == null) return;

      // const url = '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      const url = GloComm.UrlFlowD(flowNo);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    //如果是vsto表单.
    if (pageID === 'FrmExcel' || pageID === 'FrmWord') {
      const flowName = tb1;
      const FrmUrl = tb2;
      let model = FlowDevModel.FrmWord;
      if (pageID == 'FrmExcel') model = FlowDevModel.FrmExcel;
      if (pageID == 'FrmWord') model = FlowDevModel.FrmWord;

      const flowNo = await this.creteFlow(sortNo, model, flowName, FrmUrl, tb3);
      if (flowNo == null) return;

      // windowOpen(href, this.PageTitle as string);
      //补充一下代码，如何打开流程设计器.
      // @zhoupeng 抽屉打开 '/@/WF/Admin/FlowDesigner/index.vue?FlowNo=' + flowNo;
      //            return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      // 新窗口打开  '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      //        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      //这里没有解析
      //  const url = '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      const url = GloComm.UrlFlowD(flowNo);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
    if (pageID === 'TaskTreeSimple') {
      const flowName = tb1;
      const FrmUrl = tb2;
      const model = FlowDevModel.TaskTree;
      const flowNo = await this.creteFlow(sortNo, model, flowName, FrmUrl, tb3);
      if (flowNo == null) return;

      // windowOpen(href, this.PageTitle as string);
      //补充一下代码，如何打开流程设计器.
      // @zhoupeng 抽屉打开 '/@/WF/Admin/FlowDesigner/index.vue?FlowNo=' + flowNo;
      //            return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      // 新窗口打开  '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      //        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      //这里没有解析
      message.info('流程创建成功,模板编号:' + flowNo);
      // const url = '/#/WF/Designer/EditFlow?FlowNo=' + flowNo;
      const url = GloComm.UrlFlowD(flowNo);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
  }

  public async creteFlow(sortNo: string, devModel: FlowDevModel, flowName: string, frmID_URL: string, frmPK: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner_FlowDevModel');
    handler.AddPara('SortNo', sortNo);
    handler.AddPara('FlowName', flowName);
    handler.AddPara('FlowDevModel', devModel);
    handler.AddPara('FrmUrl', frmID_URL);
    handler.AddPara('FrmPK', frmPK);
    const data = await handler.DoMethodReturnString('FlowDevModel_Save_SaaS');
    if (data == undefined || data == null) {
      message.info('创建失败:' + data);
      return null;
    }

    message.info('流程创建成功,模板编号:' + data);
    return data;
  }

  public readonly TaskTree = ` 
  #### 帮助
  - 场景：张三把任务分配给N个人, N 个人都需要向张三汇报(也可以不汇报), N个人中间的任何人，都可以在继续分配给M个人，同样M也可以继续分配给Y个人。我们把这样的模式的流程称为任务树流程。
  - 根据分配任务的特征，被分配的人需要向上级汇报，可以查看下级的任务内容。
  
  `;

  public readonly Desc100 = '暂未开放';

  //使用WorkID做为表单主键.
  public readonly FrmExcel = `
  #### 帮助
  - 借助Excel的功能实现的流程表单.
  - 使用vsto技术来实现, 对于客户安装的office版本于环境有一定的要求.
  - 需要借助插件.

  #### 应用场景
  1. 复杂的科学计算.
  1. 客户使用的表单已经是excel的模式成为了习惯.
  `;

  //使用WorkID做为表单主键.
  public readonly SDKFrmWorkID = `
  ####  帮助
  - 每次新建一个单据之前, 要通过ccbpm的接口,根据模板编号生成一个WorkID作为该单据的主键.
  - 设计表单的主表的时候建议采用OID做为主键,可以是varchar(20), 用于存储表单的主键。
  - 从发起、待办、在途、已完成页面打开表单的时候.，系统传入 xxxx.htm?WorkID=xxx&FK_Node=xxxx 打开表单.
  - 我们把这样的模式称为 WorkID做主键的模式表单，因为该表单的主键生成是通过流程模板编号与当前用户信息生成的.

  ### 表单开发要求
  1. 接受WorkID=xxx传来的参数，用于提取表单数据,并渲染.
  2. 接受NodeID=xxx的参数，用于判断表单的元素只读、隐藏.
  2. 表单里必须有一个Save()的方法.
  1. 对于vue在表单的头部，尾部增加toolbar工具栏组件，WorkCheck审核组件.
  1. 对于html表单需要增加 toolbar,workcheck的标记，详细请参考demo.

  #### 如果您的业务系统与ccbpm是数据库合并的.
  1. 表单的主键设置 OID ，设置varchar(30) ,做主键.
  1. 打开流程属性让流程的业务表与该表单的表设置保持一致.
  1. 流程运转的时候，系统就会自动扩展该表的自动增加上，流程的系统自动字段.
  1. 比如: OID,WFState(状态),Title(流程标题),FlowEndNode(停留节点),Emps(参与人),FlowStarter(发起人),FlowStartRDT(发起日期) ....
  
  #### 如果两个数据库不是合并的.
  1. 可以通过OID,与流程引擎注册表 WF_GenerWorkFlow 关联查询获得流程运转信息.
  1. 可以通过事件把流程运转的信息写入到单据表里,比如:节点发送前事件,流程结束事件.

  #### 应用场景
  1. 应用于ccbpm的内置表单不能满足要求，需要自定义表单.
  1. 新建的单据.
  `;

  //自定义表单主键模式.
  public readonly SDKFrmSelfPK = `
  ####  帮助
  - 单据的增删改查工作已经通过自己的系统完成了, 每个单据都有自己的主键(一般称为单据编号)
  - 开发者期望使用ccbpm把单据列表的一行记录(一个单据)使用流程流转起来.
  - 比如: 有一个新闻列表，每条新闻右侧有个审批按钮,启动对该新闻的发布审批流程.
  - 我们把这样的模式称为自定义主键模式表单，因为该表单的主键生成是通过自己的架构生成的.
  #### 主键参数
  - 打开一个单据页面的主键参数, 比如: /XXX/BuyBill.vue?DJBH=xxxxx
  - DJBH就是主键参数.
  - 定义：打开单据表单的主键ID的参数名，就称为主键参数.
  #### 发起流程调用
  - 当发起流程的时候，开发者需要把主键参数传入到工作流处理器. /WF/MyFlow.vue?FK_Flow=001&DJBH=xxxx 
  - ccbpm就会转到您的自定义的url页面，比如: /XXX/BuyBill.vue?DJBH=xxxxx&WorkID=xxx&FK_Node=111&UserNo=xxx&Token=xxx
  - 打开您的单据.
  #### 待办调用
  - 不需要开发者处理，系统就会自动的把主键参数传递给您.

  ### 表单开发要求
  1. 接受NodeID=xxx的参数，用于判断表单的元素只读、隐藏.
  1. 表单里必须有一个Save()的方法.
  1. 对于vue在表单的头部，尾部增加toolbar工具栏组件，WorkCheck审核组件.
  1. 对于html表单需要增加 toolbar,workcheck的标记，详细请参考demo.

  #### 应用场景
  - 历史表单改造起来成本太高,可以保持数据结构的不变化,而使用上ccbpm.
  - 

  `;

  // 专业模式
  public readonly TSEntity = `
       
  #### 帮助
   - 该模式是使用TSEntity编码的模式实现表单的控制.
   - 首先写一个子类从基类上集成下来.
   #### 流程
    

   `;
  // 专业模式
  public readonly Profession = `       
  #### 帮助
   - 专业模式就是任何节点的表单方案都可单独定制和设计，它适应于更复杂的环境配置。
   - 该模式的表单定义是自由的，每个节点上都可以定义不同的表单方案。
   - 每个节点上都可以灵活定义个性化的表单，而不需要统一管理。
   #### 表单图例
   ![输入图片说明](./resource/WF/Admin/Img/ZhuanYeBiaoDan_1.png "表单设计")
   ![输入图片说明](./resource/WF/Admin/Img/ZhuanYeBiaoDan_2.png "表单设计")

   `;
  // 极简模式
  public readonly JiJian = `
  #### 帮助
   - 视频教程: https://drive.weixin.qq.com/s?k=AOsAZQczAAYH6pM5dn
   - 极简模式是采用经典表单+审核组件实现流程审核的一种模式。
   - 开始节点填写申请，以后的节点都是审批，我们把这样的模式称为极简模式。
   - 在极简模式下，每个节点右键上有一个审核组件状态（启用，禁用，只读）。
  #### 图例
  ![输入图片说明](./resource/WF/Admin/Img/JiJian.jpg "极简模式.png")
        
  `;
  // 累加表单说明
  public readonly Docs2 = `
  #### 帮助
   - 累加表单模式是经典表单模式的一种，它是在每个节点上都设置自己的表单。
   - 流程在运动的过程中，把所有经过的表单都串联起来组成一个完整的表单。
   - 累加表单容易理解与设计，一般在开始节点上设置申请单的内容，在其他节点上设置审核分组表单就可以完成审核的需求场景。
  `;

  public readonly Docs10 = `
  #### 帮助
   - 支持编写js,Html模式，使用富文本编辑器开发。
  #### 图例
  ![输入图片说明](./resource/WF/Admin/Img/kaifaze.png "屏幕截图.png") 
`;
  // 绑定表单库的表单
  public readonly RefFrm = `
  #### 帮助
   - 视频教程: https://drive.weixin.qq.com/s?k=AOsAZQczAAYyuEwsm1
   - 表单库的表单称为独立表单，每个表单都可以与任何流程的任何节点绑定。
   - 一个表单类似于一个车厢，停留在仓库里，只有他在被绑定到节点上才可以使用。
   - 每个节点就类似于火车头，一个火车头可以挂多个车厢，也可以挂一个车厢。
   - 一个节点挂一个表单，我们称为单表单流程，多个表单称为表单树流程。
   - 表单的权限控制: 一个节点挂接一个表单有权限控制，控制整体表单只读、可见、可编辑，可控制每个表单元素的状态特征。
  #### 图例
  ![输入图片说明](./resource/WF/Admin/Img/Frms.jpg "屏幕截图.png")    
  `;
  public readonly RefFrm_SelectOneFrm = `
  #### 帮助  
   - 表单库的表单称为独立表单，每个表单都可以与任何流程的任何节点绑定。
   - 一个表单类似于一个车厢，停留在仓库里，只有他在被绑定到节点上才可以使用。
   - 每个节点就类似于火车头，一个火车头可以挂多个车厢，也可以挂一个车厢。
   - 一个节点挂一个表单，我们称为单表单流程，多个表单称为表单树流程。
   - 表单的权限控制: 一个节点挂接一个表单有权限控制，控制整体表单只读、可见、可编辑，可控制每个表单元素的状态特征。
  #### 图例
  ![输入图片说明](./resource/WF/Admin/Img/Frms.jpg "屏幕截图.png")    
  `;
  public readonly FrmTree_SelectFrms = `
  #### 帮助
   - 表单库的表单称为独立表单，每个表单都可以与任何流程的任何节点绑定。
   - 一个表单类似于一个车厢，停留在仓库里，只有他在被绑定到节点上才可以使用。
   - 每个节点就类似于火车头，一个火车头可以挂多个车厢，也可以挂一个车厢。
   - 一个节点挂一个表单，我们称为单表单流程，多个表单称为表单树流程。
   - 表单的权限控制: 一个节点挂接一个表单有权限控制，控制整体表单只读、可见、可编辑，可控制每个表单元素的状态特征。
  #### 图例 -1
  ![输入图片说明](./resource/WF/Admin/Img/Tree1.png "屏幕截图.png") 
  #### 图例 -2
  ![输入图片说明](./resource/WF/Admin/Img/Tree.png "屏幕截图.png") 

  `;
  public readonly Docs5 = `
  #### 帮助
   - SDK表单就是ccbpm把界面的展现完全交给了开发人员处理,开发人员只要设计一个表单,增加一个发送按钮,调用ccbpm的发送API就可以完成
   - 表单的渲染，都是由开发人员完成，对流程的操作调用不同的接口即可。
   - 这种模式适应于比较复杂的表单但是ccform又满足不了用户的要求的情况下使用sdk表单。
   - 关于该表单的调用接口可以参考：流程属性\开发接口。
  ![输入图片说明](./resource/WF/Admin/Img/SDKFrm.png "屏幕截图.png")     
   `;

  public readonly QianRuFrm = `
  #### 帮助
   - 您可以定义一个页面，绑定到该节点上. 
   - 该页面里面有一个Save() 的 function ，当用户点击框架外面的工具栏上的【保存】按钮或者【发送】按钮，就会触发这个函数。
   - 您需要在Save()的function里完成数据完整性效验与数据保存。
   - 如果保存成功就return true, 保存失败就return false. 比如:当用户执行发送的时候，首先执行保存，保存成功后在执行发送，保存失败后，就阻止发送。
   - 您输入的Url可以有参数，但是系统会把所有的参数附件到该url后面。
   - 例如:/SDKFlowDemo/QingJia/SDKQianRuFangShiForm.htm 。
   - 比如:您配置的url为 http://xxxx:222:/abc.htm 系统实际的Url为 http://xxxx:222:/abc.htm?FK_Flow=xxx&FK_Node=xxx&WorkID=xxx&UserNo=xxx&Token=xxx
   - 系统会把当前流程环境中的变量与参数都传递到您的自定义页面上来，您可以根据这些参数来展示，保存数据，控制数据只读，可编辑。
   - 如果使用绝对路径可以使用ccbpm的全局变量@SDKFromServHost ，比如: @SDKFromServHost/MyFile.htm

  #### 样例1
  ![输入图片说明](./resource/WF/Admin/Img/SelfFrm.png "屏幕截图.png")    

  #### 样例2
  ![输入图片说明](./resource/WF/Admin/Img/SDKFrm.png "屏幕截图.png")  
  `;
}
function getAppEnvConfig(): { VITE_GLOB_WFPlant: any } {
  throw new Error('Function not implemented.');
}
