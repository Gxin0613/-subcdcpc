import { GloComm } from '/@/WF/Comm/GloComm';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GL_DictStart extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_DictStart');
    this.PageTitle = '实体管理';
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
    this.HisGLShowModel = GenerListPageShowModel.Windows; //窗口的模式.
    if (WebUser.IsAdmin == true) this.BtnOfToolbar = '新建表单模板';
    // this.BtnOfToolbar = '宫格展示';
    // this.GroupFieldDefault='';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: true, width: '10%' },
      { Key: 'Name', Name: '名称', IsShow: true, width: '65%' },
      { Key: 'SortName', Name: '类别', IsShow: false, width: '50%' },
      { Key: 'Icon', Name: 'Icon', IsShow: false },
      // { Key: 'Btns', Name: '操作', IsShow: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    const data = await handler.DoMethodReturnJson('DB_StartDicts');

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
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', object.No);
    const workID = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');

    let url = '/@/CCFast/CCBill/MyBill.vue?FrmID=' + object.No + '&WorkID=' + workID + '&RoutFrom=MyBill';
    const keys = Object.keys(object);
    for (const key of keys) {
      url += `&${key}=${object[key]}`;
    }
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === '单据门户') {
      const url = GloComm.UrlEn('TS.CCBill.DictSettingOne', object.No); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    if (btnName === '新建表单模板') {
      const url = GloComm.UrlTreeEns('TreeEns_FrmSort2Frm'); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    alert('没有解析:' + btnName);
  }
}
