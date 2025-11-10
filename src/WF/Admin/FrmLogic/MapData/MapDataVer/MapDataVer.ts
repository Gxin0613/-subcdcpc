import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import HttpHandler from '/@/utils/gener/HttpHandler';

//属性列表
export class MapDataVerAttr {
  /// <summary>
  /// 表单ID
  /// </summary>
  public static readonly FrmID = 'FrmID';
  /// <summary>
  /// 版本号
  /// </summary>
  public static readonly Ver = 'Ver';
  /// <summary>
  /// 日期
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly Rec = 'Rec';
  /// <summary>
  /// 记录人名称
  /// </summary>
  public static readonly RecName = 'RecName';
  /// <summary>
  /// 备注
  /// </summary>
  public static readonly RecNote = 'RecNote';

  public static readonly IsRel = 'IsRel';
  /// <summary>
  /// 行数
  /// </summary>
  public static readonly RowNum = 'RowNumExt';
  public static readonly AttrsNum = 'AttrsNum';
  public static readonly DtlsNum = 'DtlsNum';
  public static readonly AthsNum = 'AthsNum';
  public static readonly ExtsNum = 'ExtsNum';
}

// 表单注册
export class MapDataVer extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }
  constructor(no?: string) {
    super('TS.FrmUI.MapDataVer', 'BP.Sys.MapDataVer');
    if (!!no) this.MyPK = no;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapDataVer', '表单模板版本管理');

    map.AddMyPK();
    map.AddTBString(MapDataVerAttr.FrmID, null, '表单ID', false, false, 0, 50, 20);
    map.AddTBInt(MapDataVerAttr.Ver, 0, '版本号', true, true);
    map.AddBoolean(MapDataVerAttr.IsRel, false, '主版本?', true, false);

    map.AddTBInt(MapDataVerAttr.RowNum, 0, '数据行数', true, true);
    map.AddTBInt(MapDataVerAttr.AttrsNum, 0, '字段数', true, true);
    map.AddTBInt(MapDataVerAttr.DtlsNum, 0, '从表数', true, true);
    map.AddTBInt(MapDataVerAttr.AthsNum, 0, '附件数', true, true);
    map.AddTBInt(MapDataVerAttr.ExtsNum, 0, '逻辑数', true, true);

    map.AddTBString(MapDataVerAttr.Rec, null, '创建人', false, false, 0, 50, 20);
    map.AddTBString(MapDataVerAttr.RecName, null, '创建人', true, true, 0, 50, 100);
    map.AddTBString(MapDataVerAttr.RecNote, null, '创建原因', true, true, 0, 50, 100);
    // map.AddTBStringDoc(MapDataVerAttr.RecNote, null, 'RecNote', true, false, true);
    map.AddTBDateTime(MapDataVerAttr.RDT, null, '记录时间', true, true);

    map.AddRM_Func('设置主版本', 'SetMainVer', '您确定要设置吗?', 'icon-drop');
    this._enMap = map;
    return this._enMap;
  }

  public SetMainVer() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('MyPK', this.MyPK);
    const data = handler.DoMethodReturnString('MapDataVer_SetMainVer');
    return data;
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

// 表单注册s
export class MapDataVers extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapDataVer();
  }
  constructor() {
    super();
  }
}
