import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmPrintDBs } from './FrmPrintDB';
// 表单注册
export class FrmPrintTemplate extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }
  constructor(no?: string) {
    super('TS.Sys.Printer.FrmPrintTemplate');
    if (!!no) this.MyPK = no;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintTemplate', '打印模板');

    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 60, 60);
    map.AddTBString('Name', null, '模板名称', true, false, 0, 200, 100);

    const cfg2 = `@0=RTF@1=VSTOForWord@2=VSTOForExcel@3=WPS`;
    map.AddDDLSysEnum('TemplateFileModel', 0, '模板类型(rtf,excel,word)', true, true, 'TemplateFileModel', cfg2);
    const cfg1 = `@0=Word@1=PDF@2=Excel`;
    map.AddDDLSysEnum('PrintFileType', 0, '生成的文件类型', true, true, 'PrintFileType', cfg1);
    map.AddBoolean('IsEnable', true, '是否启用?', true, true);
    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddTBAtParas(400);
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
  override async afterDelete(): Promise<boolean> {
    //删除文件后改变下载的记录
    const frmPrintDBs = new FrmPrintDBs();
    const i = await frmPrintDBs.Retrieve('FrmPrintTemplateID', this.MyPK);
    if (i > 0) {
      const frmPrintDB = frmPrintDBs[0];
      frmPrintDB.State = '作废';
      await frmPrintDB.Update();
    }
    return Promise.resolve(true);
  }
}

// 表单注册s
export class FrmPrintTemplates extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmPrintTemplate();
  }
  constructor() {
    super();
  }
}
