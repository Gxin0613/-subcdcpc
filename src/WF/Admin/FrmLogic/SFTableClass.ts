import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { EntityNoName, EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from './SFDBSrc/SFDBSrc';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { SFTableAttr } from './SFTable/SFTable';

export class SFTableClassAttr extends EntityNoNameAttr {
  public static readonly CodeStruct = 'CodeStruct';
  public static readonly FK_Val = 'FK_Val';
  public static readonly TableDesc = 'TableDesc';
  public static readonly DefVal = 'DefVal';
  public static readonly FK_SFDBSrc = 'FK_SFDBSrc';
  public static readonly SrcTable = 'SrcTable';

  public static readonly ColumnValue = 'ColumnValue';
  public static readonly ColumnText = 'ColumnText';
  public static readonly ParentValue = 'ParentValue';
  public static readonly SelectStatement = 'SelectStatement';
  public static readonly RDT = 'RDT';
}

// 字典表
export class SFTableClass extends EntityNoName {
  constructor(mypk?: string) {
    super('TS.FrmUI.SFTableClass', 'BP.Sys.FrmUI.SFTableClass');
    if (!!mypk) this.No = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFTableClass', '字典表');

    map.AddTBStringPK(SFTableAttr.No, null, '表英文名称', true, false, 1, 200, 20);
    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, false, SFTableAttr.CodeStruct);
    map.AddTBString(SFTableAttr.Name, null, '表中文名称', true, false, 0, 200, 20, true);

    map.AddTBString(SFTableAttr.FK_Val, null, '默认创建的字段名', true, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.TableDesc, null, '表描述', true, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.DefVal, null, '默认值', true, false, 0, 200, 20);

    //数据源.
    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), true);

    map.AddTBString(SFTableAttr.SrcTable, null, '数据源表', false, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.ColumnValue, null, '显示的值(编号列)', false, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.ColumnText, null, '显示的文字(名称列)', false, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.ParentValue, null, '父级值(父级列)', false, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.SelectStatement, null, '查询语句', false, false, 0, 1000, 600, true);

    map.AddTBDate(SFTableAttr.RDT, null, '创建日期', false, false);

    const rm = new RefMethod();
    rm.Title = '查看数据';
    rm.ClassMethod = this.ToString() + '.DoEdit';
    rm.RefMethodType = RefMethodType.RightFrameOpen;
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  public DoEdit() {
    // return TS.Difference.SystemConfig.CCFlowWebPath + "WF/Admin/FoolFormDesigner/SFTableClassEditData.htm?FK_SFTableClass=" + this.No;
  }
}

//字典表 s
export class SFTableClasss extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableClass();
  }
  constructor() {
    super();
  }
}
