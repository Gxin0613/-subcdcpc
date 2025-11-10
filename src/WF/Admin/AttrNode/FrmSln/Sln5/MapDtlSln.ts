import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';

// 从表属性
export class MapDtlSln extends EntityNoName {
  constructor(no?: string) {
    super('TS.AttrNode.MapDtlSln','BP.WF.Template.Frm.MapDtlExt');
    this.setPKVal(no);
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
    const map = new Map('Sys_MapDtl', '从表属性');
    map.AddGroupAttr('基础信息');
    // #region 基础信息.
    map.AddTBStringPK('No', null, '编号', true, false, 1, 100, 20);
    map.AddTBString('Name', null, '名称', true, false, 1, 200, 20);
    map.AddTBString('Alias', null, '别名', true, false, 0, 100, 20, false, '用于Excel表单有效');
    map.AddTBInt('FK_Node', 0, 'NodeID', true, false);

    map.AddTBString('FK_MapData', null, '表单ID', true, true, 0, 100, 20);
    map.AddTBString('PTable', null, '存储表', true, false, 0, 200, 20, false, '默认与编号为同一个存储表');

    map.AddTBAtParas(1000);
    this._enMap = map;
    return this._enMap;
  }
}
/**
 * 从表属性s
 */
export class MapDtlSlns extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MapDtlSln();
  }
  constructor() {
    super();
  }
}
