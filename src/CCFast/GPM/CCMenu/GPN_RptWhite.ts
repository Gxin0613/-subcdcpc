import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
// import { Module, Modules } from '../Module';
import { Menu } from '../../GPM/CCMenu/Menu';
import { MenuModel } from '../../GPM/CCMenu/MenuModel';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Func } from '../../CCBill/Sys/Func';
import { message } from 'ant-design-vue';
import { SFTable } from '/@/WF/Admin/FrmLogic/SFTable/SFTable';
import { ClassFactoryBase, useClassFactoryLoader } from '/@/hooks/ens/useClassFactoryLoader';
import DBAccess from '/@/utils/gener/DBAccess';
import { GenerListEn } from '../../CCBill/GenerListEn/GenerListEn';
import { GloComm } from '/@/WF/Comm/GloComm';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import { Flow } from '/@/WF/TSClass/Flow';
import { FlowAdm } from '/@/WF/TSClass/Admin/FlowAdm';
import { FlowDtlView } from '../../CCBill/DBList/FlowDtlView';
import { buildShortUUID } from '/@/utils/uuid';
import { GloWF } from '/@/WF/Admin/GloWF';
import { FrmDtlView } from '../../CCBill/DBList/FrmDtlView';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPN_NewFlow } from '/@/WF/Admin/FlowLogic/GPN_NewFlow';
import { FlowDevModel } from '/@/WF/Admin/EnumLab';
import { FlowSort } from '/@/WF/TSClass/Admin/FlowSort';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { MySystem } from '../MySystem';
import { FrmSort } from '/@/WF/TSClass/Admin/FrmSort';
import { TreeEnsDBView } from '/@/CCFast/CCBill/DBList/TreeEnsDBView';
import { Rpt2DLowCode } from '../../CCBill/Components/Rpt2DLowCode';
import { Rpt3DLowCodeForSQL } from '../../CCBill/Components/Rpt3DLowCodeForSQL';
import { Rpt3DLowCodeForDBSrc } from '../../CCBill/Components/Rpt3DLowCodeForDBSrc';
import { RptPage } from '../../Windows/RptPage/RptPage';
import GPNMenuExt from './GPNMenuExt';

type FactoryDef = {
  file: string;
  urlPrefix: string;
  MUrlPrefix?: string;
  factory: ClassFactoryBase;
};
let _factory_map: Map<string, FactoryDef> | undefined = undefined;
// mao的key为第一步No
const getFactoryMap = async () => {
  if (_factory_map) {
    return _factory_map;
  }
  _factory_map = new Map([
    [
      'DataV',
      { file: '/@/views/data_visualization/index.vue', urlPrefix: '/WF/Comm/DataV', MUrlPrefix: 'CCMobile/DataV', factory: await useClassFactoryLoader('ClassFactoryOfDataV') },
    ],
    ['TabPage', { file: '/@/components/Tabs/index.vue', urlPrefix: '/WF/Comm/Tabs', MUrlPrefix: 'CCMobile/Tabs', factory: await useClassFactoryLoader('ClassFactoryOfTabs') }],
    ['Rpt2D', { file: '/@/WF/Comm/Rpt2D.vue', urlPrefix: '/WF/Comm/Rpt2D', MUrlPrefix: 'CCMobile/Rpt2D', factory: await useClassFactoryLoader('ClassFactoryOfRpt2D') }],
    ['Rpt3D', { file: '/@/WF/Comm/Rpt3D.vue', urlPrefix: '/WF/Comm/Rpt3D', MUrlPrefix: 'CCMobile/Rpt3D', factory: await useClassFactoryLoader('ClassFactoryOfRpt3D') }],
    ['Search', { file: '/@/WF/Comm/Search.vue', urlPrefix: '/WF/Comm/Search', MUrlPrefix: 'CCMobile/Search', factory: await useClassFactoryLoader('ClassFactory') }],
    ['Group', { file: '/@/WF/Comm/Group.vue', urlPrefix: '/WF/Comm/Group', factory: await useClassFactoryLoader('ClassFactory') }],
    ['Tree', { file: '/@/WF/Comm/Tree.vue', urlPrefix: '/WF/Comm/Tree', factory: await useClassFactoryLoader('ClassFactory') }],
    ['GPN', { file: '/@/WF/Comm/UIEntity/GroupPageNew.vue', urlPrefix: '/WF/Comm/GroupPageNew', factory: await useClassFactoryLoader('ClassFactoryOfGroupPageNew') }],
    ['TreeEns', { file: '/@/WF/Comm/TreeEns.vue', urlPrefix: '/WF/Comm/TreeEns', factory: await useClassFactoryLoader('ClassFactoryOfPageBaseTreeEns') }],
    ['GL', { file: '/@/WF/views/GenerList.vue', urlPrefix: '/WF/Comm/GenerList', factory: await useClassFactoryLoader('ClassFactoryOfGenerList') }],
    ['PG', { file: '/@/WF/Comm/PanelGroup.vue', urlPrefix: '/WF/Comm/PanelGroup', factory: await useClassFactoryLoader('ClassFactoryOfPanelGroup') }],
  ]);
  return _factory_map;
};
export class GPN_RptWhite extends PageBaseGroupNew {
  constructor() {
    super('GPN_RptWhite');
    this.PageTitle = '新建白色大屏';
  }

  public async Init() {
    //增加子页面.
    this.AddGroup('E', '大屏列表', 'icon-chart', '白色、蓝色大屏，各种图形分析.');
    this.TextBox1_Name(MenuModel.RptWhite, '通用信息窗/大屏(白色风格)', this.DocRptwhite, '页面名称', '统计分析');
    this.AddIcon('icon-fire', MenuModel.RptWhite);
    this.TextBox1_Name(MenuModel.FlowRptWhite, '基于流程的大屏', this.DocRptwhite, '页面名称', '流程统计分析');
    this.SelectItemsByGroupList('FlowRptWhite.BindFlow', '选择流程', '', false, GloWF.srcFlowSorts, GloWF.srcFlows);
    this.TextBox1_Name(MenuModel.BillRptWhite, '基于单据的大屏', this.DocRptwhite, '页面名称', '单据统计分析');
    this.SelectItemsByGroupList('BillRptWhite.BindFrm', '选择单据', '', false, GloWF.srcFrmTree, GloWF.srcFrmListOfBill);
    this.TextBox1_Name(MenuModel.EnRptWhite, '基于实体的大屏', this.DocRptwhite, '页面名称', '实体统计分析');
    this.SelectItemsByGroupList('EnRptWhite.BindFrm', '选择实体', '', false, GloWF.srcFrmTree, GloWF.srcFrmEntityNoName);
    this.TextBox1_Name(MenuModel.EntityRptWhite, '基于高代码的大屏', this.DocRptwhite, '页面名称', '高代码统计分析');
    this.AddTableByOptions({
      no: 'EntityRptWhite.EnName',
      name: '选择实体',
      columns: GPNMenuExt.TableCols(),
      helpDocs: '选择实体(单选)',
      IsMultiSelect: false,
      srcOfList: await GPNMenuExt.GenerEnsList('Entity'),
    });
  }

  get SystemNo() {
    // return 'd242060a-b';
    return this.params.SystemNo || this.RequestVal('SystemNo') || '';
  }

  get SortNo() {
    // return 'd242060a-b';
    return this.params.SortNo || this.RequestVal('SortNo') || '';
  }

  async GenerSorts(_systemNo?: string | undefined): Promise<any[]> {
    return [];
  }

  //重写保存方法实现业务逻辑.
  /**
   *
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID
   * @param sortNo 分类编号
   * @param tb1
   * @param tb2
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const en = new Menu();
    en.Icon = 'icon-user';
    en.ModuleNo = sortNo || this.SortNo;
    en.ModuleNoT = this.GetSortName(sortNo);
    en.SystemNo = this.SystemNo; //系统编号.
    //白色大屏
    if (pageID === 'RptWhite') {
      en.Name = tb1;
      en.MenuModel = MenuModel.RptWhite; //类型
      en.IsEnable = 1;
      en.Icon = this.GetPageIcon('RptWhite');
      en.SetPara('EnName', 'TS.CCFast.Rpt3D'); //符合readme.md里面的第2个模式.
      en.SetPara('RptModel', 'RptWhite');
      en.UrlPath = '/src/CCFast/Views/RptWhiteMain.vue';
      await en.Insert();
      en.UrlExt = '/RptWhite' + en.No.substring(0, 6) + '?PageID=' + en.No;
      await en.Update();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      const rptPage = new RptPage();
      rptPage.No = en.No;
      rptPage.Name = en.Name;
      rptPage.RptModel = 'RptWhite';
      await rptPage.Insert();
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    //其他大屏
    if (pageID === 'FlowRptWhite.BindFlow' || pageID === 'BillRptWhite.BindFrm' || pageID === 'EnRptWhite.BindFrm' || pageID === 'EntityRptWhite.EnName') {
      const subPageID = pageID.substring(0, pageID.indexOf('.'));
      en.Name = this.RequestVal('tb1', subPageID);
      en.MenuModel = MenuModel.RptWhite; //类型
      en.IsEnable = 1;
      en.Icon = this.GetPageIcon('RptWhite');
      en.SetPara('EnName', 'TS.CCFast.Rpt3D'); //符合readme.md里面的第2个模式.
      en.SetPara('RptModel', subPageID);
      en.SetPara('BindNo', tb1);
      en.SetPara('BindName', tb2);
      en.UrlPath = '/src/CCFast/Views/RptWhiteMain.vue';
      await en.Insert();
      en.UrlExt = '/RptWhite' + en.No.substring(0, 6) + '?PageID=' + en.No;
      await en.Update();
      message.info('创建成功，您可以在在菜单里执行高级编辑与授权.');
      const rptPage = new RptPage(en.No);
      rptPage.Name = en.Name;
      rptPage.RptModel = subPageID;
      if (pageID === 'FlowRptWhite.BindFlow') {
        rptPage.FlowNo = tb1;
        rptPage.FlowName = tb2;
      }
      if (pageID === 'BillRptWhite.BindFrm' || pageID === 'EnRptWhite.BindFrm') {
        rptPage.FrmID = tb1;
        rptPage.FrmName = tb2;
      }
      if (pageID === 'EntityRptWhite.EnName') {
        rptPage.FrmID = tb1;
        rptPage.FrmName = tb2;
      }
      await rptPage.Insert();
      return new GPNReturnObj(GPNReturnType.CloseAndReload, null);
    }
    //alert('没有判断的PageID:' + pageID);
  }
  //引入流程菜单
  public readonly LinkFlowFunc = `
#### 帮助
- 无
`;

  //组件
  public readonly Components = `
  #### 帮助.
 - 无
  `;

  //组件—查询组件
  public readonly Search = `
  #### 帮助
  1. 查询实体：就是把Entity实体，放入查询组件/Comm/Search.vue 上实现数据的增删改查.
  1. 可以对实体按照关键字、日期时间范围、枚举外键进行查询.
  #### 步骤1. 创建实体
  1. 创建一个实体子类，根据实体特征确定继承路径，请参考 BP.Demo.* /src/bp/demo/*.*
  1. 注意命名空间不要与系统的命名空间重复.
  1. 查询条件，隐藏条件的设置与bp架构的一样.
  #### 步骤2. 注册到ClassFactory
  1. 把改实体注册到 /src/bp/da/ClassFactory 类里面.
  1. 注意Ens、En都要注册.
  1. 请参考：BP.Demo.Student 的写法.
  #### 步骤3. 按照向导创建菜单
  1. 新建菜单，选择模块，按照向导创建菜单.
  1. 测试.
  `;

  //组件-查询组件-选择实体
  public readonly Search_Ens = `
#### 帮助
- 选择一个实体类
#### 找不到您创建的TS实体类?
- 原因1：未注册到 \`/src/bp/da/ClassFactory.ts\`里面去。
- 解决：在文件\`/src/bp/da/ClassFactory.ts\`中加入您创建的TS类。
- 原因2：未使用规范的命名（classId）。
- 解决：使用系统规范的命名，以【TS.Demo.Student】为例，系统固定写法是TS.文件路径.文件名。
`;

  //组件-查询组件-选择实体
  public readonly Search_Ens_Paras = `
#### 帮助
1. 输入参数，可以作为条件的参数，该参数可以为空.
1. 比如: &FK_Dept=@WebUser.DeptNo&SortNo=xxxxx 
1. 更多的参数请参考Search.vue的设计说明.
`;

  //组件—新建组件
  public readonly GPN = `
#### 帮助
- 无
`;

  //组件-新建组件-选择实体
  public readonly GPN_Ens = `
#### 帮助
- 无
`;

  //组件-新建组件-选择实体
  public readonly GPN_Ens_Paras = `
#### 帮助
- 无
`;

  //组件—新建组件
  public readonly TreeEns = `
#### 帮助
- 无
`;

  //组件—Tabs组件
  public readonly TabsEns = `
#### 帮助
- 无
`;

  //组件-新建组件-选择实体
  public readonly TreeEns_Ens = `
#### 帮助
- 无
`;

  public readonly Desc100 = '暂未开放';
  public readonly DocSelfUrl = `
#### 帮助
1. 可以使用相对路径，也可以使用绝对路径。
1. 用户输入的Url:  http://ccbpm.cn/MyUrl.htm
1. 打开的Url: http://ccbpm.cn/MyUrl.htm?UserNo=xxxx&Token=xxxx。

#### 自定义URL菜单 For H5
1. 菜单连接： http://ccbpm.cn/MyUrl.htm   
1. H5链接： /WF/Comm/Search.htm?EnsName=TS.ZS.Projcets 查询
1. H5链接： /WF/Comm/Group.htm?EnsName=TS.ZS.Projcets  分析
1. H5链接： /WF/MyFlow.htm?FK_Flow=001 发起指定的流程. 

#### 自定义URL菜单 For Vue3.x
- <strong>vue3菜单支持<span style="color:red">两种</span>配置</strong>
- <span style="color:red">配置后需要刷新页面</span>
- <strong>方式1：配置打开的vue文件和参数</strong>

  - 此方式本质就是构建vue的路由， 需要填写指向文件和链接
  - 指向文件是系统存在的vue文件， 表示下方链接实际由这个文件来处理
    - /src/WF/Comm/Search.vue
  - URL表示： 通过哪个路径访问上述的vue文件，可自定义，
    - 例如：需要通过上面的Search.vue 实现一个系统字典管理的链接 
    - 需要自定义个路径 /DictManage + 参数EnName=TS.FrmUI.SysEnumMain
    - 完整路径为 /DictManage?EnName=TS.FrmUI.SysEnumMain
    
- <strong>方式2： 配置url链接</strong>
  - <span style="color:red">如果配置url，指向文件填写一个空格即可</span>
  - url链接可以配置外链，以http:// 或者 https:// 开头
    外链可以为任意互联网地址，例如ccflow官网: http://ccflow.org
  - url链接也可以配置系统内部的链接，以self://开头
    系统内部链接可以配置系统工作地址，例如打开编号001的流程: self://WF/MyFlow?FK_Flow=001 

- 常用vue文件地址如下：
  - /src/WF/Comm/Search.vue 查询
  - /src/WF/Comm/Group.vue  分组

- 常用的url如下：
  - self://WF/MyFlow?FK_Flow=xxx 发起id为xxx的流程
        
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/SelfUrl.png "屏幕截图.png")
`;

  public readonly DocAloneflow = `
####  创建独立运行的流程 
  - 创建流程后，系统自动对该流程的相关操作创建到菜单上去。 
  - 比如：发起流程、流程查询、分析。 
`;

  public readonly DocRptwhite = `
####  信息窗/大屏(白色风格) 
  - 信息窗支持数据的图形展示，例如折线图、柱状图、饼图。
  - 支持变量文本输出，支持自定义HTLM代码的输出。
  - 是多种形式的统计分析展示功能。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Windows.png "屏幕截图.png")
`;

  public readonly DocRptblue = `
#### 信息窗/大屏(蓝色风格) 
  - 支持拖拽形式组装大屏窗口。
  - 大屏组件丰富：各种图表、信息、列表、小组件、图标、图片等。
  - 数据支持静态文件上传及接口动态获取的形式。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/blueRPT.jpg "屏幕截图.png")
`;

  public readonly DocTab = `
 #### Tabs页面容器 
  -  定义：每个tab下面都有一个自定义的url。
`;

  public readonly DocRpt3d = `
#### 三维报表 
 - 定义：三维报表是需要指定三个数据源，通过三维关系显示数据。
#### 事例
 - 数据源：SELECT FK_Flow,RunModel,FWCSta,count(*) AS Num FROM wf_node GROUP BY FK_Flow,RunModel,FWCSta
 - 维度1：SELECT No,Name FROM WF_Flow;
 - 维度2：SELECT IntKey AS No, Lab as Name FROM sys_enum WHERE EnumKey='RunModel';
 - 维度3：SELECT IntKey AS No, Lab as Name FROM sys_enum WHERE EnumKey='FWCSta';
 
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Rpt3D.png "屏幕截图.png")
`;

  public readonly DocRpt2d = `
#### 二维报表 
 - 定义：二维报表是需要指定两个数据源，通过二维关系显示数据。
`;

  public readonly DocEntityNoName = `
#### 帮助 
 - 实体是管理对象，比如固定资产、合同、人力学生、项目等.
 - 实体的基础管理就是对它的增、删、改、查. 
 - 对实体的管理包括实体的流程管理、相关功能管理、方法管理三部分.
 - 实体不能绑定到流程节点上，单据与独立表单可以.
 - 通过对外提供url模式的api接口，绑定到菜单里，实体与流程的关系请参考: http://doc.ccbpm.cn
 #### 数据库字段
 - 实体数据存储在数据表里，数据表的字段分为系统字段+业务字段.
 - 比如：编号、名称、创建人、创建日期、创建人部门、创建人组织就是系统字段，实体电话、邮件、地址就是业务字段.
 - No,varchar,主键,实体编号(编号的生成规则可以自定义默认为001,002)
 - Name,varchar,实体名称
 - EntityState,int,枚举类型 -1=删除,0初始化,1=草稿,2=编辑,3=归档
 - RecNo,varchar记录人编号
 - RecName,varchar,记录人名称
 - DeptNo,varchar,记录人部门编号
 - OrgNo,varchar,记录人组织
 #### 示例-车辆管理
 - 实体列表:
 ![实体](./resource/WF/Admin/FrmLogic/EntityType5.png "屏幕截图.png")  
 - 单个记录:
 ![实体](./resource/WF/Admin/FrmLogic/EntityType5_1.png "屏幕截图.png")  
`;

  public readonly DocBill = `
#### 帮助
 - 定义: 单据具有流水性质的数据，比如：报销单、请假单、出差申请单.
 - 单据与流程: 单据可以被流程节点绑定，也可从实体上发起.
 - 基本字段: 制单人Starter、制单日期RDT、单号BillNo、标题Title、状态BillState.
 - 单据编号: 可以自动定义，存储在BillNo字段中.
 - 单据标题: 可以自定义规则.
 - 单据状态: BillState 0=草稿,1=编辑中,2=退回,3=归档.
 - 单据主键: OID 是个自动生成的字段.
 - 发起人: Starter, StarterName.
 - 冗余字段: PWorkID, PFrmID父表单.
 #### 操作界面
 1. 创建一个单据数据存储到 Frm_GenerBill 一份.
 2. 待办：单据管理
 3. 我的单据: 我发起的单据，等待我审批的单据，已经创建的单据.
 4. 发起单据: 我能创建的单据列表.
 5. 单据草稿: 启动的草稿.
 6. 近期单据: 近期发起的单据.
`;

  public readonly DBList = `
#### 数据源实体 
 -  定义：数据源实体就是视图，不能对数据执行：增加、删除、修改操作。
 -  具备实体的其他的功能，可以当作查询所用。
 `;
  public readonly DictCopy = `
#### 复制实体
- 定义：自动启动工作流程，一个流程的开始节点的填写与发起是在特定规则的设置下自动发起的流程。
- 解释：通常模式下的流程启动是手工的启动，就是用户从一个发起列表，点击流程名字，就启动了该流程。但是有的时候，是系统自动发起该流程。
- 应用场景：
  周例会流程，用户希望每个周都要启动例会通知流程，这个启动是让系统自动发起而非人工发起。
`;
  public readonly Bill = this.DictCopy;
  public readonly DictRef = ``;
  public readonly DictTable = `

#### 字典表 
 -  定义：只具有编号,名称两个属性的字典实体，比如：角色类型、系统类别、税种、税目、省份、片区
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/DictTable.png "屏幕截图.png")
`;

  public readonly DictTableTree = `
#### 树结构字典表 
 - 定义：只具有编号,名称,父节点，三个属性的字典实体，比如：部门
`;
  public readonly Task = `
#### 任务 
 - 定义：记录任务参与人，任务时间，紧急程度等事件的记事本。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Task.png "屏幕截图.png")
`;
  public readonly Info = `
#### 信息发布 
 -  定义：可以编辑发布信息，信息以列表的形式展示在页面上。 
 -  也可以定义信息发布类形，比如：会议记要，工作进度，文件传达等.
#### 信息列表图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Info2.png "屏幕截图.png") 
#### 信息编辑
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Info.png "屏幕截图.png") 
#### 信息类型
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Info3.png "屏幕截图.png") 
`;

  public readonly Calendar = ` 
- 定义：可以在日历上显示工作提醒如待办、在途等。 
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Calendar.png "屏幕截图.png")
`;

  public readonly Notepad = `
#### 记事本 
- 定义：是一款在线记事本，可以记录生活、工作、事件。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/Notepad.png "屏幕截图.png") 
`;

  public readonly KnowledgeManagement = `
#### 知识库 
- 定义：各种知识的集合，方便了解和查询。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/KnowledgeManagement.png "屏幕截图.png") 
`;
  public readonly DBSrcSearch = `
#### 帮助
- 把数据源查询作为视图的数据。
`;

  public readonly WorkRec = `
#### 工作日志 
- 定义：记录工作的日志。
#### 效果图
![输入图片说明](./resource/CCFast/GPM/CCMenu/Img/WorkRec.png "屏幕截图.png") 
  `;
}
