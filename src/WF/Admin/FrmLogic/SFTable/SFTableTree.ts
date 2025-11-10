import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFTableAttr } from './SFTable';

// 系统字典表
export class SFTableTree extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableTree');
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
    const map = new Map('Sys_SFTable', '内置字典表Tree');

    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 200, 20);
    map.AddTBString(SFTableAttr.Name, null, '名称', true, false, 0, 200, 20);
    map.AddDDLSysEnum(SFTableAttr.NoGenerModel, 1, '编号生成规则', true, true, SFTableAttr.NoGenerModel, '@0=自定义@1=流水号@2=标签的全拼@3=标签的简拼@4=按GUID生成');
    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, false, SFTableAttr.CodeStruct, '@0=编号名称类型@1=树结构类型');
    map.AddTBString(SFTableAttr.TableDesc, null, '备注', true, false, 0, 200, 190, true);
    map.AddTBDateTime(SFTableAttr.RDT, null, '创建日期', false, false);

    map.AddRM_UrlTabOpen('编辑数据', '/@/WF/Comm/SFTable/SFTableTree.vue');

    this._enMap = map;
    return this._enMap;
  }
}

//系统字典表 s
export class SFTableTrees extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableTree();
  }
  constructor() {
    super();
  }
}
