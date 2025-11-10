import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloDBsrcHelper } from '../GloDBSrcHelper';
import { Glo } from '/@/WF/TSClass/Glo';
import { SFTableWebApiNoName } from '../SFTable/SFTableWebApiNoName';
import { GL_SFProc } from '/@/WF/Admin/FrmLogic/SFProc/GL_SFProc';

// 过程
export class SFProcWebApi extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFProcWebApi');
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
    const map = new Map('Sys_SFProc', 'WebApi过程');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 150);
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 150);
    map.AddDDLEntities('FK_SFDBSrc', 'local', '数据源', new SFDBSrc(), false);
    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, false, 'IsPara', '@0=无参数@1=有参数');

    map.AddDDLStringEnum('RequestMethod', 'Get', '请求模式', '@Get=Get@POST=POST', true, '', false, 0);
    map.AddTBString('ConnString', null, 'Host', true, true, 0, 500, 600, true);

    map.AddTBString('SelectStatement', null, '接口', true, false, 0, 200, 600, true, GloDBsrcHelper.Help_APISelectStatement);
    map.AddTBStringDoc('PostDoc', null, 'POST内容', true, false, true, GloDBsrcHelper.Help_PostDoc);
    map.AddTBStringDoc('HeaderDoc', null, 'Header内容', true, false, true, GloDBsrcHelper.Help_HeaderDoc);
    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);

    map.AddTBString('JsonNode', '', 'WebApi节点名称', true, false, 0, 1000, 600, false, GloDBsrcHelper.Help_JsonNode);

    // 创建信息
    map.AddGroupAttr('测试设置');
    map.AddTBString('TestParas', null, '测试参数', true, false, 0, 1000, 600, true, GloDBsrcHelper.Help_TestParas);

    map.AddTBString('Remark', null, '备注', true, false, 0, 100, 20, true);

    map.AddTBDateTime('RDT', null, '创建日期', true, true);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 100, 20);
    map.AddTBAtParas(4000);

    map.AddGroupMethod('接口测试');
    const rmB1 = new RefMethod();
    rmB1.Title = '测试';
    rmB1.RefMethodType = RefMethodType.Func;
    rmB1.Warning = '';
    rmB1.ClassMethod = 'DoUrl';
    map.AddRefMethod(rmB1);
    map.AddRM_GL(new GL_SFProc(), '引用过程', '', '&SFProcNo=@No');

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeUpdate(): Promise<boolean> {
    //校验输入的是否是json
    //校验输入的是否是json
    if (this.PostDoc && this.PostDoc != '' && Glo.IsJsonOrBlank(this.PostDoc, 'PostDoc') == false) {
      return Promise.resolve(false);
    }
    if (this.HeaderDoc && this.HeaderDoc != '' && Glo.IsJsonOrBlank(this.HeaderDoc, 'HeaderDoc') == false) {
      return Promise.resolve(false);
    }

    const vals = this.SelectStatement + this.PostDoc + this.HeaderDoc;
    this.IsPara = await SFTableWebApiNoName.CheckIsParas(vals, this.FK_SFDBSrc);

    return Promise.resolve(true);
  }

  //有参方法：原始数据
  public async DoUrl() {
    const en = new BSEntity('BP.Sys.SFProc', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('TS_WebApi_Test');
    return data;

    // return 'tabOpen@原始数据:' + JSON.stringify(data, null, 2);
    //return 'tabOpen@原始数据:' + data;
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const dbsrc = new SFDBSrc(this.FK_SFDBSrc);
    await dbsrc.Retrieve();
    this.ConnString = dbsrc.ConnString;

    return Promise.resolve(true);
  }
  public descPost = `
  #### 帮助
   -  Get 格式:  /xxx.do?userID=@WebUser.No&tike=@Token&workID=@WorkID&ndID=@NodeID&je=@JinE
   -  参数分为系统参数与自定义参数.
   -  系统参数: 登录人员的信息,比如:@WebUser.No 登录人员账号,@WebUser.Name 名称,@WebUser.DeptNo 部门编号,@WebUser.OrgNo 组织编号, @Token token.
   -  自定义参数: je=@JinE   金额是自定义参数. 
   - Post 格式：/xxx.do
   - 参数格式1：{'Send':'@WebUser.No',WorkID:'@WorkID'}
   - 参数格式2：{'Token':'@Token'}  token是数据源的常量，可以在数据源属性里配置.
   - 参数的别名:定义过程时参数的名称定义为@JE,@WorkID,当在使用的时候对应参数的名字可能发生变化这时需要使用到参数别名，例如：
   - @JE=JinE,JiaGe@WorkID=OID等
   
   #### 什么是调用主体？
  - 使用字典的对象就是调用主体, 调用主体大概是:流程事件、节点事件.
  `;
}
