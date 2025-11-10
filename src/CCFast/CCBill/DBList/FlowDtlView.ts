import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { GL_VSTOFrm } from '/@/WF/Admin/DesignerVSTO/GL_VSTOFrm';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloWF } from '/@/WF/Admin/GloWF';

// 数据源实体
export class FlowDtlView extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.FlowDtlView');
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
    const map = new Map('Sys_MapData', '流程从表视图');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, true, 1, 100, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20, true);
    map.AddTBString(MapDataAttr.PTable, null, '视图名称', true, true, 0, 500, 20, true);

    //#region 数据源.
    map.AddGroupAttr('SQL数据源');
    map.AddTBString('FlowNo', null, 'FlowNo', true, true, 0, 100, 20);
    map.AddTBString('DictID', null, '实体ID', true, true, 0, 100, 20);
    map.AddTBString('DictName', null, '流程名称', true, true, 0, 100, 20);
    map.AddTBString('DictDtlID', null, '从表ID', true, true, 0, 100, 20);
    map.AddTBString('DictDtlName', null, '从表名称', true, true, 0, 100, 20);

    map.AddTBStringDoc('ExpEn', null, '主表字段', true, false, true);
    map.AddTBStringDoc('DtlFields', null, '从表字段', true, false, true);

    map.SetPopList('ExpEn', GloWF.srcFrmFields_M('@DictID'), true, '500px', '500px', '选择从表字段', 'icon-drop');
    map.SetPopList('DtlFields', GloWF.srcFrmFields_M('@DictDtlID'), true, '500px', '500px', '选择从表字段', 'icon-drop');

    map.AddTBAtParas(4000);
    // map.ParaFields = ',DictID,DictName,DictDtlID,DictDtlName,'; //参数字段.
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
  public async DTSField() {
    const dbEntity = new BSEntity('BP.CCBill.FlowDtlView');
    dbEntity.setPK(this.No);
    await dbEntity.Retrieve();
    const data = await dbEntity.DoMethodReturnString('CheckIt');
    return '执行成功:' + data;
  }
}
