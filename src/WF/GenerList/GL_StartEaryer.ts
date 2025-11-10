import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GloComm } from '../Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { DataType } from '/@/bp/en/DataType';

export class GL_StartEaryer extends PageBaseGenerList {
  constructor() {
    super('GL_StartEaryer');
    this.PageTitle = '最近发起';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.LinkField = 'Title';
    this.GroupFields = 'FK_FlowSortText'; //分组字段.
    this.GroupFieldDefault = 'FK_FlowSortText'; //默认分组字段.
    // this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    // this.GroupFieldDefault = 'FlowName'; //默认分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.
    //this.GroupFieldDefault='';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false },
      { Key: 'FlowNo', Name: 'FlowNo', IsShow: false },
      { Key: 'Name', Name: '标题', IsShow: true, width: 350 },
      { Key: 'No', Name: '编号', IsShow: true, width: '10%' },
      { Key: 'StarterName', Name: '发起人', IsShow: false },
      { Key: 'FlowName', Name: '流程', IsShow: false },
      { Key: 'NodeName', Name: '停留节点', IsShow: false },
      { Key: 'DeptName', Name: '发起人部门', IsShow: false },
      { Key: 'RDT', Name: '发起日期', IsShow: false, DataType: DataType.AppDateTime },
      { Key: 'TodoEmps', Name: '当前处理人', IsShow: false },
      { Key: 'PRI', Name: 'PRI', IsShow: false },

      { Key: 'FK_FlowSortText', Name: '目录', IsShow: true, width: '25%' },
      { Key: 'Icon', Name: 'Icon', IsShow: false },
      { Key: 'Btns', Name: '操作', IsShow: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    // handler.AddUrlData();
    handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    const dbs = await handler.DoMethodReturnJson('StartEaryer_Init');

    const data = dbs['Start'];

    //处理数据,增加ICON.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      if (!en.Icon) en.Icon = 'icon-user';
      en.Title = '<i class=' + en.Icon + '></i><br/>' + en.Name;
      en.Btns = '启动流程,近期发起,近期参与,报表';
      //'<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>'+en.Name;
    });
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    let url = 'MyFlow.vue?FK_Flow=' + object.No;
    const keys = Object.keys(object);
    for (const key of keys) {
      url += `&${key}=${object[key]}`;
    }
    const obj = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    return obj;
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    const url = GloComm.UrlEn('TS.TSClass.FlowOneSetting', object.No);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    // if (btnName === object.Title) throw new Error('Method not implemented.');
  }
}
