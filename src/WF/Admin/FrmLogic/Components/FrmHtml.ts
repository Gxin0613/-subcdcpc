import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';

//大块文本说明
export class FrmHtml extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.SelfCommonent.FrmHtml');
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
    const map = new Map('Sys_MapExt', '大块文本说明');

    map.AddMyPK();
    map.AddRichText('HtmlText', '', '内容', true, false, true);

    this._enMap = map;
    return this._enMap;
  }
}
