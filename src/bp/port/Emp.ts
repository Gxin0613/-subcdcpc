import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { Dept } from './Dept';
import { DeptEmp, DeptEmps } from './DeptEmp';
import { DeptEmpStations } from './DeptEmpStation';
import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '../web/WebUser';
import { GPN_ChangeDept } from '/@/WF/Admin/Organization/GPN_ChangeDept';
import { GloWF } from '/@/WF/Admin/GloWF';
import { RefMethod } from '../en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { SubTablePostion } from '../en/Config';
import { TeamEmps } from '/@/bp/port/TeamEmp';
import { useI18n } from '/@/hooks/web/useI18n';
// 人员
export class Emp extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.Emp');
    if (!!no) {
      this.setPKVal(no);
    }
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
    const { t } = useI18n();
    const map = new Map('Port_Emp', t('treeens.oper.employee'));
    map.AddGroupAttr(t('treeens.oper.empinfo'));
    map.AddTBStringPK('No', null, t('treeens.oper.no'), true, true, 1, 100, 120);
    if (WebUser.CCBPMRunModel == 2) {
      map.AddTBString('UserID', null, '用户ID', true, true, 0, 50);
      //map.AddTBInt(EmpAttr.EmpSta, 0, '状态', false, false);
    }

    map.AddTBString('Name', null, t('treeens.oper.name'), true, false, 0, 50, 200);
    map.AddDDLSysEnum('EmpSta', 0, t('treeens.oper.empsta'), true, true, 'EmpSta', '@0=启用@1=禁用');

    // map.AddTBString(EmpAttr.FK_Dept, null, '部门编号', true, false, 0, 50, 200);
    map.AddDDLEntities('FK_Dept', null, t('treeens.oper.dept'), new Dept(), false);
    map.AddTBString('Tel', null, t('treeens.oper.tel'), true, false, 0, 50, 200);
    map.AddTBString('Email', null, t('treeens.oper.email'), true, false, 0, 50, 200);
    map.AddTBString('Leader', null, t('treeens.oper.leader'), true, false, 0, 50, 50, false);
    map.AddTBString('AtPara', null, t('treeens.oper.AtPara'), false, false, 0, 50, 50, false);

    map.SetPopTreeEns(
      'Leader',
      GloWF.srcDeptLazily,
      '@WebUser.DeptNo',
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey.toString(),
      true,
      '800px',
      '400px',
      '选择人员',
      'icon-people',
      '1',
      true,
      true,
    );
    //map.SetPopGroupList(EmpAttr.Leader, GloWF.srcDepts, GloWF.srcEmps, false, '300px', '500px', '选择人员', 'icon-people');
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);

    map.AddTBInt('Idx', 0, '序', false, false);

    //查询条件
    map.AddSearchAttr('FK_Dept');

    map.AddRM_DtlSearch(t('treeens.oper.deptstations'), new DeptEmps(), 'FK_Emp', null, null, 'DeptName,StationNoT,OrgNo', 'icon-people', false, '', SubTablePostion.Left);

    map.AddRM_GPN(new GPN_ChangeDept(), 'icon-user');

    const rm2 = new RefMethod();
    rm2.Title = t('sys.login.forgetFormTitle');
    rm2.ClassMethod = 'ReSetPass';
    // rm2.HisMap.AddTBString('note', null, '缴纳备注', true, false, 0, 100, 1000, true);
    //rm2.HisMap.AddTBDecimal('jine', 0, '金额', true, true);
    map.AddRefMethod(rm2);

    map.AddGroupMethod(t('treeens.oper.teammanage'));
    map.AddRM_DtlSearch(t('treeens.oper.teamstation'), new TeamEmps(), 'EmpNo', null, null, 'TeamName,StationNoT,OrgNo', 'icon-people', false, '', SubTablePostion.Left);

    // map.AddGroupMethod('组织变更');
    // const rm = new RefMethod();
    // rm.Title = '领导岗位变更(开发中)';
    // rm.ClassMethod = '.DoChangLeader';
    // rm.Warning = this.DescLeader;
    // map.AddRefMethod(rm);

    // const rm1 = new RefMethod();
    // rm1.Title = '工作岗变更(开发中)';
    // rm1.ClassMethod = '.DoChangWork';
    // rm1.Warning = this.DescWorker;
    // map.AddRefMethod(rm1);

    this._enMap = map;
    return this._enMap;
  }
  public async ReSetPass() {
    const en = new BSEntity('BP.Port.Emp', this.No);
    await en.Init();
    await en.Retrieve();
    const str = await en.DoMethodReturnString('ResetPass');
    return str;
  }

  /**
   * 当前人员是领导：他的岗位变更了,要求他审批的(在途)单子都要作废，退回到上一个节点继续审批。
   * 1. 找到他的在途工作。
   * 2. 对于已经审批的撤销回来。
   * 3. 退回到上一个节点.
   */
  public DoChangLeader() {
    return '没有实现.';
  }

  /**
   *当前人员是工作人员: 他的岗位变更了,要求他发起或者审批的单子(在途),重新发起或者重做.
   * 1. 找到他的在途工作.
   * 2. 撤销回来.
   */
  public DoChangWork() {
    return '没有实现.';
  }

  public DescLeader = `
  ##### 帮助
  - 当前人员是领导：他的岗位变更了,要求他审批的(在途)单子都要作废，退回到上一个节点继续审批。
   1. 找到他的在途工作。
   2. 对于已经审批的撤销回来。
   3. 退回到上一个节点.
  `;
  public DescWorker = `
  \t\n 当前人员是工作人员: 他的岗位变更了,要求他发起或者审批的单子(在途),重新发起或者重做.
  \t\n 1. 找到他的在途工作。
  \t\n 2. 撤销回来
  `;

  //   protected string TaioZheng()
  //   {
  //     /**
  //  === 变更触发点 ===
  // 1. 张三的角色变化了.
  // 2. 张三换了直属领导,  是其他人的领导变更.
  // 3. 张三的部门换了领导.
  // 4. 张三部门变化了.
  //      */
  // /**
  //  * 业务
  //  * 1. 获得当前人员的所有在途工作.
  //  * 2. 执行撤销操作.
  //  */
  // return "";
  //   }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const deptNo = this.GetValByKey('FK_Dept');
    const deptName = this.GetValByKey('FK_DeptText');
    //检查是否有主要部门.
    const des = new DeptEmps();
    await des.Retrieve('FK_Emp', this.No);
    const de = new DeptEmp();
    if (des.length == 0) {
      de.FK_Emp = this.No;
      de.FK_Dept = deptNo;
      de.DeptName = deptName;
      de.MyPK = de.FK_Dept + '_' + de.FK_Emp;
      await de.Insert();
      return true;
    }

    //检查是否有该数据.
    de.MyPK = deptNo + '_' + this.No;
    const i = await de.RetrieveFromDBSources();
    if (i == 0) {
      de.FK_Emp = this.No;
      de.FK_Dept = deptNo;
      de.DeptName = deptName;
      await de.Insert();
      return true;
    }
    de.DeptName = deptName;
    await de.Update();
    return true;
  }

  // @ts-ignore
  protected override async afterDelete(): Promise<boolean> {
    //删除Port_DeptEmp中的数据
    const des = new DeptEmps();
    await des.Delete('FK_Emp', this.No);
    //删除 Port_DeptEmpStation
    const deStations = new DeptEmpStations();
    await deStations.Delete('FK_Emp', this.No);
  }
}

//人员s
export class Emps extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Emp();
  }

  constructor() {
    super();
  }
}
