import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
/// <summary>
/// 落值填充
/// </summary>
export class FullBodySelf extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullBodySelf');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_MapExt', '落值填充-主表');

    map.AddMyPK();
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBStringDoc(MapExtAttr.Tag6, null, '填充表达式', true, false, true, this.DescSrc);
    map.AddTBString(MapExtAttr.FK_MapData, null, '主表', false, false, 0, 100, 20);

    const help = `#### 帮助
    - 查询的数据返回一行多列,列名要与主表字段名称保持一致,就会填充.
    - 比如： SELECT Email,Tel FROM Demo_Student WHERE No=@Key
    - @Key 是系统默认选择的字段.   返回的列与目前表单的字段值对应系统就会自动填充.
    - 
    `;
    map.SetHelperAlert('Tag6', help);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
