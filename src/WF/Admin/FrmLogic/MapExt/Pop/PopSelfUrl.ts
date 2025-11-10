import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';

// 自定义url弹窗
export class PopSelfUrl extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopSelfUrl');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '自定义url弹窗');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.ExtModel, 'Pop', '模式(大类)', false, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.ExtType, null, '类型(小类)', false, false, 0, 50, 200);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    map.AddTBInt(MapExtAttr.H, 400, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 500, '弹窗宽度', true, false);
    map.AddTBString(MapExtAttr.Tag, null, 'URL', true, false, 0, 50, 200, true);

    // map.AddGroupAttr('外观');
    // map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    // map.AddTBInt(MapExtAttr.H, 400, '弹窗高度', true, false);
    // map.AddTBInt(MapExtAttr.W, 500, '弹窗宽度', true, false);

    //参数字段.  @SelectType=1@IsEnter=0
    map.AddTBAtParas(4000);
    map.ParaFields = ',Title,';

    this._enMap = map;
    return this._enMap;
  }
}
