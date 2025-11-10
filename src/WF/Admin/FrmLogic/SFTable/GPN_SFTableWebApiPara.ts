import { SFPara } from './SFPara';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_SFTableWebApiPara extends PageBaseGroupNew {
  constructor() {
    super('GPN_SFTableWebApiPara');
    this.PageTitle = '参数';
    this.ForEntityClassID = 'TS.FrmUI.SFParaSelf';
  }
  public Init() {
    this.AddGroup('A', '内部参数'); //增加分组.
    this.AddBlank('@WebUserNo', '当前登录人员账号', this.HelpUn);
    this.AddBlank('@WebUserName', '登录人名称', this.HelpUn);
    this.AddBlank('@WebUserDeptNo', '登录人部门编号', this.HelpUn);

    this.AddBlank('@FrmDataMain', '调用的表单主表数据', this.HelpUn);
    this.AddBlank('@FrmDataDtlMain', '调用的表单主表+从表数据', this.HelpUn);
    this.AddBlank('@FrmDataDtlAthMain', '调用的表单主表+从表+附件数据', this.HelpUn);

    this.AddBlank('@FrmID', '表单ID', this.HelpUn);
    this.AddBlank('@OID', 'OID/WorkID', this.HelpUn);
    this.AddBlank('@FlowNo', '流程编号', this.HelpUn);
    this.AddBlank('@NodeID', '节点ID', this.HelpUn);

    this.AddGroup('B', '外部参数'); //增加分组.
    this.TextBox2_NameNo('Self', '自定义参数', this.HelpUn, '', '参数Key', '参数名称', '');
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
    const para = new SFPara();
    if (pageNo.includes('@') == true) {
      pageNo = pageNo.replace('@', '');
      const myPK = this.RefPKVal + '_' + pageNo;
      //创建外键数据字典.
      para.setPKVal(myPK);
      if (await para.IsExits()) return new GPNReturnObj(GPNReturnType.Error, '该参数已经存在.');
      para.Name = pageNo;
      para.RefPKVal = this.RefPKVal;
      para.ParaKey = pageNo;
      para.ParaName = this.GetPageName(pageNo);
      para.SetPara('EnName', 'TS.FrmUI.SFParaSys');
      para.setPKVal(myPK);
      para.DataType = 'String';
      if (pageNo == 'OID' || pageNo == 'NodeID') para.DataType = 'Int';
      if (pageNo == 'FrmDataMain' || pageNo == 'FrmDataDtlMain' || pageNo == 'FrmDataDtlAthMain') para.DataType = 'Json';

      para.IsSys = 0; //内置参数
      await para.DirectInsert();
      const url = GloComm.UrlEn(para.GetParaString('EnName', ''), para.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //自定义参数.
    const myPK = this.RefPKVal + '_' + tb2;
    para.setPKVal(myPK);
    await para.Init();
    if (await para.IsExits()) return new GPNReturnObj(GPNReturnType.Error, '该参数已经存在.');

    para.Name = pageNo;
    para.RefPKVal = this.RefPKVal;
    para.ParaKey = tb2;
    para.ParaName = tb1;
    para.SetPara('EnName', 'TS.FrmUI.SFParaSelf');
    para.setPKVal(myPK);
    para.DataType = 'String';
    para.IsSys = 1; //自定义参数.
    await para.DirectInsert();
    const url = GloComm.UrlEn(para.GetParaString('EnName', ''), para.MyPK);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
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
