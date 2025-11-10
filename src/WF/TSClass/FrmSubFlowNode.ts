import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from './Node';
import { SubFlowAttr, SubFlows } from '../Admin/AttrNode/SubFlow/SubFlow';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

/// <summary>
/// 子流程模式
/// </summary>
export enum SubFlowModel {
  /// <summary>
  /// 下级
  /// </summary>
  SubLevel,
  /// <summary>
  /// 同级
  /// </summary>
  SameLevel,
}
/// <summary>
/// 子流程类型
/// </summary>
export enum SubFlowType {
  /// <summary>
  /// 手动的子流程
  /// </summary>
  HandSubFlow = 0,
  /// <summary>
  /// 自动触发的子流程
  /// </summary>
  AutoSubFlow = 1,
  /// <summary>
  /// 延续子流程
  /// </summary>
  YanXuFlow = 2,
}
/// <summary>
/// 父子流程控件状态
/// </summary>
export enum FrmSubFlowSta {
  /// <summary>
  /// 不可用
  /// </summary>
  Disable,
  /// <summary>
  /// 可用
  /// </summary>
  Enable,
  /// <summary>
  /// 只读
  /// </summary>
  Readonly,
}

export class FrmSubFlowAttr extends EntityNoNameAttr {
  /// <summary>
  /// 标签
  /// </summary>
  public static readonly SFLab = 'SFLab';
  /// <summary>
  /// 状态
  /// </summary>
  public static readonly SFSta = 'SFSta';
  /// <summary>
  /// H
  /// </summary>
  public static readonly SF_H = 'SF_H';

  /// <summary>
  /// 应用类型
  /// </summary>
  public static readonly SFType = 'SFType';
  /// <summary>
  /// 附件
  /// </summary>
  public static readonly SFAth = 'SFAth';
  /// <summary>
  /// 显示方式.
  /// </summary>
  public static readonly SFShowModel = 'SFShowModel';
  /// <summary>
  /// 轨迹图是否显示?
  /// </summary>
  public static readonly SFTrackEnable = 'SFTrackEnable';
  /// <summary>
  /// 历史审核信息是否显示?
  /// </summary>
  public static readonly SFListEnable = 'SFListEnable';
  /// <summary>
  /// 是否显示所有的步骤？
  /// </summary>
  public static readonly SFIsShowAllStep = 'SFIsShowAllStep';
  /// <summary>
  /// 默认审核信息
  /// </summary>
  public static readonly SFDefInfo = 'SFDefInfo';

  /// <summary>
  /// 标题
  /// </summary>
  public static readonly SFCaption = 'SFCaption';
  /// <summary>
  /// 如果用户未审核是否按照默认意见填充？
  /// </summary>
  public static readonly SFIsFullInfo = 'SFIsFullInfo';
  /// <summary>
  /// 操作名词(审核，审定，审阅，批示)
  /// </summary>
  public static readonly SFOpLabel = 'SFOpLabel';
  /// <summary>
  /// 操作人是否显示数字签名
  /// </summary>
  public static readonly SigantureEnabel = 'SigantureEnabel';
  /// <summary>
  /// 操作字段
  /// </summary>
  public static readonly SFFields = 'SFFields';
  /// <summary>
  /// 显示控制方式
  /// </summary>
  public static readonly SFShowCtrl = 'SFShowCtrl';
  /// <summary>
  /// 查看类型
  /// </summary>
  public static readonly SFOpenType = 'SFOpenType';
  /// <summary>
  /// 所有子流程完成后父流程自动发送
  /// </summary>
  public static readonly AllSubFlowOverRole = 'AllSubFlowOverRole';
}

/// <summary>
/// 父子流程
/// </summary>
export class FrmSubFlowNode extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.Template.FrmSubFlowNode', 'BP.WF.Template.SFlow.FrmSubFlow');
    if (!!pkval) {
      this.setPKVal(pkval);
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
    const map = new Map('WF_Node', '父子流程');
    map.AddTBIntPK(NodeAttr.NodeID, 0, '节点ID');
    map.AddTBString(NodeAttr.Name, null, '节点名称', true, true, 0, 100, 10);
    map.AddTBString(FrmSubFlowAttr.SFLab, '子流程', '显示标签', true, false, 0, 200, 10, true);

    map.AddDDLSysEnum(FrmSubFlowAttr.SFSta, 0, '组件状态', true, true, FrmSubFlowAttr.SFSta, '@0=禁用@1=启用@2=只读');
    map.SetHelperUrl(FrmSubFlowAttr.SFSta, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3982372&doc_id=31094');

    map.AddDDLSysEnum(FrmSubFlowAttr.SFShowModel, 0, '显示方式', true, true, FrmSubFlowAttr.SFShowModel, '@0=表格方式@1=自由模式'); //此属性暂时没有用.

    map.AddDDLSysEnum(FrmSubFlowAttr.SFShowCtrl, 0, '显示控制方式', true, true, FrmSubFlowAttr.SFShowCtrl, '@0=可以看所有的子流程@1=仅仅可以看自己发起的子流程'); //此属性暂时没有用.
    map.SetHelperAlert(FrmSubFlowAttr.SFShowCtrl, '是对当前节点，一个流程实例下启动的所有子流程的数据权限查看控制。');

    map.AddDDLSysEnum(
      FrmSubFlowAttr.AllSubFlowOverRole,
      0,
      '所有子流程结束规则',
      true,
      true,
      FrmSubFlowAttr.AllSubFlowOverRole,
      '@0=不处理@1=当前流程自动运行下一步@2=结束当前流程',
    );

    map.AddTBString(FrmSubFlowAttr.SFCaption, '启动子流程', '连接标题', true, false, 0, 100, 10, true);
    map.AddTBString(FrmSubFlowAttr.SFDefInfo, null, '可启动的子流程编号(多个用逗号分开)', false, false, 0, 50, 10, true);
    map.AddTBString(FrmSubFlowAttr.SFFields, null, '审批格式字段', true, false, 0, 50, 10, true);
    //map.AddDDLSysEnum(FrmSubFlowAttr.SFOpenType, 0, '打开子流程显示', true, true, FrmSubFlowAttr.SFOpenType, '@0=工作查看器@1=流程轨迹'); //此属性暂时没有用.
    //map.SetHelperAlert(FrmSubFlowAttr.SFOpenType, '点击子流程（一个子流程实例）的时候要打开的页面。\t\n1.工作查看器可以看到表单. \t\n2.流程轨迹看到流程运行图，时间轴. ');
    map.AddTBFloat(FrmSubFlowAttr.SF_H, 300, '高度', true, false);
    this._enMap = map;
    return this._enMap;
  }
}
/**
 * 父子流程s
 */
export class FrmSubFlowNodes extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new FrmSubFlowNode();
  }
  constructor() {
    super();
  }
}
