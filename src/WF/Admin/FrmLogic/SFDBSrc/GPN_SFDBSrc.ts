import { SFDBSrc } from './SFDBSrc';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_SFDBSrc extends PageBaseGroupNew {
  constructor() {
    super('GPN_SFDBSrc');
    this.ForEntityClassID = 'TS.Sys.SFDBSrc';
    this.PageTitle = '创建数据源';
  }
  public Init() {
    this.AddGroup('A', '关系数据库'); //增加分组.
    this.TextBox3_NameNoNote('MySQL', 'MySQL数据库', GPN_SFDBSrc.MySQL, 'MySQL', '编号', '名称', '连接串', 'MySQL数据库');
    this.TextBox3_NameNoNote('MSSQL', 'SQLServer数据库', GPN_SFDBSrc.MSSQL, 'MSSQL', '编号', '名称', '连接串', 'SQLServer数据库');
    this.TextBox3_NameNoNote('Oracle', 'Oracle数据库', GPN_SFDBSrc.Oracle, 'Oracle', '编号', '名称', '连接串', 'Oracle数据库');
    this.TextBox3_NameNoNote('Informix', 'Informix数据库', GPN_SFDBSrc.DBSrc_NoName, 'Informix', '编号', '名称', '连接串', 'Oracle数据库');
    this.TextBox3_NameNoNote('KingBaseR3', '人大金仓库R3', GPN_SFDBSrc.KindingBase, 'KingBaseR3', '编号', '名称', '连接串', '人大金仓库R3');
    this.TextBox3_NameNoNote('KingBaseR6', '人大金仓库R6', GPN_SFDBSrc.KindingBase, 'KingBaseR6', '编号', '名称', '连接串', '人大金仓库R6');
    this.TextBox3_NameNoNote('UX', '优漩', GPN_SFDBSrc.DBSrc_NoName, 'UX', '编号', '名称', '连接串', '优漩数据库');
    this.TextBox3_NameNoNote('DM', '达梦', GPN_SFDBSrc.DBSrc_NoName, 'DM', '编号', '名称', '连接串', '达梦');
    this.TextBox3_NameNoNote('HGDB', '瀚高', GPN_SFDBSrc.DBSrc_NoName, 'HGDB', '编号', '名称', '连接串', '瀚高');
    this.TextBox3_NameNoNote('PostgreSQL', 'PGSQL数据库', GPN_SFDBSrc.PostgreSQL, 'HGDB', '编号', '名称', '连接串', 'PGSQL数据库');

    this.AddGroup('B', '服务url'); //增加分组.
    this.TextBox3_NameNoNote('WebApi', 'WebApi模式', GPN_SFDBSrc.DBSrc_NoName, 'WebApi', '编号', '名称', '主机地址', 'WebApi模式');
    // this.TextBox3_NameNoNote('WS', 'WebService数据源', GPN_SFDBSrc.DBSrc_NoName, 'WS', '编号', '名称', '主机地址', 'WebService数据源');
    // this.TextBox3_NameNoNote('Dubbo', 'Dubbo服务', GPN_SFDBSrc.DBSrc_NoName, 'Dubbo', '编号', '名称', '主机地址', 'Dubbo服务');
    // this.AddGroup('C', '服务url'); //增加分组.
    // this.AddHelp('Dubbo', 'Dubbo服务', '规划中.');
    // this.AddHelp('Dubbo', 'Dubbo服务', '规划中.');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const en = new SFDBSrc();
    en.No = tb2;
    if ((await en.IsExits()) == true) {
      return new GPNReturnObj(GPNReturnType.Error, '编号已经存在');
    }
    en.Name = tb1;
    en.DBSrcType = pageNo;
    en.ConnString = tb3;
    en.SetPara('EnName', 'TS.Sys.SFDBSrcSQL');
    if (pageNo == 'WebApi') en.SetPara('EnName', 'TS.Sys.SFDBSrcWebApi');

    await en.Insert();
    const url = '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public static readonly MySQL = `
  #### 连接到MySQL数据库
   - 支持mysql各种版本.
   - **C#连接串实例**
     Data Source=127.0.0.1;Port=3306;Initial Catalog=testDB;User ID=root;Password=ccflow;SslMode=none;
   - **Java连接串实例**
     IP=127.0.0.1;Port=3306;DBName=testDB;Username=root;Password=ccflow;
  `;
  public static readonly MSSQL = `
  #### 连接到 MSSQL 数据库
   - 支持 MSSQL 各种版本.
   - **C#连接串实例**
     Data Source=127.0.0.1;Port=1433;Initial Catalog=testDB;User ID=root;Password=ccflow;SslMode=none;
   - **Java连接串实例**
     IP=127.0.0.1;Port=1433;DBName=testDB;Username=root;Password=ccflow;
  `;

  public static readonly Oracle = `
  #### 连接到 Oracle 数据库
   - 支持 Oracle 各种版本.
   - **C#连接串实例**
     Data Source=127.0.0.1:1521/ORCL;User Id=CCFLOW;Password=CCFLOW123;
   - **Java连接串实例**
     IP=127.0.0.1;Port=1521;DBName=testDB;Username=root;Password=ccflow;
  `;

  public static readonly KindingBase = `
  #### 连接到 KindingBase 数据库
   - 支持 KindingBase 各种版本.
   - **C#连接串实例**
     Data Source=127.0.0.1;Port=54321;Initial Catalog=testDB;User ID=root;Password=ccflow;
   - **Java连接串实例**
     IP=127.0.0.1;Port=54321;DBName=testDB;Username=root;Password=ccflow;
  `;
   public static readonly PostgreSQL = `
  #### 连接到 PostgreSQL 数据库
   - 支持 PostgreSQL 各种版本.
   - **C#连接串实例**
     Host=127.0.0.1;Port=5433;Database=testDB;Username=postgres;Password=PostgreSQL
   - **Java连接串实例**
     IP=127.0.0.1;Port=54321;DBName=testDB;Username=root;Password=ccflow;
  `;

  public static readonly DBSrc_NoName = `
  #### 帮助
   - URL数据源也称为webapi数据源,微服务数据源.
   - 通过web服务获得数据源的一种方式.
   - 在数据源定义主机地址,在后面定义.
  `;
}
