import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';

/// <summary>
/// 绑定函数
/// </summary>
export class LinkAttr extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.LinkAttr');
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
    const map = new Map('Sys_MapExt', '链接属性');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.Doc, null, 'URL', true, false, 0, 100, 120, true);
    map.AddTBString(MapExtAttr.Tag1, null, '高度', true, false, 0, 10, 80, false);
    map.AddTBString(MapExtAttr.Tag2, null, '宽度', true, false, 0, 10, 80, false);

    this._enMap = map;
    return this._enMap;
  }
}
