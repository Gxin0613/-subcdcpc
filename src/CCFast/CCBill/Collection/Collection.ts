import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

//属性列表
export class CollectionAttr extends EntityNoNameAttr {
  /// <summary>
  /// 表单ID
  /// </summary>
  public static readonly FrmID = 'FrmID';
  /// <summary>
  /// 方法ID
  /// </summary>
  public static readonly MethodID = 'MethodID';
  /// <summary>
  /// 图标
  /// </summary>
  public static readonly Icon = 'Icon';
  /// <summary>
  /// 方法打开模式
  /// </summary>
  public static readonly MethodModel = 'MethodModel';
  /// <summary>
  /// 标记
  /// </summary>
  public static readonly Mark = 'Mark';
  /// <summary>
  /// tag
  /// </summary>
  public static readonly Tag1 = 'Tag1';
  /// <summary>
  /// 显示方式.
  /// </summary>
  public static readonly ShowModel = 'ShowModel';
  /// <summary>
  /// 处理内容
  /// </summary>
  public static readonly CollectionDoc_Url = 'CollectionDoc_Url';
  /// <summary>
  /// 内容类型
  /// </summary>
  public static readonly CollectionDocTypeOfFunc = 'CollectionDocTypeOfFunc';
  /// <summary>
  /// 处理内容s
  /// </summary>
  public static readonly Docs = 'Docs';

  /// <summary>
  /// 执行警告信息-对功能方法有效
  /// </summary>
  public static readonly WarningMsg = 'WarningMsg';
  /// <summary>
  /// 成功提示信息
  /// </summary>
  public static readonly MsgSuccess = 'MsgSuccess';
  /// <summary>
  /// 失败提示信息
  /// </summary>
  public static readonly MsgErr = 'MsgErr';
  /// <summary>
  /// 执行完毕后干啥？
  /// </summary>
  public static readonly WhatAreYouTodo = 'WhatAreYouTodo';
  /// <summary>
  /// Idx
  /// </summary>
  public static readonly Idx = 'Idx';
  //  #endregion 基本属性.

  // #region 外观.
  /// <summary>
  /// 宽度.
  /// </summary>
  public static readonly PopWidth = 'PopWidth';
  /// <summary>
  /// 高度
  /// </summary>
  public static readonly PopHeight = 'PopHeight';
  // #endregion 外观.

  /// <summary>
  /// 是否启用
  /// </summary>
  public static readonly IsEnable = 'IsEnable';
  //是否折叠？
  public static readonly IsZD = 'IsZD';
  /// <summary>
  /// 流程编号
  /// </summary>
  public static readonly FlowNo = 'FlowNo';
}

// 集合方法
export class Collection extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.Collection');
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
    const map = new Map('Frm_Collection', '集合方法');
    map.AddTBStringPK(CollectionAttr.No, null, '编号', true, true, 0, 100, 100);
    map.AddTBString(CollectionAttr.Name, null, '方法名', true, false, 0, 300, 100);
    map.AddTBString(CollectionAttr.MethodID, null, '方法ID', true, true, 0, 300, 50);

    //功能标记.
    map.AddTBString(CollectionAttr.MethodModel, null, '方法模式', true, true, 0, 300, 150);
    map.AddTBString(CollectionAttr.Tag1, null, 'Tag1', true, true, 0, 300, 10);
    map.AddTBString(CollectionAttr.Mark, null, 'Mark', true, true, 0, 300, 10);

    map.AddTBString(CollectionAttr.FrmID, null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString(CollectionAttr.FlowNo, null, '流程编号', true, true, 0, 10, 10);
    map.AddTBString(CollectionAttr.Icon, null, '图标', true, false, 0, 50, 60, true);

    //临时存储.
    map.AddTBString(CollectionAttr.Docs, null, '方法内容', true, false, 0, 300, 10);

    //  #region 外观.
    map.AddTBInt(CollectionAttr.PopHeight, 0, '弹窗高度', true, false);
    map.AddTBInt(CollectionAttr.PopWidth, 0, '弹窗宽度', true, false);
    // #endregion 外观.

    // #region 对功能有效
    //对功能有效.
    map.AddTBString(CollectionAttr.WarningMsg, null, '功能执行警告信息', true, false, 0, 300, 10);
    map.AddTBString(CollectionAttr.MsgSuccess, null, '成功提示信息', true, false, 0, 300, 10, true);
    map.AddTBString(CollectionAttr.MsgErr, null, '失败提示信息', true, false, 0, 300, 10, true);
    map.AddDDLSysEnum(
      CollectionAttr.WhatAreYouTodo,
      0,
      '执行完毕后干啥？',
      true,
      true,
      CollectionAttr.WhatAreYouTodo,
      '@0=关闭提示窗口@1=关闭提示窗口并刷新@2=转入到Search.htm页面上去',
    );
    // #endregion 对功能有效

    //是否启用？
    map.AddBoolean(CollectionAttr.IsEnable, true, '是否启用？', true, true, true);
    map.AddBoolean('IsZD', false, '是否折叠?', true, true, true);
    map.SetHelperAlert('IsZD', '折叠后显示在更多按钮里.');

   // map.AddBoolean('IsRight', false, '右键显示?', true, true, true);

    map.AddTBInt(CollectionAttr.Idx, 0, 'Idx', true, false);

    map.AddTBAtParas();
    // map.AddMapLoader(() => {
    //   let str = '';
    //   const methodId = this.Row.GetValByKey('MethodID');
    //   const frmId = this.Row.GetValByKey('FrmID');
    //   if (methodId == 'New') str = 'RecNew';
    //   if (methodId == 'Delete') str = 'RecDelete';
    //   if (methodId == 'ExpExcel') str = 'ExpExcel';
    //   if (methodId == 'ImpExcel') str = 'ImpExcel';
    //   if (str != '') map.AddRM_DtlSearch('按钮权限', new DBRoles(), '', '', '', '', 'icon-settings', false, `&FrmID=${frmId}&DBRole=${str}`);
    // });

    this._enMap = map;
    return this._enMap;
  }
}

//集合方法s
export class Collections extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Collection();
  }
  constructor() {
    super();
  }
}
