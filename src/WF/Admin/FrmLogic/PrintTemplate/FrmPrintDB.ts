import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';

// 表单注册
export class FrmPrintDB extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }
  constructor(no?: string) {
    super('TS.Sys.Printer.FrmPrintDB');
    if (!!no) this.MyPK = no;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintDB', '打印模板');

    map.AddMyPK();

    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 60, 60);
    map.AddTBString('FrmName', null, '表单名称', false, false, 0, 60, 60);
    map.AddTBString('WorkID', null, '实例ID', false, false, 0, 60, 60);
    map.AddTBString('FrmPrintTemplateID', null, '模板ID', false, false, 0, 60, 60);

    map.AddTBString('FrmPrintTemplateName', null, '模板名称', true, false, 0, 200, 100);
    map.AddTBString('RecNo', null, '打印人ID', false, false, 0, 60, 60);
    map.AddTBString('RecName', null, '打印人名称', false, false, 0, 60, 60);
    map.AddTBDateTime('RDT', null, '打印日期', false, false);
    map.AddTBString('FileExt', null, '文件后缀', false, false, 0, 60, 60);
    map.AddTBString('State', null, '状态', false, false, 0, 60, 60);
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

// 表单注册s
export class FrmPrintDBs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmPrintDB();
  }
  constructor() {
    super();
  }
}
