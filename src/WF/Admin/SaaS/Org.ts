import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import { OrgAdminer, OrgAdminers } from '../Organization/Admin2Group/OrgAdminer';
import WebUser from '/@/bp/web/WebUser';
import { Emp, Emps } from '/@/bp/port/Emp';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { DeptEmp, DeptEmps } from '/@/bp/port/DeptEmp';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
/// 组织
export class Org extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.SaaS.Org');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('Port_Org', '组织');

    map.AddTBStringPK('No', null, '编号', true, false, 1, 30, 150);
    map.AddTBString('Name', null, '组织名称', false, true, 0, 60, 150, true);

    map.AddTBString('ParentNo', null, '父级组织编号', false, false, 0, 60, 200, true);
    map.AddTBString('ParentName', null, '父级组织名称', false, false, 0, 60, 200, true);

    map.AddTBString('Adminer', null, '主要管理员(创始人)', true, true, 0, 60, 150, true);
    map.AddTBString('AdminerName', null, '管理员名称', true, true, 0, 60, 125, true);

    map.AddTBInt('FlowNums', 0, '流程数', true, true);
    map.AddTBInt('FrmNums', 0, '表单数', true, true);
    map.AddTBInt('Users', 0, '用户数', true, true);
    map.AddTBInt('Depts', 0, '部门数', true, true);
    map.AddTBInt('GWFS', 0, '运行中流程', true, true);
    map.AddTBInt('GWFSOver', 0, '结束的流程', true, true);
    map.AddTBString('HomeUrl', null, '主页Url', true, false, 0, 200, 125, true);
    map.AddDDLSysEnum('LoginStyle', 0, '登录风格', true, true, 'LoginStyle', '@0=默认@1=样式2@2=样式3@3=样式4@4=样式5@5=样式6@6=样式7@7=样式8@8=样式9@9=样式10');
    map.AddDDLSysEnum('LoginLayout', 0, '登录布局', true, true, 'LoginLayout', '@0=左@1=中@2=右');

    const txt = `
    ### 帮助
    - 用于显示在登录后的主页上.
    - 大屏视图: /WF/Comm/DataV?EnName=DataV_HomeAdmin
    - 待办页面: /WF/GL/TodoList
    `;
    map.SetHelperAlert('HomeUrl', txt);

    const rm = new RefMethod();
    rm.Title = '检查正确性';
    rm.ClassMethod = 'DoCheck';
    map.AddRefMethod(rm);

    const rm3 = new RefMethod();
    rm3.Title = '增加管理员';
    rm3.Icon = 'icon-user';
    rm3.ClassMethod = 'AddAdminer';
    rm3.HisMap.AddTBString('adminer', null, '管理员编号', true, false, 0, 100, 100);
    map.AddRefMethod(rm3);

    //管理员. TODO 待实现
    map.AddRM_DtlSearch('管理员', new OrgAdminers(), 'OrgNo', null, null, null, 'icon-people');

    this._enMap = map;
    return this._enMap;
  }
  //检查正确性
  public DoCheck() {
    return 'err@saas版的检查在开发中...';
  }
  //增加管理员
  public async AddAdminer(adminer: string) {
    let emp: any = {};
    //判断是否SAAS模式
    if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
      const emps = new Emps();
      await emps.Retrieve('OrgNo', this.No, 'UserID', adminer);
      console.log(emps);
      emp = emps[0];
    } else {
      emp = new Emp(adminer);
      console.log(emp);
    }

    if ((await emp.RetrieveFromDBSources()) == 0) return 'err@管理员编号错误.';
    //检查超级管理员是否存在？
    const oa = new OrgAdminer();
    oa.FK_Emp = emp.No;
    oa.EmpName = emp.Name;
    oa.OrgNo = this.No;
    oa.MyPK = this.No + '_' + oa.FK_Emp;
    if ((await oa.RetrieveFromDBSources()) == 1) return 'err@管理员已经存在.';
    //插入到管理员.
    oa.EmpNo = emp.No;
    await oa.DirectInsert();

    //如果不在同一个组织.就给他一个兼职部门.
    const depts = new DeptEmps();
    depts.Retrieve('OrgNo', this.No, 'FK_Emp', emp.No);
    if (depts.length == 0) {
      const de = new DeptEmp();
      de.FK_Dept = this.No;
      de.FK_Emp = emp.No;
      de.MyPK = this.No + '_' + emp.No;
      de.OrgNo = this.No;
      await de.DirectInsert();
    }
    //检查超级管理员是否存在？
    return '管理员增加成功,请关闭当前记录重新打开,请给管理员[ ' + emp.Name + ']分配权限';
  }
}

//组织s
export class Orgs extends EntitiesNoName {
  get GetNewEntity(): Org {
    return new Org();
  }

  constructor() {
    super();
  }
}
