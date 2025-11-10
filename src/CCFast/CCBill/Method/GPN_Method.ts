import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GroupMethods } from './GroupMethod';
import { Method } from './Method';
import DBAccess from '/@/utils/gener/DBAccess';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GloWF } from '/@/WF/Admin/GloWF';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import { FlowSort } from '/@/WF/TSClass/Admin/FlowSort';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { MySystem } from '/@/CCFast/GPM/MySystem';
import { Menus } from '/@/CCFast/GPM/CCMenu/Menu';
import { FrmSort } from '/@/WF/TSClass/Admin/FrmSort';
export class MethodModel {
  public static readonly Link = 'Link';
  public static readonly Func = 'Func';
  public static readonly Bill = 'Bill';
  public static readonly FrmBBS = 'FrmBBS';
  public static readonly DataVer = 'DataVer';
  public static readonly DictLog = 'DictLog';
  public static readonly QRCode = 'QRCode';
  public static readonly DBList = 'DBList';
  public static readonly Toolbar = 'Toolbar';
  public static readonly ImpFromFile = 'ImpFromFile';
  public static readonly PrintRTF = 'PrintRTF';
  public static readonly PrintHtml = 'PrintHtml';
  public static readonly PrintPDF = 'PrintPDF';
  public static readonly PrintZip = 'PrintZip';
  public static readonly FlowBaseData = 'FlowBaseData';
  public static readonly RefFlowTrack = 'RefFlowTrack';
  public static readonly FlowEtc = 'FlowEtc';
  public static readonly FlowSingle = 'FlowSingle';
  public static readonly FlowNewEntity = 'FlowNewEntity';
  public static readonly SingleDictGenerWorkFlows = 'SingleDictGenerWorkFlows';
}
export class GPN_Method extends PageBaseGroupNew {
  constructor() {
    super('GPN_Method');
    this.PageTitle = '新建实体方法';
    this.ForEntityClassID = 'TS.CCBill.Method';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '常规组件', 'icon-doc');
    this.TextBox2_NameNo(MethodModel.Link, '自定义链接', this.Docs0, '', 'URL链接', '链接名称', '我的链接');
    this.TextBox2_NameNo(MethodModel.Func, '方法', this.Docs1, 'Func_', '方法ID', '方法名称', '缴纳班费');
    // this.TextBox3_NameNoNote(MethodModel.Bill, '单据', this.Docs2, 'Bill_', '表单编号', '表单名称', '存储表', '缴费单');
    this.TextBox1_Name(MethodModel.FrmBBS, 'BBS/评论/日志组件', this.Docs3, '名称', '评论');
    this.TextBox1_Name(MethodModel.DataVer, '数据快照', this.Docs4, '名称', '数据快照');
    this.TextBox1_Name(MethodModel.DictLog, '操作日志', this.Docs5, '名称', '操作日志');
    this.TextBox1_Name(MethodModel.QRCode, '二维码', this.Docs6, '名称', '二维码');
    this.TextBox1_Name(MethodModel.DBList, '数据列表', this.Docs13, '名称', '数据列表');

    // this.AddGroup('P', '打印', 'icon-doc');
    // this.TextBox1_Name(MethodModel.PrintRTF, 'RTF模板打印', this.Docs7, '名称', 'RTF模板打印');
    // this.TextBox1_Name('PrintVSTOExcel', 'VSTOExcel模板打印', this.Docs7, '名称', 'VSTOExcel模板打印');
    // this.TextBox1_Name('PrintVSTOWord', 'VSTOWord模板打印', this.Docs7, '名称', 'VSTOWord模板打印');

    // this.TextBox1_Name(MethodModel.PrintHtml, 'Html打印', this.Docs7, '名称', 'Html打印');
    // this.TextBox1_Name(MethodModel.PrintPDF, 'PDF打印', this.Docs7, '名称', 'PDF打印');
    // this.TextBox1_Name(MethodModel.PrintZip, '打包下载', this.Docs7, '名称', '打包下载');

    // this.AddGroup('D', '关联单据', 'icon-doc');
    // this.TextBox2_NameNo('NewBill', '新建单据', this.HelpTodo, 'Bill_', '编号', '名称', '维修单');
    // const frmID = this.RequestVal('FrmID');
    // //增加子页面.
    // const groupSQL = GloWF.SQLOfGpnMethodGroupSQL(frmID); //`SELECT OID as No, Lab as Name FROM Sys_GroupField WHERE FrmID='${frmID}' AND  (CtrlID = '' OR CtrlID IS NULL) `;
    // const attrSQL = GloWF.SQLOfGpnMethodAttrSQL(frmID);
    // //` SELECT MyPK AS No, Name, GroupID FROM Sys_MapAttr WHERE FK_MapData='${frmID}' AND UIContralType <=4 AND KeyOfEn NOT IN ('OID','Rec','RDT','FID','Title','BillNo','BillState','FlowStarter', 'FlowEmps',  'FlowStartRDT','WFState','Emps')  AND UIVisible=1 ORDER BY GroupID,Idx`;
    // this.SelectItemsByGroupList('NewBill.SelectAttrs', '选择字段', this.HelpUn, true, groupSQL, attrSQL);
    // this.SelectItemsByList('NewBill.SelectAttrs.Group', '选择目录', this.HelpUn, false, GloWF.srcFrmTree);

    //关联单据
    // this.SelectItemsByGroupList('RefBill', '关联单据', this.Desc100, false, GloWF.srcFrmTree, GloWF.srcFrmListBill);
    // this.SelectItemsByList('RefBill.DictID', '选择关联字段ID', this.HelpUn, false, this.RefBillAttrs);
    // this.SelectItemsByList('RefBill.DictID.DictName', '选择关联字段Name', this.HelpUn, false, this.RefBillAttrs);

    this.AddGroup('C', '新建流程', 'icon-plane');
    //this.TextBox1_Name(MethodModel.RefFlowTrack, '关联流程轨迹', `查看关联的流程轨迹`, '按钮名称', '查看轨迹');
    this.TextBox1_Name(MethodModel.FlowBaseData, '基础数据变更流程', this.Docs11, '流程名称', '基础数据变更流程');
    this.TextBox1_Name(MethodModel.FlowEtc, '多次业务流程', this.Docs12, '流程名称', '多次业务流程');

    const mapData = new MapData(this.params.PKVal);
    await mapData.Retrieve();
    if (mapData.EntityType != 5) this.TextBox1_Name('FlowHostBill', '寄宿流程', this.DocsFlowHostBill, '流程名称', '寄宿流程');
    this.AddBlank('RefFlow', '关联流程', '请使用创建后导入模式实现');

    // this.TextBox1_Name(MethodModel.FlowNewEntity, '(新建)实体(注册)流程', this.Docs0, '流程名称', 'xx流程');
    this.TextBox1_Name(MethodModel.SingleDictGenerWorkFlows, '实体流程汇总列表(综合流程列表)', this.SingleDictGenerWorkFlows, '流程名称', '流程列表');

    this.AddGroup('E', '引入流程(开发中)', 'icon-plane');
    this.AddBlank('RefFlow1', '寄宿流程', '请使用创建后导入模式实现.');
    this.AddBlank('RefFlow2', '多次业务流程', '请使用创建后导入模式实现.');

    this.AddIcon('icon-link', 'Link');
    this.AddIcon('icon-film', 'Func');
    this.AddIcon('icon-bubbles', 'FrmBBS');
    this.AddIcon('icon-docs', 'DataVer');
    this.AddIcon('icon-film', 'DictLog');
    this.AddIcon('icon-frame', 'QRCode');
    this.AddIcon('icon-list', 'DBList');

    this.AddIcon('icon-print', 'PrintRTF');
    this.AddIcon('icon-print', 'PrintVSTOExcel');
    this.AddIcon('icon-print', 'PrintVSTOWord');

    this.AddIcon('icon-doc', 'NewBill');
    this.AddIcon('icon-doc', 'RefBill');
    this.AddIcon('icon-plane', 'FlowBaseData');
    this.AddIcon('icon-plane', 'FlowEtc');
    this.AddIcon('icon-plane', 'FlowSingle');
    this.AddIcon('icon-plane', 'SingleDictGenerWorkFlows');
  }

  public async FlowFrmModel() {
    return JSON.stringify([
      {
        No: 'RefBill',
        Name: '实体表单引用模式',
      },
      {
        No: 'DataCopy',
        Name: '实体数据复制模式',
      },
    ]);
  }

  //获得数据源的表.
  public async RefBillAttrs() {
    //wanglu. 怎么转换过去?
    const billID = this.RequestVal('tb1', 'RefBill');

    //1. 创建单据.
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_Method');
    handler.AddPara('FrmID', billID);
    const db = await handler.DoMethodReturnString('GPN_Menthd_RefBill_BillAttrs');
    return db;

    // const attrs = new MapAttrs();
    // await attrs.Retrieve('FK_MapData', billID, 'Idx');
    // return attrs;

    // const attrSQL = ` SELECT MyPK AS No, Name, GroupID FROM Sys_MapAttr WHERE FK_MapData='${billID}'
    //  AND UIContralType <=4 AND KeyOfEn NOT IN ('OID','Rec','RDT','FID','Title','BillNo','BillState','FlowStarter',
    // 'FlowEmps','FlowStartRDT','WFState','Emps') AND UIVisible=1 ORDER BY GroupID,Idx `;
    // const db = await DBAccess.RunSQLReturnTable(attrSQL);
    // return db;
    // return attrSQL;
    // const sfdbSrc = new SFDBSrc(src);
    // await sfdbSrc.RetrieveFromDBSources();
    // const tables = await sfdbSrc.GenerTables();
    // return JSON.stringify(tables);
  }

  public async GenerSorts() {
    const ens = new GroupMethods();
    await ens.Retrieve('FrmID', this.PKVal, 'Idx');
    return ens;
  }
  //重写保存方法实现业务逻辑.
  /**
   * 保存方法
   * @param pageID
   * @param sortNo 分类编号
   * @param tb1
   * @param tb2
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const en = new Method();
    en.GroupID = sortNo;
    en.GroupIDT = this.GetSortName(sortNo);
    en.FrmID = this.PKVal;
    en.Icon = this.GetPageIcon(pageID);
    en.IsEnable = true;
    en.Idx = 100;
    en.Name = tb1;
    en.MethodModel = pageID; //方法模式.

    //自定义url.
    if (pageID === MethodModel.Link) {
      en.Name = tb1;
      en.Docs = tb2;
      en.No = DBAccess.GenerGUID();
      en.SetPara('EnName', 'TS.CCBill.MethodLink');
      await en.Insert();

      const url = GloComm.UrlEn('TS.CCBill.MethodLink', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //执行的方法.
    if (pageID === MethodModel.Func) {
      en.Name = tb1;
      en.Docs = tb2;
      en.No = DBAccess.GenerGUID();
      en.SetPara('EnName', 'TS.CCBill.MethodFunc');
      en.MethodID = tb2;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.MethodFunc', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    // 新建单据.
    if (pageID === 'NewBill') {
      const md = new MapData();
      md.No = tb2;
      const val = await md.RetrieveFromDBSources();
      if (val != 0) {
        return new GPNReturnObj(GPNReturnType.Error, '表单ID[' + tb1 + ']已经存在.');
      }
    }

    //关联单据.
    if (pageID == 'RefBill.DictID.DictName') {
      const frmID = this.RequestVal('FrmID'); // this.GetQueryString('FrmID');
      const billID = this.RequestVal('tb2', 'RefBill'); //获得BillID.
      const billName = this.RequestVal('tb1', 'RefBill'); //获得BillID.

      const refDictID = this.RequestVal('tb1', 'RefBill.DictID'); //获得BillID.
      const refDictName = this.RequestVal('tb1', 'RefBill.DictID.DictName'); //获得BillID.

      en.Name = billName;
      en.MethodModel = 'DictRefBill'; //方法模式.
      en.No = frmID + '_' + billID; // DBAccess.GenerGUID();
      en.Tag1 = billID;
      en.Tag2 = billName;
      en.SetPara('EnName', 'TS.CCBill.MethodDictRefBill');
      en.SetPara('RefDictNo', refDictID);
      en.SetPara('RefDictName', refDictName);
      en.MethodID = 'DictRefBill';
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.MethodDictRefBill', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageID == 'NewBill.SelectAttrs.Group') {
      //求出来该表单所在的 菜单，菜单所在大模块，模块所在的系统，把系统编号计算出来.
      const frmID = this.RequestVal('FrmID'); // this.GetQueryString('FrmID');
      const no = this.RequestVal('tb2', 'NewBill');
      const name = this.RequestVal('tb1', 'NewBill');
      const ptable = this.RequestVal('tb3', 'NewBill');
      const frmSort = this.RequestVal('tb1', 'NewBill.SelectAttrs.Group');

      //1. 创建单据.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCFormDesigner');
      handler.AddUrlData();
      handler.AddPara('FK_FrmSort', frmSort);
      handler.AddPara('TB_No', no);
      handler.AddPara('TB_Name', name);
      handler.AddPara('TB_PTable', ptable);
      handler.AddPara('DDL_PTableModel', 0);
      handler.AddPara('EntityType', 1); //单据格式.
      handler.AddPara('SelectAttrs', this.RequestVal('tb1', 'NewBill.SelectAttrs')); //获取选择的字段..
      handler.AddPara('DictFrmID', frmID); //关联的实体.
      await handler.DoMethodReturnString('NewFrmGuide_Create');

      en.Name = name;
      en.MethodModel = 'DictRefBill'; //方法模式.
      en.No = frmID + '_' + no; // DBAccess.GenerGUID();
      en.Tag1 = no;
      en.Tag2 = name;
      en.SetPara('EnName', 'TS.CCBill.MethodDictRefBill');
      en.SetPara('RefDictNo', frmID + 'No');
      en.SetPara('RefDictName', frmID + 'Name');
      en.MethodID = 'DictRefBill';
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCBill.MethodDictRefBill', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //常用组件.
    if (pageID === MethodModel.FrmBBS || pageID === MethodModel.DBList || pageID === MethodModel.DictLog || pageID === MethodModel.QRCode || pageID == MethodModel.DataVer) {
      en.No = this.PKVal + '_' + pageID;
      if (await en.IsExits()) {
        if (pageID != MethodModel.DBList) {
          alert('该组件已经存在,不可重复添加.');
          return;
        }
        en.No = DBAccess.GenerGUID();
        en.MethodID = pageID;
      }
      en.Name = tb1;
      if (pageID === MethodModel.FrmBBS) en.Icon = 'icon-film';
      if (pageID === MethodModel.DictLog) en.Icon = 'icon-eye';
      if (pageID === MethodModel.QRCode) en.Icon = 'icon-frame';
      if (pageID === MethodModel.DataVer) en.Icon = 'icon-camera';
      if (pageID === MethodModel.DBList) en.Icon = 'icon-drop'; //设置默认的icon.

      en.SetPara('EnName', 'TS.CCBill.Method' + pageID);
      await en.Insert();

      const url = GloComm.UrlEn(en.GetParaString('EnName', ''), en.No);
      //alert(url);
      //  const url = '/src/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //打印.
    if (
      pageID === MethodModel.PrintHtml ||
      pageID === MethodModel.PrintPDF ||
      pageID === 'PrintVSTOWord' ||
      pageID === 'PrintVSTOExcel' ||
      pageID === MethodModel.PrintRTF ||
      pageID == MethodModel.PrintZip
    ) {
      en.No = this.PKVal + '_' + pageID;

      if ((pageID === MethodModel.PrintRTF || pageID == 'PrintVSTOWord' || pageID == 'PrintVSTOExcel') && (await en.IsExits()) == true) {
        en.No = DBAccess.GenerGUID(); // this.PKVal + '_' + pageID;
      } else {
        if ((await en.IsExits()) == true) {
          alert('该组件已经存在,不可重复添加.');
          return;
        }
      }

      en.Name = tb1;
      if (pageID === MethodModel.PrintHtml) en.Icon = 'icon-printer';
      if (pageID === MethodModel.PrintPDF) en.Icon = 'icon-printer';
      if (pageID === MethodModel.PrintRTF) en.Icon = 'icon-printer';
      if (pageID === 'PrintVSTOWord') en.Icon = 'icon-printer';
      if (pageID === 'PrintVSTOExcel') en.Icon = 'icon-printer';

      if (pageID === MethodModel.PrintZip) en.Icon = 'icon-cloud-download';
      en.Tag1 = pageID;
      if (pageID == 'PrintRTF' || pageID === 'PrintVSTOWord' || pageID === 'PrintVSTOExcel') en.SetPara('EnName', 'TS.CCBill.MethodPrintRTF');
      else en.SetPara('EnName', 'TS.CCBill.MethodPrint');

      await en.Insert();
      const url = '/src/WF/Comm/En.vue?EnName=TS.CCBill.MethodFlowBaseData&PKVal=' + en.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    let frmID = this.RefPKVal;
    if (!frmID) frmID = this.RequestVal('FrmID');
    let systemNo = '';
    //创建流程的时候先创建流程目录
    if (pageID === MethodModel.FlowBaseData || pageID === MethodModel.FlowEtc || pageID === 'FlowHostBill' || pageID === 'FlowSingleCopyData') {
      //判断是方法所属的实体单据是否存在菜单中
      const menus = new Menus();
      await menus.Retrieve('FrmID', frmID);
      const ens = menus.filter((menuEn) => menuEn.MenuModel === 'Bill' || menuEn.MenuModel === 'EntityNoName' || menuEn.MenuModel === 'Dict');
      let systemName = '';
      let rootNo = 'CCFast';
      let rootName = '';
      if (ens.length >= 1) {
        if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) rootNo = 'CCFast_' + WebUser.OrgNo;
        systemNo = ens[0].SystemNo;
        const system = new MySystem();
        system.No = systemNo;
        await system.Retrieve();
        systemName = system.Name;
        rootName = '低代码流程';
      } else {
        const mapData = new MapData();
        mapData.No = frmID;
        await mapData.Retrieve();
        systemNo = mapData.FK_FormTree;
        const frmSort = new FrmSort();
        frmSort.No = systemNo;
        await frmSort.Retrieve();
        systemName = frmSort.Name;
        rootNo = SystemConfig.CCBPMRunModel != CCBPMRunModel.Single ? WebUser.OrgNo || '1' : '1';
      }

      //获取系统.
      const flowSort = new FlowSort();
      flowSort.No = systemNo;
      if ((await flowSort.IsExits()) == false) {
        flowSort.No = rootNo;
        if ((await flowSort.IsExits()) == false && rootNo.startsWith('CCFast')) {
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
    }

    //修改实体属性.
    if (pageID === MethodModel.FlowBaseData) {
      const name = tb1;
      const groupID = sortNo;
      const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_Method');
      // @ts-ignore
      handler.AddPara('SortNo', systemNo); //该实体的类别编号与，流程的类别编号一致.
      handler.AddPara('FlowName', name);
      handler.AddPara('Name', name);
      handler.AddPara('FrmID', frmID);
      handler.AddPara('FlowDevModel', 1); //设置为极简模式.
      handler.AddPara('GroupID', groupID); // 方法的的GroupID..
      handler.AddPara('ModuleNo', ''); // 隶属的方法模板.
      const data = await handler.DoMethodReturnString('FlowBaseData_Save');
      const url = GloComm.UrlEn('TS.CCBill.MethodFlowBaseData', data);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      // }
    }

    // 关联流程轨迹
    if (pageID == MethodModel.RefFlowTrack) {
      en.No = this.PKVal + '_' + pageID;
      if (await en.IsExits()) {
        alert('该组件已经存在,不可重复添加.');
        return;
      }
      en.Name = tb1;
      en.Icon = 'icon-doc'; //设置默认的icon.
      en.SetPara('EnName', 'TS.CCBill.Method' + pageID);
      await en.Insert();
      const url = GloComm.UrlEn(en.GetParaString('EnName', ''), en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //新建其他业务流程.
    if (pageID === MethodModel.FlowEtc || pageID === 'FlowHostBill' || pageID === 'FlowSingleCopyData') {
      const name = tb1;
      const groupID = sortNo;
      const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_Method');
      handler.AddPara('SortNo', systemNo); //该实体的类别编号与，流程的类别编号一致.
      handler.AddPara('FlowName', name);
      handler.AddPara('Name', name);
      handler.AddPara('FrmID', frmID);
      handler.AddPara('FlowDevModel', pageID === 'FlowHostBill' ? 3 : 1); //设置为极简模式.
      handler.AddPara('GroupID', groupID); // 方法的的GroupID..
      handler.AddPara('ModuleNo', ''); // 隶属的方法模板..
      handler.AddPara('FlowModel', pageID); // 流程模式..

      const data = await handler.DoMethodReturnString('FlowEtc_Save');
      const url = GloComm.UrlEn('TS.CCBill.Method' + pageID, data);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    // if (pageID === MethodModel.FlowNewEntity) {
    //   alert('未实现.');
    //   return;
    // }

    //流程实体汇总列表.
    if (pageID === MethodModel.SingleDictGenerWorkFlows) {
      // en.No = this.RefPKVal + '_' + pageID;
      en.No = this.PKVal + '_' + pageID;
      if ((await en.IsExits()) == true) {
        alert('该组件已经存在,不可重复添加.');
        return;
      }
      en.Name = tb1;

      en.MethodID = MethodModel.SingleDictGenerWorkFlows;
      en.MethodModel = MethodModel.SingleDictGenerWorkFlows; //设置为链接按钮.
      en.RefMethodType = 1;
      en.Icon = 'icon-drop';
      en.SetPara('EnName', 'TS.CCBill.MethodSingleDictGenerWorkFlow');
      en.Insert();

      const url = '/src/WF/Comm/En.vue?EnName=TS.CCBill.MethodSingleDictGenerWorkFlow&PKVal=' + en.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //alert('没有判断的PageID:' + pageID);
  }

  public readonly SingleDictGenerWorkFlows = `
  #### 帮助
  - 一个实体发起的所有流程
  - 比如：在一个学生身上发起的：请假流程、入党申请流程、基本资料变更流程。
  - 比如：在一个固定资产身发起的：领用流程、维修流程、折旧流程、移交流程。
  - 所有的流程都组合一个表显示出来。
  `;

  public readonly Desc100 = '暂未开放';

  // URL连接
  public readonly Docs0 = `
  #### 帮助
   - 用于解决不能实现的，对实体的操作个性化较强的功能。
   - 比如：您输入的url为外部链接: http://ccbpm.cn/MyUrl.htm
   - 比如：您需要打开系统内部的一个vue文件: /src/WF/Comm/En.vue 这个文件必须位于项目内部。
   - 系统将解析为: http://ccbpm.cn/MyUrl.htm?WorkID=xxxx&FrmID=xxxx&UserNo=xxxx&Token=xxxx。
  #### 效果图
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/Link.png "屏幕截图.png")      
  `;

  // Func, '方法'
  public readonly Docs1 = `
  #### 帮助
  - 对一个实体记录，执行相关的操作。
  - 例如：执行一段SQL或者Javascript脚本。
  #### 无参数的方法效果
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/Func.png "屏幕截图.png")    
  #### 有参数的方法效果
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/Func2.png "屏幕截图.png")    
  `;

  // Bill, '单据:缴费单、维修单、报销单不需流程审批.
  public readonly Docs2 = `
  #### 帮助
   - 单据就是依赖于实体存在流水性质的记账凭证。
   - 比如：出门证、介绍信、证明函。
   - 比如：出库单、入库单。
  `;

  // FrmBBS, 'BBS/评论/日志组件', this.Docs3
  public readonly Docs3 = `
  #### 帮助
  - 一个实体里只有一个该组件菜单。
  - 应用场景：填写客户跟踪信息、实体跟踪记录、实体留言记录、多个人对一个实体的操作记录。
  #### 效果图
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/FrmBBS.png "屏幕截图.png")     
  `;

  // DataVer, '数据快照', this.Docs4
  public readonly Docs4 = `
  #### 帮助
  - 类似于数据库的备份。
  - 可以在一定的事件对当前的实体进行数据备份，可以恢复数据到指定的数据备份。
  #### 效果图
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/DataVer.png "屏幕截图.png") 
  `;

  // DictLog, '操作日志', this.Docs5,
  public readonly Docs5 = `
  #### 帮助
  - 操作日志，留存操作痕迹。
  #### 效果图
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/DictLog.png "屏幕截图.png") 
  `;

  // QRCode, '二维码(扫码手机上查看)', this.Docs6,
  public readonly Docs6 = `
  #### 帮助
  - 该二维码是一个用于数据扫描查看的二维码。
  -  用户扫一扫就可以在手机上查看该表单的信息。
  -  如果您需要填报二维码，请在菜单新建【表单填报二维码】。
  #### 效果图
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/QRCode.png "屏幕截图.png") 
  `;

  public readonly Docs13 = `
  #### 帮助
  - 写一个sql语句，返回一个列表
  `;

  // PrintRTF,PrintVSTOExcel,PrintVSTOWord, 'RTF模板打印', this.Docs7,
  public readonly Docs7 = `
  #### 帮助
  - ccfrom提供三种打印模式，以模版类型划分，分别是：rtf、vstoExcel、vstoWord。
  - rtf不需要安装插件，需要通过替换标记生成vsto文件。
  - vstoWord、vstoExcel需要安装插件才能完成。

  #### 打印模版设置
  - 三种模式的打印，必须首先设置打印模版。
  - 设置步骤: 表单设计器=》表单属性=》打印模版。
  #### 运行图1
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/ToolbarRuning.png "屏幕截图.png") 
  #### 效果图2
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/ToolbarSetting.png "屏幕截图.png")    
  `;
  // PrintHtml, 'Html打印', this.Docs8,
  public readonly Docs8 = `
  #### 帮助
  - 无
  `;
  // PrintPDF, 'PDF打印', this.Docs9,
  public readonly Docs9 = `
  #### 帮助
  - 无
  `;
  // PrintZip, '打包下载', this.Docs10,
  public readonly Docs10 = `
  #### 帮助
  -无
  `;
  // FlowBaseData, '(实体)修改基础数据流程', this.Docs11
  public readonly Docs11 = `
  #### 帮助
  - 比如：基础资料变更、法人变更、企业变更、状态变更。
  - 操作当前一行数据（一个实体的基础数据变更)。
  - 流程结束后，系统就会把这些字段同步到实体中去。
  - <a target="_blank" href="https://www.bilibili.com/video/BV11dQqYDEf3/">流程与实体的关系</a>
  #### 开发说明
  - 点击确定后，系统自动创建一个极简模式流程。
  - 此流程的表单，是从当前实体表单中复制而来的。
  - 您可以根据自己的需要新增与删除字段。
  - 可以在方法属性里，设置数据同步方式与同步内容。
  #### 效果图
  ![输入图片说明](./resource/CCFast/CCBill/Method/Img/FlowBaseData.png "屏幕截图.png")    
  `;

  //流程宿主单据
  public readonly DocsFlowHostBill = `
  #### 应用场景
  - 一个单据(合同)，需要绑定到一个流程上做审批，在流程运行过程中对表单数据的修改，即可反映到单据上，既修改的数据就是单据的记录。
  - 单据为流程运动提供审批数据，流程在运动过程中，影响单据的BillState的状态。
  - 单据是宿主，流程是寄生虫，一个宿主可以有多个寄生虫。
  - 单据在一个时间点，只能把数据提供给一个寄生虫使用。
  - ccbpm把上述模式称为【宿主流程】。
  - 流程发起后，单据的BillState不能修改，属于审批状态，流程走完以后，设置归档状态。
  - 流程没有完成，就不能再发起，只能发起一次。
  - 流程运动过程中退回，要更新单据的 BillState 状态，设置为退回。
  #### 设计实现
  - 该流程是绑定独立表单，该表单就是单据。
  - 在表单与节点的关系中，设置 WhoIsPK 是父流程ID或单据OID。
  - 启动流程的时候，系统就会设置 WF_GenerWorkFlow 的 PWorkID= 单据的OID，PFlowNo=单据的FrmID，PNodeID=0，PEmpNo=@WebUser.No
  - 该流程不能被独立发起。
  - 流程运动过程中影响单据的状态Frm_GenerBill 的 BillState。
  `;

  //复制数据模式.
  public readonly DocsFlowSingleCopyData = `
    #### 应用场景
    - 一个单据(合同)，需要绑定一个流程上做审批，在流程运行过程中对表单数据的修改，即可反映到单据上，既修改的数据就是单据的记录。
    - ccbpm把上述模式称为应用单据数据审批模式。
    #### 设计实现
    - 该流程是绑定独立表单，该表单就是单据。
    - 在表单与节点的关系中，设置 WhoIsPK 是父流程ID或单据OID。
    - 启动流程的时候，系统就会设置 PWorkID= 单据的OID，PFlowNo=单据的FrmID，PNodeID=0，PEmpNo=@WebUser.No
    `;

  //多次业务流程
  public readonly Docs12 = `
  #### 帮助
  - 比如：物业费缴纳、维修流程、派车流程、处罚流程、嘉奖流程、三好学生评定。
  - 流程运行完毕后，就作为业务查询数据。
  - 启动流程的时候，单据数据copy到开始节点上。
  #### 开发说明
  - 点击确定后，系统自动创建一个极简模式的流程。
  - 此流程的表单，是从当前实体表单中复制而来的。
  - 您可以根据自己的需要新增与删除字段。
  - <a href=https://www.bilibili.com/video/BV12P4y1p74h/>流程与实体的关系</a>
    
  `;
  public readonly DocsFlowSingle = `
  #### 帮助
  - 在一个单据中，仅仅发起一次的流程，我们成为单次流程。
  - 比如：合同，发起审核流程，注销流程。
  - 创建单次流程系统为当前表单设置为如下字段,其中XXX是流程编号。
  - WFStateXXXX，状态。
  - FlowStarterXXXX，发起人名称。
  - FlowStartRDT，发起日期。
  - FlowEndNodeIDXXX，结束节点。
  - FlowEndNodeNameXXX，节点名称。
  - WorkIDXXX，工作ID。
  - 流程在运行过程中会更新这些字段。
  #### 1.数据引用模式
  - 创建的流程类型为绑定单表单流程，绑定的表单就是当前的表单。
  - 把当前的低代码开发的表单绑定到每个节点上。
  - 表单与节点的关系属性里设置，WhoIsPK 为 父流程节点ID或者单据OID。
   #### 2.数据复制模式
  - 创建的是极简模式的流程，开始节点表单的内容(字段)是从当前实体或者单据复制过去的。
  - 启动流程的时候，把当前的表单数据复制到开始节点表单上去,流程运转的数据与当前实体或者单据无关系。
  #### 开发说明
  - <a href=https://www.bilibili.com/video/BV12P4y1p74h/>流程与实体的关系</a>
  `;
}
