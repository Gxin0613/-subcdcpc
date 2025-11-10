import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmPrintTemplates } from '/@/WF/Admin/FrmLogic/PrintTemplate/FrmPrintTemplate';
import { MapDataVerAttr } from '/@/WF/Admin/FrmLogic/MapData/MapDataVer/MapDataVer';
import { SubTablePosition } from '/@/bp/en/Config';

export class FrmEntityNoNameBtn extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.FrmEntityNoNameBtn');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('Sys_MapData', '常规按钮');

    map.AddGroupAttr('常规按钮');
    map.AddTBStringPK('No', null, '表单编号', true, true, 1, 190, 20);
    map.AddTBString('Name', '', '名称', true, true, 0, 50, 10);

    //在这里做控制了，通过BillState控制 新建、保存、删除、归档、撤销归档
    map.AddTBString('NewLab', '新建', '新建标签', false, false, 0, 50, 10);
    map.AddTBString('NewLabEn', 'New', '新建标签En', false, false, 0, 50, 10);
    map.AddTBString('NewLabJP', '新建', '新建标签JP', false, false, 0, 50, 10);

    map.AddBoolean('NewEnable', true, '是否启用', false, true);

    map.AddTBString('SaveLab', '保存', '保存标签', false, false, 0, 50, 10);
    map.AddTBString('SaveLabEn', 'Save', '保存标签En', false, false, 0, 50, 10);
    map.AddTBString('SaveLabJP', '保存', '保存标签JP', false, false, 0, 50, 10);

    map.AddBoolean('SaveEnable', true, '是否启用', false, true);

    map.AddTBString('DeleteLab', '删除', '删除标签', false, false, 0, 50, 10);
    map.AddBoolean('DeleteEnable', true, '是否启用', false, true);

    map.AddTBString('FilingDoneLab', '归档', '归档标签', false, false, 0, 50, 10);
    map.AddBoolean('FilingDoneEnable', true, '是否启用', false, true);

    map.AddTBString('FilingUnLab', '撤销归档', '撤销归档标签', false, false, 0, 50, 10);
    map.AddBoolean('FilingUnEnable', true, '是否启用', false, true);

    map.AddTBString('PrintHtmlLab', '打印Html', '打印Html标签', true, false, 0, 50, 10);
    map.AddBoolean('PrintHtmlEnable', false, '是否启用', true, true);

    map.AddTBString('PrintPDFLab', '打印PDF', '打印PDF标签', true, false, 0, 50, 10);
    map.AddBoolean('PrintPDFEnable', true, '是否启用', true, true);

    map.AddTBString('PrintZipLab', '打包下载', '打包下载标签', true, false, 0, 50, 10);
    map.AddBoolean('PrintZipEnable', true, '是否启用', true, true);

    map.AddTBString('PrintTemplateLab', '模版打印', '模版打印标签', true, false, 0, 50, 10);
    map.SetHelperAlert('PrintTemplateLab', '启用必须要在表单属性，设置打印模板.');
    map.AddBoolean('PrintTemplateEnable', false, '是否启用', true, true);

    const myurl = GloComm.UrlDtlSearch(this.classID, 'TS.Sys.Printer.FrmPrintTemplate', 'FrmID', '@No', '', '', 'Name,FileModel,PrintFileType,TemplateFileModel,', false, '&xx=1');
    map.AddLink('TemplateSet', '设置模板', myurl, false, GPNReturnType.OpenUrlByModal, '', 'icon-link');

    const str1 = `Name,FileModel,PrintFileType,TemplateFileModel,`;
    map.AddRM_DtlSearch('模板打印', new FrmPrintTemplates(), MapDataVerAttr.FrmID, '', '', str1, 'icon-printer', true, '', SubTablePosition.Bottom);

    this._enMap = map;
    return this._enMap;
  }
}
