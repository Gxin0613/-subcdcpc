import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { GL_VSTOFrm } from '/@/WF/Admin/DesignerVSTO/GL_VSTOFrm';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloWF } from '/@/WF/Admin/GloWF';

// 数据源实体
export class FrmDtlView extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.FrmDtlView');
    if (!!pkval) this.No = pkval;
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
    const map = new Map('Sys_MapData', '表单从表视图');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, true, 1, 100, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20, true);
    map.AddTBString(MapDataAttr.PTable, null, '视图名称', true, true, 0, 500, 20, true);

    //#region 数据源.
    map.AddGroupAttr('SQL数据源');
    map.AddTBString('FrmNo', null, '表单No', true, true, 0, 100, 20); //主表单
    map.AddTBString('FrmName', null, '表单名称', true, true, 0, 100, 20);
    map.AddTBString('DtlNo', null, '从表ID', true, true, 0, 100, 20); //选择的从表ID
    map.AddTBString('DtlName', null, '从表名称', true, true, 0, 100, 20);

    map.AddTBStringDoc('FrmFields', null, '主表字段', true, false, true);
    map.AddTBStringDoc('DtlFields', null, '从表字段', true, false, true);

    map.SetPopList('FrmFields', GloWF.srcFrmFields_M('@FrmNo'), true, '500px', '500px', '选择主表字段', 'icon-drop');
    map.SetPopList('DtlFields', GloWF.srcFrmFields_M('@DtlNo'), true, '500px', '500px', '选择从表字段', 'icon-drop');

    map.AddTBAtParas(4000);
    const rm = new RefMethod();
    rm.Title = '检查';
    rm.ClassMethod = 'DTSField';
    rm.Visable = true;
    rm.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm);
    map.AddRM_GL(new GL_VSTOFrm(), '编辑字段', 'icon-books', '&FrmID=@No');

    this._enMap = map;
    return this._enMap;
  }
  //检查
  public async DTSField() {
    const dbEntity = new BSEntity('BP.CCBill.FrmDtlView');
    dbEntity.setPK(this.No);
    await dbEntity.Retrieve();
    const data = await dbEntity.DoMethodReturnString('CheckIt');
    return '执行成功:' + data;
  }
}
