import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { SFColumn, SFColumns } from './SFColumn';
import { GloDBsrcHelper } from '../GloDBSrcHelper';
import { Glo } from '/@/WF/TSClass/Glo';
import { SFTableWebApiNoName } from '../SFTable/SFTableWebApiNoName';

// 查询
export class SFSearchWebApi extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFSearchWebApi');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFSearch', 'WebApi查询');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 150);
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 150);
    map.AddDDLEntities('FK_SFDBSrc', 'local', '数据源', new SFDBSrc(), false);

    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, false, 'IsPara', '@0=无参数@1=有参数');

    map.AddDDLSysEnum('ResultNum', 0, '行数', true, true, 'IsMRow', '@0=多行@1=单行');

    map.AddDDLStringEnum('RequestMethod', 'Get', '请求模式', '@Get=Get@POST=POST', true, '', false, 0);
    map.AddTBString('ConnString', null, 'Host', true, true, 0, 500, 600, true);
    map.AddTBString('SelectStatement', null, '接口名称', true, false, 0, 200, 600, true, GloDBsrcHelper.Help_APISelectStatement);
    map.AddTBStringDoc('PostDoc', null, 'POST内容', true, false, true, GloDBsrcHelper.Help_PostDoc);
    map.AddTBStringDoc('HeaderDoc', null, 'Header内容', true, false, true, GloDBsrcHelper.Help_HeaderDoc);

    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);

    map.AddTBString('JsonNode', '', 'WebApi节点名称', true, false, 0, 200, 100, false, GloDBsrcHelper.Help_JsonNode);

    map.AddTBStringDoc('DataColumn', '', '返回数据列', true, true, true);
    map.AddTBString('ExpNote', null, '表达式说明', true, false, 0, 500, 600, true);
    // 创建信息
    map.AddGroupAttr('测试设置');
    map.AddTBString('TestParas', null, '测试参数', true, false, 0, 1000, 600, true, GloDBsrcHelper.Help_TestParas);

    map.AddTBString('Remark', null, '备注', true, false, 0, 100, 20, true);
    map.AddTBDateTime('RDT', null, '创建日期', true, true);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 100, 20);

    map.AddTBAtParas(4000);

    // if (this.IsPara == 1) {
    map.AddGroupMethod('测试设置');
    const rmB12 = new RefMethod();
    rmB12.Title = '测试';
    rmB12.RefMethodType = RefMethodType.Func;
    rmB12.Warning = '';
    rmB12.ClassMethod = 'DoUrl';
    map.AddRefMethod(rmB12);
    map.AddRM_DtlBatch('列属性', new SFColumns(), 'RefPKVal');

    const rm = new RefMethod();
    rm.Title = '原始数据';
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = '';
    rm.ClassMethod = 'DoUrlOriginal';
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
  public async DoUrl() {
    if (this.IsPara == 1 && this.TestParas == '') {
      return 'tabOpen@该查询是一个有参数实体，请在设置里设置参数,执行保存,之后执行测试.';
    }

    const en = new BSEntity('BP.Sys.SFSearch', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnJSON('TS_SFSearch_Test');
    let dataKeys: string[] = [];
    if (Array.isArray(data) && data.length > 0) {
      dataKeys = Object.keys(data[0]);
    }

    for (let index = 0; index < dataKeys.length; index++) {
      const key = dataKeys[index];
      const col = new SFColumn();
      col.MyPK = this.No + '_' + key;
      const num = await col.RetrieveFromDBSources();
      if (num == 1) continue;

      col.RefPKVal = this.No;
      col.AttrKey = key;
      col.AttrName = key;
      col.DataType = 'String';
      await col.Insert();
    }
    return 'tabOpen@原始数据:' + JSON.stringify(data, null, 2);
  }

  //原始数据. ******************* 无参数 ***********************************
  public async DoUrlOriginal() {
    if (this.IsPara == 1 && this.TestParas == '') {
      return 'tabOpen@请设置测试参数,执行保存然后执行测试.';
    }
    const en = new BSEntity('BP.Sys.SFSearch', this.No);
    await en.Init();
    await en.Retrieve();
    debugger;
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
    debugger;
    const en = new BSEntity('BP.Sys.SFSearch', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('TS_Stuct_Data_WebApi');
    return (
      `tabOpen@
  结构数据:
  ` + JSON.stringify(data, null, 2)
    );
  }

  protected override async beforeUpdate(): Promise<boolean> {
    const vals = this.SelectStatement + this.PostDoc + this.HeaderDoc;
    this.IsPara = await SFTableWebApiNoName.CheckIsParas(vals, this.FK_SFDBSrc);
    //校验输入的是否是json
    if (this.PostDoc && this.PostDoc != '' && Glo.IsJsonOrBlank(this.PostDoc, 'PostDoc') == false) {
      return Promise.resolve(false);
    }
    if (this.HeaderDoc && this.HeaderDoc != '' && Glo.IsJsonOrBlank(this.HeaderDoc, 'HeaderDoc') == false) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const dbsrc = new SFDBSrc(this.FK_SFDBSrc);
    await dbsrc.Retrieve();
    this.ConnString = dbsrc.ConnString;
    return Promise.resolve(true);
  }
}
