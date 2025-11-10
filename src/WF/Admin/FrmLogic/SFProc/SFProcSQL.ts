import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloDBsrcHelper } from '../GloDBSrcHelper';
import { SFTableWebApiNoName } from '../SFTable/SFTableWebApiNoName';

// 过程
export class SFProcSQL extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFProcSQL');
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
    const map = new Map('Sys_SFProc', 'SQL过程');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 150);
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 150);
    map.AddDDLEntities('FK_SFDBSrc', 'local', '数据源', new SFDBSrc(), false);
    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, false, 'IsPara', '@0=无参数@1=有参数');
    map.AddTBStringDoc('SelectStatement', null, '表达式', true, false, true, GloDBsrcHelper.Help_APISelectStatement);
    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);

    map.AddGroupAttr('测试');
    map.AddTBString('TestParas', null, '测试用例', true, false, 0, 500, 600, true, GloDBsrcHelper.Help_TestParas);
    map.AddTBString('Remark', null, '备注', true, false, 0, 100, 20, true);
    map.AddTBDateTime('RDT', null, '创建日期', true, true);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 100, 20);
    map.AddTBAtParas();

    this._enMap = map;
    return this._enMap;
  }

  //有参方法：原始数据
  public async DoPara(p: string) {
    const en = new BSEntity('BP.Sys.SFProc', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnJSON('Exec', p);
    return 'tabOpen@原始数据:' + JSON.stringify(data, null, 2);
  }

  //执行无参数的方法.
  public async DoNoPara() {
    return this.DoPara('');
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    // const dbsrc = new SFDBSrc(this.FK_SFDBSrc);
    // await dbsrc.Retrieve();
    // this.ConnString = dbsrc.ConnString;
    this.IsPara = await SFTableWebApiNoName.CheckIsParas(this.SelectStatement, this.FK_SFDBSrc);
    return Promise.resolve(true);
  }
}
