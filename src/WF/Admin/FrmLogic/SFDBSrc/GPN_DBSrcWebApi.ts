import { SFProc } from '../SFProc/SFProc';
import { SFSearch } from '../SFSearch/SFSearch';
import { SFTable } from '../SFTable/SFTable';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_DBSrcWebApi extends PageBaseGroupNew {
  constructor() {
    super('GPN_DBSrcWebApi');
    this.PageTitle = '新建';
  }
  public Init() {
    const pageNo = this.RequestVal('PageNo');

    if (pageNo == 'SFTable') {
      this.AddGroup('A', '新建字典', 'icon-list'); //增加分组.

      this.TextBox2_NameNo('SFTable', 'WebApi接口字典表', this.WebApi, '', '字典ID', '字典名称', '');
      this.TextArea('SFTable.Doc', '服务链接', this.WebApi_Url, '路径与参数', `/xxx.do`, '输入主机的后部分');
      this.SelectItemsByList('SFTable.Doc.CodeStruct', '数据结构', this.HelpTodo, false, this.GetCodeStruct());
    }

    if (pageNo == 'Search') {
      this.AddGroup('B', '新建查询', 'icon-layers'); //增加分组.
      this.TextBox3_NameNoNote('Search', '创建查询', this.HelpSearch, 'APISearch', '编号', '名称', '备注', '我的查询');
      this.AddIcon('icon-layers', 'Search');
    }

    if (pageNo == 'Proc') {
      this.AddGroup('C', '新建过程', 'icon-options'); //增加分组.
      this.TextBox3_NameNoNote('Proc', '创建过程', this.HelpSearch, '', '编号', '名称', '备注', '我的过程');
      this.AddIcon('icon-options', 'Proc');
    }
  }
  public GetCodeStruct() {
    const dictJson = [
      { No: '0', Name: '编号名称' },
      { No: '1', Name: '树结构' },
    ];
    const json = JSON.stringify(dictJson);
    return json;
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (pageNo == 'Search') {
      const en = new SFSearch();
      en.No = tb2;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + tb2 + ']已经存在.');
      }
      en.Name = tb1;
      //数据源.
      en.FK_SFDBSrc = this.RefPKVal;
      en.Remark = tb3;
      en.SetPara('EnName', 'TS.FrmUI.SFSearchWebApi');
      await en.Insert();
      const url = GloComm.UrlEn('TS.FrmUI.SFSearchWebApi', en.No); // '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageNo == 'Proc') {
      const en = new SFProc();
      en.No = tb2;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + tb2 + ']已经存在.');
      }
      en.Name = tb1;
      //数据源.
      en.FK_SFDBSrc = this.RefPKVal;
      en.Remark = tb3;
      en.SetPara('EnName', 'TS.FrmUI.SFProcWebApi');
      await en.Insert();
      const url = GloComm.UrlEn('TS.FrmUI.SFProcWebApi', en.No); // '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageNo == 'SFTable') {
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
    }

    if (pageNo == 'SFTable.Doc.CodeStruct') {
      const sfTable = new SFTable();

      sfTable.Name = this.RequestVal('tb1', 'SFTable');
      sfTable.No = this.RequestVal('tb2', 'SFTable');
      sfTable.DBSrcType = 'WebApi';
      //sfTable.SrcType = 8; //字典数据源类型.

      //根据不同的字典类型,生成.
      sfTable.CodeStruct = this.RequestVal('tb1', 'SFTable.Doc.CodeStruct'); //数据结构.
      let enName = 'TS.FrmUI.SFTableWebApiNoName';
      if (sfTable.CodeStruct == 1) enName = 'TS.FrmUI.SFTableWebApiTree';
      sfTable.SetPara('EnName', enName);

      sfTable.SelectStatement = this.RequestVal('tb1', 'SFTable.Doc'); //SQL语句.
      sfTable.FK_SFDBSrc = this.RefPKVal;
      sfTable.FK_Val = sfTable.No;
      await sfTable.Insert();

      const url = GloComm.UrlEn(enName, sfTable.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }

  public readonly HelpSearch = `
  #### 帮助
  - 查询与字典表不同，他需要参数据才能执行.
  #### 用到场景
  - 文本框自动完成, 级联下拉框、自动填充.
  `;

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
