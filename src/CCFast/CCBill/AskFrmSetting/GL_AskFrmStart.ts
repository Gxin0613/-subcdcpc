import { GloComm } from '/@/WF/Comm/GloComm';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import WebUser from '/@/bp/web/WebUser';

export class GL_AskFrmStart extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_AskFrmStart');
    this.PageTitle = '创建活动';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = 'Name'; //关键字段.
    this.GroupFields = 'SortName'; //分组字段.
    //this.GroupFieldDefault = 'FK_FlowSortText'; //默认分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
    if (WebUser.IsAdmin == true) this.BtnOfToolbar = '新建活动';

    // this.BtnOfToolbar = '宫格展示';
    // this.GroupFieldDefault='';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: true, width: '20%' },
      { Key: 'Name', Name: '名称', IsShow: true, width: '30%' },
      { Key: 'SortName', Name: '类别', IsShow: false, width: '50%' },
      { Key: 'Icon', Name: 'Icon', IsShow: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    const data = await handler.DoMethodReturnJson('GL_AskFrmStart');

    //处理数据,增加ICON.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      if (!en.Icon) en.Icon = 'icon-user';
      en.Title = en.Name;
      // en.Btns = '启动流程,近期发起,近期参与,报表';
      en.Btns = '单据门户';
      //'<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>'+en.Name;
    });
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const frmID = object.No;
    const url = GloComm.UrlGenerList('GL_AskFrm', '&FrmID=' + frmID);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === '单据门户') {
      const url = GloComm.UrlEn('TS.CCAskFrm.AskFrmSettingOne', object.No); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    if (btnName === '新建活动') {
      const url = GloComm.UrlTreeEns('TreeEns_FrmSort2Frm'); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    alert('没有解析:' + btnName);
  }
}
