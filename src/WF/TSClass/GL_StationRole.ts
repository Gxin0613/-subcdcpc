import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import DBAccess from '/@/utils/gener/DBAccess';

export class GL_StationRole extends PageBaseGenerList {
  constructor() {
    super('GL_StationRole');
    this.PageTitle = '查看人员';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LabFields = 'MsgType';
    const No = this.RequestVal('PKVal');

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'DeptName', Name: '部门名称', IsShow: true },
      { Key: 'Name', Name: '人员名称', IsShow: true },
    ];
    //获得数据源.
    // const sql = `SELECT b.Name FROM port_deptempstation a , port_emp b WHERE a.FK_Emp = b.No AND a.FK_Station = '${No}'`;
    //const sql = `SELECT c.Name AS DeptName, b.Name FROM port_deptempstation a , port_emp b, port_dept c WHERE a.FK_Emp = b.No AND a.FK_Dept=c.No  AND a.FK_Station = '${No}' ORDER BY b.Name`;
    const db = await DBAccess.RunSQLReturnTable('Port_StationRole@Key=' + No);
    //设置数据源.
    this.Data = db;
  }
  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    alert('没有解析:' + object);
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    alert('没有解析:' + btnName);
  }
}
