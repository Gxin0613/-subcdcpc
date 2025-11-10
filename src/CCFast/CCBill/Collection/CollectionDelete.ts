import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { CollectionAttr } from '/@/CCFast/CCBill/Collection/Collection';

//属性列表
// 集合方法
export class CollectionDelete extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.CollectionDelete');
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
    //map.AddDDLSysEnum(CollectionAttr.IsEnable, 0, '删除规则', true, true, CollectionAttr.IsEnable, '@0=不删除@1=物理删除@2=逻辑删除');
    map.AddBoolean('IsZD', false, '是否折叠?', true, true, false);
    map.SetHelperAlert('IsZD', '折叠后显示在更多按钮里.');
   // map.AddBoolean('IsRight', false, '右键显示?', true, true, true);


    map.AddTBInt(CollectionAttr.Idx, 0, 'Idx', true, false);

    map.AddTBAtParas();

    this._enMap = map;
    return this._enMap;
  }
}

//集合方法s
export class CollectionDeletes extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new CollectionDelete();
  }
  constructor() {
    super();
  }
}
