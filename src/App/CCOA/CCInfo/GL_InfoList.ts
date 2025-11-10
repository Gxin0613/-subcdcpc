import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { Infos } from './Info';
import WebUser from '/@/bp/web/WebUser';
import { GloComm } from '/@/WF/Comm/GloComm';
export class GL_InfoList extends PageBaseGenerList {
  constructor() {
    super('GL_InfoList');
    this.PageTitle = '通知公告';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.LinkField = 'Name'; //焦点字段.
    this.Icon = '';
    if (WebUser.IsAdmin == true) this.BtnOfToolbar = '维护';

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Name', Name: '名称', IsShow: true, DataType: 1, width: 100 },
      { Key: 'RDT', Name: '日期', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Dept', Name: '部门', IsShow: true, DataType: 1, width: 100 },
    ];

    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    const infos = new Infos();
    await infos.RetrieveAll();
    this.Data = infos;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const url = '';
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, object.NodeName);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '维护') {
      const url = GloComm.UrlSearch('TS.CCOA.CCInfo.Info');
      return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer60, url);
    }
    return;
  }
}
