import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';

// 地图
export class ExtMap extends EntityMyPK {
  constructor(pkval?: string) {
    // super("bp.demo.ExtMap","TS.Demo.BPFramework.ExtMap");
    super('TS.FrmUI.SelfCommonent.ExtMap');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_MapAttr', '地图');

    // #region 通用的属性.
    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段', true, true, 1, 100, 20);

    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);
    map.AddTBFloat(MapAttrAttr.UIHeight, 1, '高度', true, false);
    map.AddTBFloat(MapAttrAttr.UIWidth, 1, '宽度', true, false);

    map.AddTBString(MapAttrAttr.Name, null, '名称', true, false, 0, 500, 20, true);
    // #endregion 通用的属性.

    // #region 个性化属性.
    // map.AddTBString(MapAttrAttr.Tag1, "_blank", "连接目标(_blank,_parent,_self)", true, false, 0, 20, 20);
    // map.AddTBString(MapAttrAttr.Tag2, null, "URL", true, false, 0, 500, 20, true);
    // #endregion 个性化属性.

    this._enMap = map;
    return this._enMap;
  }
}
