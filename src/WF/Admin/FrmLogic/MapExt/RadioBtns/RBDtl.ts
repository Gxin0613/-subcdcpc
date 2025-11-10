import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';

/// <summary>
/// 联动从表
/// </summary>
export class RBDtl extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.RBDtl');
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
    const map = new Map('Sys_MapExt', '联动从表');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.RefPKVal, null, '关联主键', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '控件', true, true, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.ExtModel, 'RBAction', '模式1', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.ExtType, 'RBActionAttr', '模式', false, false, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Tag, null, '字段名', true, true, 0, 10, 120, true);
    map.AddTBString(MapExtAttr.Tag1, null, '枚举值', false, false, 0, 10, 80, true);

    const str = '@0=不设置@1=可编辑@2=可编辑必填@3=可见@4=不可见';
    // map.AddDDLStringEnum(MapExtAttr.Tag1, 'blur', '状态', str, true);
    // map.AddRadioBtn(MapExtAttr.Tag1, 0, '状态', true, true, 'RBDtlSta', str, null);
    map.AddDDLSysEnum(MapExtAttr.Tag3, 0, '状态', true, true, 'RBDtlSta', str, null);

    // map.AddTBString(MapExtAttr.Tag1, null, '事件名称', true, false, 0, 10, 100, true);
    // map.AddTBString(MapExtAttr.Doc, null, '设置值', true, false, 0, 10, 200, true);
    //  map.AddTBString(MapExtAttr.Tag2, null, '提示信息', true, false, 0, 10, 200, true);
    // 执行类型.
    // const val = '@0=按表单字段计算@1=按人员计算@2=按角色计算@3=按部门计算@4=按SQL计算';
    // map.AddDDLSysEnum(RBDtlAttr.RBDtlExcType, 0, '执行类型', true, true, RBDtlAttr.RBDtlExcType, val);
    // map.AddTBStringDoc(RBDtlAttr.Tag1, null, '执行内容1', true, false, true);
    // map.AddTBStringDoc(RBDtlAttr.Tag2, null, '执行内容2', true, false, true);
    map.AddTBAtParas(300);
    //   map.AddRM_GPE(new GPE_RBDtl(), 'icon-drop');
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 联动从表s
 */
export class RBDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new RBDtl();
  }
  constructor() {
    super();
  }
}
