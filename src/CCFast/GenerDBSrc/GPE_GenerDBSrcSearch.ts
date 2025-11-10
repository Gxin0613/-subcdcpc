import { GenerDBSrc } from './GenerDBSrc';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloWF } from '/@/WF/Admin/GloWF';
import { TreeEns_DBSrc } from '/@/WF/Admin/TreeEns_DBSrc';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPE_GenerDBSrcSearch extends PageBaseGroupEdit {
  constructor() {
    super('GPE_GenerDBSrcSearch');
    this.PageTitle = '数据源';
  }

  public async Init() {
    this.entity = new GenerDBSrc(); //对应的类.
    this.KeyOfEn = 'DoWay'; //要编辑的字段.
    this.AddGroup('A', '配置数据源');

    let markID = this.GetRequestVal('MarkID');
    if (markID == null || markID == '') markID = 'Main';

    //数据源类型:Search,SFTable,Proc三种类型.
    let dbModel = this.GetRequestVal('DBModel'); //SFTable,Search,SFProc
    if (dbModel == null || dbModel == '') dbModel = 'Search';

    //初始化数据.
    const handler = new HttpHandler('BP.CCFast.Handler_CCFast');
    handler.AddPara('PKVal', this.GetRequestVal('PKVal'));
    handler.AddPara('MarkID', markID);
    handler.AddPara('DBModel', dbModel);
    const data: any = await handler.DoMethodReturnString('GenerDBSrc_InitData');
    this.entity.setPKVal(data?.MyPK); // 初始化数据后将返回的MyPK替换到Entity中

    //设置按钮.
    this.Btns = [
      { pageNo: 'StaticData', list: ['检查JSON格式'] },
      { pageNo: 'SearchDBSrc', list: ['查询属性'] },
      { pageNo: 'SelfSQL', list: ['新建数据源'] },
      { pageNo: 'SelfWebApiGet', list: ['新建数据源'] },
      { pageNo: 'SelfWebApiPost', list: ['新建数据源'] },
    ];

    this.Blank('None', '未设置/不启用', this.GenerHelp(dbModel, 'None'));
    this.DBSrcSQL('SelfSQL', '自定义SQL', 'DBSrc', 'Doc', this.GenerHelp(dbModel, 'SelfSQL'));
    this.DBSrcWebApiGet('SelfWebApiGet', '自定义WebApiGet', 'DBSrc', 'Url', 'PostModel', 'HeadDoc', 'BodyDoc', this.GenerHelp(dbModel, 'SelfSQL'));
    this.DBSrcWebApiPost('SelfWebApiPost', '自定义WebApiPost', 'DBSrc', 'Url', 'PostModel', 'HeadDoc', 'BodyDoc', this.GenerHelp(dbModel, 'SelfSQL'));

    if (dbModel == 'SFProc') {
      this.SelectItemsByGroupList('SFProc', '选择过程', this.HelpUn, false, GloWF.srcDBSrc, GloWF.srcSFProc, 'Doc', 'BodyDoc', this.GenerHelp(dbModel, 'SFProc'));
      this.SelectItemsByList('BuessUnit', '业务单元-BuessUnit', this.HelpUn, false, await this.GenerBuessUnit(), 'Doc', 'BodyDoc');
      this.SelectItemsByList('EventBase', '事件类-EventBase', this.HelpUn, false, await this.GenerEventBase(), 'Doc', 'BodyDoc');
    }
    if (dbModel == 'Search') {
      this.SingleTextArea('StaticData', '静态数据', 'Doc', '请输入静态文本', this.GenerHelp(dbModel, 'StaticData'));
      this.SelectItemsByGroupList('SearchDBSrc', '选择查询', this.HelpUn, false, GloWF.srcDBSrc, GloWF.srcDBSFSearch, 'Doc', 'BodyDoc', this.GenerHelp(dbModel, 'SearchDBSrc'));
    }
    if (dbModel == 'SFTable') {
      this.SingleTextArea('StaticData', '静态数据', 'Doc', '请输入静态文本', this.GenerHelp(dbModel, 'StaticData'));
      this.SelectItemsByGroupList('SFTableDBSrc', '选择字典', this.HelpUn, false, GloWF.srcDBSrc, GloWF.srcBindSFTable, 'Doc', 'BodyDoc', this.GenerHelp(dbModel, 'SFTableDBSrc'));
    }
    this.AddHelp('Help', '帮助', 'https://docs.qq.com/doc/DRGtCaGVjU2VsWnJu', 200);
  }

  public GenerHelp(dbModel: string, pageID: string) {
    if (pageID == 'None') return this.HelpNone;

    //自定义SQL.
    if (pageID == 'SelfSQL' && dbModel == 'SFTable') return this.SelfSQL_SFTable;
    if (pageID == 'SelfSQL' && dbModel == 'Search') return this.SelfSQL_SFSearch;
    if (pageID == 'SelfSQL' && dbModel == 'SFProc') return this.SelfSQL_SFProc;

    //自定义SQL.
    if ((pageID == 'SelfWebApiGet' || pageID == 'SelfWebApiPost') && dbModel == 'SFTable') return this.SelfWebApiGet_SFTable;
    if ((pageID == 'SelfWebApiGet' || pageID == 'SelfWebApiPost') && dbModel == 'Search') return this.SelfWebApiGet_SFSearch;
    if ((pageID == 'SelfWebApiGet' || pageID == 'SelfWebApiPost') && dbModel == 'SFProc') return this.SelfWebApiGet_SFProc;

    return this.SelfSQL_SFSearch;
  }

  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {
    if (_btnName == '查询属性') {
      //  const url = GloComm.UrlGPE(new GPE_XieZuoOverRole(), this.RefPKVal);
      // return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }
    if (_btnName == '检查JSON格式') {
      // const url = GloComm.UrlGPE(new GPE_TeamleaderConfirm(), this.RefPKVal);
      // return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url, '组长确认规则');
    }
    if (_btnName == '新建数据源') {
      const url = GloComm.UrlGPN('TreeEns_DBSrc', '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url, '组长确认规则');
    }
  }
  public readonly HelpNone = `
  #### 帮助
  - 不设置，不启用。
  - 请参考其他的选项。
  `;

  // *************************** SelfWebApiGet
  public readonly SelfWebApiGet_SFTable = `
  #### 字典
  - 首先需要在数据源中创建主机.
  - 返回格式编号、名称列的数据源, 返回的JSON格式，需要通过数据源能够解析.
  #### Url表达式
  - 格式：/XX/XX/xxx/xxxx/xxx@Paras
  - 支持ccbpm表达式, url的部分要从 /XX/XX/xxx
  #### 参数
  - 支持 @WebUser.* 表达式, @WebUer.No, @WebUser.Name, @WebUser.DeptNo, @WebUser.DeptName,@WebUser.OrgNo @WebUser.Token
  - 标识：登录人员的账号、名称、部门编号、部门名称、组织编号、组织名称、Token.
  - 支持流程环境变量:当前流程@FlowNo、@NodeID、@WorkID 标识: 流程编号、节点ID、工作ID.
  - 支持表单环境变量:@OID,@No,标识表单主键,  @+字段名, 比如：@JE  @Age  @XingBie  在执行的时候，系统就会替换下来这个变量.
  `;
  public readonly SelfWebApiGet_SFSearch = `
  #### 查询
  - 首先需要在数据源中创建主机.
  - 查询: 返回的是结果集合,返回的列名要与字段名匹配.
  - 表达式里支持变量参数. 
  #### Url表达式
  - 格式：/XX/XX/xxx/xxxx/xxx@Paras
  - 支持ccbpm表达式, url的部分要从 /XX/XX/xxx
  #### 参数
  - 支持 @WebUser.* 表达式, @WebUer.No, @WebUser.Name, @WebUser.DeptNo, @WebUser.DeptName,@WebUser.OrgNo @WebUser.Token
  - 标识：登录人员的账号、名称、部门编号、部门名称、组织编号、组织名称、Token.
  - 支持流程环境变量:当前流程@FlowNo、@NodeID、@WorkID 标识: 流程编号、节点ID、工作ID.
  - 支持表单环境变量:@OID,@No,标识表单主键,  @+字段名, 比如：@JE  @Age  @XingBie  在执行的时候，系统就会替换下来这个变量.
  `;

  public readonly SelfWebApiGet_SFProc = `
  #### 过程
  - 首先需要在数据源中创建主机.
  - 过程: 执行的过程.
  #### Url表达式
  - 格式：/XX/XX/xxx/xxxx/xxx@Paras
  - 支持ccbpm表达式, url的部分要从 /XX/XX/xxx
  #### 参数
  - 支持 @WebUser.* 表达式, @WebUer.No, @WebUser.Name, @WebUser.DeptNo, @WebUser.DeptName,@WebUser.OrgNo @WebUser.Token
  - 标识：登录人员的账号、名称、部门编号、部门名称、组织编号、组织名称、Token.
  - 支持流程环境变量:当前流程@FlowNo、@NodeID、@WorkID 标识: 流程编号、节点ID、工作ID.
  - 支持表单环境变量:@OID,@No,标识表单主键,  @+字段名, 比如：@JE  @Age  @XingBie  在执行的时候，系统就会替换下来这个变量.
  `;
  // *************************** 自定义SQL：
  public readonly SelfSQL_SFTable = `
  #### 字典
  - 返回格式编号、名称列的数据源。
  #### 格式
  - SELECT No, Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
  - 注意返回的格式区分大小写,如果需要返回的是树结构实体，需要三列: No,Name,ParentNo, 比如: SELECT No,Name,ParentNo FROM Port_Dept
  - 支持内置表达式，支持外部参数变量。
  #### 参数
  - 支持 @WebUser.* 表达式, @WebUer.No, @WebUser.Name, @WebUser.DeptNo, @WebUser.DeptName,@WebUser.OrgNo @WebUser.Token
  - 标识：登录人员的账号、名称、部门编号、部门名称、组织编号、组织名称、Token.
  - 支持流程环境变量:当前流程@FlowNo、@NodeID、@WorkID 标识: 流程编号、节点ID、工作ID.
  - 支持表单环境变量:@OID,@No,标识表单主键,  @+字段名, 比如：@JE  @Age  @XingBie  在执行的时候，系统就会替换下来这个变量.
  `;
  public readonly SelfSQL_SFSearch = `
  #### 查询
  - 查询: 返回的是结果集合,返回的列名要与字段名匹配.
  - 表达式里支持变量参数. 
  - 格式: SELECT No as BianHao, Name as XingMing, Tel as DianHua FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
  #### 参数
  - 支持 @WebUser.* 表达式, @WebUer.No, @WebUser.Name, @WebUser.DeptNo, @WebUser.DeptName,@WebUser.OrgNo @WebUser.Token
  - 标识：登录人员的账号、名称、部门编号、部门名称、组织编号、组织名称、Token.
  - 支持流程环境变量:当前流程@FlowNo、@NodeID、@WorkID 标识: 流程编号、节点ID、工作ID.
  - 支持表单环境变量:@OID,@No,标识表单主键,  @+字段名, 比如：@JE  @Age  @XingBie  在执行的时候，系统就会替换下来这个变量.
  `;
  public readonly SelfSQL_SFProc = `
  #### 过程
  - 过程: 执行的存储过程.
  - 格式1: Exec MyPrc @OID  ,格式2: Exec MyPrc @WorkID,   格式3: Exec MyPrc @OID,@WebUser.No
  #### 参数
  - 支持 @WebUser.* 表达式, @WebUer.No, @WebUser.Name, @WebUser.DeptNo, @WebUser.DeptName,@WebUser.OrgNo @WebUser.Token
  - 标识：登录人员的账号、名称、部门编号、部门名称、组织编号、组织名称、Token.
  - 支持流程环境变量:当前流程@FlowNo、@NodeID、@WorkID 标识: 流程编号、节点ID、工作ID.
  - 支持表单环境变量:@OID,@No,标识表单主键,  @+字段名, 比如：@JE  @Age  @XingBie  在执行的时候，系统就会替换下来这个变量.
  `;
  public readonly SelfWebApi = `
  #### 帮助
  - 静态文本.
  #### 格式
  
  `;

  public readonly StaticData = `
  #### 帮助
  - 静态文本.请输入JSON格式的数据.
  #### 格式
{No:'xx',Name:'xxx'}
  
  `;

  public readonly Desc0 = `
  #### 帮助
  - 禁用数据内容功能。
  - 对应实体列表页面将隐藏关键字搜索框。
 `;
  public readonly Desc1 = `
  #### 帮助
  - 数据内容功能支持用户输入一个关键词，对实体中所有显示列执行模糊匹配（LIKE查询）。**该功能自动排除外键字段、枚举类型字段及数值型字段**，仅适用于文本类内容的检索。
  - 搜索框默认提示文本为：“请输入关键字…”。
  #### 效果图
  -  ![输入图片说明](./resource/CCBill/SearchCond/SearchKey.png "屏幕截图.png")  
 `;

  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }

  ///业务单元.
  public async GenerBuessUnit() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionDtl_Init');
    return JSON.stringify(data);
  }
  //事件类.
  public async GenerEventBase() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionEventBase_Init');
    return JSON.stringify(data);
  }
}
