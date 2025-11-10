import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { GPE_MethodFunc } from './GPE_MethodFunc';
import { MethodFuncParas } from './MethodFuncPara';
import { GPE_GenerDBSrcSearch } from '../../GenerDBSrc/GPE_GenerDBSrcSearch';

// 功能方法
export class MethodFunc extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodFunc","TS.Demo.BPFramework.MethodFunc");
    super('TS.CCBill.MethodFunc');
    this.setPKVal(no);
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
    const map = new Map('Frm_Method', '方法');

    //主键.
    map.AddGroupAttr('基本设置');
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(MethodAttr.Name, null, '方法名', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.GroupID, null, '分组ID', false, false, 0, 50, 10);
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', false, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Tag1, null, 'Tag1', false, false, 0, 300, 10);
    map.AddTBString(MethodAttr.FrmID, null, '表单ID', false, false, 0, 300, 10);

    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);
    map.AddTBString(MethodAttr.Mark, null, '功能说明', true, false, 0, 900, 10, true);
    map.SetHelperAlert(MethodAttr.Mark, '对于该功能的描述.');
    //是否显示到列表.
    map.AddBoolean(MethodAttr.IsList, false, '是否显示在列表?', true, true);

    map.AddGroupAttr('提示信息');
    map.AddTBString('BtnDoneText', '执行', '执行按钮', true, false, 0, 100, 10, true);
    map.SetHelperAlert('BtnDoneText', '执行按钮,默认为：执行');
    map.AddTBString(MethodAttr.WarningMsg, null, '执行警告信息', true, false, 0, 300, 10, true);
    map.AddTBString(MethodAttr.MsgSuccess, null, '成功提示信息', true, false, 0, 300, 10, true);
    map.AddTBString(MethodAttr.MsgErr, null, '失败提示信息', true, false, 0, 300, 10, true);

    //map.AddDDLSysEnum(MethodAttr.MethodDocTypeOfFunc, 0, '内容类型', true, false, 'MethodDocTypeOfFunc',
    // '@0=SQL@1=URL@2=JavaScript@3=业务单元');
    map.AddTBInt(MethodAttr.MethodDocTypeOfFunc, 0, '内容类型?', false, false);
    map.AddTBString(MethodAttr.Docs, null, '执行内容', false, false, 0, 300, 10, true);
    map.AddTBAtParas();

    // map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);
    map.AddRM_DtlSearch('参数', new MethodFuncParas(), 'FK_MapData', '', '', 'Name,KeyOfEn,DataType', 'icon-drop', true, '&UIVisible=1&IsMove=true');
    map.AddRM_GPE(new GPE_MethodFunc(), 'icon-drop');
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '执行内容', '&MarkID=Main');

    this._enMap = map;
    return this._enMap;
  }
  public ZhuXiaoXueJi(): string {
    return '执行成功. ZhuXiaoXueJi ' + this.Name;
  }
}
