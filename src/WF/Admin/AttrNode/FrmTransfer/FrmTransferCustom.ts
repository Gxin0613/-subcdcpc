import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { NodeAttr } from '/@/WF/TSClass/Node';
import { BtnAttr } from '../BtnLab';

export class FTCAttr extends EntityNoNameAttr {
  /// <summary>
  /// 显示标签
  /// </summary>
  public static readonly FrmTransferCustomLab = 'FrmTransferCustomLab';
  /// <summary>
  /// 状态
  /// </summary>
  public static readonly FrmTransferCustomSta = 'FrmTransferCustomSta';

  /// <summary>
  /// H
  /// </summary>
  public static readonly FrmTransferCustom_H = 'FrmTransferCustom_H';

  public static readonly FTCSta = 'FTCSta';
  public static readonly FTCLab = 'FTCLab';
  public static readonly FTC_H = 'FTC_H';
  public static readonly FTCWorkModel = 'FTCWorkModel';
}

/// <summary>
/// 轨迹组件
/// </summary>
export class FrmTransferCustom extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Template.FrmTransferCustom', 'BP.WF.Template.FrmTransferCustom');
    if (!!pkval) {
      this.NodeID = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '流转自定义');

    map.AddGroupAttr('流转自定义');
    map.AddTBIntPK(NodeAttr.NodeID, 0, '节点ID');
    map.AddTBString(NodeAttr.Name, null, '节点名称', true, true, 0, 100, 10);
    map.AddTBString(BtnAttr.TCLab, '流转自定义', '显示标签', true, false, 0, 50, 10, true);
    map.AddTBInt(BtnAttr.TCEnable, 0, 'TCEnable', true, false);
    map.AddDDLSysEnum(FTCAttr.FTCSta, 0, '组件状态', true, true, FTCAttr.FTCSta, '@0=禁用@1=只读@2=可设置人员');
    //  map.AddTBString(FTCAttr.FTCSta, null, '组件状态', true, false, 0, 100, 20, true);
    map.AddDDLSysEnum(FTCAttr.FTCWorkModel, 0, '工作模式', true, true, FTCAttr.FTCWorkModel, '@0=简洁模式@1=高级模式');
    map.AddTBFloat(FTCAttr.FTC_H, 300, '高度', true, false);

    this._enMap = map;
    return this._enMap;
  }
}
