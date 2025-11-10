import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import WebUser from '/@/bp/web/WebUser';
export class GL_BillDraft extends PageBaseGenerList {
  constructor() {
    super('GL_BillDraft');
    this.PageTitle = '草稿';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '保存日期'; //日期字段名.
    this.LinkField = 'Title';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    //this.GroupFields = 'FlowName';
    //this.GroupFieldDefault = 'FlowName';

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false },
      { Key: 'Title', Name: '标题', IsShow: true },
      { Key: 'RDT', Name: '编写时间', IsShow: true },
      { Key: 'FlowName', Name: '流程', IsShow: true },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddUrlData();
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    this.Data = await handler.DoMethodReturnJson('DB_Draft');
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const workID = object.WorkID;
    let url = '/@/CCFast/CCBill/MyBill.vue?FrmID=' + object.No + '&WorkID=' + workID + '&RoutFrom=MyBill&Frm=Draft&U=' + WebUser.No;
    const keys = Object.keys(object);
    for (const key of keys) {
      if (key === 'WorkID') continue;
      url += `&${key}=${object[key]}`;
    }

    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === object.WorkID) throw new Error('Method not implemented.');
  }
}
