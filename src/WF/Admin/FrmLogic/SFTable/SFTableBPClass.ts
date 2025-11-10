import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFTableAttr } from './SFTable';
import WebUser from '/@/bp/web/WebUser';

// SQL查询表
export class SFTableBPClass extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableBPClass');
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
    map.AddTBString(SFTableAttr.Name, null, '表中文名称', true, false, 0, 200, 20, false);
    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, false, SFTableAttr.CodeStruct, '@0=编号名称类型@1=树结构类型');
    map.AddDDLStringEnum(SFTableAttr.DBSrcType, 'BPClass', '数据表类型', SFTableAttr.DBSrcType, false);
    //数据源.
    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), false);
    map.AddDDLSysEnum(SFTableAttr.NoGenerModel, 1, '编号生成规则', true, true, SFTableAttr.NoGenerModel, '@0=自定义@1=流水号@2=标签的全拼@3=标签的简拼@4=按GUID生成');
    map.AddTBDate(SFTableAttr.RDT, null, '创建日期', true, true);
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 200, 100);

    this._enMap = map;
    return this._enMap;
  }

  protected override beforeInsert(): Promise<boolean> {
    this.OrgNo = WebUser.OrgNo;
    return Promise.resolve(true);
  }
}

//字典表 s
export class SFTableBPClasss extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableBPClass();
  }
  constructor() {
    super();
  }
}
