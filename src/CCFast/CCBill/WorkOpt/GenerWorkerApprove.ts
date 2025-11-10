import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
// 自定义审核
export class GenerWorkerApprove extends EntityMyPK {
  constructor(no?: string) {
    super('TS.CCBill.WorkOpt.GenerWorkerApprove');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_GenerWorker', '审核');
    map.AddMyPK();
    map.AddTBInt('Idx', 0, '节点步骤', true, true);
    map.AddTBInt('WorkID', 0, 'WorkID', true, true);
    map.AddTBString('EmpNo', null, '处理人编号', true, false, 0, 100, 150);
    map.AddTBString('EmpName', null, '处理人名称', true, false, 0, 100, 150);
    // map.AddTBInt('PassSta', 0, '状态', true, false); //0=未开始,1=进行中,2=已通过.
    map.AddDDLSysEnum('PassSta', 0, '状态', true, true, 'PassSta', '@0=待办@1=未开始@2=已通过@3=退回');
    map.AddTBDateTime('RDT', null, '记录日期', true, true);
    map.AddTBDateTime('SendDT', null, '单据活动时间', false, false);

    map.AddTBStringDoc('CheckerNote', null, '审核意见', true, false, true);

    map.AddTBString('DeptNo', null, '部门No', true, true, 0, 100, 10);
    map.AddTBString('DeptName', null, '部门名称', true, true, 0, 100, 10);
    map.AddTBString('FrmID', null, '表单ID', true, true, 0, 100, 10);
    map.AddTBAtParas(4000);

    // map.AddRM_DtlSearch
    this._enMap = map;
    return this._enMap;
  }
}
//审核人员s
export class GenerWorkerApproves extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new GenerWorkerApprove();
  }
  constructor() {
    super();
  }
}
