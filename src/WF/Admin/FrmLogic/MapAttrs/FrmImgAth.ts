import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from './MapAttr';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

export class FrmImgAthAttr extends MapAttrAttr {
  public static readonly CtrlID = 'CtrlID';
  public static readonly H = 'H';
  public static readonly W = 'W';
  public static readonly IsEdit = 'IsEdit';
  public static readonly IsRequired = 'IsRequired';
}

// 图片附件
export class FrmImgAth extends EntityMyPK {
  constructor(mypk?: string) {
    // super("bp.demo.FrmImgAth","TS.Demo.BPFramework.FrmImgAth");
    super('TS.FrmUI.FrmImgAth');
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public get EnMap() {
    const map = new Map('Sys_FrmImgAth', '图片附件');

    map.AddMyPK();

    map.AddTBString(FrmImgAthAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(FrmImgAthAttr.CtrlID, null, '控件ID', true, true, 0, 200, 20);
    map.AddTBString(FrmImgAthAttr.Name, null, '中文名称', true, false, 0, 200, 20);

    map.AddTBFloat(FrmImgAthAttr.H, 200, 'H', true, false);
    map.AddTBFloat(FrmImgAthAttr.W, 160, 'W', false, false);

    map.AddBoolean(FrmImgAthAttr.IsEdit, true, '是否可编辑', true, true);
    //map.AddTBInt(FrmImgAthAttr.IsEdit, 1, "是否可编辑", true, true);
    map.AddBoolean(FrmImgAthAttr.IsRequired, false, '是否必填项', true, true);

    this._enMap = map;
    return this._enMap;
  }
}

//图片附件s
export class FrmImgAths extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmImgAth();
  }
  constructor() {
    super();
  }
}
