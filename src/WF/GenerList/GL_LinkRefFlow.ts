import { message } from 'ant-design-vue';
import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import { GenerWorkFlowExts } from '../TSClass/FlowData/GenerWorkFlowExt';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import Event from '/@/utils/Events';
import { Node } from '/@/WF/TSClass/Node';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { router } from '/@/router';

export class GL_LinkRefFlow extends PageBaseGenerList {
  constructor() {
    super('GL_LinkRefFlow');
    this.PageTitle = '关联流程单据';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.PageTitle = '关联流程单据';
    // this.GroupFieldDefault = 'FlowName';
    this.PageSize = 10; // 分页的页面行数, 0不分页.
    this.Icon = '';
    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.
    this.ShowCheckBox = true;
    const flowNo = this.RequestVal('FlowNo');

    this.BtnOfToolbar = '保存';
    //查询数据.
    const gwfs = new GenerWorkFlowExts();
    await gwfs.Retrieve('WFState', 3, 'FK_Flow', flowNo, 'WorkID');
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'WorkID', Name: '主键', IsShow: false, IsShowMobile: false },
      { Key: 'Title', Name: '标题', width: 250 },
      { Key: 'NodeName', Name: '停留节点', width: 120 },
      { Key: 'RDT', Name: '发起日期', width: 150 },
    ];

    const data: any = [];
    for (const gwf of gwfs) {
      const da = Object.fromEntries(gwf.Row);
      data.push(da);
    }
    data.forEach((en) => {
      const useKeys = ['WorkID', 'FK_Flow', 'FK_Node', 'Title'];
      const parts = [];
      useKeys.forEach((key) => {
        if (en[key] !== undefined) {
          parts.push(`${key}=${en[key]}`);
        }
      });
      en.WorkID = parts.join('@');
    });
    //设置数据源.
    this.Data = data;
  }
  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const parts = object.WorkID.split('@');
    let workId = 0;
    for (const part of parts) {
      if (part.startsWith('WorkID=')) {
        workId = part.split('=')[1];
        break;
      }
    }
    let url = location.pathname + '#/WF/MyView?WorkID=' + workId;
    const keys = Object.keys(object);
    const useKeys = ['FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID'];
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
    if (IsMobile()) {
      const mobileUrl = url.replace('/src/WF/', '/CCMobile/').replace('.vue', '');
      try {
        router.push(mobileUrl);
      } catch (e: any) {
        location.hash = '#' + mobileUrl;
      }
      return;
    }
    return new GPNReturnObj(GPNReturnType.OpenIframeByModal, url);
  }

  //按钮事件.
  async BtnClick(btnName: string, _object: Record<string, any>, Rows) {
    //按钮事件.
    if (btnName === '保存') {
      Event.emit('LinkRefFlow', Rows);
    }
  }
}
