import { FrmBill } from '../FrmBill';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import WebUser from '/@/bp/web/WebUser';

export class GL_BillStart extends PageBaseGenerList {
  constructor() {
    super('GL_BillStart');
    this.PageTitle = '发起单据';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = 'Name'; //关键字段.
    this.GroupFields = 'SortName'; //分组字段.
    //this.GroupFieldDefault = 'FK_FlowSortText'; //默认分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Windows; //窗口的模式.
    if (WebUser.IsAdmin == true) this.BtnOfToolbar = '新建表单模板';

    // this.BtnOfToolbar = '宫格展示';
    // this.GroupFieldDefault='';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: true, width: '10%' },
      { Key: 'Name', Name: '名称', IsShow: true, width: '65%' },
      { Key: 'SortName', Name: '类别', IsShow: false, width: '50%' },
      { Key: 'Icon', Name: 'Icon', IsShow: false },
      // { Key: 'Btns', Name: '操作', IsShow: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    const data = await handler.DoMethodReturnJson('DB_StartBills');

    //处理数据,增加ICON.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      if (!en.Icon) en.Icon = 'icon-user';

      en.Title = en.Name;
      // en.Btns = '启动流程,近期发起,近期参与,报表';
      en.Btns = '单据门户';
      //'<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>'+en.Name;
    });
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const frmID = object.No;

    const frmBill = new FrmBill(frmID);
    await frmBill.Retrieve();

    let url = '';
    //如果是不
    if (frmBill.BillCheckModel != 'ByFlowNo') {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('FrmID', frmID);
      const workID = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
      url = '/@/CCFast/CCBill/MyBill.vue?FrmID=' + frmID + '&WorkID=' + workID + '&RoutFrom=MyBill';
    } else {
      url = '/@/WF/MyFlow.vue?FlowNo=' + frmBill.BillCheckFlow + '&FrmID=' + frmID + '&IsRegBill=1&RoutFrom=MyBill';
    }

    // alert(url);

    const keys = Object.keys(object);
    for (const key of keys) {
      url += `&${key}=${object[key]}`;
    }
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === '单据门户') {
      const url = GloComm.UrlEn('TS.CCBill.BillSettingOne', object.No); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    if (btnName === '新建表单模板') {
      const url = GloComm.UrlTreeEns('TreeEns_FrmSort2Frm'); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    // if (btnName === '近期发起') {
    //   const url = '/#/WF/GenerList?EnName=GL_RecentStart&FlowNo=' + object.No;
    //   return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    // }
    // if (btnName === '近期参与') {
    //   const url = '/#/WF/GenerList?EnName=GL_RecentWork&FlowNo=' + object.No;
    //   return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    // }
    // if (btnName === '启动流程' || btnName === '发起流程') {
    //   return this.LinkFieldClick(object);
    // }

    alert('没有解析:' + btnName);
  }
}
