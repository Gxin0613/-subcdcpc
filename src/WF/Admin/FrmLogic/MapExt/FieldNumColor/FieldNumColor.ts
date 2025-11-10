import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { MapExtAttr } from '../../MapExt';

/// <summary>
/// 数值字段颜色
/// </summary>
export class FieldNumColor extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FieldNumColor');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '数值字段颜色');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.RefPKVal, null, '关联主键', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '操作的字段', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.ExtModel, null, '模式1', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.ExtType, '', '模式', false, false, 0, 10, 100, true);

    map.AddTBString(MapExtAttr.Tag, null, '颜色', true, false, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Tag1, null, '最小值', true, false, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Tag2, null, '最大值', true, false, 0, 10, 200, true);

    // 执行类型.
    // const val = '@0=按表单字段计算@1=按人员计算@2=按角色计算@3=按部门计算@4=按SQL计算';
    // map.AddDDLSysEnum(FieldNumColorAttr.FieldNumColorExcType, 0, '执行类型', true, true, FieldNumColorAttr.FieldNumColorExcType, val);
    // map.AddTBStringDoc(FieldNumColorAttr.Tag1, null, '执行内容1', true, false, true);
    // map.AddTBStringDoc(FieldNumColorAttr.Tag2, null, '执行内容2', true, false, true);
    map.AddTBAtParas(300);
    //   map.AddRM_GPE(new GPE_FieldNumColor(), 'icon-drop');
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.ExtModel = 'FieldNumColor';
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 数值字段颜色s
 */
export class FieldNumColors extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FieldNumColor();
  }
  constructor() {
    super();
  }
}
