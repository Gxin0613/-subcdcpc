import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';
import { MapAttrString } from '../MapAttrs/MapAttrString';

// 超连接
export class FrmLink extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.SelfCommonent.FrmLink');
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
    const map = new Map('Sys_MapAttr', '超连接');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段', true, true, 1, 100, 20);
    map.AddDDLSQL(MapAttrAttr.GroupID, null, '显示的分组', MapAttrString.SQLOfGroupAttr, true);

    map.AddTBString(MapAttrAttr.Name, 'New Link', '标签', true, false, 0, 500, 20, true);
    map.AddTBString(MapAttrAttr.Tag1, '_blank', '打开方式', true, false, 0, 4000, 20);
    map.SetHelperAlert(MapAttrAttr.Tag1, '设置链接打开方式：_blank（新窗口），_self（当前窗口），_parent（父窗口），_modal（弹窗）');
    map.AddTBString(MapAttrAttr.Tag2, null, 'URL', true, false, 0, 500, 20, true);

    this._enMap = map;
    return this._enMap;
  }
}
