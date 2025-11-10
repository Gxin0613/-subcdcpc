import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { AuthAttr } from '../Comm/Setting/Auth';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_AuthorListMy extends PageBaseGenerList {
  constructor() {
    super('GL_AuthorListMy');
    this.PageTitle = '我的授权';
  }
  //重写的构造方法.
  async Init() {
    // this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    // this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'AutherName';
    // this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    // this.GroupFieldDefault = 'FlowName'; //分组字段.
    // this.LabFields = 'WFState';
    this.Icon = '';
    //  this.BtnOfToolbar = '批处理,打印';
    //  this.BtnsOfRow = '登录并处理工作';
    this.PageSize = 0; // 分页的页面行数, 0不分页.

    //定义列,这些列用于显示.IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: AuthAttr.AutherToEmpNo, Name: '授权给', IsShow: false, DataType: 1 },
      { Key: AuthAttr.AutherToEmpName, Name: '授权给', IsShow: true, DataType: 1 },
      { Key: 'AuthType', Name: '授权方式', IsShow: true, DataType: 1, width: 66, RefFunc: 'AuthType' },
      { Key: 'TakeBackDT', Name: '授权到日期', IsShow: true, DataType: 1, width: 100 },
      { Key: AuthAttr.FlowName, Name: '流程名称', IsShow: true, DataType: 1, width: 100 },
      { Key: 'RDT', Name: '记录日期', IsShow: true, DataType: 1, width: 100 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    const data: any = await handler.DoMethodReturnJson('AuthorListMy_Init');
    data.forEach((en) => {
      if (en.AuthType == 0) {
        en.AuthType = '全部流程';
        en.FlowName = '全部流程';
      }
      if (en.AuthType == 1) {
        en.AuthType = '指定流程';
        en.FlowName = en.FlowNoT;
      }
      if (en.AuthType == 2) en.AuthType = '取消';
    });
    this.Data = data;
  }

  public AuthType(val: number) {
    if (val == 0) return '不授权';
    if (val == 1) return '全部流程授权';
    if (val == 2) return '指定流程授权';
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const url = '/#/Middle/GenerList?EnName=GL_AuthorTodolist&RefNo=' + object.Auther;

    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '批处理') {
      // const url = '/src/WF/Batch.vue?xxx=' + object.WorkID;
      // window.location.href = url;
      return;
    }
    return;
  }
}
