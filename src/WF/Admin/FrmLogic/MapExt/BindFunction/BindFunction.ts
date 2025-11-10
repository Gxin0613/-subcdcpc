import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { MapExtAttr } from '../../MapExt';

/// <summary>
/// 绑定函数
/// </summary>
export class BindFunction extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.BindFunction');
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
    const map = new Map('Sys_MapExt', '正则/函数');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.RefPKVal, null, '关联主键', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '操作的字段', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.ExtModel, null, '模式1', false, false, 0, 10, 50, true);
    //模式 (RegularExpression/Funtion)
    map.AddTBString(MapExtAttr.ExtType, '', '模式', false, false, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Tag6, null, '模式名称', true, true, 0, 10, 100, true);

    // let str = '@blur=blur失去焦点';
    // str += '@change=change内容变化';
    // str += '@onclick=onclick单击';
    // str += '@ondblclick=ondblclick双击';
    // str += '@onkeypress=onkeypress按下键盘';
    // str += '@onkeyup=onkeyup按上键盘';
    // str += '@oninput=oninput/readonly值改变';
    // map.AddDDLStringEnum(MapExtAttr.Tag, 'blur', '事件类型', str, true);
    map.AddTBString(MapExtAttr.Tag, null, '事件类型', true, false, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Tag1, null, '事件名称', true, false, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Doc, null, '内容', true, true, 0, 10, 300, true);
    map.AddTBString(MapExtAttr.Tag2, null, '提示信息', true, false, 0, 10, 200, true);

    // 执行类型.
    // const val = '@0=按表单字段计算@1=按人员计算@2=按角色计算@3=按部门计算@4=按SQL计算';
    // map.AddDDLSysEnum(BindFunctionAttr.BindFunctionExcType, 0, '执行类型', true, true, BindFunctionAttr.BindFunctionExcType, val);
    // map.AddTBStringDoc(BindFunctionAttr.Tag1, null, '执行内容1', true, false, true);
    // map.AddTBStringDoc(BindFunctionAttr.Tag2, null, '执行内容2', true, false, true);
    map.AddTBAtParas(300);
    //   map.AddRM_GPE(new GPE_BindFunction(), 'icon-drop');
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.ExtModel = 'BindFunction';
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 绑定函数s
 */
export class BindFunctions extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new BindFunction();
  }
  constructor() {
    super();
  }
}
