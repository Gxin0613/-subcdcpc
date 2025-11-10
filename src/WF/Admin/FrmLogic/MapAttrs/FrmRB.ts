import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
//属性列表
export class FrmRBAttr {
  /// 主表
  public static readonly FK_MapData = 'FK_MapData';
  /// KeyOfEn
  public static readonly KeyOfEn = 'KeyOfEn';
  /// IntKey
  public static readonly IntKey = 'IntKey';
  /// EnumKey
  public static readonly EnumKey = 'EnumKey';
  /// 标签
  public static readonly Lab = 'Lab';
  /// 脚本
  public static readonly Script = 'Script';
  /// 配置信息
  public static readonly FieldsCfg = 'FieldsCfg';
  /// 提示信息
  public static readonly Tip = 'Tip';
  /// 字体大小，AtPara中属性，added by liuxc,2017-05-22
  public static readonly FontSize = 'FontSize';
  /// 设置的值
  public static readonly SetVal = 'SetVal';
  // 是否启用
  public static readonly UIIsEnable = 'UIIsEnable';
}

// 单选框
export class FrmRB extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Sys.FrmRB', 'BP.Sys.FrmRB');
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmRB', '单选框');

    map.AddMyPK();
    map.AddTBString(FrmRBAttr.FK_MapData, null, '表单ID', true, false, 0, 200, 20);
    map.AddTBString(FrmRBAttr.KeyOfEn, null, '字段', true, false, 0, 200, 20);
    map.AddTBString(FrmRBAttr.EnumKey, null, '枚举值', true, false, 0, 30, 20);
    map.AddTBString(FrmRBAttr.Lab, null, '标签', true, false, 0, 500, 20);
    map.AddTBString(FrmRBAttr.IntKey, '0', 'IntKey', true, false, 0, 500, 20);
    map.AddTBInt(FrmRBAttr.UIIsEnable, 0, '是否启用', true, false);

    //要执行的脚本.
    map.AddTBString(FrmRBAttr.Script, null, '要执行的脚本', true, false, 0, 4000, 20);
    map.AddTBString(FrmRBAttr.FieldsCfg, null, '配置信息@FieldName=Sta', true, false, 0, 4000, 20);
    map.AddTBString(FrmRBAttr.SetVal, null, '设置的值', true, false, 0, 200, 20);
    map.AddTBString(FrmRBAttr.Tip, null, '选择后提示的信息', true, false, 0, 1000, 20);

    map.AddTBAtParas(500);

    this._enMap = map;
    return this._enMap;
  }
}

//单选框s
export class FrmRBs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmRB();
  }
  constructor() {
    super();
  }
}
