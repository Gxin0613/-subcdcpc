import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

// 字段单附件
export class ExtAthSingle extends EntityMyPK {
  constructor(mypk?: string) {
    // super("bp.demo.ExtAthSingle","TS.Demo.BPFramework.ExtAthSingle");
    super('TS.FrmUI.SelfCommonent.ExtAthSingle');
    if (!!mypk) this.MyPK = mypk;
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
    const map = new Map('Sys_MapAttr', '字段单附件');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '名称', true, false, 0, 500, 20, true);

    map.AddTBFloat(MapAttrAttr.UIHeight, 1, '高度', true, false);
    map.AddTBFloat(MapAttrAttr.UIWidth, 1, '宽度', true, false);

    this._enMap = map;
    return this._enMap;
  }
}
