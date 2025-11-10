import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
/// <summary>
/// 填充附件
/// </summary>
export class FullAth extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullAth');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_MapExt', '填充附件');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.RefPKVal, null, 'RefPKVal', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.ExtType, null, 'ExtType', false, false, 0, 10, 50, true);

    const help = `
    #### 帮助
    - 目前仅仅支持从ccform的表单里获取附件数据并填充.
    - 当前填充关联的表单ID, 以及附件ID.
    `;
    const help2 = `
    #### 帮助
    - 返回三个列(有先后顺序)FileName,FileFullName,Sort
    - SQL示例：select FileName,FileFullName,Sort FROM sys_frmattachmentdb where RefPKVal='@Key' and NoOfObj='Ath1'.
    `;
    map.AddTBString(MapExtAttr.Tag1, null, '附件NoOfObj', true, false, 0, 150, 150, false, help);
    map.AddTBString(MapExtAttr.Tag2, null, '附件名称', true, false, 0, 150, 150, false, help);
    map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBStringDoc(MapExtAttr.Doc, null, '表达式', true, false, true, help2);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 填充附件s
 */
export class FullAths extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FullAth();
  }
  constructor() {
    super();
  }
}
