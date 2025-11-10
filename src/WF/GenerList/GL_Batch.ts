import { message } from 'ant-design-vue';
import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { IsMobile } from '/@/utils/gener/StringUtils';

export class GL_Batch extends PageBaseGenerList {
  constructor() {
    super('GL_Batch');
    this.PageTitle = '批处理';
  }
  //重写的构造方法.
  async Init() {
    // this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    // this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Name';
    this.GroupFields = 'FlowName'; //分组字段.
    this.GroupFieldDefault = 'FlowName'; //默认分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    this.Icon = '';
    // this.BtnOfToolbar = '批处理,打印';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.LabFields = 'WFState';
    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'FlowName', Name: '流程', IsShow: true, IsShowMobile: false, DataType: 1, width: 200 },
      { Key: 'Name', Name: '节点名称', IsShow: true, DataType: 1, width: 200 },
      { Key: 'NodeID', Name: '节点ID', IsShow: true, DataType: 1, width: 66 },
      { Key: 'BatchRole', Name: '规则', IsShow: false, IsShowMobile: false, DataType: 1, width: 200 },
      { Key: 'Num', Name: '待办数', IsShow: true, DataType: 7, width: 144 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    //
    const data: any = await handler.DoMethodReturnJson('Batch_Init');
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    // alert('批量处理未完成.');
    // return;
    if (object.BatchRole == 1) {
      if (IsMobile()) {
        const url = '/src/CCMobile/WorkOpt/Batch/BatchWorkCheckModel.vue?NodeID=' + object.NodeID;
        const obj = new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
        return obj;
      } else {
        //要根据不同的, 如何转向?  /#/WF/Comm/GenerList?EnName=GL_Batch
        const url = '/src/WF/WorkOpt/Batch/BatchWorkCheckModel.vue?NodeID=' + object.NodeID;
        // const url = GloComm.UrlGenerList('GL_BatchWorkCheckModel', '&NodeID=' + object.NodeID);
        const title = object.FlowName + ': ' + object.Name;
        const obj = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, title);
        return obj;
      }
    }
    if (object.BatchRole == 2) {
      message.warning(`批量处理BatchRole=${object.BatchRole},[字段分组模式批处理]开发中.`);
      return null;
    }
    message.warning(`批量处理规则BatchRole=${object.BatchRole}开发中.`);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === object.WorkID) return null;
    // throw new Error('Method not implemented.');
  }
}
