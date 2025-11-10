import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

// 评分
export class ExtScore extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SelfCommonent.ExtScore');
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public get EnMap() {
    const map = new Map('Sys_MapAttr', '评分');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段', true, true, 1, 100, 20);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);
    map.AddTBString(MapAttrAttr.Name, null, '评分事项', true, false, 0, 500, 20, true);
    map.AddTBString(MapAttrAttr.Tag2, '5', '总分', true, false, 0, 100, 20);

    this._enMap = map;
    return this._enMap;
  }
}
