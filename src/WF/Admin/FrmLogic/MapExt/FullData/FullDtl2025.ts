import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
/// <summary>
/// 填充从表
/// </summary>
export class FullDtl2025 extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullDtl2025');
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
    const map = new Map('Sys_MapExt', '填充从表');

    map.AddMyPK();

    map.AddTBString(MapExtAttr.Tag1, null, '从表ID', true, true, 0, 150, 150, false);
    map.AddTBString(MapExtAttr.Tag2, null, '从表名称', true, true, 0, 150, 150, false);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=FullDataDtl');
    map.AddLink('Doc', '设置-填充数据源', url, false, GPNReturnType.OpenUrlByDrawer50, this.help, 'icon-settings');
    // map.AddTBStringDoc(MapExtAttr.Doc, null, '表达式', true, false, true, this.help);

    this._enMap = map;
    return this._enMap;
  }
  public readonly help = `
  #### 帮助
  - 返回一个数据集合，列名与从表的列名对应就可以自动填充.
  `;
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}

/**
 * 填充从表s
 */
export class FullDtlSelfs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FullDtlSelf();
  }
  constructor() {
    super();
  }
}
