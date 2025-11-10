import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
// 属性
export class AutoStartEn5Attr extends EntityNoNameAttr {
  /// 参数1
  public static readonly StartGuidePara1 = 'StartGuidePara1';
  /// 参数2
  public static readonly StartGuidePara2 = 'StartGuidePara2';
}

// 自动发起设置
export class DeadLineRole1 extends EntityNoName {
  constructor(no?: string) {
    super('TS.AttrFlow.DeadLineRole1');
    this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Flow', '限期完成时限规则');
    map.CodeStruct = '2';

    map.AddTBStringPK(AutoStartEn5Attr.No, null, '编号', true, true, 3, 3, 50);
    map.AddTBString(AutoStartEn5Attr.Name, null, '名称', true, true, 0, 50, 200);

    map.AddTBInt('Days', 0, '天数', true, false);
    map.AddTBInt('Hours', 0, '小时数', true, false);
    map.AddTBInt('MM', 0, '分钟数', true, false);

    // map.AddTBString(AutoStartEn5Attr.StartGuidePara1, null, "第2个节点人员集合 ", true, false, 0, 50, 200);
    // map.AddTBString(AutoStartEn5Attr.StartGuidePara2, null, "发起时间点", true, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }
}
