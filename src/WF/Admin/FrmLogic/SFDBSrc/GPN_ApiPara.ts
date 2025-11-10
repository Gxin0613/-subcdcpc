import { SFApiPara } from './SFApiPara';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import DBAccess from '/@/utils/gener/DBAccess';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_ApiPara extends PageBaseGroupNew {
  constructor() {
    super('GPN_ApiPara');
    this.ForEntityClassID = 'TS.FrmUI.SFApiPara';
    this.PageTitle = '新建';
  }
  public async Init() {
    this.AddGroup('A', '新建内置参数', 'icon-list'); //增加分组.

    this.TextBox2_NameNo('LetVar', '变量参数', this.HelpTodo, '', '参数ID', '参数名称', '');
    this.SelectItemsByList('LetVar.CodeStruct', '存储位置', this.HelpTodo, false, await this.GetCodeStruct());
    this.SelectItemsByList('LetVar.CodeStruct.BU', '业务单元-BuessUnit', this.HelpTodo, false, await this.GenerBuessUnit());

    this.TextBox2_NameNo('ConstVar', '常量参数', this.HelpTodo, '', '参数ID', '参数名称', '');
    this.TextBox2_NameNo('SQLExp', 'SQL表达式', this.HelpTodo, '', '参数ID', '参数名称', '');
  }
  public async GetCodeStruct() {
    return JSON.stringify([
      { No: '0', Name: 'Cookies(比如:token 获取后可以反复使用)' },
      { No: '1', Name: '不存储:(每次获取的时候重新计算)' },
    ]);
  }

  ///业务单元.
  public async GenerBuessUnit() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionDtl_Init');
    return JSON.stringify(data);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    if (pageNo == 'ConstVar') {
      const en = new SFApiPara();
      en.DBSrcNo = this.RefPKVal;
      en.AttrKey = tb2;
      en.MyPK = en.DBSrcNo + '_' + tb2;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + tb2 + ']已经存在.');
      }
      en.AttrName = tb1;
      en.DataType = 1;
      await en.Insert();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(en.classID, en.MyPK));
    }

    if (pageNo == 'SQLExp') {
      const en = new SFApiPara();
      en.DBSrcNo = this.RefPKVal;
      en.AttrKey = tb2;
      en.MyPK = en.DBSrcNo + '_' + tb2;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + tb2 + ']已经存在.');
      }
      en.AttrName = tb1;
      en.DataType = 1;
      en.ApiParaModel = 2; //SQL表达式.
      await en.Insert();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(en.classID, en.MyPK));
    }

    if (pageNo == 'LetVar') {
      const en = new SFApiPara();
      en.DBSrcNo = this.RefPKVal;
      en.AttrKey = tb2;
      en.MyPK = en.DBSrcNo + '_' + tb2;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + tb2 + ']已经存在.');
      }
    }

    if (pageNo == 'LetVar.CodeStruct.BU') {
      const en = new SFApiPara();
      en.DBSrcNo = this.RefPKVal;
      en.AttrKey = this.RequestVal('tb1', 'LetVar');
      //  en.MyPK = DBAccess.GenerGUID(); // en.DBSrcNo + '_' + tb1;
      en.MyPK = en.DBSrcNo + '_' + en.AttrKey;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + en.MyPK + ']已经存在.');
      }
      en.AttrName = tb2;
      en.ApiParaModel = 1; //业务单元.
      en.DataType = 1;
      en.ApiParaStore = this.RequestVal('tb1', 'LetVar.CodeStruct');
      en.ExpDoc = tb1;

      await en.Insert();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(en.classID, en.MyPK));
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
