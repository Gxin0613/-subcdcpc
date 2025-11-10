import { message } from 'ant-design-vue';
import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { isComPage } from '/@/utils/gl';
import { Node } from '/@/WF/TSClass/Node';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { router } from '/@/router';
import dayjs from 'dayjs';
import { DataType } from '/@/bp/en/DataType';

export class GL_Focus extends PageBaseGenerList {
  constructor() {
    super('GL_Focus');
    this.PageTitle = '我的关注(收藏)';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '保存日期'; //日期字段名.
    this.LinkField = 'Title';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.GroupFields = 'FlowName';

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false },
      { Key: 'Title', Name: '标题', IsShow: true, width: '300px' },
      { Key: 'FlowName', Name: '流程', IsShow: true },
      { Key: 'StarterName', Name: '发起人', IsShow: true },
      { Key: 'RDT', Name: '发起时间', IsShow: true },
      { Key: 'Sender', Name: '发送人', IsShow: true },
      { Key: 'NodeName', Name: '停留节点', IsShow: true },
      { Key: 'PRI', Name: 'PRI', IsShow: false, RefFunc: 'PRI' },
      { Key: 'SendDT', Name: '接收时间', IsShow: true },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    const data: any = await handler.DoMethodReturnJson('Focus_Init');
    console.log('data', data);

    const curr = dayjs(DataType.CurrentDateTime).toDate();
    //处理数据,增加标签. @liuwei.
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
      if (en.WFState == 7) en.WFState = '@作废=red';
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
    });

    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    // let url = '/#/WF/MyView?';
    let url = '/src/WF/MyView.vue?';
    const keys = Object.keys(object);
    const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID'];
    for (const key of keys) {
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

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === object.WorkID) throw new Error('Method not implemented.');
  }
}
