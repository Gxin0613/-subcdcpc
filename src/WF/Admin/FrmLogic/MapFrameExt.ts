import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
export class MapFrameAttr extends MapAttrAttr {
  public static readonly IsAutoSize = 'IsAutoSize';
  public static readonly H = 'H';
  public static readonly W = 'W';
  public static readonly FrameURL = 'FrameURL';
  public static readonly URL = 'URL';
  public static readonly UrlSrcType = 'UrlSrcType';
  public static readonly EleType = 'EleType';
}

// 框架
export class MapFrameExt extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapFrameExt');
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
    const map = new Map('Sys_MapFrame', '框架');

    map.AddMyPK();
    map.AddTBString(MapFrameAttr.FK_MapData, null, '表单ID', true, true, 0, 100, 20);
    map.AddTBString(MapFrameAttr.Name, null, '名称', true, false, 0, 200, 20, true);

    map.AddDDLSysEnum(MapFrameAttr.UrlSrcType, 0, 'URL来源', true, true, MapFrameAttr.UrlSrcType, '@0=自定义@1=地图@2=流程轨迹表@3=流程轨迹图');
    map.AddTBString(MapFrameAttr.FrameURL, null, 'URL', true, false, 0, 3000, 20, true);

    map.AddTBString(MapFrameAttr.URL, null, 'URL', false, false, 0, 3000, 20, true);

    map.AddTBString(MapFrameAttr.W, null, '宽度', true, false, 0, 20, 20);
    map.AddTBString(MapFrameAttr.H, null, '高度', true, false, 0, 20, 20);

    map.AddBoolean(MapFrameAttr.IsAutoSize, true, '是否自动设置大小', false, false);

    map.AddTBString(MapFrameAttr.EleType, null, '类型', false, false, 0, 50, 20, true);

    map.AddTBString(MapFrameAttr.GUID, null, 'GUID', false, false, 0, 128, 20);

    map.AddTBInt(MapAttrAttr.Idx, 0, '序号', true, false); //@李国文.

    const rm = new RefMethod();
    rm.Title = '预制';
    rm.ClassMethod = this.ToString() + '.DoFrameExt()';
    rm.RefMethodType = RefMethodType.RightFrameOpen;
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  public DoFrameExt() {
    return '../../Admin/FoolFormDesigner/FrameExt/Default.htm?MyPK=' + this.MyPK;
  }
}

//框架 s
export class MapFrameExts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapFrameExt();
  }
  constructor() {
    super();
  }
}
