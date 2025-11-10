import { SFTable } from '../SFTable';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_SFTable extends PageBaseGroupNew {
  constructor() {
    super('GPN_SFTable');
    this.ForEntityClassID = 'TS.FrmUI.SFTable';
    this.PageTitle = '新建字典';
  }
  public Init() {
    this.AddGroup('A', '新建字典'); //增加分组.
    this.TextBox2_NameNo('SFTableDict', '内置字典表', this.SFTable, 'SF_', '字典ID', '字典名称', '');
    this.SelectItemsByList('SFTableDict.CodeStruct', '数据结构', this.SFTable, false, this.GetCodeStruct());
    //  this.SelectItemsByList('SFTable.Type', '数据结构', this.SFTable, 'SF_', '字典ID', '字典名称', '');

    this.TextBox2_NameNo('SQL', 'SQL查询字典表', this.SQL, 'SQL_', '字典ID', '字典名称', '');
    this.TextSQL('SQL.Doc', '填写SQL', this.SQL_Doc, '查询SQL', `SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'`, '查询语句');
    this.SelectItemsByList('SQL.Doc.CodeStruct', '数据结构', this.SFTable, false, this.GetCodeStruct());

    this.TextBox2_NameNo('WebApi', 'WebApi接口字典表', this.WebApi, '', '字典ID', '字典名称', '');
    this.TextSQL('WebApi.Doc', '服务链接', this.WebApi_Url, '路径与参数', `/xxx.do`, '输入主机的后部分');
    this.SelectItemsByList('WebApi.Doc.CodeStruct', '数据结构', this.SFTable, false, this.GetCodeStruct());

    this.TextBox2_NameNo('Handler', '微服务Handler字典表', this.Handler, 'Handler_', '字典ID', '字典名称', '');
    this.TextSQL('Handler.Doc', '填写内容', this.SQL_Doc, '查询SQL', `SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'`, '查询语句');

    // this.TextBox2_NameNo('JavaScript', 'JavaScript字典表', this.JavaScript, 'JS_', '字典ID', '字典名称', '');
    // this.TextArea('JavaScript.Doc', '填写方法名', this.SQL_Doc, '方法名', ` MyDict() `, 'Javascript的方法名');

    this.AddGroup('B', '相关功能'); //增加分组.
    // this.AddBlank('AdminDBSrc', '数据源维护', '');
    // this.AddBlank('AdminDBSrc.ToUrl', '修改', '');
    this.AddFunction('AdminDBSrc_ToUrl', '数据源维护', this.GotoUrl);

    // this.AddGroup('A', '外键类型'); //增加分组.
    // this.TextBox3_NameNoNote(SrcType.SysDict, '内置字典表', this.Docs3, '', '字典ID', '字典名称', '请输入字典名称', '');
    // // this.TextBox3_NameNoNote(SrcType.LocalDBTableOrView, '本数据库表或视图', this.Docs4, '', '字典ID', '字典名称', '请输入字典名称', '');
    // //  this.TextBox3_NameNoNote('View', '把现有的表或者视图作为外键表注册到表单数据字典.(新版本暂不支持该功能)', this.Docs4, '', '枚举ID', '枚举名称', '请输入枚举值', '');
    // // this.TextBox3_NameNoNote(SrcType.BPClass, 'BP实体类', this.Docs4, '', '字典ID', '字典名称', '请输入字典名称', '');
    // this.AddGroup('B', '外部数据源'); //增加分组.
    // this.TextBox3_NameNoNote('SQLTable', 'SQL查询表', this.Docs3, '', '字典ID', '字典名称', '请输入字典名称', '');
    // this.TextBox3_NameNoNote(SrcType.Handler, '微服务Handler外部数据源,', this.Docs3, '', '字典ID', '字典名称', '请输入字典名称', '');
    // this.TextBox3_NameNoNote(SrcType.JSFunction, 'JavaScript外部数据源', this.Docs3, '', '字典ID', '字典名称', '请输入字典名称', '');
    // this.TextBox3_NameNoNote(SrcType.WebApi, 'WebApi接口', this.Docs3, '', '字典ID', '字典名称', '请输入字典名称', '');
  }
  public GetCodeStruct() {
    const dictJson = [
      { No: '0', Name: '编号名称' },
      { No: '1', Name: '树结构' },
    ];
    const json = JSON.stringify(dictJson);
    return json;
  }

  public GotoUrl() {
    const url = '/@/WF/Comm/Search.vue?EnName=TS.Sys.SFDBSrc';
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    //创建外键数据字典.
    const sfTable = new SFTable();
    sfTable.Name = tb1;
    sfTable.No = tb2;
    sfTable.TableDesc = tb3; //备注.
    sfTable.RDT = DataType.CurrentDateTime;
    if (pageNo.includes('.') == false) {
      if (await sfTable.IsExits()) {
        throw new Error('编号:' + sfTable.No + '已存在.');
      }
    }

    //自定义字典表.内置字典表
    /*srcType= 0	本地的类 1	创建表 2	表或视图 3	SQL查询表 4	WebServices 5	微服务Handler外部数据源
    6	JavaScript外部数据源 7	系统字典表 8	WebApi接口     */
    if (pageNo === 'SFTableDict.CodeStruct') {
      sfTable.Name = this.RequestVal('tb1', 'SFTableDict');
      sfTable.No = this.RequestVal('tb2', 'SFTableDict');
      sfTable.FK_SFDBSrc = 'local';
      //sfTable.SrcType = 7; //系统字典表.
      sfTable.DBSrcType = 'SysDict';
      sfTable.DBType = 0;
      sfTable.FK_Val = sfTable.No;
      sfTable.NoGenerModel = 1;
      sfTable.CodeStruct = this.RequestVal('tb1', 'SFTableDict.CodeStruct'); //字典结构类型.0=编号名称，1=树结构.
      if (sfTable.CodeStruct == 0) sfTable.SetPara('EnName', 'TS.FrmUI.SFTableNoName');
      else sfTable.SetPara('EnName', 'TS.FrmUI.SFTableTree');
      await sfTable.Insert();

      //给i他初始化数据.
      const bpEn = new BSEntity('BP.Sys.SFTable', sfTable.No);
      await bpEn.Retrieve();
      await bpEn.DoMethodReturnString('GenerDataOfJson');

      let url = '';
      url = '/@/WF/Comm/En.vue?EnName=' + sfTable.GetParaString('EnName', '') + '&PKVal=' + sfTable.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageNo == 'SQL.Doc.CodeStruct') {
      sfTable.Name = this.RequestVal('tb1', 'SQL');
      sfTable.No = this.RequestVal('tb2', 'SQL');
      sfTable.DBSrcType = 'SQL';
      //sfTable.SrcType = 3; //字典数据源类型.

      //根据不同的字典类型,生成.
      sfTable.CodeStruct = this.RequestVal('tb1', 'SQL.Doc.CodeStruct'); //数据结构.
      let enName = 'TS.FrmUI.SFTableSQLNoName';
      if (sfTable.CodeStruct == 1) enName = 'TS.FrmUI.SFTableSQLTree';
      sfTable.SetPara('EnName', enName);

      sfTable.SelectStatement = this.RequestVal('tb2', 'SQL.Doc'); //SQL语句.
      sfTable.FK_SFDBSrc = this.RequestVal('tb1', 'SQL.Doc'); //数据源.
      sfTable.FK_Val = sfTable.No;
      await sfTable.Insert();

      const url = GloComm.UrlEn(enName, sfTable.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    if (pageNo == 'WebApi.Doc.CodeStruct') {
      sfTable.Name = this.RequestVal('tb1', 'WebApi');
      sfTable.No = this.RequestVal('tb2', 'WebApi');
      sfTable.DBSrcType = 'WebApi';
      //sfTable.SrcType = 8; //字典数据源类型.

      //根据不同的字典类型,生成.
      sfTable.CodeStruct = this.RequestVal('tb1', 'WebApi.Doc.CodeStruct'); //数据结构.
      let enName = 'TS.FrmUI.SFTableWebApiNoName';
      if (sfTable.CodeStruct == 1) enName = 'TS.FrmUI.SFTableWebApiTree';
      sfTable.SetPara('EnName', enName);

      sfTable.SelectStatement = this.RequestVal('tb2', 'WebApi.Doc'); //SQL语句.
      sfTable.FK_SFDBSrc = this.RequestVal('tb1', 'WebApi.Doc'); //数据源.
      sfTable.FK_Val = sfTable.No;
      await sfTable.Insert();

      const url = GloComm.UrlEn(enName, sfTable.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    if (pageNo == 'Handler.Doc') {
      sfTable.Name = this.RequestVal('tb1', 'Handler');
      sfTable.No = this.RequestVal('tb2', 'Handler');
      sfTable.DBSrcType = 'Handler';
      //sfTable.SrcType = 5;
    }

    if (pageNo == 'JavaScript.Doc') {
      sfTable.Name = this.RequestVal('tb1', 'JavaScript');
      sfTable.No = this.RequestVal('tb2', 'JavaScript');
      sfTable.DBSrcType = 'JavaScript';
      //sfTable.SrcType = 6;
    }

    let enName = '';
    if (pageNo === 'Handler.Doc') enName = 'TS.FrmUI.SFTableHandler';
    if (pageNo === 'JavaScript.Doc') enName = 'TS.FrmUI.SFTableJS';
    sfTable.SelectStatement = tb2;
    sfTable.FK_SFDBSrc = tb1;
    sfTable.FK_Val = sfTable.No;

    if (enName !== '') {
      sfTable.SetPara('EnName', enName);
      sfTable.SelectStatement = tb2;
      sfTable.FK_SFDBSrc = tb1;
      sfTable.FK_Val = sfTable.No;
      await sfTable.Insert();
      const url = '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + sfTable.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }
  public readonly WebApi_Url = `
  #### 帮助
   - 请输入路径参数.
   - 仅仅输入主机端口号后面的部分.
   - 比如: /xxxx.do
  `;

  public readonly SrcHelp = `
  #### 帮助
   - 请选择数据源，如果没有，请新建数据源.
   - 
  `;

  public readonly SFTable = `
  #### 帮助
   - 内置字典表,比如: 省份，片区、城市、税种，税目
   - 内置字典表，是自己可以维护的表.
   - 存储在 Sys_SFTableDtl 表里. 
   - 用户可以通过ccfrom自己定义，自己维护的基础数据.
   
  `;

  public readonly Handler = `
  #### 帮助
   - 优点:格式灵活,展现效果随心所欲.
   - 适用于:效果
   #### lisdxcx
   xxxxx
xxx      
  `;

  public readonly SQL = `
  #### 帮助
   - 设置一个SQL语句从数据源中查询出来.
   - 支持ccbpm的表达式. @WebUser.No 当前用户编号， @WebUser.Name 登录名称， @WebUser.DeptNo 登录人所在部门.
   #### DEMO
   - 本部门的人员.
   - SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
   - 我的下级部门
   - SELECT No,Name FROM Port_Dept WHERE PartentNo='@WebUser.DeptNo'
xxx      
  `;
  public readonly SQL_Doc = `
  #### 帮助
   - 设置一个SQL语句从数据源中查询出来.
   - 支持ccbpm的表达式. @WebUser.No 当前用户编号， @WebUser.Name 登录名称， @WebUser.DeptNo 登录人所在部门.
   #### DEMO
   - 本部门的人员.
   - SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
   - 我的下级部门
   - SELECT No,Name FROM Port_Dept WHERE PartentNo='@WebUser.DeptNo'
xxx      
  `;

  // 选择系统枚举
  public readonly JavaScript = `
    #### 帮助
     - 暂无
     #### lisdxcx
     function Xxx()
     {
        
     }
xxx      
    `;
  // 选择系统枚举
  public readonly WebApi = `
  #### 帮助
   - 调用服务获得数据.
    
  `;

  // web地址.
  public readonly WebApi_Doc = `
  #### 帮助
  - 调用服务获得数据.
    
  `;

  // 选择自定的枚举
  public readonly Docs1 = `
  #### 帮助 
  - 暂无
  `;

  // 选择系统枚举
  public readonly Docs2 = `
  #### 帮助
  - 暂无
    
  `;

  // 新建string枚举
  public readonly Docs4 = `
  #### 帮助
  - 填写格式: 枚举值,枚举标签; 
  - 例如: ty,团员;dy=党员;qz,群众; 
  - 系统解析为: ty是团员, dy是党员, qz是群众.

  #### 数据存储.
  - string类型的枚举也称为标记枚举,字母存储一个列,标签存储一个列.
  - 在表单里字段是abc,那系统就会自动创建一个影子字段 abcT.
  - abc字段存储的是标记, abcT存储的是标签.
  `;
}
