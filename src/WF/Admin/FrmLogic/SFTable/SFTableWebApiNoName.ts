import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFTableAttr } from './SFTable';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloDBsrcHelper } from '../GloDBSrcHelper';
import { Glo } from '/@/WF/TSClass/Glo';
import { SFApiParas } from '../SFDBSrc/SFApiPara';

// Handler字典表
export class SFTableWebApiNoName extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableWebApiNoName');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFTable', 'WebAPI字典表');

    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 200, 200);
    map.AddTBString(SFTableAttr.Name, null, '名称', true, false, 0, 200, 200);
    // map.AddDDLSysEnum('IsPara', 0, '参数个数', true, true, 'IsPara', '@0=无参数@1=有1个参数@2=有多个参数');
    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, false, SFTableAttr.CodeStruct, '@0=编号名称类型@1=树结构类型');
    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), false);
    map.AddDDLStringEnum('RequestMethod', 'Get', '请求方式', '@Get=Get@POST=POST', true);
    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, false, 'IsPara', '@0=无参数@1=有参数');

    // map.AddDDLStringEnum('ParaMethod', 'Path', '参数模式', '@Query=Query@Path=Path@FrmData=FrmData', true);
    map.AddTBString('SelectStatement', null, '接口名称', true, false, 0, 200, 600, true, GloDBsrcHelper.Help_APISelectStatement);
    map.AddTBStringDoc('PostDoc', null, 'Body内容', true, false, true, GloDBsrcHelper.Help_PostDoc);
    map.AddTBStringDoc('HeaderDoc', null, 'Header内容', true, false, true, GloDBsrcHelper.Help_HeaderDoc);
    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);
    map.AddTBString('JsonNode', '', 'WebApi节点名称', true, false, 0, 1000, 600, false, GloDBsrcHelper.Help_JsonNode);

    // 列对应
    map.AddGroupAttr('返回数据&列对应');
    map.AddTBString('FieldNo', '', '编号属性No', true, false, 0, 200, 600, true, GloDBsrcHelper.FieldNo);
    map.AddTBString('FieldName', '', '名称属性Name', true, false, 0, 200, 600, true, GloDBsrcHelper.FieldNo);

    map.AddGroupAttr('测试设置');
    map.AddTBString('TestParas', null, '测试参数', true, false, 0, 1000, 600, true, GloDBsrcHelper.Help_TestParas);

    map.AddGroupAttr('同步到本机');
    map.AddBoolean('IsDTS', false, '是否同步到本机?', true, true);
    map.AddTBString('DTS2Table', null, '本机数据表', true, false, 0, 100, 100);
    map.SetHelperAlert('DTS2Table', '要同步到本机的数据表，如果没有该数据表，就回自动创建数据表，并同步数据。');
    map.AddDDLSysEnum('DTSWay', 0, '同步方式', true, true, 'DTSWay', '@0=清空方式@1=覆盖模式');
    map.AddTBAtParas(4000);

    // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    map.AddGroupMethod('测试');
    const rm = new RefMethod();
    rm.Title = '原始数据';
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = '';
    rm.ClassMethod = 'DoUrl';
    map.AddRefMethod(rm);

    const rm1 = new RefMethod();
    rm1.Title = '结构化数据';
    rm1.RefMethodType = RefMethodType.Func;
    rm1.Warning = '';
    rm1.ClassMethod = 'DoCodeStruct';
    map.AddRefMethod(rm1);

    const rm2 = new RefMethod();
    rm2.Title = '同步数据到本机';
    rm2.RefMethodType = RefMethodType.Func;
    rm2.Warning = '';
    rm2.ClassMethod = 'DoDTS2Table';
    map.AddRefMethod(rm2);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeUpdate(): Promise<boolean> {
    //校验输入的是否是json
    if (Glo.IsJsonOrBlank(this.PostDoc, 'PostDoc') == false) return Promise.resolve(false);
    if (Glo.IsJsonOrBlank(this.HeaderDoc, 'HeaderDoc') == false) return Promise.resolve(false);
    return Promise.resolve(true);
  }

  public async DoDTS2Table() {
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Retrieve();
    const data = await en.DoMethodReturnString('DoDTS2Table');
    return data;
  }

  //原始数据. ******************* 无参数 ***********************************
  public async DoUrl() {
    if (this.IsPara == 1 && !this.TestParas) return 'tabOpen@请设置测试参数,执行保存然后执行测试.';
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('TS_YuanShi_Data_WebApi');
    return (
      `tabOpen@
原始数据:
` + JSON.stringify(data, null, 2)
    );
  }
  //结构数据.
  public async DoCodeStruct() {
    if (this.IsPara == 1 && !this.TestParas) return 'tabOpen@请设置测试参数.';
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('TS_Stuct_Data_WebApi');
    return (
      `tabOpen@
结构数据:
` + JSON.stringify(data, null, 2)
    );
  }

  public static async CheckIsParas(vals: string, dbSrcNo: string) {
    //找到系统变量.
    const paras = new SFApiParas();
    await paras.Init();
    await paras.Retrieve('DBSrcNo', dbSrcNo);

    //替换掉 Url  = SelectStatement,PostDoc,HeaderDoc;
    for (let index = 0; index < paras.length; index++) {
      const element = paras[index];
      vals = vals.replaceAll('@' + element.AttrKey, 'xxx');
    }

    //检查是否有参数.
    if (!!vals && vals.includes('@')) return 1;
    return 0;
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const vals = this.SelectStatement + this.PostDoc + this.HeaderDoc;

    this.IsPara = await SFTableWebApiNoName.CheckIsParas(vals, this.FK_SFDBSrc);
    return Promise.resolve(true);
  }

  public descPost = `
  #### 帮助
   -  格式:  /xxx.do?userID=@WebUser.No&tike=@Token&workID=@WorkID&ndID=@NodeID&je=@JinE
   -  参数分为系统参数与自定义参数.
   -  系统参数: 登录人员的信息,比如:@WebUser.No 登录人员账号,@WebUser.Name 名称,@WebUser.DeptNo 部门编号,@WebUser.OrgNo 组织编号, @Token token.
   -  自定义参数: je=@JinE   金额是自定义参数. 

   #### 什么是调用主体？
  - 使用字典的对象就是调用主体, 调用主体大概是: 接受人规则、绑定下拉框字典、级联字典.
  - 调用主体在调用的环境里有一些数据，这些数据对当前字典来说都可以是参数.
  `;
  public descApi = `
  #### 帮助
   -  格式:  /xxx.do?userID=@WebUser.No&tike=@Token&workID=@WorkID&ndID=@NodeID&je=@JinE
   -  参数分为系统参数与自定义参数.
   -  系统参数: 登录人员的信息,比如:@WebUser.No 登录人员账号,@WebUser.Name 名称,@WebUser.DeptNo 部门编号,@WebUser.OrgNo 组织编号, @Token token.
   -  自定义参数: je=@JinE   金额是自定义参数. 

   #### 什么是调用主体？
  - 使用字典的对象就是调用主体, 调用主体大概是: 接受人规则、绑定下拉框字典、级联字典.
  - 调用主体在调用的环境里有一些数据，这些数据对当前字典来说都可以是参数.
  `;
}

// 字典表 s
export class SFTableWebApiNoNames extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableWebApiNoName();
  }
  constructor() {
    super();
  }
}
