import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

//属性列表
export class DictFlowAttr extends EntityNoNameAttr {
  // 电话
  public static readonly FrmID = 'FrmID';
  /// <summary>
  /// 子流程编号
  /// </summary>
  public static readonly FlowNo = 'FlowNo';
  /// <summary>
  /// 标签
  /// </summary>
  public static readonly Label = 'Label';
  /// <summary>
  /// 是否显示在表格右边
  /// </summary>
  public static readonly IsShowListRight = 'IsShowListRight';
  /// <summary>
  /// Idx
  /// </summary>
  public static readonly Idx = 'Idx';
}

// 台账子流程属性
export class DictFlow extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.DictFlow');
    if (!!pkval) this.No = pkval;
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
    const map = new Map('Frm_DictFlow', '台账子流程');
    map.CodeStruct = '3';
    map.AddMyPK();

    map.AddTBString(DictFlowAttr.FrmID, null, '表单ID', true, false, 0, 300, 10);
    map.AddTBString(DictFlowAttr.FlowNo, null, '流程编号', true, false, 0, 20, 10);
    map.AddTBString(DictFlowAttr.Label, null, '功能标签', true, false, 0, 20, 10);
    map.AddTBInt(DictFlowAttr.IsShowListRight, 0, '是否显示在列表右边', true, false);

    map.AddTBInt(DictFlowAttr.Idx, 0, 'Idx', true, false);
    this._enMap = map;
    return this._enMap;
  }
}

//台账子流程s
export class DictFlows extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new DictFlow();
  }
  constructor() {
    super();
  }
}
