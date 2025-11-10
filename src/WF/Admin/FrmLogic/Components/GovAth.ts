import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from '../MapAttrs/MapAttr';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GovDocTemplates } from '../../AttrFlow/GovDoc/GovDocTemplate';

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
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', false, false, 1, 200, 20);
    map.AddTBString(MapAttrAttr.Name, null, '名称', true, false, 0, 200, 20);
    // map.AddDDLSysEnum(MapAttrAttr.UIIsEnable, 0, '启用类型', true, true, 'CtrlEnableType', '@0=禁用(隐藏)@1=启用@2=只读');
    map.AddDDLSysEnum(MapAttrAttr.Tag, 0, '组件类型', true, true, 'GovDocType', '@0=office文件@1=WPS在线文件@3=OnlyOffice在线文件@4=本机文件');
    //map.AddDDLSysEnum(MapAttrAttr.Tag, 0, '组件类型', true, true, 'GovDocType', '@0=RTF模板@1=HTML模板@2=Weboffice组件@3=WPS组件@4=金格组件');
    map.AddDDLStringEnum(MapAttrAttr.Tag2, "Modal", '在线文件打开方式', '@blank=新窗口打开@IFrame=嵌入式打开@Modal=弹窗打开',true);
    map.AddTBString(MapAttrAttr.Tag1, null, '公文模板ID(仅WPS使用)', true, false, 0, 50, 10, false);

    map.AddTBString(MapAttrAttr.Tag3, '500', '高度', true, false, 0, 500, 20, false);
    
    //从表.  'Mark=GovDoc'
    map.AddRM_DtlSearch('公文模板', new GovDocTemplates(), 'RefPKVal', '', '', null, 'icon-doc', true);
    
    this._enMap = map;
    return this._enMap;
  }
}
