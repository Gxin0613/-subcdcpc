import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';
import { Emp } from '/@/bp/port/Emp';
// 自定义审核
export class SelfCheckWorker extends EntityMyPK {
  constructor(no?: string) {
    super('TS.CCBill.WorkOpt.SelfCheckWorker');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Frm_GenerWorker', '审核');
    map.AddMyPK();
    map.AddTBInt('Idx', 0, '节点步骤', false, true);
    map.AddTBInt('WorkID', 0, 'WorkID', false, true);
    map.AddTBString('EmpNo', null, '处理人编号', true, false, 0, 100, 150);
    map.AddTBString('EmpName', null, '处理人名称', true, false, 0, 100, 150);
    map.AddDDLSysEnum('PassSta', 0, '状态', false, true, 'PassSta', '@0=待办@1=未开始@2=已通过@3=退回');
    map.AddTBString('DeptNo', null, '部门No', false, true, 0, 100, 200);
    map.AddTBString('DeptName', null, '部门名称', true, true, 0, 200, 200);
    map.AddTBString('FrmID', null, '表单ID', false, true, 0, 100, 10);
    //人员选择，懒加载模式.
    map.SetPopTreeEns(
      'EmpNo',
      GloWF.srcDeptLazily,
      GloWF.srcDeptRoot,
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      false,
      '800px',
      '400px',
      '选择接收人',
      'icon-people',
      '1',
      true,
      true,
    );
    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeInsert(): Promise<boolean> {
    const emp = new Emp(this.EmpNo);
    await emp.Retrieve();
    this.DeptNo = emp.FK_Dept;
    this.DeptName = emp.FK_DeptText;
    this.EmpName = emp.Name;
    this.PassSta = 1;
    this.MyPK = this.WorkID + '_' + this.EmpNo + '_' + this.Idx;
    return Promise.resolve(true);
  }
}
//审核人员s
export class SelfCheckWorkers extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SelfCheckWorker();
  }
  constructor() {
    super();
  }
}
