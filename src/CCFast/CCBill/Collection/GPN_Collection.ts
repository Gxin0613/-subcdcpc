import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Menus } from '../../GPM/CCMenu/Menu';
import { Collection } from './Collection';
import DBAccess from '/@/utils/gener/DBAccess';
import { FrmDict } from '../FrmDict';
import { Methods } from '../Method/Method';
import { GloComm } from '/@/WF/Comm/GloComm';
import { FlowSort } from '/@/WF/TSClass/Admin/FlowSort';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import { MySystem } from '/@/CCFast/GPM/MySystem';
import { message } from 'ant-design-vue';
import { GloWF } from '/@/WF/Admin/GloWF';

export class CollectionModel {
  /**************************************   无需集合支持  */
  //查询条件设置
  public static readonly SearchCond = 'SearchCond';
  //自定义按钮
  public static readonly Link = 'Link';
  //扫码填报
  public static readonly QRCodeAddDict = 'QRCodeAddDict';
  //注册/新增实体类流程
  public static readonly FlowNewEntity = 'FlowNewEntity';
  /**************************************   需要集合支持  */
  //方法:(包含有参数与无参数的方法)
  public static readonly Func = 'Func';
  //单据:批量发起.
  public static readonly Bill = 'Bill';
  //自定义按钮
  public static readonly LinkCollection = 'LinkCollection';
  //实体批量发起流程
  public static readonly FlowEntityBatchStart = 'FlowEntityBatchStart';
}

export class GPN_Collection extends PageBaseGroupNew {
  constructor() {
    super('GPN_Collection');
    this.PageTitle = '新建列表组件';
    this.ForEntityClassID = 'TS.CCBill.Collection';
  }

  public async Init() {
    const frmID = this.RefPKVal;
    const frm = new FrmDict(frmID);
    await frm.Retrieve();

    //增加子页面.
    this.AddGroup('A', '无需集合支持');
    // this.TextBox1_Name(CollectionModel.SearchCond, "查询条件设置", this.Docs0, "流程名称", "xx流程");
    this.TextBox2_NameNo(CollectionModel.Link, '自定义链接', this.DocsLink, '', '链接名称', 'URL链接', '我的链接');

    this.TextBox1_Name(CollectionModel.QRCodeAddDict, '扫码填报', this.DescQRCodeAddDict, '标签', '扫码填报');
    const lab = `新建${frm.Name}流程`;
    this.TextBox1_Name(CollectionModel.FlowNewEntity, '注册/新增实体类流程', this.FlowNewEntity, '流程名称', lab);

    this.AddGroup('B', '需要集合支持');
    const srcOfList = GloWF.SQLOfGpnCollection(this.RefPKVal); //`SELECT No,Name FROM Frm_Method  WHERE MethodModel='Func' AND FrmID='${this.RefPKVal}' ORDER BY Idx  `;

    //可否支持传入 ens ?
    const funcs = new Methods();
    await funcs.Retrieve('MethodModel', 'Func', 'FrmID', this.RefPKVal);

    this.SelectItemsByList(CollectionModel.Func, '实体方法', this.Desc100, false, srcOfList);

    this.TextBox1_Name(CollectionModel.Bill, '单据:批量发起(未解析)', this.Docs0, '单据名称', '出入证明');

    this.TextBox2_NameNo(CollectionModel.LinkCollection, '自定义链接', this.Docs0, '', '链接标签', 'URL链接', '我的链接');
    if (frm.EntityType != 1) {
      const labX = `批量发起:${frm.Name}流程`;
      this.TextBox1_Name(CollectionModel.FlowEntityBatchStart, '批量发起流程', this.Docs0, '流程名称', labX);
    }
  }
  GenerSorts(_systemNo?: string | undefined): Promise<any[]> {
    return Promise.resolve([]);
  }
  //重写保存方法实现业务逻辑.
  /**
   * @param pageID
   * @param sortNo 分类编号
   * @param tb1
   * @param tb2
   * @param _tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    //自定义url.
    if (pageID === CollectionModel.Link) {
      const en = new Collection();
      //await en.Init();
      en.FrmID = this.RefPKVal; // this.RequestVal('FrmID');
      en.MethodID = 'Link';
      en.Mark = 'Link';
      en.Name = tb1;
      en.MethodModel = 'Link'; //设置为链接按钮.
      en.UrlExt = tb2;
      en.Tag1 = tb2;
      en.Icon = 'icon-drop';
      en.SetPara('EnName', 'TS.CCBill.CollectionLink');
      en.No = tb1 + '_' + this.RefPKVal; //不能重复.

      en.Idx = 100;
      await en.Insert();

      const url = GloComm.UrlEn(en.GetParaString('EnName', ''), en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageID === CollectionModel.QRCodeAddDict) {
      const en = new Collection();
      en.FrmID = this.RefPKVal;
      en.MethodID = pageID;
      en.Mark = pageID;
      en.Name = tb1;
      en.MethodModel = pageID;
      en.SetPara('EnName', 'TS.CCBill.CollectionQRCodeAddDict');
      en.Icon = 'icon-drop';
      en.Idx = 100;
      en.No = tb1 + '_' + this.RefPKVal; //不能重复.
      await en.Insert();
      //  const url1 = '/src/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
      const url = GloComm.UrlEn(en.GetParaString('EnName', ''), en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    let frmID = this.RefPKVal;
    if (!frmID) frmID = this.RequestVal('FrmID');
    let systemNo = '';
    //创建流程的时候先创建流程目录
    if (pageID === CollectionModel.FlowNewEntity || pageID === CollectionModel.FlowEntityBatchStart) {
      //判断是方法所属的实体单据是否存在菜单中
      const menus = new Menus();
      await menus.Retrieve('FrmID', frmID);
      const ens = menus.filter((menuEn) => menuEn.MenuModel === 'Bill' || menuEn.MenuModel === 'EntityNoName' || menuEn.MenuModel === 'Dict');
      if (ens.length == 0) {
        message.error('没有查询到关于FrmID=' + frmID + '菜单.');
        return;
      }
      const menuEn = menus[0];
      let systemName = '';
      let rootNo = 'CCFast';
      let rootName = '';
      if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) rootNo = 'CCFast_' + WebUser.OrgNo;
      systemNo = menuEn.SystemNo;
      const system = new MySystem();
      system.No = systemNo;
      await system.Retrieve();
      systemName = system.Name;
      rootName = '低代码流程';
      //获取系统.
      const flowSort = new FlowSort();
      flowSort.No = systemNo;
      if ((await flowSort.IsExits()) == false) {
        flowSort.No = rootNo;
        if ((await flowSort.IsExits()) == false) {
          flowSort.Name = rootName;
          if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) flowSort.ParentNo = '1';
          else flowSort.ParentNo = WebUser.OrgNo;
          flowSort.OrgNo = WebUser.OrgNo;
          await flowSort.Insert();
        }
        flowSort.No = systemNo;
        flowSort.Name = systemName;
        if (SystemConfig.CCBPMRunModel == CCBPMRunModel.Single) flowSort.ParentNo = rootNo;
        else flowSort.ParentNo = WebUser.OrgNo;
        flowSort.OrgNo = WebUser.OrgNo;
        await flowSort.Insert();
      }
      //新建实体.
      if (pageID === CollectionModel.FlowNewEntity) {
        //执行方法.
        const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_Collection');
        handler.AddPara('FlowName', tb1);
        handler.AddPara('Name', tb1);
        handler.AddPara('FrmID', frmID);
        handler.AddPara('FlowDevModel', 1); //设置为极简模式.
        handler.AddPara('ModuleNo', menuEn.ModuleNo); // 隶属的方法模板..
        handler.AddPara('SortNo', flowSort.No);
        const data = await handler.DoMethodReturnString('FlowNewEntity_Save');
        const url = GloComm.UrlEn('TS.CCBill.CollectionFlowNewEntity', data);
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }

      //实体批量发起流程.
      if (pageID === CollectionModel.FlowEntityBatchStart) {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_Collection');
        handler.AddPara('SortNo', flowSort.No); //该实体的类别编号与，流程的类别编号一致.
        handler.AddPara('FlowName', tb1);
        handler.AddPara('Name', tb1);
        handler.AddPara('FrmID', frmID);
        handler.AddPara('FlowDevModel', 1); //设置为极简模式.
        //  handler.AddPara('GroupID', groupID); // 方法的的GroupID..
        handler.AddPara('ModuleNo', menuEn.ModuleNo);
        handler.AddPara('IsCanBatch', 1);
        const data = await handler.DoMethodReturnString('FlowEntityBatchStart_Save');
        if (data.indexOf('err@') == 0) {
          alert(data);
          return;
        }
        const url = GloComm.UrlEn('TS.CCBill.CollectionFlowNewEntity', data);
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }
    }

    //增加一个功能.
    if (pageID === CollectionModel.Func) {
      const en = new Collection();
      en.FrmID = this.RefPKVal;
      en.MethodID = tb1;
      en.Mark = pageID;
      en.Name = tb2;
      en.MethodModel = pageID;
      en.SetPara('EnName', 'TS.CCBill.CollectionFunc');
      en.Icon = 'icon-energy';
      en.Idx = 100;
      en.No = tb1 + '_' + this.RefPKVal; //不能重复.
      await en.Insert();

      const url = GloComm.UrlEn(en.GetParaString('EnName', ''), en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    // 超链接.
    if (pageID === CollectionModel.LinkCollection) {
      const en = new Collection();
      en.FrmID = this.RefPKVal;
      en.MethodID = tb1;
      en.Mark = pageID;
      en.Name = tb2;
      en.MethodModel = pageID;
      en.SetPara('EnName', 'TS.CCBill.CollectionLink');
      en.Icon = 'icon-energy';
      en.Idx = 100;
      en.No = DBAccess.GenerGUID(); // tb1 + '_' + this.RefPKVal; //不能重复.
      await en.Insert();
      const url = GloComm.UrlEn(en.GetParaString('EnName', ''), en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    alert('没有判断的PageID:' + pageID);
  }

  public readonly DocsLink = '暂未开放';

  public readonly FlowNewEntity = `
  #### 帮助
  - 比如：xxx登记、供应商申请、xx申请、入党申请、材料入库申请
  - 流程运行完毕后，就写入该条数据到实体列表中.
  #### 开发说明
  - 点击确定后，系统自动创建一个流程，并且开流程为绑定表单库的表单模式模式。
  - 该流程绑定的表单就是该实体表单
  - 用户发起流程实例就是直接在该表单上增加一笔记录，流程结束后，或者指定的节点结束后，该记录变为提交状态。
  `;

  // 专业模式
  public readonly Docs0 = `
  
  #### 帮助
   - 该模式的表单定义是自由的,每个节点上都可以定义不同的表单方案. 
   - 每个节点上都可以灵活定义个性化的表单,而不需要统一管理. 
        
        `;

  public readonly Desc100 = '暂未开放';
  public readonly DocSelfUrl = `
  #### 帮助
   - 自定义URL菜单， 您可以使用右上角的下拉框选择自己要定义的菜单类型. 
   
   - 菜单连接： http://ccbpm.cn/MyUrl.htm  
   - 菜单连接： http://ccbpm.cn/MyUrl.htm  
   - 链接： /WF/Comm/Search.htm?EnsName=TS.ZS.Projcets 查询
   - 链接： /WF/Comm/Group.htm?EnsName=TS.ZS.Projcets  分析
   - 链接： /WF/MyFlow.htm?FK_Flow=001 发起指定的流程. 
   
   -  可以使用相对路径，也可以使用绝对路径。
   -  用户输入的Url:  http://ccbpm.cn/MyUrl.htm
   -  打开的Url : http://ccbpm.cn/MyUrl.htm?UserNo=xxxx&Token=xxxx。
   -  SID就类似于token, UserNo就是当前登录用户的编号。
   -  <img src="SelfUrl.png" class="HelpImg" />
  `;

  // 扫码填报
  public readonly DescQRCodeAddDict = `
      扫码在手机上新建.
        `;
  // 极简模式
  public readonly Docs1 = `
  
   #### 帮助
    - 该表单是固定格式的表单,可以展现4列6列展现. 
    - 使用批量设置审核组件的状态,来满足不同的审批需要,审核组件有启用禁用只读三个状态. 
    - 用于简单的表单审批场景,第1个节点填写表单,第2个节点之后表单都是只读的,使用审核组件填写审核意见. 
    - 优点:开发效率高,展现简洁,学习成本低,业务人员可以入手. 
    - 缺点:展示样式固定.
  `;
  // 开发者表单说明
  public readonly Docs2 = `
  
   #### 帮助
    - 该流程所有的节点都禁用了审核组件,审核信息写入到了审核分组里的字段里.
    - 流程在运动过程中,每个节点的人员都在当前节点上填写一些信息,走到最后一个节点才是完整的表单,所以整个表单就像累加起来的一样.
    - 我们把符合整个特征的流程,称为累加表单流程.
    
  `;
  // 触发启动说明
  public readonly Docs3 = `
   #### 帮助
   
    - 第三方软件向特定的表 WF_Task 中写入数据，每写入一条数据系统就会自动发起一条流程。
    - ccBPM就会读取这张表来完成流程的发起,发起成功后就把这条记录设置成已经发起的状态。
    - 详见设置以及该表的结构参考操作手册.
    
  `;
}
