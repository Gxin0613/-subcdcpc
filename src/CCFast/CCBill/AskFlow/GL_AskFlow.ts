import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import WebUser from '/@/bp/web/WebUser';
import GloFrm from '/@/WF/Admin/FrmLogic/GloFrm';
import { isComPage } from '/@/utils/gl';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GenerAskFrm, GenerAskFrms } from '../AskFrm/GenerAskFrm';
import { getAppEnvConfig } from '/@/utils/env';

export class GL_AskFlow extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    //  throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_AskFlow');
    this.PageTitle = '流程';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '创建日期'; //日期字段名.
    this.LinkField = 'Title';
    this.Icon = 'icon-drop';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.ShowIdx = true;
    // this.GroupFields = 'FrmName';
    this.LabFields = 'AskFrmState'; //可以控制内容的转义输出比如 @Red=警告.
    this.BtnOfToolbar = '新建,设计流程';
    // this.GroupFieldDefault = 'AskModelText';
    const flowNo = this.RequestVal('FlowNo');

    const ens = new GenerAskFrms();
    if (flowNo == '' || flowNo == null) {
      await ens.Retrieve('RecNo', WebUser.No, 'AskFrmApp', 'AskFlow', 'RDT');
      //   this.GroupFields = 'FrmName';
      //获得数据.
      // 定义列，这些列用于显示.
      this.Columns = [
        { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false, DataType: 2 },
        { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
        { Key: 'FlowNo', Name: '表单', IsShow: false, IsShowMobile: true, DataType: 1, width: 20 },
        { Key: 'FlowName', Name: '名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        //  { Key: 'AskModelText', Name: '问卷模式', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
        // { Key: 'UserScropText', Name: '用户范围', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
        { Key: 'AskFrmState', Name: '状态', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        // { Key: 'DTFrom', Name: '日期从', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        // { Key: 'DTTo', Name: '到', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },

        { Key: 'NumRelEmp', Name: '下发', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        { Key: 'NumVisite', Name: '访问', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        { Key: 'NumSubmit', Name: '提交', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },

        { Key: 'RecName', Name: '创建人', IsShow: true, IsShowMobile: true, DataType: 1, width: 30 },
        { Key: 'RDT', Name: '创建日期', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
        { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
      ];
    } else {
      //获得数据.
      await ens.Retrieve('FlowNo', flowNo, 'RecNo', WebUser.No, 'RDT');
      //alert(flowNo + 'xxx');
      // 定义列，这些列用于显示.
      this.Columns = [
        { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false, DataType: 2 },
        { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
        //  { Key: 'AskModelText', Name: '问卷模式', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
        // { Key: 'UserScropText', Name: '用户范围', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
        { Key: 'AskFrmState', Name: '状态', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        // { Key: 'DTFrom', Name: '日期从', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
        // { Key: 'DTTo', Name: '到', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },

        { Key: 'NumRelEmp', Name: '下发', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        { Key: 'NumVisite', Name: '访问', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
        { Key: 'NumSubmit', Name: '提交', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },

        { Key: 'RecName', Name: '创建人', IsShow: true, IsShowMobile: true, DataType: 1, width: 30 },
        { Key: 'RDT', Name: '创建日期', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
        // { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
      ];
    }

    const data: any = [];
    for (const en of ens) {
      const row = Object.fromEntries(en.Row);
      data.push(row);
    }

    // //处理数据,增加标签.
    data.forEach((en) => {
      // if ()
      // en.Btns = '生成连接,下发,进度,表单,';
      if (en.AskFrmState == 0) {
        en.AskFrmState = '@设计中=orange';
        //  en.Btns = '连接,下发';
      }
      if (en.AskFrmState == 1) {
        en.AskFrmState = '@运行中=green';
        //  en.Btns = '连接,下发,流程,进度';
      }
      if (en.AskFrmState == 2) {
        en.AskFrmState = '@调查完毕=blue';
        // en.Btns = '流程,进度';
      }
      if (en.AskFrmState == 3) {
        en.AskFrmState = '@强制结束=red';
        // en.Btns = '流程,进度';
      }
      //  if (en.AskFlowSta == 3) en.AskFlowSta = '@退回=red';
      // if (en.PRI == 0) en.PRI = '#80a22e';
      // if (en.PRI == 1) en.PRI = '#ffde72';
      // if (en.PRI == 2) en.PRI = '#db382e';
    });
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const mypk = object.MyPK;
    const en = new GenerAskFrm(mypk);
    await en.Retrieve();
    const url = GloComm.UrlGenerList('GL_AskFlowDtl', '&FlowNo=' + en.FlowNo + '&RefMyPK=' + mypk + '&AskFlowType=AskFlowInside');
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  async BtnClick(btnName: string, _object: Record<string, any>) {
    if (btnName === '下发') {
      const mypk = _object.MyPK;
      const url = GloComm.UrlEnOnly('TS.CCBill.AskFlow.RelToEmp', mypk);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnName === '表单' || btnName == '设计流程') {
      const flowNo = this.RequestVal('FlowNo');
      const { VITE_PUBLIC_PATH } = getAppEnvConfig();
      const path = VITE_PUBLIC_PATH;
      const url = path + `#/WF/Comm/Entity?EnName=TS.WF.FD.FlowJiJian&FlowNo=${flowNo}&PKVal=${flowNo}`;
      window.open(url);
      return;
    }

    if (btnName === '进度') {
      const mypk = _object.MyPK;
      const en = new GenerAskFrm(mypk);
      await en.Retrieve();
      const url = GloComm.UrlGenerList('GL_AskBillDtl', '&AppType=AskFlow&FlowNo=' + en.FlowNo + '&RefMyPK=' + mypk + '&AskFlowType=AskBillInside');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnName === '二维码') {
      const mypk = _object.MyPK;
      const en = new GenerAskFrm(mypk);
      en.Retrieve();
      const url = await en.WXQRCode();
      return;
    }

    if (btnName === '生成连接' || btnName === '连接') {
    //  debugger;
      const en = new GenerAskFrm(_object.MyPK);
      await en.Retrieve();
      // en.AskFlowSta = 1;
      // await en.Update();
      const url = `/#/CCBill/AskFlow/FrmAskQRCode?MyPK=${_object.MyPK}&AskFlowUserType=${_object.AskFlowUserType}&FlowNo=${_object.FlowNo}`;
      return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, url);
    }

    if (btnName == '新建') {
      const frmID = this.RequestVal('FlowNo');
      if (frmID == '' || frmID == null || frmID == undefined) {
        const url = GloComm.UrlGPN('GPN_SelectedAskFlow', '', '');
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, url);
      }

      const name = window.prompt('请输入名称', '我的流程问卷');
      if (name == undefined) return;

      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('FlowNo', frmID);
      handler.AddPara('Title', name);
      await handler.DoMethodReturnString('CreateAskFlow');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, '创建成功');
    }
    if (btnName == '设置') {
      const frmID = this.RequestVal('FlowNo');
      const url = GloComm.UrlEn('TS.CCBill.FrmAsk', frmID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, url);
    }
    if (btnName == '设计表单') {
      // NodeFormType.RefNodeFrm
      const frmID = this.RequestVal('FlowNo');
      await GloFrm.CheckForm(frmID);
      //判断表单类型.
      const md = new MapData(frmID);
      md.No = frmID;
      await md.RetrieveFromDBSources();
      const url = md.UrlDesigner(); //获得设计器的url.
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, isComPage(url));
    }
    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
