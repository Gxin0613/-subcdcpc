import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GloWF } from '/@/WF/Admin/GloWF';
// 固定人员审核
export class ByEmpNo extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.ByEmpNo');
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
    const map = new Map('Sys_MapData', '固定人员审核');

    map.AddTBStringPK('No', null, 'FrmID', false, false, 1, 3, 50);

    const strs = ',';
    for (let index = 1; index < 9; index++) {
      map.AddTBString('CheckEmpNo' + index, null, '审核人员' + index, true, false, 0, 25, 50);
      map.SetPopTreeEns(
        'CheckEmpNo' + index,
        GloWF.srcDeptLazily,
        '@WebUser.DeptNo',
        GloWF.srcEmpLazily,
        'GloWF.srcEmpSearchKey',
        true,
        '800px',
        '400px',
        '审核人',
        'icon-people',
        '1',
        true,
        true,
      );
      map.AddDDLSysEnum('CheckRole' + index, 0, '多人处理', true, true, 'CheckM', '@0=抢办@1=协作', null, false);
      // map.AddTBString('NodeName' + index, null, '工作内容' + index, true, true, 0, 25, 50, true);
      //  map.SetHelperAlert('NodeName' + index, '节点名称，比如：部门审核、人力资源审核');
      //组合字符串.
      // strs += 'CheckEmpNo' + index + ',CheckEmpNo' + index + 'T,CheckRole' + index + ',';
    }
    map.AddTBAtParas(4000);
    //    map.AddMyFile;
    map.ParaFields = strs; // ',NodeName1,EmpNo1,NodeName2,EmpNo2,NodeName3,EmpNo3,NodeName4,EmpNo4,';

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
