import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GL_Online extends PageBaseGenerList {
  override LinkFieldClick(object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
 
  constructor() {
    super('GL_Online');
    this.PageTitle = '在线人员';
  }
   override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  //重写的构造方法.
  async Init() {
      // this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
      // this.LinkField = 'Name';   //焦点字段.
    // this.GroupFields = 'GroupName'; //分组字段.
    // this.HisGLShowModel = GenerListPageShowModel.Windows; //窗口的模式.
    //  this.HisGLShowModel = GenerListPageShowModel.Table;
      this.BtnOfToolbar = '查询';
      this.Icon = '';
      this.PageSize = 0; // 分页的页面行数, 0不分页.
      
     // 定义列，这些列用于显示
      this.Columns = [
      { Key: 'No', Name: '登录编号', IsShow: false, DataType: 1, width: 80 },
      { Key: 'EmpName', Name: '登录名称', IsShow: true, DataType: 1, width: 80 },
      { Key: 'IP', Name: 'IP', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Locatinon', Name: '登录地点', IsShow: true, DataType: 1, width: 150 },
      { Key: 'Brower', Name: '浏览器', IsShow: true, DataType: 1, width: 80 },
      { Key: 'OS', Name: '操作系统', IsShow: true, DataType: 1, width: 80 },
      { Key: 'TokenModel', Name: 'Token模式', IsShow: true, DataType: 1, width: 80 },
      { Key: 'RDT', Name: '登录时间', IsShow: true, DataType: 1, width: 120 },
      { Key: 'LastRDT', Name: '最后活跃时间', IsShow: true, DataType: 1, width: 120 },
    ];
    await this.reloadInfo();
  }
  async reloadInfo(){
   //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm_Sys');
    const data: any = await handler.DoMethodReturnJson('OnLineCustomer');
    this.Data = data;
  }
   async BtnClick(_btnName: string, _object: Record<string, any>) {
    if (_btnName == '查询') {
        await this.reloadInfo();
      }
  }
}
