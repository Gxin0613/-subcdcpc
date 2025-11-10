import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import dayjs from 'dayjs';
import { Flow } from '../TSClass/Flow';
import { getAppEnvConfig } from '/@/utils/env';
import { GetPara, IsMobile } from '/@/utils/gener/StringUtils';
import { isComPage } from '/@/utils/gl/index';
import { router } from '/@/router';
import { GloComm } from '../Comm/GloComm';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import WebUser from '/@/bp/web/WebUser';
import { AtPara } from '/@/bp/da/AtPara';
import { getVstoHost } from '/@/utils/VstoUtils';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export class GL_Todolist extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_Todolist');
    this.PageTitle = '待办';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //'发起日期'; //日期字段名.
    this.LinkField = 'Title'; //焦点字段.

    let flowNo = this.RequestVal('FlowNo'); //流程编号参数.
    if (!flowNo) flowNo = this.RequestVal('PKVal');

    if (!!flowNo) {
      this.GroupFields = 'NodeName,StarterName'; //分组字段.
    } else {
      this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
      this.GroupFieldDefault = 'FlowName'; //默认分组字段.
    }

    this.LabFields = 'WFState';
    this.Icon = '';

    // this.BtnOfToolbar = '批处理';   //批处理按钮点击跳转有问题，先移除
    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    let isShowColumn = true;
    if (!!flowNo) {
      const flow = new Flow();
      flow.No = flowNo;
      await flow.Retrieve();
      //自定义显示列.
      if (flow.BuessFieldRole == 1) {
        isShowColumn = false;
        this.Columns = [
          { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
          { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
          { Key: 'FlowStarterName', Name: '发起人', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
          { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
          { Key: 'WFState', Name: '标签', IsShow: false, IsShowMobile: true, DataType: 2, width: 150 },
        ];
        const keys = flow.BuessFields.split(',');
        const bussFieldNames = flow.BuessFieldNames || flow.GetParaString('BuessFieldNames', '');
        const names = bussFieldNames.split(',');
        for (let i = 0; i < keys.length; i++) {
          this.Columns.push({
            Key: keys[i],
            Name: names[i],
            IsShow: true,
            IsShowMobile: false,
            DataType: 2,
          });
        }
      }
    }

    //定义列,这些列用于显示, IsRead, PRI是特殊字段.
    // if (this.Columns == null) {
    //   // 增加字段.
    //   // 增加标签.
    // }
    if (isShowColumn == true)
      this.Columns = [
        { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
        { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
        { Key: 'StarterName', Name: '发起人', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
        { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
        { Key: 'NodeID', Name: '节点ID', IsShow: false, IsShowMobile: false, DataType: 1, width: 150 },
        { Key: 'NodeName', Name: '停留节点', IsShow: true, IsShowMobile: false, DataType: 1, width: 150, enableSearch: true, options: [] },
        { Key: 'FlowName', Name: '流程', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
        { Key: 'Sender', Name: '发送人', IsShow: true, DataType: 1, width: 121 },
        { Key: 'SendDT', Name: '发送时间', IsShow: true, DataType: 7, width: 144 },
        // { Key: 'PRI', Name: 'PRI', IsShow: true, IsShowMobile: false, DataType: 1, width: 50, RefFunc: 'PRI' },
        { Key: 'SDT', Name: '应完成日期', IsShow: true, IsShowMobile: false, DataType: DataType.AppDateTime, width: 150 },
        { Key: 'ADT', Name: '接收时间', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 80, RefFunc: 'FirendlyDT' },
        { Key: 'IsRead', Name: '是否读取', IsShow: false, IsShowMobile: false, DataType: 2, RefFunc: 'IsRead' },
        {
          Key: 'WFState',
          Name: '标签',
          IsShow: false,
          IsShowMobile: true,
          DataType: 2,
          width: 100,
        },
      ];
    const IsRead = this.RequestVal('IsRead');
    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddUrlData();
    handler.AddPara('FlowNo', flowNo);
    if (!!IsRead) handler.AddPara('IsRead', IsRead);
    const data: any = await handler.DoMethodReturnJson('Todolist_Init');
    const curr = dayjs(DataType.CurrentDateTime).toDate();
    const ndNameSet = new Set();
    //处理数据,增加标签.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      let lab = '';
      if (en.SDT != '无' && dayjs(en.SDT).toDate() < curr) lab = '@逾期=red';
      if (en.WFState == 1) {
        en.WFState = '@草稿=orange';
        en.SDT = '';
      }
      if (en.WFState == 2) en.WFState = lab + '@新工作=green';
      if (en.WFState == 4) en.WFState = '@挂起=yellow';
      if (en.WFState == 7) en.WFState = '@废=red';
      if (en.WFState == 5) en.WFState = lab + '@退回=red';
      if (en.WFState == 3) en.WFState = lab + '@归档=blue';
      if (en.WFState == 6) en.WFState = lab + '@移交=red';
      if (en.WFState == 8) en.WFState = lab + '@加签=green';
      if (en.AtPara.includes('@IsCC=1')) {
        en.WFState = '@抄送=blue';
        en.SDT = ''; //没有应完成日期.
      }
      // <i class="glyphicon glyphicon-bookmark" style="color:red"></i>
      // <i class="glyphicon glyphicon-bookmark" style="color:yellow"></i>
      // <i class="glyphicon glyphicon-bookmark" style="color:green"></i>
      // if (en.PRI == 0) en.PRI = '<img src="./resource/WF/Img/PRI/0.png" style="display:inline"/>';
      // if (en.PRI == 1) en.PRI = '<img src="./resource/WF/Img/PRI/1.png" style="display:inline"/>';
      // if (en.PRI == 2) en.PRI = '<img src="./resource/WF/Img/PRI/2.png" style="display:inline"/>';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';
      en.ADT = this.FirendlyDT(en.ADT);
      en.SDT = !!en.SDT && en.SDT != '无' ? dayjs(en.SDT).format('YYYY-MM-DD HH:mm') : '无';
      en.RDT = !!en.RDT ? (en.RDT == '无' ? '无' : dayjs(en.RDT).format('YYYY-MM-DD HH:mm')) : '';
      //处理发送人 for ningbogang
      const sender = en.Sender;
      if (sender != null && sender != '' && sender != undefined) {
        en.Sender = sender.split(',').length > 1 ? sender.split(',')[1].replace(';', '') : sender.split(',')[0];
      }
      ndNameSet.add(en.NodeName);
    });
    const nameCol = this.Columns.find((item) => item.Key === 'NodeName');
    if (nameCol)
      nameCol.options = Array.from(ndNameSet).map((item) => {
        return {
          label: item,
          value: item,
        };
      });
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    const workID = object.WorkID;
    const workBillNo = object.BillNo || '';
    //如果是单据.
    if (object.SysType == 'FrmBill') {
      const frmID = object.FK_Flow;
      let myurl = GloComm.UrlMyBill(frmID, workID);
      myurl += '&WorkBillNo=' + workBillNo;
      if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, myurl, object.Title);
      if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, myurl, object.Title);
      if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, myurl, object.Title);
      if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, myurl, object.Title);
    }
    let url = '/src/WF/MyFlow.vue?WorkID=' + workID;
    const atpara = object.AtPara;

    // 判断是否是vsto.
    if (atpara.includes('@AppID=MyFlow') == true) {
      const ap = new AtPara(atpara);
      const appID = ap.GetValStrByKey('AppID');
      const frmID = 'ND' + object.FK_Node;
      const flowNo = object.FK_Flow;
      const nodeID = object.FK_Node;
      let myurl = `excelform://-fromccflow,AppID=${appID},WorkID=${workID},FlowNo=${flowNo},FrmID=${frmID},NodeID=${nodeID},Token=${WebUser.Token}`;
      myurl += ',WSUrl=' + getVstoHost() + ',WebHostUrl=' + window.location.origin;
      window.location.href = myurl + '&WorkBillNo=' + object.BillNo;
      return;
    }

    if (!!atpara && (atpara.includes('@IsCC=1') || atpara.includes('@IsAuto=1'))) {
      url = '/src/WF/MyCC.vue?WorkID=' + workID;
      if (atpara.includes('@NodeIDWork')) {
        url += '&NodeIDWork=' + GetPara(atpara, 'NodeIDWork');
      }
    }
    const keys = Object.keys(object);
    const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID', 'PFlowNo', 'PNodeID'];
    for (const key of keys) {
      if (key === 'WorkID') continue;
      if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
    }
    url += '&WorkBillNo=' + workBillNo;
    const PathHash = location.hash;
    let urlPath: any = '';
    if (IsMobile()) {
      const mobileUrl = url.replace('/src/WF/', '/CCMobile/').replace('.vue', '');
      try {
        router.push(mobileUrl);
      } catch (e: any) {
        location.hash = '#' + mobileUrl;
      }
      return;
    }
    if (PathHash.includes('/WF/Port') || PathHash.includes('/FEForward') || flowOpenModel == 3) {
      urlPath = isComPage(url);
      url = urlPath + '&win=true';
      // 新标签页打开;
      window.open(url);
      return;
    }
    //   window.open(url); //打开页面。
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, object.NodeName);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url, object.NodeName);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, object.NodeName);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url, object.NodeName);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    const hashUrl = window.location.hash;
    let url = '';
    const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
    if (btnName == '批处理') {
      if (object) {
        if (hashUrl.includes('WF') == true) url = '/#/WF/Comm/GenerList?EnName=GL_Batch&NodeID=' + object.NodeID;
        else if (hashUrl.includes('Middle') == true) url = '/#/Middle/GenerList?EnName=GL_Batch&NodeID=' + object.NodeID;
        else url = '/#/WF/Comm/GenerList?EnName=GL_Batch&NodeID=' + object.NodeID;
        if (VITE_GLOB_IS_THIRDPART_SYSTEM) url = url.replace('/Comm', '');
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      } else {
        if (hashUrl.includes('WF') == true) url = '/#/WF/Comm/GenerList?EnName=GL_Batch';
        else if (hashUrl.includes('Middle') == true) url = '/#/Middle/GenerList?EnName=GL_Batch';
        else url = '/#/CCMobile/GenerList?EnName=GL_Batch&Title=批处理';
        if (VITE_GLOB_IS_THIRDPART_SYSTEM) url = url.replace('/Comm', '');
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }
    }

    // alert('未实现的按钮功能:' + btnName);
    return;
  }
}
