import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesOID, EntityOID } from '/@/bp/en/EntityOID';

export class NodeToolbarAttr {
  public static readonly OID = 'OID';
  /// <summary>
  /// 节点
  /// </summary>
  public static readonly FK_Node = 'FK_Node';
  /// <summary>
  /// 到达目标
  /// </summary>
  public static readonly Target = 'Target';
  /// <summary>
  /// 标题
  /// </summary>
  public static readonly Title = 'Title';
  /// <summary>
  /// url
  /// </summary>
  public static readonly UrlExt = 'UrlExt';
  /// <summary>
  /// 序号
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// 在工作处理器显示
  /// </summary>
  public static readonly IsMyFlow = 'IsMyFlow';
  /// <summary>
  ///  在工作查看器显示
  /// </summary>
  public static readonly IsMyView = 'IsMyView';
  /// <summary>
  ///  在树形表单显示
  /// </summary>
  public static readonly IsMyTree = 'IsMyTree';
  /// <summary>
  ///  在抄送功能显示
  /// </summary>
  public static readonly IsMyCC = 'IsMyCC';
  /// <summary>
  /// Icon 图片附件
  /// </summary>
  public static readonly IconPath = 'IconPath';
  /// 执行类型
  /// </summary>
  public static readonly ExcType = 'ExcType';
}

/// <summary>
/// 自定义工具栏
/// </summary>
export class NodeToolbar extends EntityOID {
  constructor(pkval?: number) {
    super('TS.WF.Template.NodeToolbar');
    if (!!pkval) {
      this.OID = pkval;
    }
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
    const map = new Map('WF_NodeToolbar', '自定义工具栏');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('外观');
    map.AddTBIntPKOID();
    map.AddTBInt(NodeToolbarAttr.FK_Node, 0, '节点', false, true);
    map.AddTBString(NodeToolbarAttr.Title, null, '标题', true, false, 0, 100, 150, true);

    // 执行类型.
    map.AddDDLSysEnum(NodeToolbarAttr.ExcType, 0, '执行类型', true, true, 'ToobarExcType', '@0=超链接@1=函数');

    map.AddTBString(NodeToolbarAttr.UrlExt, null, '连接/函数', true, false, 0, 500, 200, true);
    map.AddTBString(NodeToolbarAttr.Target, null, '目标', true, false, 0, 100, 100);
    map.AddTBInt(NodeToolbarAttr.Idx, 0, '显示顺序', true, false);

    map.AddTBString(NodeToolbarAttr.IconPath, null, 'ICON', true, false, 0, 100, 100, true);
    let msg = '提示：';
    msg += `	
 1. 给工具栏按钮设置图标两种方式,上传图标模式与设置指定的Icon的ID模式.`;
    msg += `	
 2. 我们优先解决Icon的ID解析模式.`;
    msg += `	
 3. 比如: ./Img/Btn/Save.png `;
    map.SetHelperAlert(NodeToolbarAttr.IconPath, msg);

    map.AddGroupAttr('作用位置');
    map.AddBoolean(NodeToolbarAttr.IsMyFlow, false, '工作处理器', true, true);
    map.AddBoolean(NodeToolbarAttr.IsMyTree, false, '流程树', true, true);
    map.AddBoolean(NodeToolbarAttr.IsMyView, false, '工作查看器', true, true);
    map.AddBoolean(NodeToolbarAttr.IsMyCC, false, '抄送工具栏', true, true);
    // map.AddMyFile('图标'); //增加附件.

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 自定义工具栏s
 */
export class NodeToolbars extends EntitiesOID {
  get GetNewEntity(): EntityOID {
    return new NodeToolbar();
  }
  constructor() {
    super();
  }
}
