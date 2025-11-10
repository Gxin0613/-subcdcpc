import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFColumns } from '../SFSearch/SFColumn';
import { MapAttrLangs } from '../MapAttrs/MapAttrLang';
import { MapDtlLangs } from '../MapDtlLang';
import { FrmAttachmentLangs } from '../FrmAttachment/FrmAttachmentLang';
import { MapAttrGener, MapAttrGeners } from '../MapAttrs/MapAttrGener';
import { MapDtls } from '../MapDtl';
import { FrmAttachments } from '../FrmAttachment/FrmAttachment';

// 查询
export class PTDBSrcSearch extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }
  constructor(no?: string) {
    super('TS.Sys.Printer.PTDBSrcSearch');
    if (!!no) this.MyPK = no;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintTemplateDBSrc', '查询');

    map.AddMyPK();

    //实体单据.
    map.AddTBString('RefFrmID', null, '查询ID', true, true, 0, 60, 60);
    map.AddTBString('RefFrmName', null, '查询名称', true, true, 0, 60, 60);
    map.AddTBInt('Idx', 0, 'Idx', false, false);

    //map.AddRM_DtlSearch('列属性', new SFColumns(), 'RefFrmID', '', '', '', 'icon-list', true);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
