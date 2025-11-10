import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFTableAttr } from './SFTable';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { SFParaSQLs } from './SFParaSQL';
import { GloDBsrcHelper } from '../GloDBSrcHelper';

// SQL查询表
export class SFTableSQLTree extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableSQLTree');
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
    const map = new Map('Sys_SFTable', 'SQL字典Tree');

    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 100, 20);
    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, false, SFTableAttr.CodeStruct, '@0=编号名称类型@1=树结构类型');
    map.AddTBString(SFTableAttr.Name, null, '名称', true, false, 0, 200, 20, true);

    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, false, 'IsPara', '@0=无参数@1=有参数');

    //数据源.
    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), false);
    map.AddTBStringDoc(SFTableAttr.SelectStatement, null, '查询SQL语句', true, false, true);
    map.AddTBString(SFTableAttr.ParentValue, null, 'Root节点值', true, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.FK_Val, null, '默认字段名', true, false, 0, 200, 20);

    map.AddTBString(SFTableAttr.TableDesc, null, '描述', true, false, 0, 200, 20, true);
    map.AddTBString(SFTableAttr.DefVal, null, '默认值', false, false, 0, 200, 20);
    map.AddTBDate(SFTableAttr.RDT, null, '创建日期', true, false);
    // if (this.IsPara == 0) {
    const rm = new RefMethod();
    rm.Title = '无参测试';
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = '';
    rm.ClassMethod = 'DoUrl';
    map.AddRefMethod(rm);

    const rm2 = new RefMethod();
    rm2.Title = '有参测试';
    rm2.RefMethodType = RefMethodType.Func;
    rm2.HisMap.AddTBString('Key', null, '输入参数', true, false, 0, 100, 1000, true, GloDBsrcHelper.Help_TestParas);
    rm2.Warning = '';
    rm2.ClassMethod = 'DoParaCodeStract';
    map.AddRefMethod(rm2);

    this._enMap = map;
    return this._enMap;
  }

  // 无参: 结构数据.
  public async DoUrl() {
    if (this.IsPara == 1) return 'tabOpen@该字典是有参字典，请使用有参方法测试.';
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('GenerDataOfJson');
    return (
      `tabOpen@结构数据:
` + JSON.stringify(data, null, 2)
    );
  }
  //有参方法: 结构化数据
  public async DoParaCodeStract(p: string) {
    if (this.IsPara == 0) return 'tabOpen@该字典是无参字典，请使用无参方法测试.';

    if (this.IsPara === 1) {
      if (p.includes('@') == true || p.includes('=') == true) return 'tabOpen@只有一个参数的字典错误：请直接输入参数值即可，不需要@，=分割.';
    }

    if (this.IsPara == 2) {
      if (p.includes('@') || p.includes('=')) return 'tabOpen@多个参数的字典错误：格式:@key1=val1@key2=val2  现在格式:' + p;
    }

    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('GenerJsonByPara', p);
    return (
      `tabOpen@结构数据:
` + JSON.stringify(data, null, 2)
    );
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const en = new SFDBSrc(this.FK_SFDBSrc);
    await en.Retrieve();
    this.ConnString = en.ConnString;

    //检查是否有参数.
    if (this.SelectStatement.includes('@Key') == true) {
      this.IsPara = 1;
    } else {
      this.IsPara = 0;
    }

    return Promise.resolve(true);
  }
}
