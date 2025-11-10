import { message } from 'ant-design-vue';
import { FrmBill } from './FrmBill';
import { FlowDevModel } from '/@/WF/Admin/EnumLab';
import { Flow } from '/@/WF/TSClass/Flow';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { DataType } from '/@/bp/en/DataType';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { SelfCheck } from './BillCheck/SelfCheck';
import { ByEmpNo } from './BillCheck/ByEmpNo';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GloWF } from '/@/WF/Admin/GloWF';

export class GPE_BillCheckModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_BillCheckModel');
    this.PageTitle = '单据审核模式';
  }
  Init() {
    this.entity = new FrmBill(); //对应的类.
    this.KeyOfEn = 'BillCheckModel'; //要修改的字段.

    this.Btns = [{ pageNo: 'ByFlowNo', list: ['设计流程'] }];

    //增加子页面.
    this.AddGroup('A', '简易模式'); //增加分组.
    this.Blank('None', '不审核', this.Desc0);
    this.AddEntity('BySettingEmpNos', '固定人员审核', new ByEmpNo(), this.ByEmpNos, '');

    this.AddGroup('B', '自定义审核');
    this.AddEntity('SelfCheck1', '自由模式', new SelfCheck(), this.SelfCheck, '');
    this.AddEntity('SelfCheck2', '抢办模式', new SelfCheck(), this.SelfCheck, '');
    this.AddEntity('SelfCheck3', '协作模式', new SelfCheck(), this.SelfCheck, '');
    this.AddEntity('SelfCheck4', '队列模式', new SelfCheck(), this.SelfCheck, '');

    this.AddGroup('C', '二开模式');
    this.SingleTB('BySQL', '按照SQL设置审核人员', 'BillCheckTag', this.BySQL, '请输入SQL表达式，返回No,Name两个列的人员集合.', DataType.AppString);
    this.Blank('ByAPI', '外部程序调用', this.SelfCheck);

    this.AddGroup('Z', '流程模式');
    this.SelectItemsByGroupList('ByFlowNo', '绑定流程审核', this.HelpUn, false, GloWF.srcFlowSorts, GloWF.srcFlows, 'BillCheckTag');
  }
  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }

    if (btnName == '设计流程') {
      const frmBill = new FrmBill();
      frmBill.No = this.RefPKVal;
      const nu3m = await frmBill.RetrieveFromDBSources();
      if (nu3m == 0) {
        alert('错误，没有查询到编号:' + frmBill.No + '的表单.');
        return;
      }
      if (frmBill.BillCheckModel != 'ByFlowNo') {
        frmBill.BillCheckModel = 'ByFlowNo';
        await frmBill.Update();
      }

      if (frmBill.BillCheckTag.includes(',') == true) {
        const url = GloComm.UrlGPN('GPN_BillCheckEditFlow', '&FrmID=' + frmBill.No);
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer30, url);
      }

      const flow = new Flow();
      flow.No = frmBill.BillCheckTag;
      const num = await flow.RetrieveFromDBSources();
      if (num == 0) {
        if (window.confirm('目前没有绑定流程编号，您想创建一个新流程吗?') == false) return;
      } else {
        //做一些强制性的更新.
        //flow.PTable = frmBill.PTable;
        flow.SetValByKey('PTable', frmBill.PTable);
        flow.FrmUrl = frmBill.No;
        flow.BillNoFormat = frmBill.BillNoFormat;
        flow.IsCanStart = 0;
        await flow.Update();
        //  const url = '';
        const url = GloComm.UrlFlowD(flow.No);
        // const url = '/#/WF/Designer/EditFlow?FlowNo=' + flow.No + '&FK_Flow=' + flow.No;
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }

      const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner_FlowDevModel');
      handler1.AddPara('SortNo', '');
      handler1.AddPara('FlowName', frmBill.Name);
      handler1.AddPara('FlowDevModel', FlowDevModel.RefOneFrmTree);
      handler1.AddPara('FrmUrl', frmBill.No);
      handler1.AddPara('FrmPK', frmBill.No);
      const data = await handler1.DoMethodReturnString('FlowDevModel_Save');

      if (data == undefined || data == null) {
        message.info('创建失败:' + data);
        return null;
      } else {
        alert('该单据的审核流程已经创建,模板编号为:' + data);
        //做一些强制性的设置.
        const flow = new Flow();
        flow.No = data;
        await flow.RetrieveFromDBSources();
        // flow.PTable = frmBill.PTable;
        flow.SetValByKey('PTable', frmBill.PTable);
        flow.FrmUrl = frmBill.No;
        flow.BillNoFormat = frmBill.BillNoFormat;
        flow.IsCanStart = 0;
        await flow.Update();

        frmBill.BillCheckModel = 'ByFlowNo';
        frmBill.BillCheckTag = data;
        await frmBill.Update();
      }
      //const url = '/#/WF/Designer/EditFlow?FlowNo=' + data + '&FK_Flow=' + data;

      const url = GloComm.UrlFlowD(data);

      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      // const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      // handler.AddPara('FrmID', this.RefPKVal);
      // const url = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');

      // //创建流程.
      // const url = GloComm.UrlGPN('GPN_NewFlowByFrmBill', '&FrmID=' + this.RefPKVal);
      // return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    // throw new Error('Method not implemented.');
  }
  public async AfterSave(_pageID: string, _pageVal: any) {
    // if (pageID == 'ByFlowNo' && !this.entity?.BillCheckTag) {
    //   const flow = new BSEntity('BP.WF.Flow', this.entity?.BillCheckTag);
    //   flow.No = this.entity?.BillCheckTag;
    //   await flow.Retrieve();
    //   flow.BillNoFormat = this.entity?.BillNoFormat;
    //   flow.PTable = this.entity?.PTable;
    //   await flow.Update();
    //   //const idx = 1;
    // }
  }
  public readonly ByFlowNo = `  
  #### 帮助
  - 如果要绑定的流程为空，请按照要求设计流程，阅读<被启动的流程设计注意事项>
  - 使用流程审批单据, 列表上点新建按钮，就启动流程.
  #### 被启动的流程设计注意事项.
  1. 该流程每个节点都绑定当前单据,使用绑定表单库的表单.
  2. 设置流程业务数据存储表，与当前单据的存储表保持一致.
  3. 该流程单据编号生成规则与单据编号规则一致.
  #### 应用描述
  1. 操作员在列表上点新建，就创建流程,并启动流程, 这个时间单据的状态是BillState, CheckStart=3 开始审核状态.
  1. 如果发送下去: 该BillState状态 Checking =4 审批状态.
  1. 审批完毕后,就是归档状态.Over=100
  `;

  public readonly SelfCheck = `  
  #### 帮助
  - 自定义审核: 是单据的创建人，自定义审核人的路径.
  - 自定义审核包含：自由模式、抢办模式、队列模式、协作模式四种类型.
  
  #### 1.自由模式
  - A起草单据:发送给B,B看到后可以有两种方式处理：1.发送给C, 2.可以执行归档. 归档以后该记录就不能在被编辑了.
  #### 2.抢办模式
  - A起草单据:发送给B,C,D,  BCD三人任意一个审批,就执行归档操作.
  #### 3.队列模式
  - A起草单据:发送给B,C,D,  BCD三人按照顺序进行审批.由最后一个人D进行归档操作.
  #### 4.协作模式
  - A起草单据:发送给B,C,D,  BCD三人同时可以进行审批.由最后一个人D审批完毕后,就执行归档操作.
  
  `;

  public readonly Desc0 = `  
  #### 帮助
  - 不审核，仅仅实现单据的增删改查,统计分析,登记所用.
  - 比如： 出门单，出库单，不需要审核.
  - 单据的状态: 0=空白，1=草稿，2=编辑中, 100=归档.
  `;

  public readonly ByEmpNos = `
  #### 帮助
  - 按照设置人员账号的顺序进行审核.
  `;

  public readonly BySQL = `
  #### 帮助
  - 按照SQL语句获得人员顺序进行审核.
  `;
}
