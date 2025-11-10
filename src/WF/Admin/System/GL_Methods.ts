import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../FoolFormDesigner/dto/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_Methods extends PageBaseGenerList {
  constructor() {
    super('GL_Methods');
    this.PageTitle = '系统工具';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = ''; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.LinkField = 'Name';
    this.GroupFields = 'GroupName'; //分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Windows; //窗口的模式.
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Name', Name: '名称', IsShow: true, DataType: 1, width: 200 },
      { Key: 'Help', Name: '帮助', IsShow: true, DataType: 1, width: 200 },
      { Key: 'GroupName', Name: '分组', IsShow: true, DataType: 1, width: 200 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    const data: any = await handler.DoMethodReturnJson('MethodLink_Init');
    this.Data = data;
    //console.log('data', this.Data);
  }

  //打开页面.
  async LinkFieldClick(_object: Record<string, any>) {
    //执行点击事件
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('M', _object.No);
    const data: any = await handler.DoMethodReturnJson('Method_Done');
    return new GPNReturnObj(GPNReturnType.Message, data);
  }

  BtnClick(_btnName: string, _object: Record<string, any>) {}
}
