import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrString } from '../MapAttrs/MapAttrString';
import { MapAttrAttr } from '../MapAttrs/MapAttr';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
export class FrmImgAttr extends MapAttrAttr {
  public static readonly ImgSrcType = 'ImgSrcType';
  public static readonly ImgPath = 'ImgPath';
  public static readonly ImgURL = 'ImgURL';
  public static readonly LinkURL = 'LinkURL';
  public static readonly LinkTarget = 'LinkTarget';
  public static readonly ImgAppType = 'ImgAppType';
}

// 装饰图片
export class FrmImg extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.FrmImg');
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
    const map = new Map('Sys_MapAttr', '装饰图片');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 0, 200, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '对应字段', true, true, 0, 200, 20);
    map.AddTBString(FrmImgAttr.Name, null, '中文名称', true, true, 0, 500, 20);
    map.AddDDLSysEnum(FrmImgAttr.ImgSrcType, 0, '图片来源', true, true, FrmImgAttr.ImgSrcType, '@0=本地@1=URL');

    map.AddTBString(FrmImgAttr.ImgPath, null, '图片路径', true, false, 0, 200, 20, true);

    let strs = '本机的图片路径:';
    strs += ` 
 1.您可以使用 ＠baseBase 或者＠+字段英文名作为变量来标识文件路径.`;
    strs += ` 
 2.注意＠需要半角字符.`;
    strs += ` 
 3.例如:＠basePath/DataUser/UserIcon/＠QingJiaRenID.png`;
    map.SetHelperAlert(FrmImgAttr.ImgPath, strs);

    map.AddTBString(FrmImgAttr.ImgURL, null, '图片URL', true, false, 0, 200, 20, true);
    map.AddTBString(FrmImgAttr.LinkURL, null, '连接到URL', true, false, 0, 200, 20, true);
    map.AddTBString(FrmImgAttr.LinkTarget, '_blank', '连接目标', true, false, 0, 200, 20);

    //UIContralType.FrmImg
    //map.AddTBString(FrmImgAttr.Tag0, null, "参数", true, false, 0, 500, 20); 2
    //map.AddTBString(FrmImgAttr.EnPK, null, "英文名称", true, false, 0, 500, 20);
    //map.AddTBInt(FrmImgAttr.ImgAppType, 0, "应用类型", false, false);
    //map.AddTBString(FrmImgAttr.GUID, null, "GUID", true, false, 0, 128, 20);
    //map.AddTBInt(FrmImgAttr.ImgAppType, 0, '应用类型', false, false);

    map.AddTBFloat(MapAttrAttr.UIWidth, 0, '宽度', true, false);
    map.AddTBFloat(MapAttrAttr.UIHeight, 0, '高度', true, false);

    this._enMap = map;
    return this._enMap;
  }
}
