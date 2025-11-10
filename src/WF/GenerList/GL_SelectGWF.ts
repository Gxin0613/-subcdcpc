import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import { getAuthCache } from '/@/utils/auth';
import { ADMIN_TOKEN_KEY, TESTER_KEY } from '/@/enums/cacheEnum';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GenerWorkFlowExts } from '../TSClass/FlowData/GenerWorkFlowExt';

export class GL_SelectGWF extends PageBaseGenerList {
  constructor() {
    super('GL_SelectGWF');
    this.PageTitle = '切换测试实例';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Title';
    this.PageSize = 0; // 分页的页面行数, 0不分页.

    //定义列.
    this.Columns = [
      { Key: 'WorkID', Name: 'WorkID', IsShow: true, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, DataType: 1, width: 350 },
      { Key: 'NodeName', Name: '停留节点', IsShow: true, DataType: 1, width: 100 },
      { Key: 'TodoEmps', Name: '当前处理人', IsShow: true, DataType: 1, width: 350 },
      { Key: 'RDT', Name: '发起日期', IsShow: true, DataType: 1, width: 120 },
      { Key: 'SendDT', Name: '最后处理日期', IsShow: true, DataType: 1, width: 120 },
    ];

    //获得数据.
    const gwfs = new GenerWorkFlowExts();
    await gwfs.Retrieve('Starter', this.RequestVal('TesterNo'), 'WFState', 2, 'FK_Flow', this.RequestVal('FlowNo'), 'WorkID DESC');

    this.Data = gwfs;
    this.Data.forEach((item) => {
      item.NodeName = item.FK_Node + '_' + item.NodeName;
    });
  }
  //打开页面.
  async LinkFieldClick(record: Record<string, any>) {
    const flowNo = this.RequestVal('FlowNo');
    //页面跳转到测试容器
    const url =
      '/#/WF/TestingContainer/Default?TesterNo=' +
      getAuthCache(TESTER_KEY) +
      '&FlowNo=' +
      flowNo +
      '&WorkID=' +
      record.WorkID +
      '&CurrPage=FlowInstance&Token=' +
      getAuthCache(ADMIN_TOKEN_KEY) +
      '&t=' +
      Math.random();
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  /**
   * 按钮操作，包含工具栏、行操作 ，
   * @param btnName 按钮名称
   * @param record 行数据
   * @constructor
   */
  BtnClick(btnName: string, record: Record<string, any>) {
    console.log(btnName);
    console.log(record);
    return;
  }
}
