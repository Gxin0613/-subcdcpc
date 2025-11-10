import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GloComm } from '../Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_FlowRpt extends PageBaseGenerList {
  constructor() {
    super('GL_FlowRpt');
    this.PageTitle = '分流程查询';
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
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
    // this.BtnOfToolbar = '宫格展示';
    // this.GroupFieldDefault='';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'Name', Name: '名称', IsShow: true, width: '65%' },
      { Key: 'No', Name: '编号', IsShow: true, width: '10%' },
      { Key: 'FlowNote', Name: '说明', IsShow: false, width: 100 },
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
      en.Title = '<i class=' + en.Icon + '></i><br/>' + en.Name;
    });
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const url = GloComm.UrlEn('TS.TSClass.FlowOneSetting', object.No);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    const url = GloComm.UrlEn('TS.TSClass.FlowOneSetting', object.No);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);

    alert('没有解析:' + btnName);
  }
}
