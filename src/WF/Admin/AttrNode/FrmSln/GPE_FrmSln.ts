import { GloWF } from '../../GloWF';
import { FormSlnType } from '../EnumLab';
import { Sln11 } from './Sln11/Sln11';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr, Nodes } from '/@/WF/TSClass/Node';
import { SelfFormEn } from './SelfFormEn';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { EntityTSForm } from '/@/WF/Admin/AttrNode/FrmSln/EntityTSForm';
import HttpHandler from '../../FoolFormDesigner/dto/HttpHandler';
import { FoolTruckFrmNode } from '/@/WF/Admin/AttrNode/FrmSln/Sln10/FoolTruckFrmNode';
import { Flow } from '/@/WF/TSClass/Flow';
import { Sln12 } from './Sln11/Sln12';

export class GPE_FrmSln extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmSln');
    this.PageTitle = '表单方案';
    this.Btns = [
      { pageNo: '2', list: ['设置所有节点都采用此方案'] },
      { pageNo: '5', list: ['设置多表单'] },
      { pageNo: '11', list: ['表单权限', '设置所有节点都采用此方案'] },
      { pageNo: '10', list: ['表单权限', '设置所有节点都采用此方案'] },
    ];
  }

  async Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.FormType; //要编辑的字段.
    //判断是否是极简模式
      debugger
    const flowNo = this.GetRequestVal("FlowNo");
    if(!!flowNo){
      const flow = new Flow();
      flow.No = flowNo;
      await flow.Retrieve();
    
      if(flow.FlowDevModel == 1){
         this.AddGroup('C', '绑定表单库里的表单'); //增加分组.
         this.AddEntity(FormSlnType.RefOneFrmTree, '单表单(绑定独立表单)', new Sln12(), this.RefOneFrmTree);
         return ;
      }
        
    }
    

    //增加子页面.
    this.AddGroup('A', '内置表单'); //增加分组.
    // this.AddEntity(FormSlnType[0], "经典表单(默认)",new Sln5(), this.Desc0);
    // this.AddEntity(FormSlnType.FoolForm, '经典表单(默认)', new FrmSlnEn0(), this.FoolForm);
    this.Blank(FormSlnType.FoolForm, '节点表单(默认)', this.FoolForm);
    //  this.Blank(FormSlnType.Developer, '开发者表单', this.Developer);
    this.SelectItemsByList(FormSlnType.RefNodeFrm, '引用其它节点表单', this.RefNodeFrm, false, GloWF.sqlNodeFrmList, NodeAttr.NodeFrmID);
    this.Blank(FormSlnType.FoolTruck, '累加表单', this.FoolForm);
    // this.Blank(FormSlnType.FoolForm, '经典表单(默认)', this.FoolForm);
    // this.Blank(FormSlnType.Developer, '开发者表单', this.Developer);
    // this.Blank(FormSlnType, "章节表单(beta)", this.Desc0);
    // this.Blank(FormSlnType.FreeForm, "自由表单(2021年以后不再支持)", this.Desc0);
    // this.Blank(FormSlnType.FoolTruck, '累加模式表单(将要取消支持)', this.FoolTruck);
    this.AddGroup('B', '自定义表单'); //增加分组.
    //this.SingleTB(FormSlnType.SelfForm, '嵌入式表单', NodeAttr.FormUrl, this.SelfForm, '请输入嵌入式表单的URL');
    this.AddEntity(FormSlnType.SelfForm, '嵌入式表单', new SelfFormEn(), this.SelfForm);

    //  this.SingleTB(FormSlnType.SDKForm, 'SDK表单(自定义的表单)', NodeAttr.FormUrl, this.SDKForm, '请输入表单的URL');
    this.AddEntity(FormSlnType.SDKForm, 'SDK表单', new SelfFormEn(), this.SDKForm);

    //this.SingleTB(FormSlnType.SDKFormSmart, '智能SDK表单(自定义的表单)', 'FormUrl', this.SDKForm, '请输入表单的URL');
    this.AddGroup('C', '绑定表单库里的表单'); //增加分组.
    this.AddEntity(FormSlnType.RefOneFrmTree, '单表单(绑定独立表单)', new Sln11(), this.RefOneFrmTree);
    //  this.AddEntity(FormSlnType.SheetTree, '多表单(表单树)', new Sln5(), this.SheetTree);
    this.Blank(FormSlnType.SheetTree, '多表单', this.SheetTree);
    // this.AddGroup('C', '绑定高代码TS'); //增加分组.
    this.AddEntity(FormSlnType.EntityTS, '绑定高代码TS', new EntityTSForm(), this.EntityTS);
  }
  public async AfterSave(_pageID: string, _pageVal: any) {
    if (_pageID == FormSlnType.FoolForm.toString() || _pageVal == FormSlnType.Developer.toString()) {
      const node = new Node(this.RefPKVal);
      await node.Retrieve();
      node.NodeFrmID = '';
      await node.Update();
    }
    if (_pageID == FormSlnType.FoolTruck.toString()) {
      const node = new Node(this.RefPKVal);
      await node.Retrieve();
      node.NodeFrmID = 'ND' + this.RefPKVal;
      await node.Update();
      const nodes = new Nodes();
      await nodes.Retrieve('FK_Flow', node.FK_Flow, 'Step');
      for (const jsNode of nodes) {
        if (jsNode.NodeID === parseInt(this.RefPKVal)) continue;
        if (jsNode.NodeType != 0) continue;
        const frmNode = new FoolTruckFrmNode();
        frmNode.MyPK = 'ND' + jsNode.NodeID + '_' + node.NodeID + '_' + node.FK_Flow;
        if ((await frmNode.RetrieveFromDBSources()) == 0) {
          frmNode.FK_Frm = 'ND' + jsNode.NodeID;
          frmNode.FK_Node = node.NodeID;
          frmNode.FK_Flow = node.FK_Flow;
          frmNode.FrmSln = 1;
          //frmNode.SetPara('EnName', 'TS.AttrNode.FrmNodeCtrlSln');
          await frmNode.Insert();
        }
      }
    }
  }
  public async BtnClick(_pageID: string, _pageVal: any, _btnName: string) {
    //  debugger;
    // if (pageID == pageVal || pageID === btnName) )throw new Error('方法暂未实现');
    if (_pageID == '2') {
      if (window.confirm('您确定要执行吗？请仔细阅读执行说明。') == false) return '';
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
      handler.AddPara('FK_Node', this.entity?.NodeID);
      const data = await handler.DoMethodReturnJson('SelfForm_SetAllNodeFrmUseThisSln');
      return data;
    }
    if (_pageID == '5') {
      const url = GloComm.UrlEn('TS.AttrNode.Sln5', this.entity?.PKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '设置');
    }
    if (_pageID == '11' && _btnName == '设置所有节点都采用此方案') {
      if (window.confirm('您确定要执行吗？请仔细阅读执行说明。') == false) return '';
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
      handler.AddPara('FK_Node', this.entity?.NodeID);
      const data = await handler.DoMethodReturnJson('RefOneFrmTree_SetAllNodeFrmUseThisSln');
      return data;
    }
    if (_pageID == '11' && _btnName == '表单权限') {
      const node = new Node(this.entity?.NodeID);
      await node.Retrieve();
      const MyPK = node.NodeFrmID + '_' + node.NodeID + '_' + node.FK_Flow;
      const url = GloComm.UrlEn('TS.AttrNode.FrmNode11', MyPK);
      // alert(url);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '设置');
    }
    //累加表单
    if (_pageID == '10') {
      if (_btnName == '设置所有节点都采用此方案') {
        if (window.confirm('您确定要执行吗？请仔细阅读执行说明。') == false) return '';
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
        handler.AddPara('FK_Node', this.entity?.NodeID);
        const data = await handler.DoMethodReturnJson('FoolTruck_SetAllNodeFrmUseThisSln');
        return data;
      }
      if (_btnName == '表单权限') {
        const url = GloComm.UrlEn('TS.AttrNode.Sln10', this.entity?.PKVal);
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '表单权限');
      }
    }
    throw new Error('方法暂未实现');
  }

  public readonly FoolForm = `

  #### 帮助
   - 视频教程: https://drive.weixin.qq.com/s?k=AOsAZQczAAY9NtLjEw
   - 设计方便，界面简洁清晰。
   - 字段的顺序可以通过拖拽实现移动,通过栅栏格来布局界面元素。
   - 可以通过定义文本属性来体现不同控件的展示要求（文本，单选，多选，定位，评分，多附件，地图，身份证识别等）满足表单要求。
 
  #### 图例1
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FoolFrmD.png "屏幕截图.png")
   
  #### 图例2
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FoolFrmD2.png "屏幕截图.png")
 
  #### 表单模式
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/shagua1.png "屏幕截图.png")
   
  `;

  public readonly Developer = `
  #### 帮助
   - 支持编写js,Html模式，使用富文本编辑器开发.
  #### 样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/kaifaze.png "屏幕截图.png")
  `;

  //引用指定节点的表单.
  public readonly RefNodeFrm = `
  #### 帮助
   - 支持编写js,Html模式，使用富文本编辑器开发.
  #### 样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/kaifaze.png "屏幕截图.png")
  `;
  public readonly FoolTruck = `
  #### 帮助
   - 该表单是以经典表单展示，也叫累加表单，也叫轨迹表单。
   - 每个节点上都有自己的一个字段集合, 当前节点的表单是以前表单按照走过的顺序累加（默认字段只读）加上当前节点表单拼接而成的。
   - 该表单设计简单，思路清晰，适用于在审核组件模式下不能解决的审核节点特殊字段数据的采集。
   - 该表单是审核组件模式表单的有益补充。
  `;

  public readonly SelfForm = `
  #### 定义
 - 嵌入模式的表单，就是开发者自定义个一个表单，然后把表单的地址绑定到节点属性的一种做法。
 - 该模式下，系统在运行的过程中，头部使用工具栏，尾部使用审核组件。
 - 开发者自己定义的页面有一个Save() 的 function ，当用户点击框架外面的工具栏上的【保存】按钮或者【发送】按钮，就会触发这个函数。
 - 您需要在Save()的function里完成数据完整性效验与数据保存，或者调用ccbpm的接口把参数传入到流程引擎里面去.
 - 该方法: 如果保存成功就return true, 保存失败就return false. 用于校验数据填写的完整性. 比如:当用户执行发送的时候，首先执行保存，保存成功后在执行发送，保存失败后，就阻止发送。
 - 您输入的Url可以有参数，但是系统会把所有的参数附件到该url后面。
 - 例如:/SDKFlowDemo/QingJia/SDKQianRuFangShiForm.htm(也可能是vue的路由页面/src/App/Demo/VueSelfFrm/QingJia.vue.例如： http://localhost:3000/#/QingJia)
 - 比如:您配置的url为 http://xxxx:222:/abc.htm 系统实际的Url为 http://xxxx:222:/abc.htm?FK_Flow=xxx&FK_Node=xxx&WorkID=xxx&UserNo=xxx&Token=xxx
 - 系统会把当前流程环境中的变量与参数都传递到您的自定义页面上来，您可以根据这些参数来展示，保存数据，控制数据只读，可编辑。
 #### 工作示意图
 - 头部：工具栏, 尾部:审核组件, 中间部门自定义url.
 - 图：
 ![嵌入模式表单](./resource/WF/Admin/AttrNode/FrmSln/SelfFrm/SelfFrm.png "嵌入模式表单.")
 - 该模式充分利用ccbpm提供的toolbar功能, 启用禁用流程功能按钮，在节点属性里设置. 
 - 审核组件的禁用启用，在表单属性=》表单=》设置，或者在流程属性里批量设置。

 #### Url跟目录定义
 - 本机文件: 在ccbpm前端目录里开发的表单文件.
 - 全路径: 比如：http://xxx.ccbpm.cn/xx.htm
 - 子系统设置: 在流程模板目录上设置的路径,在流程目录上点属性设置路径.
 - 图：
 ![嵌入模式表单](./resource/WF/Admin/AttrNode/FrmSln/SelfFrm/systemSetting.png "路径设置.")
 - ccbpm 会读取第一个设置作为表单的根目录.
 - 全局配置文件(.env):  配置在.env 的http路径变量.  VITE_GLOB_API_URL
 - 系统参数(PC端FrmUrl,移动端:MobileFrmUrl) 启动或者运行流程的过程中通过调用api Node_SaveParas() 方法写入的参数的Url, ccbpm就获取这个参数作为url的路径.

 ##### 1)、操作步骤:
      (1). /WF/API/Port_Login (如果已经执行登录就忽略）
      (2). /WF/API/Node_CreateBlankWorkID (创建流程运行实例)
      (3). /WF/API/Node_SaveParas (设置FrmUrl)
 ![嵌入模式表单](./resource/WF/Admin/AttrNode/FrmSln/SelfFrm/SelfFrmUrl.png "嵌入模式表单.")

 #### 如何向流程引擎写入参数?
 - 在流程运行的过程中,需要向流程引擎写入参数,用于控制:流程方向转向、以及接受人等.
 - ccbpm提供两种方法:
 1. 在保存方法里调用API接口.
 2. 在保存方法里，返回指定的格式的json: 

 #### Url全路径配置
 - **嵌入式表单Url全路径配置**：查阅[操作手册](https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8346570&doc_id=31094)
  `;
  public readonly SDKFormSmart = `
  #### 帮助
  1. 如果要在您的业务表单上跑流程，仅仅要做的是把 SmartSDKFrm.js 放入到您的页面里面。
  1. 系统就会自动生成流程引擎的控制toolbar， toolbar 的按钮权限在节点属性里直接控制。
  1. 您可以充分利用ccbpm的很多组件功能，比如：定位、地图、拍照、附件、评论、写字板、超链接组件等等。
  `;
  public readonly SDKForm = `

  #### 帮助
  1. SDK表单就是ccbpm把界面的展现完全交给了开发人员处理,开发人员只要设计一个表单,增加一个发送按钮,调用ccbpm的发送API就可以完成。
  1. 如果使用绝对路径可以使用ccbpm的全局变量@SDKFromServHost ，比如: @SDKFromServHost/MyFile.htm
  1. 例如:/SDKFlowDemo/QingJia/S1_TianxieShenqingDan.jsp , /SDKFlowDemo/QingJia/S1_TianxieShenqingDan.htm
  1. ccbpm团队为您提供了一个demo流程 \流程树\SDK流程\ 该目录下有很多SDK模式的流程供您参考。
  #### 样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/SDKFrm.png "屏幕截图.png")
  `;
  public readonly RefOneFrmTree = `
  #### 帮助
   - 表单库里选择一个表单绑定到当前节点上,该模式我们也称为绑定独立表单.
   - 一个表单可以被多个流程模板绑定，这个表单模板就可以重用. 
   - 比如: 集团IT部门发布一个请假表单，一个公文格式表单，各个子公司都可以使用。
   - 我们可以在每个节点上通过节点与表单的关系设置，字段的可见，可用，只读等操作，满足不同的场景使用。
   - 该表单的工作方式与内置表单工作模式一致, 上面是工具栏下面是表单.

  #### 设置所有的节点都采用此表单
   - 驰骋工作流从理论上来说，没个节点都可以绑定不同的单个表单，但是实践的场景是一个流程模板，通常绑定一个表单。
   - 系统提供这个功能，方便设计人员，一次性就可以绑定表单.
   - 我们通过节点与表单的设计实现该表单工作场景，如下说明.
  #### 节点与表单的关系
   - 

  #### 工作样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/ziyou.png)
 
  `;
  // 绑定表单树的表单.
  public readonly SheetTree = `

  #### 帮助
   - 当一个节点需要绑定多个表单的时候，我们把这样的节点称为多表单节点，或者表单树节点。
   - 比如: 项目申报流程，提报项目的时候（开始节点）需要提交，项目基本信息、项目环评信息、项目风险评估、项目实施计划书。

   #### 功能说明
   - 如果在每个节点上，绑定不同的表单，就要在每个节点上单独绑定. 比如: 开始节点绑定3个表单，第2个节点绑定10个表单。
   #### 表单节点关系
   - 一个表单可以绑定一个流程的不同节点上，每个节点与这个表单，都有一个设置关系，我们称为表单节点关系。

   #### 表单展现方式
   - 我们把一个节点需要绑定多个表单的节点称为多表单节点，它有两种展现方式，标签页与表单树。
   - 对应的流程demo：\流程树\表单解决方案\树形表单与多表单。
  `;
  public readonly EntityTS = `
  #### 帮助
   - 在我们的写的TS的Entity中选择其中一个绑定到当前节点上，该模式我们也称为绑定高表单。
   - 一个实体Entity可以被多个流程模板绑定。
  `;
}
