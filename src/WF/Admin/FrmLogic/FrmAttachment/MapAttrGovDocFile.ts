import { MapAttrAttr } from '../MapAttrs/MapAttr';
import { GovDocTemplates } from '../../AttrFlow/GovDoc/GovDocTemplate';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';

// 公文组件
export class GovAth extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SelfCommonent.GovAth');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_MapAttr', 'VSTO公文组件');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '名称', true, false, 0, 200, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', false, false, 1, 200, 20);
    // map.AddDDLSysEnum(MapAttrAttr.UIIsEnable, 0, '启用类型', true, true, 'CtrlEnableType', '@0=禁用(隐藏)@1=启用@2=只读');
    map.AddDDLSysEnum(MapAttrAttr.Tag, 0, '组件类型', true, true, 'GovDocType', '@0=vsto公文组件@1=WPS组件@2=金格组件');
    //   map.AddDDLSysEnum(MapAttrAttr.Tag, 0, '组件类型', true, true, 'GovDocType', '@0=RTF模板@1=HTML模板@2=Weboffice组件@3=WPS组件@4=金格组件');
    //从表.  'Mark=GovDoc'
    map.AddRM_DtlSearch('公文模板', new GovDocTemplates(), 'RefPKVal', '', '', null, 'icon-doc', true);

    this._enMap = map;
    return this._enMap;
  }
}
