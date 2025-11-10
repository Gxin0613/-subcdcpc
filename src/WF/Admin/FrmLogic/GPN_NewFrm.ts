import { FrmSorts } from '../../TSClass/Admin/FrmSort';
import GloFrm from './GloFrm';
import { GroupField, GroupFields } from './GroupField';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { windowOpen } from '/@/utils/windowOpen';

export class GPN_NewFrm extends PageBaseGroupNew {
  constructor() {
    super('GPN_NewFrm');
    this.PageTitle = '新建表单';
  }

  public async Init() {
    // this.AddGroup('F', '实验中'); //增加分组.
    // this.TextBox2_NameNo('FrmEntityNoName', '新建实体2024', this.FrmEntityNoName, 'Entity_', '实体ID', '实体名称', '');
    // this.AddIcon('icon-layers', 'FrmEntityNoName');
    // this.TextBox2_NameNo('FrmEntityTree', '新建树实体', this.FrmEntityNoName, 'Tree_', '实体ID', '实体名称', '');
    // this.AddIcon('icon-layers', 'FrmEntityTree');

    this.AddGroup('D', '实体单据', 'icon-notebook', '可以独立运行的，增加、删除、修改具有列表，属性页面，可以被API调用也可以绑定到菜单独立运行.'); //增加分组.
    // this.TextBox2_NameNo('FrmDict', '新建实体', this.FrmEntityNoName, 'Dict_', '实体ID', '实体名称', '');
    // this.AddIcon('icon-layers', 'FrmDict');
    this.TextBox2_NameNo('FrmEntityNoName', '新建实体', this.FrmEntityNoName, 'Entity_', '实体ID', '实体名称', '资产台账');
    this.AddIcon('icon-layers', 'FrmEntityNoName');

    this.TextBox2_NameNo('FrmBill', '新建单据', this.FrmBillDesc, 'Bill_', '单据ID', '单据名称', '维修单');
    this.AddIcon('icon-notebook', 'FrmBill');

    this.TextBox2_NameNo('FrmAsk', '新建活动(调查、问卷、流程活动)', this.FrmBillDesc, 'Ask_', '问卷ID', '问卷名称', '饮食调查');
    this.AddIcon('icon-emotsmile', 'FrmAsk');

    //增加子页面.
    this.AddGroup('A', '流程表单', 'icon-organization', '仅仅为绑定流程节点上需求而创建的表单.'); //增加分组.
    this.TextBox3_NameNoNote('0', '经典表单', this.FoolFrm, 'Frm_', '表单ID', '表单名称', '存储表', '');
    this.AddIcon('icon-notebook', '0');

    // this.TextBox3_NameNoNote('8', '开发者表单', this.DevFrm, 'Frm_', '表单ID', '表单名称', '存储表', '');
    // this.AddIcon('icon-calendar', '8');

    this.TextBox3_NameNoNote('10', '章节表单', this.ChartFrm, 'Frm_', '表单ID', '表单名称', '存储表', '');
    this.TextBox3_NameNoNote('6', 'Vsto模式Excel表单', this.HelpUn, 'Frm_', '表单ID', '表单名称', '存储表', '');
    this.TextBox3_NameNoNote('61', 'Vsto模式Word表单', this.HelpUn, 'Frm_', '表单ID', '表单名称', '存储表', '');
    this.TextBox3_NameNoNote('11', 'AI大文本表单', this.HelpUn, 'Frm_', '表单ID', '表单名称', '存储表', '');
    this.AddIcon('icon-grid', '6');
    this.TextBox3_NameNoNote('9', 'Wps表单(开发中)', this.HelpUn, 'Frm_', '表单ID', '表单名称', '存储表', '');
    this.TextBox2_NameNo('3', '嵌入式表单', this.HelpUn, 'Frm_', '表单ID', '表单名称', '');

    // //绑定表单库模式.
    // this.AddGroup('B', '文件支持表单');
    // this.TextBox3_NameNoNote('19', 'Vsto的Word表单', this.Docs1, 'Frm_', '表单ID', '表单名称', '存储表', '');
    //其他类型表单.
    // this.AddGroup('C', '其他表单'); //增加分组.
    // this.TextBox2_NameNo('7', '实体类组件', this.Docs1, 'Frm_', '实体类EnName', '表单名称', '');
  }

  public async GenerSorts(): Promise<any[]> {
    const ens = new FrmSorts();
    await ens.Init();
    await ens.RetrieveAll();
    return ens;
    // return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const name = tb1;
    const no = tb2;
    const pTable = tb3;
    //如果是实体.
    if (pageNo == 'FrmDict' || pageNo == 'FrmAsk' || pageNo == 'FrmEntityNoName') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      //handler.AddFormData();
      //handler.AddUrlData();
      handler.AddPara('TB_No', no);
      handler.AddPara('TB_Name', name);
      handler.AddPara('TB_PTable', pTable);
      handler.AddPara('DDL_DBSrc', 'local');
      handler.AddPara('FK_FrmSort', sortNo);
      handler.AddPara('EntityType', 2); //MyDict.
      if (pageNo == 'FrmAsk') handler.AddPara('EntityType', 4); //MyDict.
      if (pageNo == 'FrmEntityNoName') handler.AddPara('EntityType', 5); //entityNoName实体.
      //DDL_FrmTree
      // eslint-disable-next-line no-var
      //  var data = await handler.DoMethodReturnString('NewFrmGuide_Create');
      const data = await handler.DoMethodReturnString('NewFrmGuide_Create');
      if (data?.includes?.('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      // 检查表单.
      await GloFrm.CheckForm(no);
      const url = '/#/WF/Designer/Form?FrmID=' + no;
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
    //如果是实体.
    if (pageNo == 'FrmBill') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      //handler.AddFormData();
      //handler.AddUrlData();
      handler.AddPara('TB_No', no);
      handler.AddPara('TB_Name', name);
      handler.AddPara('TB_PTable', pTable);
      handler.AddPara('DDL_DBSrc', 'local');
      handler.AddPara('FK_FrmSort', sortNo);
      handler.AddPara('EntityType', 1); //单据.

      //DDL_FrmTree
      // eslint-disable-next-line no-var
      //  var data = await handler.DoMethodReturnString('NewFrmGuide_Create');
      const callbackObject = (await handler.DoMethodReturnString('NewFrmGuide_Create')) as string;
      const data = callbackObject as string;
      if (typeof data === 'string' && data.includes('err@') == true) return new GPNReturnObj(GPNReturnType.Error, data);

      // 检查表单.
      await GloFrm.CheckForm(no);
      // const frmBill = new BSEntity('BP.CCBill.FrmBill', no);
      // const num = await frmBill.RetrieveFromDBSources();
      // if (num != 1) {
      //   alert('表单创建错误.');
      //   return;
      // }
      // await frmBill.DoMethodReturnJSON('CheckEnityTypeAttrsFor_Bill');

      const url = '/#/WF/Designer/Form?FrmID=' + no;
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    //其他表单类型.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
    // handler.AddFormData();
    handler.AddPara('TB_No', no);
    handler.AddPara('TB_Name', name);
    handler.AddPara('TB_PTable', pTable);
    handler.AddPara('DDL_FrmType', pageNo); //表单类型.
    handler.AddPara('FK_FrmSort', sortNo); //隶属目录.类别..

    const callbackObject = (await handler.DoMethodReturnString('NewFrmGuide_Create')) as string;

    if (typeof callbackObject === 'string') {
      windowOpen(callbackObject, name);
      return;
    }

    //如果是章节表单，修复初始化信息.
    if (pageNo == '10') {
      const gss = new GroupFields();
      await gss.Retrieve('FrmID', no);
      if (gss.length == 0) {
        const gs = new GroupField();
        gs.Lab = '节点1';
        gs.FrmID = no;
        gs.CtrlType = 'Dir';
        gs.Idx = 0;
        await gs.Insert();
        const gs1 = new GroupField();
        gs1.Lab = '节点2';
        gs1.FrmID = no;
        gs1.CtrlType = 'Dir';
        gs1.ParentOID = gs.OID;
        gs1.Idx = 0;
        await gs1.Insert();
        const gs2 = new GroupField();
        gs2.Lab = '节点3';
        gs2.FrmID = no;
        gs2.CtrlType = 'Dir';
        gs2.ParentOID = gs.OID;
        gs2.Idx = 1;
        await gs2.Insert();
      }
    }

    const data = callbackObject as string;
    if (typeof data === 'string' && data.includes('err@') == true) return new GPNReturnObj(GPNReturnType.Error, data);

    // 检查表单.
    await GloFrm.CheckForm(no);
    const url = '/#/WF/Designer/Form?FrmID=' + no;
    // const keys = Object.keys(callbackObject);
    // let url = '/#/WF/Designer/Form?';
    // for (const key of keys) {
    //   url += `${key}=${callbackObject[key]}&`;
    // }
    // url = url.substring(0, url.length - 1);
    const obj = new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    return obj;
    // windowOpen(url, name);
  }

  // 经典表单说明
  public readonly FrmEntityNoName = `
 #### 帮助 
   - 实体是管理对象. 比如固定资产管理、合同管理、人力学生、项目等.
   - 实体的基础管理就是对它的增、删、改、查. 
   - 对实体的管理包括实体的流程管理、相关功能管理、方法管理三部分.
   - 实体不能绑定到流程节点上,单据与独立表单可以.
   - 通过对外提供url模式的api接口,绑定到菜单里, 实体与流程的关系请参考: http://doc.ccbpm.cn
   #### 数据库字段
   - 实体数据存储在数据表里,数据表的字段分为系统字段+业务字段.
   - 比如： 编号、名称、创建人、创建日期、创建人部门、创建人组织就是系统字段.  实体电话、邮件、地址就是业务字段
   - No,varchar,主键,实体编号(编号的生成规则可以自定义默认为001,0002)
   - Name,varchar,实体名称
   - EntityState,int,枚举类型 -1=删除,0初始化,1=草稿,2=编辑,3=归档.
   - RecNo,varchar记录人编号,
   - RecName,varchar,记录人名称
   - DeptNo,varchar,记录人部门编号,
   - OrgNo,varchar,记录人组织
   #### 示例-车辆管理.
   - 实体列表:
   ![实体](./resource/WF/Admin/FrmLogic/EntityType5.png "屏幕截图.png")  
   - 单个记录:
   ![实体](./resource/WF/Admin/FrmLogic/EntityType5_1.png "屏幕截图.png")  
  `;

  // 调查问卷
  public readonly FrmAskDesc = `
  #### 帮助
   - 定义: 单据具有流水性质的数据增删改查,比如:报销单、请假单、出差申请单.
   - 单据与流程: 单据可以被流程节点绑定,也可也从实体上发起.
   - 基本字段: 制单人Starter、制单日期RDT、单号BillNo、标题Title、状态BillSta.
   - 单据编号:可以自动定义,存储在BillNo字段中.
   - 单据标题: 可以自定义规则，类似于流程标题.
   - 单据状态: BillState 0=草稿,1=编辑中,2=退回,3=归档.
   - 单据主键: OID 是个自动生的字段,类似于WorkID.
   - 发起人: Starter, StarterName.
   - 冗余字段: PWorkID, PFrmID父表单.
   #### 操作界面.
   1. 创建一个单据数据存储到 Frm_GenerBill 一份.
   2. 待办:单据管理
   3. 我的单据: 我发起的单据,等待我审批的单据,已经创建的单据.
   4. 发起单据: 我能创建的单据列表.
   5. 单据草稿: 启动的草稿.
   6. 近期单据: 近期发起的单据.
  `;
  // 单据说明
  public readonly FrmBillDesc = `
  #### 帮助
   - 定义: 单据具有流水性质的数据增删改查,比如:报销单、请假单、出差申请单.
   - 单据与流程: 单据可以被流程节点绑定,也可也从实体上发起.
   - 基本字段: 制单人Starter、制单日期RDT、单号BillNo、标题Title、状态BillSta.
   - 单据编号: 可以自动定义,存储在BillNo字段中.
   - 单据标题: 可以自定义规则，类似于流程标题.
   - 单据状态: BillState 0=草稿,1=编辑中,2=退回,3=归档.
   - 单据主键: OID 是个自动生的字段,类似于WorkID.
   - 发起人: Starter, StarterName.
   - 冗余字段: PWorkID, PFrmID父表单.
   #### 操作界面.
   1. 创建一个单据数据存储到 Frm_GenerBill 一份.
   2. 待办:单据管理
   3. 我的单据: 我发起的单据,等待我审批的单据,已经创建的单据.
   4. 发起单据: 我能创建的单据列表.
   5. 单据草稿: 启动的草稿.
   6. 近期单据: 近期发起的单据.
  `;
  // 经典表单说明
  public readonly FoolFrm = `
  #### 帮助 
   - 该表单是固定格式的表单,可以展现4列6列展现.
   - 优点:开发效率高,展现简洁,学习成本低,业务人员可以入手.
   - 缺点:展示样式固定.
  `;

  // 开发者表单说明
  public readonly DevFrm = `
  #### 帮助
   - 依托富文本编辑器,实现对表单的编辑.
   - 优点:格式灵活,展现效果随心所欲.
   - 缺点:业务人员入手需要一定的学习成本.
   - 适用于:效果
    
  `;

  // 章节表单
  public readonly ChartFrm = `
  
  #### 帮助
   - 依托于经典表单设计器进行设计.
   - 一个分组就是章.
   - 每个字段都是大块文本,就是节.
    
  `;
}
