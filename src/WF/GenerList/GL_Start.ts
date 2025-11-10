import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GloComm } from '../Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { router } from '/@/router';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { isComPage } from '/@/utils/gl';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import SimpleLineIcons from '/@form/props/icons/SimpleLineIcons'; //icon列表
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export class GL_Start extends PageBaseGenerList {
  constructor() {
    super('GL_Start');
    this.PageTitle = `${'发起流程'}`;
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = 'Name'; //关键字段.
    this.GroupFields = 'FK_FlowSortText'; //分组字段.
    this.GroupFieldDefault = 'FK_FlowSortText'; //默认分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Windows; //窗口的模式.
    // this.BtnOfToolbar = '宫格展示';
    // this.GroupFieldDefault='';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'Name', Name: '名称', IsShow: true, width: '65%' },
      { Key: 'No', Name: '编号', IsShow: true, width: '10%' },
      { Key: 'FlowNote', Name: '说明', IsShow: false, width: '50%' },
      { Key: 'FK_FlowSortText', Name: '目录', IsShow: true, width: '25%' },
      { Key: 'Icon', Name: 'Icon', IsShow: false },
      { Key: 'Btns', Name: '操作', IsShow: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    const dbs = await handler.DoMethodReturnJson('Start_Init');
    // @ts-ignore
    const data = dbs['Start'];
    //处理数据,增加ICON.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      if (!en.Icon) en.Icon = 'icon-user';
      //随机icon显示
      const randomIndex = Math.floor(Math.random() * SimpleLineIcons.length);
      en.FlowSortIcon = SimpleLineIcons[randomIndex];

      en.Title = en.Name;
      // en.Btns = '启动流程,近期发起,近期参与,报表';
      en.Btns = `${'流程列表'}`;
      //'<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>'+en.Name;
    });
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const flowNo = object.No;

    //检查是否是vsto表单?
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handler.AddPara('FlowNo', flowNo);
    const data = await handler.DoMethodReturnString('MyFlow_CheckVSTOFrm');
    // console.log(data);
    // if (data != '0' && data?.indexOf('AppID=') >= 0) {
    //   data += ',WSUrl=' + getVstoHost() + ',WebHostUrl=' + window.location.origin;
    //   //const url = GloWF.openVSTO('MyFlowExcel', data, data);
    //   //window.open(data); // 期望打开以后
    //   window.location.href = data;
    //   return;
    // }

    //打开相应的傻瓜表单.
    let url = `/src/WF/MyFlow.vue?FlowNo=${flowNo}&RouteFrom=MyFlow`;

    const keys = Object.keys(object);
    for (const key of keys) {
      if (key == 'Title') continue;
      url += `&${key}=${object[key]}`;
    }
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
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
    if (PathHash.includes('/WF/Port') || flowOpenModel == 3) {
      urlPath = isComPage(url);
      url = urlPath + '&win=true';
      // 新标签页打开;
      window.open(url);
      return;
    }
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, object.Name);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url, object.Name);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, object.Name);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url, object.Name);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    // const url = GloComm.UrlEn('TS.TSClass.FlowOneSetting', object.No);
    if (btnName === `${'流程列表'}`) {
      //  const url = `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      const url = GloComm.UrlEn('TS.TSClass.FlowOneSetting', object.No); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
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
