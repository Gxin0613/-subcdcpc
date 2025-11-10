import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { DataType } from '/@/bp/en/DataType';
import { Node } from '/@/WF/TSClass/Node';
import { message } from 'ant-design-vue';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { router } from '/@/router';

export class GL_RecentStart extends PageBaseGenerList {
  constructor() {
    super('GL_RecentStart');
    this.PageTitle = '我发起的';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title';
    const flowNo = this.RequestVal('FlowNo');

    if (flowNo == null) {
      this.GroupFields = 'NodeName,FlowName'; //分组字段.
      this.GroupFieldDefault = ''; //分组字段.
    } else {
      this.GroupFields = 'NodeName'; //停留节点.
      this.GroupFieldDefault = ''; //停留节点.
    }

    //alert(this.GroupFieldDefault);
    this.LabFields = 'WFState';
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, DataType: 1, width: 350 },
      { Key: 'FK_Flow', Name: 'FK_Flow', IsShow: false, DataType: 1, width: 150 },
      { Key: 'FlowName', Name: '流程', IsShow: true, DataType: 1, width: 150 },
      { Key: 'NodeName', Name: '停留节点', IsShow: true, DataType: 1, width: 150 },
      { Key: 'TodoEmps', Name: '当前处理人', IsShow: true, DataType: 1, width: 150 },
      { Key: 'RDT', Name: '发起时间', IsShow: true, DataType: 7, width: 144 },
      // { Key: 'PRI', Name: 'PRI', IsShow: true, DataType: 1, width: 50 },
      // { Key: 'WFState', Name: '标签', IsShow: true, DataType: 2 },
      { Key: 'WFState', Name: '标签', IsShow: true, IsShowMobile: true, DataType: 2, width: 160 },
    ];

    this.BtnsOfRow = 'Copy发起';
    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('FlowNo', flowNo); //我发起的流程.
    const data: any = await handler.DoMethodReturnJson('RecentStart_Init');

    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      let lab = '';
      if (en.SDT >= DataType.CurrentDateTime) lab = '@逾期=red'; //@lyc
      if (en.WFState == 0) en.WFState = '@空白';
      if (en.WFState == 1) en.WFState = '@草稿=orange';
      if (en.WFState == 2) en.WFState = '@新工作=green';
      if (en.WFState == 4) en.WFState = '@挂起=yellow';
      if (en.WFState == 7) en.WFState = '@删除=red';
      if (en.WFState == 5) en.WFState = lab + '@退回=red';
      if (en.WFState == 3) en.WFState = lab + '@归档=blue';
      if (en.WFState == 6) en.WFState = lab + '@移交=red';
      if (en.WFState == 8) en.WFState = lab + '@加签=red';
      // if (en.PRI == 0) en.PRI = '<img src="resource/WF/Img/PRI/0.png" style="display:inline"/>';
      // if (en.PRI == 1) en.PRI = '<img src="resource/WF/Img/PRI/1.png" style="display:inline"/>';
      // if (en.PRI == 2) en.PRI = '<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';
    });

    this.Data = data;
    console.log('data', this.Data);
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    // let url = '/#/WF/MyView?WorkID=' + object.WorkID;
    const workBillNo = object.BillNo || '';
    let url = '/src/WF/MyView.vue?WorkID=' + object.WorkID;
    if (IsMobile()) {
      url = '/CCMobile/MyView?WorkID=' + object.WorkID;
    }
    url += '&WorkBillNo=' + workBillNo;
    const keys = Object.keys(object);
    for (const key of keys) {
      if (key === 'WorkID' || key === 'WFState') continue;
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
      url += `&${key}=${object[key]}`;
    }
    if (IsMobile()) {
      router.push(url);
      return;
    }
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === 'Copy发起') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF');
      handler.AddPara('FK_Flow', object.FK_Flow);
      handler.AddPara('WorkID', object.WorkID);
      const data = handler.DoMethodReturnString('Start_CopyAsWorkID');
      // const url = '/#/WF/MyFlow?WorkID=' + data + '&FK_Flow=' + object.FK_Flow;
      const url = '/src/WF/MyFlow.vue?WorkID=' + data + '&FK_Flow=' + object.FK_Flow;
      const obj = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
      return obj;
    }
    return;
    // throw new Error('Method not implemented.');
  }
}
