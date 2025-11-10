import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { GL_VSTOFrm } from '/@/WF/Admin/DesignerVSTO/GL_VSTOFrm';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';

// 数据源实体
export class GLDBViewSQL extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.GLDBViewSQL');
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
    const map = new Map('Sys_MapData', '不分页视图SQL模式');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, true, 1, 190, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20, true);
    map.AddTBString(MapDataAttr.PTable, null, '视图名称', false, false, 0, 500, 20, true);
    map.AddTBString('GroupField', null, '分组字段', true, false, 0, 100, 20, true);
    map.SetHelperAlert('GroupField', '分组字段可以有多个字段,逗号分割,例如:Field1,Field2.');
    map.AddTBString('GroupDefault', null, '默认的分组字段', true, false, 0, 100, 20, true);
    map.AddTBString('DTField', null, '日期查询字段', true, false, 0, 100, 20, true);
    map.AddTBString('LabField', null, '标签字段', true, false, 0, 100, 20, true);
    map.AddTBString('LabContent', null, '标签字段显示', true, false, 0, 100, 20, true);
    map.SetHelperAlert('LabContent', '不同的内容用Tag标签显示写法如下:通过=green;不通过=red;');

    //#region 数据源.
    map.AddGroupAttr('SQL数据源');
    map.AddDDLEntities(MapDataAttr.DBSrc, 'local', '数据源', new SFDBSrc(), true, null, true);
    map.AddTBStringDoc(MapDataAttr.ExpEn, null, '表达式', true, false, true);
    map.SetHelperAlert('ExpEn', '可以创建视图的SQL表达式:必须包含:OID,BillNo,Title,字段.');

    map.ParaFields = ',GroupField,GroupDefault,DTField,LabField,LabContent,';

    //增加参数字段.
    map.AddTBAtParas(4000);

    const rm = new RefMethod();
    rm.Title = '同步数据字段';
    rm.ClassMethod = 'DTSField';
    rm.Visable = true;
    rm.RefMethodType = RefMethodType.Func;
    rm.Icon = 'icon-energy';
    map.AddRefMethod(rm);
    map.AddRM_GL(new GL_VSTOFrm(), '编辑字段', 'icon-eye', '&FrmID=@No');

    this._enMap = map;
    return this._enMap;
  }
  public async DTSField() {
    const dbEntity = new BSEntity('BP.CCBill.SearchBillView');
    dbEntity.setPK(this.No);
    await dbEntity.Retrieve();
    const data = await dbEntity.DoMethodReturnString('CheckGLGenerList');

    return '执行成功:' + data;
  }
}
