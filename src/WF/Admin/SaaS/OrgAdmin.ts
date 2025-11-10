import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import { OrgAdminer, OrgAdminers, OrgAdminerAttr } from '../Organization/Admin2Group/OrgAdminer';
import WebUser from '/@/bp/web/WebUser';
import { Emp, Emps } from '/@/bp/port/Emp';
import { FlowSorts } from '../../TSClass/Admin/FlowSort';
import { Flows } from '../../TSClass/Flow';
import { FlowAttr } from '../../TSClass/Admin/FlowAdm';
import { FrmSorts } from '../../TSClass/Admin/FrmSort';
import { MapDataAttr, MapDatas } from '../FrmLogic/MapData';
import DBAccess from '/@/utils/gener/DBAccess';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { DeptEmp, DeptEmps } from '/@/bp/port/DeptEmp';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
/// 组织
export class OrgAdmin extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.SaaS.OrgAdmin');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_Org', '组织');

    map.AddTBStringPK('No', null, '编号(与部门编号相同)', true, false, 1, 30, 150);
    map.AddTBString('Name', null, '组织名称', true, true, 0, 60, 150, true);

    map.AddTBString('Adminer', null, '主要管理员(创始人)', true, true, 0, 60, 150, true);
    map.AddTBString('AdminerName', null, '管理员名称', true, true, 0, 60, 125, true);

    map.AddTBInt('FlowNums', 0, '流程数', true, true);
    map.AddTBInt('FrmNums', 0, '表单数', true, true);
    map.AddTBInt('Users', 0, '用户数', true, true);
    map.AddTBInt('Depts', 0, '部门数', true, true);
    map.AddTBInt('GWFS', 0, '运行中流程', true, true);
    map.AddTBInt('GWFSOver', 0, '结束的流程', true, true);

    map.AddTBString('HomeUrl', null, '主页Url', true, true, 0, 60, 125, true);
    map.AddDDLSysEnum('LoginStyle', 0, '登录风格', true, true, 'LoginStyle', '@0=默认@1=样式2@2=样式3@3=样式4@4=样式5@5=样式6@6=样式7@7=样式8@8=样式9@9=样式10');
    map.AddDDLSysEnum('LoginLayout', 0, '登录布局', true, true, 'LoginLayout', '@0=左@1=中@2=右');

    const rm = new RefMethod();
    rm.Title = '检查正确性';
    rm.ClassMethod = 'DoCheck';
    map.AddRefMethod(rm);

    const rm1 = new RefMethod();
    rm1.Title = '修改主管理员';
    rm1.ClassMethod = 'ChangeAdminer';
    rm1.HisMap.AddTBString('adminer', null, '新主管理员编号', true, false, 0, 100, 100);
    map.AddRefMethod(rm1);

    const rm3 = new RefMethod();
    rm3.Title = '增加管理员';
    rm3.Icon = 'icon-user';
    rm3.ClassMethod = 'AddAdminer';
    rm3.HisMap.AddTBString('adminer', null, '管理员编号', true, false, 0, 100, 100);
    map.AddRefMethod(rm3);

    // const rm2 = new RefMethod();
    // rm2.Title = '取消独立组织';
    // rm2.ClassMethod = 'DeleteOrg';
    // rm2.Warning = '您确定要取消独立组织吗？系统将要删除该组织以及该组织的管理员，但是不删除部门数据.';
    // map.AddRefMethod(rm2);

    //管理员. TODO 待实现
    map.AddRM_DtlSearch('管理员', new OrgAdminers(), 'OrgNo', null, null, null, 'icon-people');

    const rm33 = new RefMethod();
    rm33.Title = '登录系统';
    rm33.Icon = 'icon-user';
    rm33.ClassMethod = 'LoginAsOrg';
    map.AddRefMethod(rm33);

    this._enMap = map;
    return this._enMap;
  }
  public LoginAsOrg() {
    const url = '/#/SelectOrg?OrgNo=' + this.No + '&UserNo=' + this.No;
    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }
  //检查正确性
  public DoCheck() {
    return 'err@saas版的检查在开发中...';
  }
  //修改主管理员
  public async ChangeAdminer(adminer: string) {
    if (WebUser.No?.includes('admin') == false) return 'err@非admin管理员，您无法执行该操作.';
    const emp = new Emp(adminer);
    if ((await emp.RetrieveFromDBSources()) == 0) return 'err@管理员编号错误.';
    const old = this.Adminer;
    this.Adminer = emp.UserID;
    this.AdminerName = emp.Name;
    this.Update();

    //检查超级管理员是否存在？
    const oa = new OrgAdminer();
    oa.EmpNo = old;
    oa.OrgNo = this.No;
    oa.Delete();

    //插入到管理员.
    oa.EmpNo = emp.UserID;
    oa.Save();

    //检查超级管理员是否存在？
    return '修改成功,请关闭当前记录重新打开.';
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
  //取消独立组织
  public DeleteOrg() {
    if (WebUser.No?.includes('admin') == false) return 'err@只有admin帐号才可以执行。';

    if (this.No.includes('100') == true) return 'err@admin组织不能取消.';

    //流程类别.
    const fss = new FlowSorts();
    fss.Retrieve(OrgAdminerAttr.OrgNo, this.No);
    fss.forEach((en) => {
      const fls = new Flows();
      fls.Retrieve(FlowAttr.FK_FlowSort, en.No);

      if (fls.length != 0) return 'err@在流程目录：' + en.Name + '有[' + fls.length + ']个流程没有删除。';
    });

    //表单类别.
    const ftTrees = new FrmSorts();
    ftTrees.Retrieve(MapDataAttr.OrgNo, this.No);
    fss.forEach((en) => {
      const mds = new MapDatas();
      mds.Retrieve(MapDataAttr.FK_FormTree, en.No);
      if (mds.length != 0) return 'err@在表单目录：' + en.Name + '有[' + mds.length + ']个流程没有删除。';
    });

    const oas = new OrgAdminers();
    oas.Delete(OrgAdminerAttr.OrgNo, this.No);

    const fs = new FlowSorts();
    fs.Delete(OrgAdminerAttr.OrgNo, this.No);

    fss.Delete(OrgAdminerAttr.OrgNo, this.No); //删除流程目录.
    ftTrees.Delete(MapDataAttr.OrgNo, this.No); //删除表单目录。

    //更新到admin的组织下.
    let sqls = "UPDATE Port_Emp SET OrgNo='" + WebUser.OrgNo + "' AND OrgNo='" + this.No + "'";
    sqls += "@UPDATE Port_Dept SET OrgNo='" + WebUser.OrgNo + "' AND OrgNo='" + this.No + "'";
    sqls += "@UPDATE Port_DeptEmp SET OrgNo='" + WebUser.OrgNo + "' AND OrgNo='" + this.No + "'";
    sqls += "@UPDATE Port_DeptEmpStation SET OrgNo='" + WebUser.OrgNo + "' AND OrgNo='" + this.No + "'";
    DBAccess.RunUrlReturnString(sqls);

    this.Delete();
    return 'info@成功注销组织,请关闭窗口刷新页面.';
  }
}

//组织s
export class OrgAdmins extends EntitiesNoName {
  get GetNewEntity(): OrgAdmin {
    return new OrgAdmin();
  }

  constructor() {
    super();
  }
}
