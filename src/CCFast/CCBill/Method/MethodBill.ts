import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

// 实体单据
export class MethodBill extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodBill","TS.Demo.BPFramework.MethodBill");
    super('TS.CCBill.MethodBill');

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
    const map = new Map('Frm_Method', '实体单据');

    //主键.
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(MethodAttr.Name, null, '方法名', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.GroupID, null, '分组ID', true, true, 0, 50, 10);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.Tag1, null, 'Tag1', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.Mark, null, 'Mark', true, true, 0, 300, 10);

    map.AddTBString(MethodAttr.FrmID, null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.FlowNo, null, '流程编号', true, true, 0, 10, 10);

    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);
    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);
    map.AddTBAtParas();

    this._enMap = map;
    return this._enMap;
  }

  //  /// <summary>
  //     /// 新建工作
  //     /// </summary>
  //     /// <param name="workid">实体的实例ID</param>
  //     /// <returns></returns>
  //     public string CreateWorkID(Int64 workid)
  //     {
  //         //获得当前的实体.
  //         GEEntity ge = new GEEntity(this.FrmID, workid);

  //         //创建单据ID.
  //         Int64 workID = TS.CCBill.Dev2Interface.CreateBlankBillID(this.Tag1, null, ge.Row, this.FrmID, workid);
  //         return workID.ToString();
  //     }
}
