import { GloComm } from '/@/WF/Comm/GloComm';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { getAppEnvConfig } from '/@/utils/env';
import { getVstoHost } from '/@/utils/VstoUtils';
import { message } from 'ant-design-vue';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import Dev2InterfaceAth from '/@/WF/CCForm/Dev2InterfaceAth';

export class GL_Printer extends PageBaseGenerList {
  constructor() {
    super('GL_Printer');
    this.PageTitle = '打印';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    const frmID = this.RequestVal('FrmID');
    let frmIDs = this.RequestVal('FrmIDs');
    const workID = this.RequestVal('WorkID');
    const nodeID = this.RequestVal('FK_Node') || this.RequestVal('NodeID');
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = 'FrmPrintTemplateName'; //关键字段.
    if (!!frmIDs) this.GroupFields = 'FrmID'; //分组字段.

    this.BtnOfToolbar = '下载VSTO插件';
    //this.GroupFieldDefault = 'FK_FlowSortText'; //默认分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
    this.BtnsOfRow = '打印,VSTO打印';
    this.LabFields = 'State';
    this.Columns = [];
    if (!!frmIDs) this.Columns.push({ Key: 'FrmID', Name: '表单名称', IsShow: true, width: '10%' });
    frmIDs = frmIDs || frmID;
    this.Columns.push(
      { Key: 'MyPK', Name: '编号', IsShow: false, width: '10%' },
      { Key: 'FrmPrintTemplateName', Name: '模板名称', IsShow: true, width: '30%' },
      { Key: 'RTFFileName', Name: '文件名称', IsShow: false, width: '10%' },
      { Key: 'State', Name: '状态', IsShow: true, width: '10%' },
      { Key: 'RDT', Name: '打印日期', IsShow: true, width: '10%' },
      { Key: 'RecNo', Name: '打印人编号', IsShow: false, width: '15%' },
      { Key: 'RecName', Name: '打印人', IsShow: true, width: '15%' },
      { Key: 'Icon', Name: 'Icon', IsShow: false, width: '15%' },
      { Key: 'Btns', Name: 'Btns', IsShow: false, width: '15%' },
    );

    //获得数据源.
    this.Data = [];
    const arrFrmID = frmIDs.split(',');
    for (const frmNo of arrFrmID) {
      if (!!frmNo) {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill_Opt');
        handler.AddPara('FrmID', frmNo);
        handler.AddPara('WorkID', workID);
        handler.AddPara('NodeID', nodeID);
        const data = await handler.DoMethodReturnJson('Printer_Init');

        //处理数据,增加ICON.
        data.forEach((en) => {
          if (en.State != '作废') {
            en.Icon = 'icon-user';
            if (en.State == '未打印') en.State = '@未打印=black';
            if (en.State == '已打印') en.State = '@已打印=green';
            if (en.State == '作废') en.State = '@作废=red';
            en.Btns = '';
            if (en.State != '未打印') en.Btns = '重新打印,';
            en.Btns += '下载,VSTO打开';
            if (CommonConfig.IsOnlinePreviewOfAth == true) en.Btns += ',KKFile预览';
            this.Data.push(en);
          }
        });
      }
    }
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_Opt');
    handler.AddPara('TemplateID', object.FrmPrintTemplateID);
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    handler.AddPara('WorkID', this.RequestVal('WorkID'));
    handler.AddPara('DBMyPK', object.MyPK); //模板实例的ID,没有用处.
    handler.AddPara('OpenType', 0);
    handler.AddPara('NodeID', this.RequestVal('FK_Node') || this.RequestVal('NodeID'));
    const fileUrl = await handler.DoMethodReturnString('Printer_SelectOne');
    const { VITE_GLOB_PREVIEW_URL } = getAppEnvConfig();
    const url = VITE_GLOB_PREVIEW_URL + fileUrl;

    //怎么刷新页面？
    await this.Reload();
    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === '打印') {
      const url = GloComm.UrlEn('TS.CCBill.DictSettingOne', object.No); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    if (btnName == '下载VSTO插件') {
      window.open('http://eyer.ccbpm.cn/DownLoad/vstoinstall.exe');
      return;
    }
    if (btnName == '下载' || btnName == 'VSTO打开' || btnName == '重新打印' || btnName == 'KKFile预览') {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill_Opt');
      handler.AddPara('TemplateID', object.FrmPrintTemplateID);
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('WorkID', this.RequestVal('WorkID'));
      handler.AddPara('DBMyPK', object.MyPK); //模板实例的ID,没有用处.
      handler.AddPara('NodeID', this.RequestVal('FK_Node') || this.RequestVal('NodeID'));
      handler.AddPara('PWorkID', this.RequestVal('PWorkID'));
      handler.AddPara('FID', this.RequestVal('FID'));
      if (btnName == '重新打印') {
        handler.AddPara('OpenType', 0);
        handler.AddPara('IsRePrint', 1);
      } else {
        handler.AddPara('OpenType', btnName == '下载' ? 0 : 1); //0:下载    1：vsto
      }

      let fileUrl = await handler.DoMethodReturnString('Printer_SelectOne');
      if (fileUrl.indexOf('err@') >= 0) {
        message.error('请先设置打印模版');
      } else if (fileUrl && fileUrl?.indexOf('AppID=') >= 0) {
        fileUrl += ',WSUrl=' + getVstoHost() + ',WebHostUrl=' + window.location.origin;
        window.location.href = fileUrl;
      } else {
        const { VITE_GLOB_API_URL } = getAppEnvConfig();
        fileUrl = fileUrl.replace('file@pdf@', '/');
        let url = VITE_GLOB_API_URL + fileUrl;
        if (btnName == 'KKFile预览') {
          url = (await Dev2InterfaceAth.OpenAthKKViewByPath(url)) || '';
        }
        window.open(url);
      }
      await this.Reload();
    }
  }
}
