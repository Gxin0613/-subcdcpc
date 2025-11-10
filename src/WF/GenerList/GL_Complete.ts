import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';
import dayjs from 'dayjs';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { Node } from '/@/WF/TSClass/Node';
import { message } from 'ant-design-vue';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { isComPage } from '/@/utils/gl';
import { router } from '/@/router';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

export class GL_Complete extends PageBaseGenerList {
  constructor() {
    super('GL_Complete');
    this.PageTitle = '已完成';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title'; //焦点字段.
    this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    this.GroupFieldDefault = 'FlowName'; //默认分组字段.
    this.Icon = '';
    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    let flowNo = this.RequestVal('FlowNo'); //流程编号参数.
    if (!flowNo) flowNo = this.RequestVal('PKVal');

    //定义列,这些列用于显示, IsRead, PRI是特殊字段.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
      { Key: 'StarterName', Name: '发起人', IsShow: true, IsShowMobile: true, DataType: 1, width: 66 },
      { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 160 },
      { Key: 'NodeID', Name: '节点ID', IsShow: false, IsShowMobile: false, DataType: 1, width: 150 },
      { Key: 'NodeName', Name: '停留节点', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
      { Key: 'FlowName', Name: '流程', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
      //{ Key: 'RDT', Name: '发起', IsShow: true, IsShowMobile: false, DataType: 7, width: 160 },
      { Key: 'Sender', Name: '发送人', IsShow: true, DataType: 1, width: 121 },
      // { Key: 'PRI', Name: 'PRI', IsShow: true, IsShowMobile: false, DataType: 1, width: 50, RefFunc: 'PRI' },
      { Key: 'SDTOfNode', Name: '应完成日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 100 },
      //{ Key: 'ADT', Name: '接收时间', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 90, RefFunc: 'FirendlyDT' },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('FlowNo', flowNo);
    const data: any = await handler.DoMethodReturnJson('Complete_Init');
    const curr = dayjs(DataType.CurrentDateTime).toDate();
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
      // if (en.PRI == 0) en.PRI = '<img src="resource/WF/Img/PRI/0.png" style="display:inline"/>';
      // if (en.PRI == 1) en.PRI = '<img src="resource/WF/Img/PRI/1.png" style="display:inline"/>';
      // if (en.PRI == 2) en.PRI = '<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';

      en.RDT = !!en.RDT ? (en.RDT == '无' ? '无' : dayjs(en.RDT).format('YYYY-MM-DD HH:mm')) : '';
      //处理发送人 for ningbogang
      const sender = en.Sender;
      if (sender != null && sender != '' && sender != undefined) {
        en.Sender = sender.split(',').length > 1 ? sender.split(',')[1].replace(';', '') : sender.split(',')[0];
      }
    });

    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const workID = object.WorkID;
    // let url = '/#/WF/MyView?WorkID=' + workID;
    let url = '/src/WF/MyView.vue?WorkID=' + workID;
    const keys = Object.keys(object);
    const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID'];
    for (const key of keys) {
      if (key === 'WorkID') continue;
      if (key === 'FK_Node') {
        let nodeID = object[key];
        const node = new Node();
        node.setPKVal(nodeID);
        const i = await node.RetrieveFromDBSources();
        if (i == 0) {
          message.warning('节点[' + nodeID + ']已经删除,打开开始节点的流程信息');
          nodeID = parseInt(parseInt(object.FK_Flow || object.FlowNo) + '01');
        }
        url += `&${key}=${nodeID}`;
        continue;
      }
      if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
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
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  BtnClick(btnName: string, record: Record<string, any>) {
    console.log(btnName);
    console.log(record);
  }
}
