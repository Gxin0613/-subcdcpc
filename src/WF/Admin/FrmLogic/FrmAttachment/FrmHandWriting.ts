import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

// 手写签名版
export class FrmHandWriting extends EntityMyPK {
  constructor(mypk?: string) {
    // super("bp.demo.FrmHandWriting","TS.Demo.BPFramework.FrmHandWriting");
    super('TS.FrmUI.FrmHandWriting');
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

  public get EnMap() {
    const map = new Map('Sys_MapAttr', '手写签名版');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段', true, true, 1, 100, 20);

    map.AddTBFloat(MapAttrAttr.UIHeight, 1, '高度', true, false);
    map.AddTBFloat(MapAttrAttr.UIWidth, 1, '宽度', true, false);

    map.AddTBString(MapAttrAttr.Name, null, '名称', true, false, 0, 500, 20, true);

    this._enMap = map;
    return this._enMap;
  }
}

//手写签名版s
export class FrmHandWritings extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmHandWriting();
  }
  constructor() {
    super();
  }
}
