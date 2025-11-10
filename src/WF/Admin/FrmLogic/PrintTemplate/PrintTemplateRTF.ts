import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GPN_PrintRTF } from './GPN_PrintRTF';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// VSTOExcel表单模板
export class PrintTemplateRTF extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }
  constructor(pkval?: string) {
    super('TS.Sys.Printer.PrintTemplateRTF');
    if (!!pkval) this.setPKVal(pkval);
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintTemplate', 'RTF模板');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本属性');
    map.AddMyPK();
    map.AddTBString('Name', null, '名称', true, false, 0, 500, 20, true);
    const cfg1 = `@0=Word@1=PDF@2=Excel`;
    map.AddDDLSysEnum('PrintFileType', 0, '生成的文件类型', true, true, 'PrintFileType', cfg1);

    map.AddLink('Help', 'Rtf模板打印帮助', '', false, GPNReturnType.OpenUrlByNewWindow, 'https://docs.qq.com/doc/DRHNQeE9tV3ZlVE11', 'icon-support');

    map.AddRM_GPN(new GPN_PrintRTF(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
}
