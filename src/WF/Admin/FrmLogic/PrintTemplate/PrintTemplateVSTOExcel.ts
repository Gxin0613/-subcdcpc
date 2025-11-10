import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import WebUser from '/@/bp/web/WebUser';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { PTDBSrcs } from './PTDBSrc';
import { getVstoHost } from '/@/utils/VstoUtils';
import { message } from 'ant-design-vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// VSTOExcel表单模板
export class PrintTemplateVSTOExcel extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }
  constructor(pkval?: string) {
    super('TS.Sys.Printer.PrintTemplateVSTOExcel');
    if (!!pkval) this.setPKVal(pkval);
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintTemplate', 'VSTOExcel模板');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本属性');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 60, 60);
    map.AddTBString('Name', null, '名称', true, false, 0, 500, 20, true);
    const cfg1 = `@0=Word@1=PDF@2=Excel`;
    map.AddDDLSysEnum('PrintFileType', 0, '生成的文件类型', true, true, 'PrintFileType', cfg1);
    map.AddBoolean('VSTOIsEnableSave', false, '是否允许保存生成的单据?', true, true, true, this.HelpVSTOIsEnableSave);

    map.AddLink('Help', 'Rtf模板打印帮助', '', false, GPNReturnType.OpenUrlByNewWindow, 'https://docs.qq.com/doc/DRFNGZGJwYVZsaE1T', 'icon-support');

    map.AddRM_DtlSearch('数据源设置', new PTDBSrcs(), 'FrmPrintTemplateID', '', '', '', 'icon-settings', true);

    const rm = new RefMethod();
    rm.Title = 'VSTOExcel打印模板设计器';
    rm.RefMethodType = RefMethodType.Func;
    rm.ClassMethod = 'DoOpenIt';
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  public HelpVSTOIsEnableSave = `
  #### 帮助
  - 是否允许保存？
  - 把vsto的表单作为打印模板的时候，用户打开文件，该文件是数据+模板文件.
  - 如果允许保存：用户修改后，就可以保存.
  `;

  public async DoOpenIt(_type = 0) {
    let url = '';
    if (this.PrintFileType == 2) url = 'excelform://-fromccflow,AppID=PrinterTemplateDesinger,FrmID=';
    else url = 'wordform://-fromccflow,AppID=PrinterTemplateDesinger,FrmID='; //打开word模版设计器.

    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      if (this.PrintFileType == 2) {
        handler.AddPara('Header', 'excelform');
      } else {
        handler.AddPara('Header', 'wordform');
      }
      const result: any = await handler.DoMethodReturnString('IsInstallVSTO');
      // 执行自定义逻辑，例如记录日志
    } catch (e) {
      message.error(e as string);
      return;
    }

    url += this.FrmID + ',Token=' + WebUser.Token?.replace(',,', '');
    url += ',MyPK=' + this.MyPK;
    url += ',UserNo=' + WebUser.No;
    // url += ',FrmID=' + this.FrmID;
    url += ',EnName=' + this.FrmID;
    // url += ',WebHostUrl=' + window.location.origin;
    url += ',WebHostUrl=' + window.location.origin;
    const host = getVstoHost();
    url += ',WSUrl=' + host;
    console.info(url);
    window.location.href = url;
    return url;
    // return '检查结果如下..xxxxxxxxxxxxxx@xxxxxxx  @xxxxxxxxxx';
  }
}
