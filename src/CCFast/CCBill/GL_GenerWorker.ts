import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GenerWorkers } from '/@/CCFast/CCBill/GenerWorker';

export class GL_GenerWorker extends PageBaseGenerList {
  constructor() {
    super('GL_GenerWorker');
    this.PageTitle = '审核人员';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = ''; //关键字段.
    this.GroupFields = ''; //分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
    this.LabFields = 'PassSta';
    this.Columns = [
      { Key: 'Idx', Name: '节点步骤', IsShow: true, width: '10%' },
      { Key: 'EmpNo', Name: '处理人编号', IsShow: true, width: '20%' },
      { Key: 'EmpName', Name: '处理人名称', IsShow: false, width: '10%' },
      { Key: 'PassSta', Name: '状态', IsShow: true, width: '10%' },
      { Key: 'RDT', Name: '记录日期', IsShow: true, width: '15%' },
      { Key: 'SendDT', Name: '单据活动时间', IsShow: true, width: '15%' },
    ];

    //获得数据源.
    const workers = new GenerWorkers();
    await workers.Retrieve('WorkID', this.RequestVal('WorkID'));
    this.Data = [];
    workers.forEach((item) => {
      if (item.PassSta === 0) item.PassSta = '未开始';
      if (item.PassSta === 1) item.PassSta = '进行中';
      if (item.PassSta === 2) item.PassSta = '已通过';
      this.Data.push(item);
    });
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {}

  async BtnClick(btnName: string, object: Record<string, any>) {}
}
