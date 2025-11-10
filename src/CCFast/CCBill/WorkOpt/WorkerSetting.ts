import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityWorkID } from '/@/bp/en/EntityWorkID';
import { GloWF } from '/@/WF/Admin/GloWF';

// 预置审核人
export class WorkerSetting extends EntityWorkID {
  constructor(no?: number) {
    super('TS.CCBill.WorkOpt.WorkerSetting');
    this.setPKVal(no);
  }
  override get PK(): string {
    return 'WorkID';
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    uac.IsView = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_GenerBill', '预置审核人');

    map.AddTBIntPK('WorkID', 0, 'WorkID');
    map.AddTBString('FrmID', null, '单据ID', false, false, 0, 100, 10);
    map.AddTBString('FrmName', null, '单据', true, true, 0, 200, 10);
    map.AddTBString('BillNo', null, '单号', true, true, 0, 100, 80);
    map.AddTBString('Title', null, '标题', true, true, 0, 500, 150, true);

    for (let index = 1; index < 9; index++) {
      map.AddTBString('CheckEmpNo' + index, null, '审核人员' + index, true, true, 1, 25, 50);
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
      //组合字符串.
    }
    this._enMap = map;
    return this._enMap;
  }
}
