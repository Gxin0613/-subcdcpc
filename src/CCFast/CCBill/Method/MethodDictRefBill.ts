import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { EntityNoName } from '/@/bp/en/EntityNoName';

// 功能方法
export class MethodDictRefBill extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodFunc","TS.Demo.BPFramework.MethodFunc");
    super('TS.CCBill.MethodDictRefBill');
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
    const map = new Map('Frm_Method', '关联单据');

    //主键.
    map.AddGroupAttr('基本设置');
    map.AddTBString(MethodAttr.Name, null, '方法名', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', true, true, 0, 300, 10);
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);

    map.AddTBString(MethodAttr.GroupID, null, '分组ID', false, false, 0, 50, 10);
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', false, false, 0, 300, 10);
    map.AddTBString('Tag1', null, '单据ID', true, true, 0, 100, 10);
    map.AddTBString('Tag2', null, '单据名称', true, true, 0, 200, 10);

    map.AddTBString('Tag3', null, '列的显示方式', true, true, 0, 200, 10);
    map.AddTBString('Docs', null, '显示的列', true, true, 0, 500, 10);

    map.AddTBString('RefDictNo', null, '关联编号', true, true, 0, 100, 10);
    map.AddTBString('RefDictName', null, '关联名称', true, true, 0, 200, 10);

    map.AddTBString(MethodAttr.FrmID, null, '实体表单ID', false, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);
    map.ParaFields = ',RefDictNo,RefDictName,';
    map.AddTBAtParas();

    //map.AddRM_GPE(new GPE_MethodFunc(), 'icon-drop');
    //map.AddRM_DtlSearch('参数', new MethodFuncParas(), 'FK_MapData', '', '', 'Name,KeyOfEn,DataType', 'icon-drop', true, '');

    this._enMap = map;
    return this._enMap;
  }
  public ZhuXiaoXueJi(): string {
    return '执行成功. ZhuXiaoXueJi ' + this.Name;
  }
}
