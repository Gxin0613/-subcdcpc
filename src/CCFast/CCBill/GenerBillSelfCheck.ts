import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GloWF } from '/@/WF/Admin/GloWF';
// 自定义审核
export class GenerBillSelfCheck extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.GenerBillSelfCheck');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_GenerBill', '自定义审核');
    map.AddTBIntPK('WorkID', 0, 'WorkID');
    for (let index = 1; index < 9; index++) {
      map.AddTBString('EmpNo' + index, null, '审核人员' + index, true, true, 1, 25, 50);
      map.SetPopTreeEns(
        'EmpNo' + index,
        GloWF.srcDeptLazily,
        '@WebUser.DeptNo',
        GloWF.srcEmpLazily,
        'GloWF.srcEmpSearchKey',
        true,
        '800px',
        '400px',
        '负责人',
        'icon-people',
        '1',
        true,
        true,
      );
      map.AddDDLSysEnum('CheckM' + index, 0, '多人处理', true, true, 'CheckM', '@0=抢办@1=协作', null, false);
    }
    map.AddTBAtParas(4000);
    this._enMap = map;
    return this._enMap;
  }
}
