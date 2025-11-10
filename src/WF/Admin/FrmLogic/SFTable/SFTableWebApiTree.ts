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
export class SFTableWebApiTree extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableWebApiTree');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFTable', 'WebAPI字典表');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 200, 20);
    map.AddTBString(SFTableAttr.Name, null, '名称', true, false, 0, 200, 20, true);
    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, true, 'IsPara', '@0=无参数@1=有1个参数@2=有多个参数');
    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, false, SFTableAttr.CodeStruct, '@0=编号名称类型@1=树结构类型');
    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), false);
    map.AddDDLStringEnum('RequestMethod', 'Get', '请求方式', '@Get=Get@POST=POST', true);

    map.AddTBString('SelectStatement', null, 'API接口', true, false, 0, 200, 600, true, GloDBsrcHelper.Help_APISelectStatement);
    map.AddTBStringDoc('PostDoc', null, 'POST内容', true, false, true, GloDBsrcHelper.Help_PostDoc);
    map.AddTBStringDoc('HeaderDoc', null, 'Header内容', true, false, true, GloDBsrcHelper.Help_HeaderDoc);
    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);
    map.AddTBString('JsonNode', '', 'WebApi节点名称', true, false, 0, 1000, 600, false, GloDBsrcHelper.Help_JsonNode);

    // 列对应
    map.AddGroupAttr('列对应');
    map.AddTBString('FieldNo', '', '编号属性No', true, false, 0, 200, 600, true, GloDBsrcHelper.FieldNo);
    map.AddTBString('FieldName', '', '名称属性Name', true, false, 0, 200, 600, true, GloDBsrcHelper.FieldNo);
    map.AddTBString('FieldParentNo', '', '父级属性ParentNo', true, false, 0, 200, 600, true, GloDBsrcHelper.FieldNo);
    const note = ` 
    #### 帮助
    - 根目录的parentNo的值.
    - 系统不允许有多个根节点.
    `;
    map.AddTBString(SFTableAttr.RootVal, null, 'Tree根节点值', true, false, 0, 500, 600, true, note);

    map.AddGroupAttr('测试设置');
    map.AddTBString('TestParas', null, '测试参数', true, false, 0, 1000, 600, true, GloDBsrcHelper.Help_TestParas);

    map.AddTBAtParas(4000);

    // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    map.AddGroupMethod('测试设置');
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

    this._enMap = map;
    return this._enMap;
  }

  //原始数据. ******************* 无参数 ***********************************
  public async DoUrl() {
    if (this.IsPara == 1) return 'tabOpen@该字典是有参字典，请使用有参方法测试.';
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('TS_YuanShi_Data_WebApi');
    return (
      `tabOpen@原始数据:
` + JSON.stringify(data, null, 2)
    );
  }
  //结构数据.
  public async DoCodeStruct() {
    if (this.IsPara == 1) return 'tabOpen@该字典是有参字典，请使用有参方法测试.';
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('TS_Stuct_Data_WebApi');
    return (
      `tabOpen@结构数据:
` + JSON.stringify(data, null, 2)
    );
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    //校验输入的是否是json
    if (Glo.IsJsonOrBlank(this.PostDoc, 'PostDoc') == false) return Promise.resolve(false);
    if (Glo.IsJsonOrBlank(this.HeaderDoc, 'HeaderDoc') == false) return Promise.resolve(false);

    //找到系统变量.
    const paras = new SFApiParas();
    await paras.Init();
    await paras.Retrieve('DBSrcNo', this.FK_SFDBSrc);

    //替换掉 Url  = SelectStatement,PostDoc,HeaderDoc;
    let vals = this.SelectStatement + this.PostDoc + this.HeaderDoc;
    for (let index = 0; index < paras.length; index++) {
      const element = paras[index];
      vals = vals.replaceAll('@' + element.AttrKey, 'xxx');
    }

    //检查是否有参数.
    if (!!vals && vals.includes('@')) {
      this.IsPara = 1;
    } else {
      this.IsPara = 0;
    }
    return Promise.resolve(true);
  }
}

//Handler字典表 s
export class SFTableWebApiTrees extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableWebApiTree();
  }
  constructor() {
    super();
  }
}
