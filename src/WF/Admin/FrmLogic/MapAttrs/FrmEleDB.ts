/// <summary>
/// 表单元素扩展DB 属性
/// </summary>

import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

export class FrmEleDBAttr {
  /// <summary>
  /// RefPKVal
  /// </summary>
  public static readonly RefPKVal = 'RefPKVal';
  /// <summary>
  /// EleID
  /// </summary>
  public static readonly EleID = 'EleID';
  /// <summary>
  /// 主表
  /// </summary>
  public static readonly FK_MapData = 'FK_MapData';
  /// <summary>
  /// FID
  /// </summary>
  public static readonly FID = 'FID';
  /// <summary>
  /// Tag1
  /// </summary>
  public static readonly Tag1 = 'Tag1';
  /// <summary>
  /// Tag2
  /// </summary>
  public static readonly Tag2 = 'Tag2';
  /// <summary>
  /// Tag3
  /// </summary>
  public static readonly Tag3 = 'Tag3';
  /// <summary>
  /// Tag4
  /// </summary>
  public static readonly Tag4 = 'Tag4';
  /// <summary>
  /// Tag5
  /// </summary>
  public static readonly Tag5 = 'Tag5';
}

/// <summary>
/// 表单元素扩展DB
/// </summary>
export class FrmEleDB extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Sys.FrmEleDB');
    if (!!mypk) {
      this.MyPK = mypk;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_FrmEleDB', '表单元素扩展DB');

    map.AddMyPK();
    map.AddTBString(FrmEleDBAttr.FK_MapData, null, 'FK_MapData', true, false, 1, 100, 20);
    map.AddTBString(FrmEleDBAttr.EleID, null, 'EleID', true, false, 0, 50, 20);
    map.AddTBString(FrmEleDBAttr.RefPKVal, null, 'RefPKVal', true, false, 0, 50, 20);
    map.AddTBInt(FrmEleDBAttr.FID, 0, 'FID', false, true);
    map.AddTBString(FrmEleDBAttr.Tag1, null, 'Tag1', true, false, 0, 1000, 20);
    map.AddTBString(FrmEleDBAttr.Tag2, null, 'Tag2', true, false, 0, 1000, 20);
    map.AddTBString(FrmEleDBAttr.Tag3, null, 'Tag3', true, false, 0, 1000, 20);
    map.AddTBString(FrmEleDBAttr.Tag4, null, 'Tag4', true, false, 0, 1000, 20);
    map.AddTBString(FrmEleDBAttr.Tag5, null, 'Tag5', true, false, 0, 1000, 20);

    //参数属性
    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
}

// 表单元素扩展DB s
export class FrmEleDBs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmEleDB();
  }
  constructor() {
    super();
  }
}
