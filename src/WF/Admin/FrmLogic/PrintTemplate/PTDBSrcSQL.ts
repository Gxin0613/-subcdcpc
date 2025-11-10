import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';

// 单据数据源
export class PTDBSrcSQL extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }
  constructor(no?: string) {
    super('TS.Sys.Printer.PTDBSrcSQL');
    if (!!no) this.MyPK = no;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintTemplateDBSrc', 'SQL数据源');

    map.AddMyPK();

    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 60, 60);
    map.AddTBString('FrmName', null, '表单名称', false, false, 0, 60, 60);
    map.AddTBString('FrmPrintTemplateID', null, '模板ID', false, false, 0, 60, 60);

    //Bill=单据,EntityNoName=实体,SQL=数据源,Img=图片,Ath=附件
    map.AddTBString('DBTypeID', null, '数据源类型ID', false, false, 0, 60, 60);
    map.AddTBString('DBTypeName', null, '类型名称', false, false, 0, 60, 60);
    //SQL.
    map.AddDDLEntities('DBSrc', 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBStringDoc('SQLSelect', null, '查询表达式', true, true, true);
    map.AddTBInt('Idx', 0, 'Idx', false, false);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
