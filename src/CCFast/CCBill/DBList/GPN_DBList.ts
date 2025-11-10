import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import DBAccess from '/@/utils/gener/DBAccess';
import { AuthType } from '/@/bp/auth/AuthType';
import { GloWF } from '/@/WF/Admin/GloWF';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import { PCenter } from '../../GPM/PCenter/PCenter';
export class GPN_DBList extends PageBaseGroupNew {
  public Init() {
    this.AddGroup('A', '数据源实体');
    this.TextBox3_NameNoNote('FrmID', '按表单ID创建', this.HelpTodo, 'DB_', '请输入数据源ID', '输入数据源名称', '请输入表单ID', '我的数据源');
    this.SelectItemsByGroupList('FrmID.Table', '主表字段', this.HelpTodo, true, GloWF.srcFrmGroups, GloWF.srcFrmFields);
    this.SelectItemsByGroupList('FrmID.Table.SelectDtl', '选择从表', this.HelpTodo, true, GloWF.srcFrmGroups, GloWF.srcFrmFields);
    this.SelectItemsByGroupList('FrmID.Table.SelectDtl.Dtl', '从表字段', this.HelpTodo, true, GloWF.srcFrmGroups, GloWF.srcFrmFields);

    //数据源
    //1.设置数据源。本机数据源，
    this.TextBox2_NameNo('View', '按关系数据源创建', this.HelpTodo, 'DBList', '输入ID', '输入名称', '输入表单ID');
    this.TextSQL('View.SQL', '输入查询SQL', this.HelpTodo, 'DBList', 'SELECT No as OID, No as BillNo, Name as Title, Tel,Email  FROM Port_Emp', '请输入SQL');
  }

  constructor() {
    super('GPN_DBList');
    this.PageTitle = '数据源实体';
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (pageNo == 'View') {
      const md = new MapData();
      md.No = tb2;
      if ((await md.IsExits()) == false) {
        message.info('ID:' + tb2 + '已经存在,请重命名.');
        return new GPNReturnObj(GPNReturnType.CloseAndReload);
      }
    }

    if (pageNo == 'View.SQL') {
    }

    if (pageNo == 'FrmID') {
      const md = new MapData();
      md.No = tb2;
      if ((await md.IsExits()) == false) {
        message.info('ID:' + tb2 + '已经存在,请重命名.');
        return new GPNReturnObj(GPNReturnType.CloseAndReload);
      }
      md.No = tb3;
      if ((await md.IsExits()) == false) {
        message.info('输入表单ID' + tb3 + '不存在.');
        return new GPNReturnObj(GPNReturnType.CloseAndReload);
      }
    }

    //开始创建实体.
    if (pageNo == 'FrmID.TableField.Dtl') {
      const dbID = this.RequestVal('tb1', 'FrmID');
      const dbName = this.RequestVal('tb2', 'FrmID');
      const fromFrmID = this.RequestVal('tb3', 'FrmID');

      const tableAttrs = this.RequestVal('tb1', 'FrmID.TableField');
      const dtlAttrs = this.RequestVal('tb1', 'FrmID.TableField.Dtl');

      const frm = new MapData();
      frm.No = fromFrmID;
      await frm.RetrieveFromDBSources();

      //注册表单.
      const md = new MapData();
      md.No = dbID;
      md.Name = dbName;
      md.PTable = dbID;
      await md.Insert();
      const sql = '';
    }

    if (1 == 1) return;

    //执行创建.
    const en = new PCenter();
    en.CtrlObj = this.RequestVal('CtrlObj');
    en.CtrlPKVal = ctrlPKVal;
    en.CtrlModel = pageNo; // AnyOne,Adminer,Depts
    en.CtrlModelT = this.GetPageName(pageNo); //模式名称.
    en.IDs = tb1;
    en.IDNames = tb2;
    en.MyPK = DBAccess.GenerGUID();
    if (pageNo === AuthType.Anyone || pageNo === AuthType.Adminer || pageNo === AuthType.AdminerAndAdmin2) {
      en.IDs = '无';
      en.IDNames = '无';
      en.MyPK = en.CtrlPKVal + '_' + pageNo;
      if ((await en.IsExits()) == true) {
        // alert('已经存在这个模式.');
        message.info('已经存在这个模式');
        return;
      }
    }
    const AuthControlCls = new Map([
      [AuthType.Emps, 'TS.GPM.PCenterEmp'],
      [AuthType.Depts, 'TS.GPM.PCenterDept'],
      [AuthType.Stations, 'TS.GPM.PCenterStation'],
      [AuthType.SQL, 'TS.GPM.PCenterSQL'],
    ]);
    // let enName = AuthControlCls.get(pageNo) || 'None';
    // if (pageNo === AuthType.Emps) enName = 'TS.GPM.PCenterEmp';
    // if (pageNo === 'Depts') enName = 'TS.GPM.PCenterDept';
    // if (pageNo === 'Stations') enName = 'TS.GPM.PCenterStation';
    // if (pageNo === 'SQL') enName = 'TS.GPM.PCenterSQL';
    en.SetPara('EnName', AuthControlCls.get(pageNo as AuthType) || 'None');
    await en.Insert();
    message.info('创建成功');

    return new GPNReturnObj(GPNReturnType.CloseAndReload);
  }
  // 所有人
  public readonly Docs0 = `
  #### 帮助
  - 所有人都可以有权限。
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Anyone.png "屏幕截图.png") 
`;

  //管理员Adminer
  public readonly Docs1 = `
  #### 帮助
  - 只有管理员有权限。
  #### 配置图
  ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Admin.png "屏幕截图.png") 
  `;
  //管理员、二级管理员
  public readonly Docs2 = `
  #### 帮助
  - 管理员和二级管理员有权限。
  #### 配置图
  ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/AdminerAndAmin2.png "屏幕截图.png") 
  `;
  // 按人员计算Emps
  public readonly Docs3 = `
  #### 帮助
  - 按选择的人员赋权。
  #### 配置图
  - ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Emp.png "屏幕截图.png") 
  `;
  // 按角色计算Stations
  public readonly Docs4 = `
  #### 帮助
  - 按选择的角色人员赋权。
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Stations.png "屏幕截图.png") 
  `;
  // 按部门计算
  public readonly Docs5 = `
  #### 帮助
  - 按选择的部门人员赋权。
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Dept.png "屏幕截图.png") 
  `;
  // 按SQL计算
  public readonly Docs6 = `
  #### 帮助
  - 自动抄送给要绑定的人员.1. 输入的SQL是一个查询语句，返回的一行的第一列数据。
  - 该数据大于0 ，就是真(可以拥有此权限)，否则就是假（不能操作此权限）。
  - SQL语句支持ccbpm的表达式，比如：SELECT count(*) FROM Port_Dept WHERE No='@WebUser.DeptNo'。
  #### 说明
  - @WebUser.No 当前登录的人员编号
  - @WebUser.DeptNo 当前登录的部门编号
  - @RDT 是当前日期， 比如：2020-01-01
  - @DateTime 是当前时间， 比如：2020-01-01 10:09
  #### 配置图
   ![输入图片说明](./resource/CCFast/GPM/PCenter/Img/Sql.png "屏幕截图.png") 
  `;
}
