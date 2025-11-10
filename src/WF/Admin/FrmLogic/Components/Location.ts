import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

//系统定位
export class Location extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.SelfCommonent.Location');
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public get EnMap() {
    const map = new Map('Sys_MapAttr', '系统定位');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.Name, '', '标签', true, false, 0, 500, 20, true);
    map.AddTBString(MapAttrAttr.Tag1, '', '默认地址', true, false, 0, 4000, 20);
    //  map.SetHelperAlert(MapAttrAttr.Tag1, '比如:_blank,_parent,_self');

    this._enMap = map;
    return this._enMap;
  }
}
