import { Module } from './Module';
import { MySystem } from './MySystem';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import DBAccess from '/@/utils/gener/DBAccess';
import { GloComm } from '/@/WF/Comm/GloComm';
import HttpHandler from '/@/utils/gener/HttpHandler';
import message from 'ant-design-vue/lib/message';
import WebUser from '/@/bp/web/WebUser';
import { usePermissionStore } from '/@/store/modules/permission';
import { usePermission } from '/@/hooks/web/usePermission';

export class GPN_System extends PageBaseGroupNew {
  constructor() {
    super('GPN_System');
    this.PageTitle = '新建应用';
  }
  public Init() {
    let from = this.RequestVal('From');
    if (from == '' || from == null) from = 'ccflow';
    //alert(from);
    //if (from != 'ccflow') {
    this.AddGroup('Hand', '创建应用', 'icon-magic-wand'); //增加分组.
    this.TextBox1_Name('NewSystem', '创建应用', this.NewSystem, '应用名称', '人力资源', '请输入中文的应用名称.');
    this.TextBox1_Name('NewPortal', '新建门户', this.NewSystem, '门户名称', '财务专员门户', '请输入中文的门户名称.');
    this.TextBox1_Name('NewAlone', '创建独立工作应用', this.NewSystem, '应用名称', '人力资源', '请输入中文的应用名称.');

    // this.TextBox1_Name('NewSSOSystem', '跳转应用', this.NewSystem, '应用名称', '人力资源', '请输入中文的应用名称.');
    // }

    this.AddGroup('AI', 'AI创建应用', 'icon-magic-wand'); //增加分组.
    this.TextArea('AISystem', 'AI创建应用', this.AINewSystem, '输入提示词', this.AlertWordNewSystem, '请输入提示词，详情参考帮助.');
    this.AddIcon('icon-like', 'AISystem');
    // this.SelectItemsByTree('AISystem.Menus', '确认菜单内容', this.HelpTodo, true, this.GenerMenus, '100');
    this.Table('AISystem.Menus', '确认菜单内容', this.HelpTodo, true, this.GenerMenus);

    // this.TextArea('Simple', '简单模式', this.AINewSystem, '输入提示词', '我要创建一个车辆管理应用', '请输入提示词，详情参考帮助.');
    // this.Table('Simple.Menus', '确认菜单内容', this.HelpTodo, true, this.GenerMenus);

    this.AddGroup('AICrete', 'AI创建提示词(训练中)'); //增加分组.
    this.TextArea('Doctor', '病种管理', this.AINewSystem, '输入提示词', this.AlertWord_doctor, '请输入提示词，详情参考帮助.');
    this.Table('Doctor.Menus', '确认菜单内容', this.HelpTodo, true, this.GenerMenus);

    this.TextArea('Demo1', 'Demo:车辆管理', this.AINewSystem, '输入提示词', this.AlertWordNewSystem, '请输入提示词，详情参考帮助.');
    this.Table('Demo1.Menus', '确认菜单内容', this.HelpTodo, true, this.GenerMenus);

    this.TextArea('Demo2', 'Demo:HR应用', this.AINewSystem, '输入提示词', this.AlertWord_HRSystem, '请输入提示词，详情参考帮助.');
    this.Table('Demo2.Menus', '确认菜单内容', this.HelpTodo, true, this.GenerMenus);
    this.TextArea('Demo3', 'Demo:CRM应用', this.AINewSystem, '输入提示词', this.AlertWord_CRMSystem, '请输入提示词，详情参考帮助.');
    this.Table('Demo3.Menus', '确认菜单内容', this.HelpTodo, true, this.GenerMenus);
    this.AddIcon('icon-list', 'NewSystem');

    this.AddGroup('Imp', '导入应用(开发中)'); //增加分组.
    this.TextBox1_Name('Imp1', '导入本机文件', this.HelpTodo, '应用名称', '人力资源', '请输入中文的应用名称.');
    this.TextBox1_Name('Imp2', '导入已存在应用', this.HelpTodo, '应用名称', '人力资源', '请输入中文的应用名称.');

    // this.SelectItemsByGroupList('1', '自动启动子流程', this.Docs1, false, srcGroup, srcList);
    // this.SelectItemsByGroupList('2', '延续子流程', this.Docs2, false, srcGroup, srcList);
    // this.SelectItemsByGroupList('3', '发起导航创建子流程(对开始节点有效)', this.Docs3, false, srcGroup, srcList);
  }

  public async GenerMenus() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');

    // let words = this.RequestVal('tb1', 'AISystem');
    // if (pageNo == 'Simple.Menus') words = this.RequestVal('tb1', 'Simple');
    // if (pageNo == 'Doctor.Menus') words = this.RequestVal('tb1', 'Doctor');

    let Words = this.RequestVal('tb1', 'AISystem');
    if (Words == null || Words == undefined || Words == '') Words = this.RequestVal('tb1', 'Doctor');
    if (Words == null || Words == undefined || Words == '') Words = this.RequestVal('tb1', 'Simple');
    if (Words == null || Words == undefined || Words == '') Words = this.RequestVal('tb1', 'Demo1');
    if (Words == null || Words == undefined || Words == '') Words = this.RequestVal('tb1', 'Demo2');
    if (Words == null || Words == undefined || Words == '') Words = this.RequestVal('tb1', 'Demo3');

    handler.AddPara('Words', Words);
    const data: any = await handler.DoMethodReturnString('App_Menus');
    if (data.includes('err@') == true) {
      alert(data);
      return null;
    }
    return JSON.stringify(data);
    //alert(data);
    //return JSON.stringify(data);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
   // debugger;
    if (pageNo === 'Imp1' || pageNo === 'Imp2') {
      alert('功能在开发中.');
      return;
    }
    if (pageNo == 'NewSystem' || pageNo == 'NewPortal' || pageNo == 'NewSSOSystem' || pageNo == 'NewAlone') {
      let systemType = 0;
      if (pageNo == 'NewPortal') systemType = 1;
      if (pageNo == 'NewSSOSystem') systemType = 2; //单点登录.
      if (pageNo == 'NewAlone') systemType = 3; //独立应用.

      const system = new MySystem();
      system.SystemType = systemType;
      system.Name = tb1;
      system.Icon = 'icon-user';
      system.No = DBAccess.GenerGUID();
      system.CreateNo = WebUser.No;
      system.CreateName = WebUser.Name;
      await system.Insert();

      if (systemType == 0) {
        //循环创建模块.
        for (let index = 0; index < 2; index++) {
          const model = new Module();
          model.No = DBAccess.GenerGUID();
          model.Name = '模块' + index;
          model.Icon = 'icon-fire';
          model.SystemNo = system.No;
          await model.Insert();
        }
      }

      if (systemType == 0) {
        system.SetPara('EnName', 'TS.GPM.MySystem');
      }
      if (systemType == 1) {
        system.SetPara('EnName', 'TS.GPM.SystemPortal');
        system.Icon = 'icon-chart';
      }
      if (systemType == 2) system.SetPara('EnName', 'TS.GPM.SystemSkip');
      if (systemType == 3) system.SetPara('EnName', 'TS.GPM.SystemAlone');
      const pStore = usePermissionStore();
      const p = usePermission();
      await system.Update();
      await pStore.buildCCFastRoutes();
      await p.refreshMenu();

      message.info('创建成功.');
      const url = GloComm.UrlEn('TS.GPM.MySystem', system.No);
      return new GPNReturnObj(GPNReturnType.CloseAndReload, url);
    }
    //提示词创建应用.
    if (pageNo == 'AISystem.Menus' || pageNo.includes('.Menus')) {
      const words = tb1;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('Nodes', words); //选择的菜单发送过去.
      const data: any = await handler.DoMethodReturnString('App_MenuSave');
      const url = GloComm.UrlEn('TS.GPM.MySystem', data);
      return new GPNReturnObj(GPNReturnType.CloseAndReload, url);
    }
  }

  //使用AI创建应用.
  public readonly AlertWord_doctor = `我是一个医院,我想创建一个关于 肺癌 病种精细化管理的应用。
   菜单包括但不限于，病人基础资料管理、病例管理等。
   菜单要求如下：
   1. 我们把管理的主体，称为管理对象，比如：病人就是管理主体就是对象。
   2. 请把信息的查询与维护合并一个菜单，如果是管理对象称为什么什么台账，如果是单据称为什么什么单。
   3. 我们把统计分析的菜单称为报表。
 `;

  //使用AI创建应用.
  public readonly AlertWordNewSystem = `我是一个服务类型的公司，公司里有50多辆小汽车，我要做一个车辆管理应用、
  以下是模块菜单要求：
  1.基础信息模块：车辆台账、车辆报表.
    1.1 车辆台账字段包括但不限于:车牌号、里程、颜色、负责人、车辆类型、车架号.
    1.2 车辆报表包括但不限于：车辆类型，数量的饼状图，车辆类型，里程的饼状图.
  2.加油管理模块：加油记录、加油报表。
    2.1 加油记录台账，包括但不限于:汽车编号、汽车名称、车辆类型、加油人、加油日期、加油量、金额.
    2.2 加油报表包括但不限于：车辆类型，加油金额、加油量柱状图.
  3.维修管理模块：维修记录，维修店管理，维修费用报表, 维修申请流程.
    3.1 维修记录台账，包括但不限于:维修人，维修地点、维修金额、维修原因.
    3.2 维修报表包括但不限于：车辆类型，维修金额柱状图. Flow
    3.3 维修申请流程包括如下步骤：填写维修申请单、部门审批、总经理审批、反馈给申请人。
`;

  public readonly AlertWord_HRSystem = `我是一个服务类型的公司，公司里有50名员工，我要做一个人力管理应用，涵盖员工管理全流程，从招聘、入职、培训、薪资、考勤到绩效评估
以下是模块菜单要求：
1. 员工信息
1.1 新增员工
1.2 员工列表
1.3 员工信息查询
1.4 组织架构管理
1.4.1 部门管理
1.4.2 岗位管理
1.5 员工离职

2. 招聘
2.1 招聘需求管理
2.2 应聘者管理
2.3 面试安排
2.4 录用管理
2.5 招聘渠道管理

3. 培训与发展
3.1 培训计划
3.2 培训活动管理
3.3 培训资源管理
3.4 员工培训记录
3.5 培训效果评估

4. 薪资与福利
4.1 薪资结构管理
4.2 工资单发放
4.3 福利项目管理
4.4 税务管理
4.5 退休金管理

5. 考勤
5.1 考勤记录
5.2 请假管理
5.3 出差管理
5.4 加班管理
5.5 考勤报表

6. 绩效
6.1 绩效目标设定
6.2 绩效评估
6.3 绩效反馈
6.4 绩效奖金管理
6.5 绩效报表

7. 报表
7.1 员工信息报表
7.2 招聘报表
7.3 培训报表
7.4 薪资报表
7.5 考勤报表
7.6 绩效报表
`;

  public readonly AlertWord_CRMSystem = `我是一个服务类型的公司，公司有上千家客户。我要做一个CRM管理应用，帮助我们提升客户满意度，优化业务流程，增加销售机会和成单率，管理销售全流程
以下是模块菜单要求：
1. 客户管理
1.1 新增客户
1.2 客户列表
1.3 客户信息查询
1.4 客户分类管理
1.5 客户联系人管理

2. 销售管理
2.1 销售机会管理
2.2 销售漏斗分析
2.3 报价单管理
2.4 销售订单管理
2.5 合同管理

3. 市场营销
3.1 市场活动管理
3.2 营销计划
3.3 客户细分
3.4 邮件营销
3.5 问卷调查

4. 客户服务
4.1 服务请求管理
4.2 客户反馈管理
4.3 票务应用
4.4 知识库管理
4.5 客户满意度调查

5. 报表与分析
5.1 客户报表
5.2 销售报表
5.3 市场营销报表
5.4 客户服务报表
5.5 综合分析报表
`;

  //
  public readonly NewSystem = `
  #### 帮助
   - 输入应用名称，比如:人力资源,CRM,OA,财务管理,业务流程等.
   - 一个应用下有n个模块,一个模块下有n个菜单,菜单就是功能应用.
   - 应用、模块、菜单三个级别，每个级别上都可以使用权限控制，默认权限是开放的.
  #### 详细说明
   - 菜单是组织应用的基本元素。
   - CCFast 组织菜单形式分为应用、模块、菜单三级模式。
   - 不同类型的菜单解决不同应用场景。
   - CCFast 允许增加自己的自定义菜单，这样的话完全可以把ccfast作为一个权限管理应用.
   - 权限管理是从应用、模块、菜单三级的自上而下的管理模式。
   - CCFast 的应用设计，都是面对的菜单模式的应用设计。
   #### 视频教程.
   https://www.bilibili.com/video/BV12P4y1p74h/
`;

  //使用AI创建应用.
  public readonly AINewSystem = `
#### 帮助
 - 输入应用名称，比如:人力资源,CRM,OA,财务管理,业务流程等.
 - 一个应用下有n个模块,一个模块下有n个菜单,菜单就是功能应用.
 - 应用、模块、菜单三个级别，每个级别上都可以使用权限控制，默认权限是开放的.
#### 详细说明
 - 菜单是组织应用的基本元素。
 - CCFast 组织菜单形式分为应用、模块、菜单三级模式。
 - 不同类型的菜单解决不同应用场景。
 - CCFast 允许增加自己的自定义菜单，这样的话完全可以把ccfast作为一个权限管理应用.
 - 权限管理是从应用、模块、菜单三级的自上而下的管理模式。
 - CCFast 的应用设计，都是面对的菜单模式的应用设计。
 #### 视频教程.
 https://www.bilibili.com/video/BV12P4y1p74h/
`;
}
