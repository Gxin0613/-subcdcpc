import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

// 连接
export class MethodPrintRTF extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodLink","TS.Demo.BPFramework.MethodLink");
    super('TS.CCBill.MethodPrintRTF');
    this.setPKVal(no);
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
    const map = new Map('Frm_Method', '打印Rtf模板');

    //主键.
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(MethodAttr.Name, null, '链接标签', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', false, true, 0, 300, 10);
    map.AddTBString(MethodAttr.GroupID, null, '分组ID', false, true, 0, 50, 10);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', false, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Mark, null, 'Mark', false, true, 0, 300, 10);
    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);
    const cfg1 = `@0=Word@1=PDF@2=Excel`;
    map.AddDDLSysEnum('PrintFileType', 0, '生成的文件类型', true, true, 'PrintFileType', cfg1);
    //是否显示到列表.
    map.AddBoolean(MethodAttr.IsList, false, '是否显示在列表?', true, true);
    map.AddMyFile('rtf模板文件', '*.rtf', 'DataUser/CyclostyleFile/');
    //map.AddAthSingle('RtfFile', 'rtf模板文件', true, true, '*.rtf', 'DataUser/CyclostyleFile/');
    map.AddTBAtParas();

    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }
}
