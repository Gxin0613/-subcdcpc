import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFTableAttr } from './SFTable';
import BSEntity from '/@/utils/gener/BSEntity';
import WebUser from '/@/bp/web/WebUser';
import { GloDBsrcHelper } from '../GloDBSrcHelper';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { DataType } from '/@/bp/en/DataType';

// SQL查询表
export class SFTableSQLNoName extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableSQLNoName');
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
    const map = new Map('Sys_SFTable', 'SQL字典NoName');

    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 100, 20);
    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, false, SFTableAttr.CodeStruct, '@0=编号名称类型@1=树结构类型');
    map.AddTBString(SFTableAttr.Name, null, '表中文名称', true, false, 0, 200, 20, true);
    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, false, 'IsPara', '@0=无参数@1=有参数');

    //数据源.
    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), false);
    map.AddTBStringDoc(SFTableAttr.SelectStatement, null, '查询SQL语句', true, false, true);

    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);

    map.AddTBString(SFTableAttr.TableDesc, null, '描述', true, false, 0, 200, 20, true);
    map.AddTBString(SFTableAttr.DefVal, null, '默认值', true, false, 0, 200, 20);
    map.SetHelperAlert(SFTableAttr.DefVal, '创建表单时:字段的默认值.');
    map.AddTBString(SFTableAttr.FK_Val, null, '默认字段名', true, false, 0, 200, 20);
    map.SetHelperAlert(SFTableAttr.FK_Val, '创建表单时:默认的字段名.');

    map.AddTBDate(SFTableAttr.RDT, null, '创建日期', true, true);
    map.AddTBString('Label', null, '标签', true, false, 0, 200, 20);
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 200, 100);

    // 创建信息
    map.AddGroupAttr('测试设置');
    map.AddTBString('TestParas', null, '测试参数', true, false, 0, 1000, 600, true, GloDBsrcHelper.Help_TestParas);

    map.AddTBString('Remark', null, '测试备注', true, false, 0, 100, 20, true);

    map.AddGroupMethod('验证');
    const rm = new RefMethod();
    rm.Title = '测试';
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = '';
    rm.ClassMethod = 'DoTestNoParas';
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  // 无参: 结构数据.
  public async DoTestNoParas() {
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('TS_Stuct_Data_WebApi');
    return (
      `tabOpen@结构数据:
` + JSON.stringify(data, null, 2)
    );
  }

  protected override beforeInsert(): Promise<boolean> {
    this.OrgNo = WebUser.OrgNo;
    this.RDT = DataType.CurrentDateTime;
    return Promise.resolve(true);
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    //检查是否有参数.
    if (this.SelectStatement.includes('@Key') == true) {
      this.IsPara = 1;
    } else {
      this.IsPara = 0;
    }
    return Promise.resolve(true);
  }
}

//字典表 s
export class SFTableSQLNoNames extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableSQLNoName();
  }
  constructor() {
    super();
  }
}
