/// static re独立组织 属性
import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import { Emp } from '/@/bp/port/Emp';
import { OrgAdminer, OrgAdminers } from './OrgAdminer';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { DeptEmp, DeptEmps } from '/@/bp/port/DeptEmp';
import WebUser from '/@/bp/web/WebUser';

export class OrgAttr extends EntityNoNameAttr {
  public static readonly Adminer = 'Adminer';
  /// <summary>
  /// 管理员名称
  /// </summary>
  public static readonly AdminerName = 'AdminerName';
  /// <summary>
  /// 父级组织编号
  /// </summary>
  public static readonly ParentNo = 'ParentNo';
  /// <summary>
  /// 父级组织名称
  /// </summary>
  public static readonly ParentName = 'ParentName';
  /// <summary>
  /// 序号
  /// </summary>
  public static readonly Idx = 'Idx';
}

///独立组织
export class Org extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.Admin2Group.Org');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_Org', ' 独立组织');
    map.AddTBStringPK(OrgAttr.No, null, '编号', true, false, 1, 30, 40);
    map.AddTBString(OrgAttr.Name, null, '组织名称', true, false, 0, 60, 200, true);

    map.AddTBString(OrgAttr.Adminer, null, '创始人', true, true, 0, 60, 200, true);
    map.AddTBString(OrgAttr.AdminerName, null, '名称', true, true, 0, 60, 200, true);

    map.AddTBInt('FlowNums', 0, '流程数', true, true);
    map.AddTBInt('FrmNums', 0, '表单数', true, true);
    map.AddTBInt('Users', 0, '用户数', true, true);
    map.AddTBInt('Depts', 0, '部门数', true, true);
    map.AddTBInt('GWFS', 0, '运行中流程', true, true);
    map.AddTBInt('GWFSOver', 0, '结束的流程', true, true);

    const rm1 = new RefMethod();
    rm1.Title = '增加二级管理员';
    rm1.Icon = 'icon-user';
    rm1.ClassMethod = 'AddAdminer';
    rm1.HisMap.AddTBString('adminer', null, '管理员编号', true, false, 0, 100, 100);
    map.AddRefMethod(rm1);
    map.AddRM_DtlSearch('二级管理员', new OrgAdminers(), 'OrgNo');

    this._enMap = map;
    return this._enMap;
  }

  public async AddAdminer(adminer: string) {
    const emp = new Emp(adminer);
    // if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) emp.No = this.No + '_' + adminer;
    // else emp.No = adminer;

    if ((await emp.RetrieveFromDBSources()) == 0) return 'err@管理员编号错误.';
    //检查超级管理员是否存在？
    const oa = new OrgAdminer();
    oa.FK_Emp = emp.No;
    oa.EmpName = emp.Name;
    oa.OrgNo = this.No;
    oa.MyPK = this.No + '_' + oa.FK_Emp;
    if ((await oa.RetrieveFromDBSources()) == 1) return 'err@管理员已经存在.';
    //插入到管理员.
    oa.FK_Emp = emp.No;
    await oa.DirectInsert();

    //如果不在同一个组织.就给他一个兼职部门.
    const depts = new DeptEmps();
    await depts.Retrieve('OrgNo', this.No, 'FK_Emp', emp.No);
    if (depts.length == 0) {
      const de = new DeptEmp();
      de.FK_Dept = this.No;
      de.FK_Emp = emp.No;
      de.MyPK = this.No + '_' + emp.No;
      de.OrgNo = this.No;
      await de.Save();
    }

    //检查超级管理员是否存在？
    return '管理员增加成功,请关闭当前记录重新打开,请给管理员[ ' + emp.Name + ']分配权限';
  }
}

// 独立组织s
export class Orgs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Org();
  }
  constructor() {
    super();
  }
}
