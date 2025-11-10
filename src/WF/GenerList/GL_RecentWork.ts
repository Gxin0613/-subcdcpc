import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Node } from '/@/WF/TSClass/Node';
import { message } from 'ant-design-vue';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { router } from '/@/router';
import { isComPage } from '/@/utils/gl';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { useI18n } from '/@/hooks/web/useI18n';
import { AtPara } from '/@/bp/da/AtPara';

const { t } = useI18n();
export class GL_RecentWork extends PageBaseGenerList {
  constructor() {
    super('GL_RecentWork');
    this.PageTitle = '近期工作';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title';
    // this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    // this.GroupFieldDefault = 'FlowName'; //分组字段.
    this.LabFields = 'WFState';
    this.Icon = '';

    const flowNo = this.RequestVal('FlowNo');
    this.BtnOfToolbar = '';
    this.PageSize = 15; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, DataType: 1, width: 350 },
      { Key: 'StarterName', Name: '发起人', IsShow: true, DataType: 1, width: 66 },
      { Key: 'RDT', Name: '发起日期', IsShow: true, DataType: 7, width: 144 },
      { Key: 'NodeName', Name: '停留节点', IsShow: true, DataType: 1, width: 150 },
      { Key: 'FlowName', Name: '流程', IsShow: true, DataType: 1, width: 150 },

      { Key: 'Sender', Name: '发送人', IsShow: true, DataType: 1, width: 121 },
      { Key: 'SendDT', Name: '发送时间', IsShow: true, DataType: 7, width: 144 },
      { Key: 'HS', Name: '耗时', IsShow: true, DataType: 7, width: 144 },
      // { Key: 'PRI', Name: 'PRI', IsShow: true, IsShowMobile: false, DataType: 1, width: 50 },
      // { Key: 'SDT', Name: '应完成时间', IsShow: true, DataType: 7, width: 144 },
      // { Key: 'ADT', Name: '接收时间', IsShow: true, DataType: 7, width: 150 },
      { Key: 'WFState', Name: '标签', IsShow: false, DataType: 2, width: 160 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('FlowNo', flowNo); //是否按照flowNo查询.
    const data: any = await handler.DoMethodReturnJson('RecentWork_Init');
    dayjs.extend(duration);
    //处理数据,增加标签. @liuwei.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      const lab = '';
      // if (en.SDT >= DataType.CurrentDateTime) lab = '@逾期=red'; //@lyc
      if (en.WFState == 1) en.WFState = '@草稿=orange';
      if (en.WFState == 2) en.WFState = '@新工作=green';
      if (en.WFState == 3) en.WFState = lab + '@归档=blue';
      if (en.WFState == 4) en.WFState = '@挂起=yellow';
      if (en.WFState == 5) en.WFState = lab + '@退回=red';
      if (en.WFState == 6) en.WFState = lab + '@移交=red';
      if (en.WFState == 7) en.WFState = '@作废=red';
      if (en.WFState == 8) en.WFState = lab + '@加签=red';
      // if (en.PRI == 0) en.PRI = '<img src="resource/WF/Img/PRI/0.png" style="display:inline"/>';
      // if (en.PRI == 1) en.PRI = '<img src="resource/WF/Img/PRI/1.png" style="display:inline"/>';
      // if (en.PRI == 2) en.PRI = '<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';
      const givenDate = dayjs(en.RDT); // "2024-08-02 17:50:17"
      let currentDataTimes = dayjs(DataType.CurrentDateTimes); // "2024-08-02 18:49:31"
      if (en.WFSta === 1) {
        const atPara = new AtPara(en.AtPara);
        currentDataTimes = dayjs(atPara.GetValStrByKey('EnFlowRDT') || en.SendDT);
      }
      // 计算 givenDate 和 currentDataTimes 之间的差异（秒）
      const diffInSeconds = currentDataTimes.diff(givenDate, 'second');
      // 使用 dayjs.duration 来创建一个持续时间对象
      const duration = dayjs.duration(diffInSeconds * 1000); // 注意：dayjs.duration 需要毫秒数
      // 根据时间差的不同部分来格式化字符串
      if (duration.asHours() < 1) {
        en.HS = duration.format('m分'); // 使用方括号可以避免当分钟或秒数为 1 时前面的 'm' 或 's' 被解释为 'minute' 或 'second' 的缩写
      } else if (duration.asDays() < 1) {
        en.HS = duration.format('H时m分');
      } else {
        en.HS = duration.format('D天H时m分');
      }
    });

    this.Data = data;

    this.GroupFields = 'NodeName,FlowName'; //分组字段.
    this.GroupFieldDefault = ''; //分组字段.

    console.log('data', this.Data);
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    // let url = '/#/WF/MyView?WorkID=' + object.WorkID + '&IsReadonly=1';
    let nodeID = object['FK_Node'];
    const workBillNo = object.BillNo || '';
    const node = new Node();
    node.setPKVal(nodeID);
    const i = await node.RetrieveFromDBSources();
    if (i == 0) {
      message.warning('节点[' + nodeID + ']已经删除,打开开始节点的流程信息');
      nodeID = parseInt(parseInt(object.FK_Flow || object.FlowNo) + '01');
    }
    let workID = object.WorkID;
    if (node.NodeWorkType != 6 && object.FID != 0) workID = object.FID;
    let url = '/src/WF/MyView.vue?WorkID=' + workID + '&IsReadonly=1';
    // if (IsMobile()) {
    //   url = '/CCMobile/MyView?WorkID=' + object.WorkID + '&IsReadonly=1';
    // }
    const keys = Object.keys(object);
    const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID', 'PFlowNo', 'PNodeID'];
    for (const key of keys) {
      if (key === 'WorkID') continue;
      if (key === 'FK_Node') {
        url += `&${key}=${nodeID}`;
        continue;
      }
      if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
    }
    url += '&WorkBillNo=' + workBillNo;
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
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, object.NodeName);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url, object.NodeName);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, object.NodeName);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url, object.NodeName);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '批处理') {
      const url = '/@/WF/Batch?' + object.WorkID;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      return;
    }

    alert('没有处理功能' + btnName);
    return;
    // throw new Error('Method not implemented.');
  }
}
