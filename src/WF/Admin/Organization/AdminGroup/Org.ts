/// static re独立组织 属性
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import { Emp } from '/@/bp/port/Emp';
import { OrgAdminer, OrgAdminers } from '/@/WF/Admin/Organization/Admin2Group/OrgAdminer';
import { DeptEmp, DeptEmps } from '/@/bp/port/DeptEmp';
import BSEntity from '/@/utils/gener/BSEntity';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';
import { Dept } from '../Admin2Group/Dept';
import { GPN_EditDepts } from './GPN_EditDepts';
import { GloComm } from '/@/WF/Comm/GloComm';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
///独立组织
export class Org extends EntityTree {
  constructor(no?: string) {
    super('TS.Port.AdminGroup.Org');
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
    map.AddTBStringPK('No', null, '编号', true, true, 1, 30, 40);
    map.AddTBString('Name', null, '组织名称', true, false, 0, 60, 200, true);
    map.AddTBString('ParentNo', null, 'ParentNo', false, false, 0, 60, 200);

    map.AddTBString('Adminer', null, '创始人', true, true, 0, 60, 200, false);
    map.AddTBString('AdminerName', null, '名称', true, true, 0, 60, 200, false);

    map.AddTBInt('FlowNums', 0, '流程数', true, true);
    map.AddTBInt('FrmNums', 0, '表单数', true, true);
    map.AddTBInt('Users', 0, '用户数', true, true);
    map.AddTBInt('Depts', 0, '部门数', true, true);
    map.AddTBInt('GWFS', 0, '运行中流程', true, true);
    map.AddTBInt('GWFSOver', 0, '结束的流程', true, true);
    map.AddDDLSysEnum('DataVSetting', 0, '大屏设置', true, true, 'DataVSetting', '@0=使用默认@1=自定义');
    map.AddTBString('TreeNos', null, '直线组织编号', true, true, 0, 60, 2000, true);
    map.SetHelperAlert('TreeNos', '用于控制单据,实体的查询权限,在保存的时候自动生成.');

    const rm1 = new RefMethod();
    rm1.Title = '增加管理员';
    rm1.Icon = 'icon-user';
    rm1.ClassMethod = 'AddAdminer';
    rm1.HisMap.AddTBString('adminer', null, '管理员编号', true, false, 0, 100, 100);
    map.AddRefMethod(rm1);

    map.AddRM_DtlSearch('管理员列表', new OrgAdminers(), 'OrgNo');

    const rm13 = new RefMethod();
    rm13.Title = '变更创始人';
    rm13.Icon = 'icon-user';
    rm13.ClassMethod = 'ChangerAdminer';
    rm13.HisMap.AddTBString('adminer', null, '创始人编号', true, false, 0, 100, 100);
    map.AddRefMethod(rm13);
    map.AddRM_UrlTabOpen('大屏设置', GloComm.UrlWhiteScreenViewer(CommonConfig.GroupRptWhitePrefix + this.No), 'icon-film');

    map.AddGroupMethod('高级设置');
    const rm2 = new RefMethod();
    rm2.Title = '注销组织';
    rm2.Icon = 'icon-user';
    rm2.ClassMethod = 'ZhuXiaoOrg';
    map.AddRefMethod(rm2);

    const r3m2 = new RefMethod();
    r3m2.Title = '更新所有组织的TreeNos';
    r3m2.Icon = 'icon-settings';
    r3m2.ClassMethod = 'DTSAllOrgTreeNos';
    map.AddRefMethod(r3m2);

    //修改组织部门.
    map.AddRM_GPN(new GPN_EditDepts(), 'icon-home');

    // const r6 = new RefMethod();
    // r6.Title = '修复组织数据';
    // r6.Icon = 'icon-settings';
    // r6.ClassMethod = 'DTSAllOrgTreeNos';
    // map.AddRefMethod(r6);

    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    let treeNos = ',' + this.No + ',';
    const myParentNo = await this.GetNos(this.No);
    if (myParentNo != '') {
      treeNos = treeNos + myParentNo + ',';
      const myParentNo1 = await this.GetNos(myParentNo);
      if (myParentNo1 != '') {
        treeNos = treeNos + myParentNo1 + ',';
        const myParentNo2 = await this.GetNos(myParentNo1);
        if (myParentNo2 != '') {
          treeNos = treeNos + myParentNo2 + ',';

          const myParentNo3 = await this.GetNos(myParentNo2);
          if (myParentNo3 != '') {
            treeNos = treeNos + myParentNo3 + ',';
            if (myParentNo3 != '') {
              treeNos = treeNos + myParentNo3 + ',';
            }
          }
        }
      }
      this.TreeNos = treeNos;
    }
    return Promise.resolve(true);
  }
  public async GetNos(deptNo: string): Promise<string> {
    const deptP = new Dept(deptNo);
    const num = await deptP.RetrieveFromDBSources();
    if (num == 0) return '';
    return deptP.ParentNo;
  }

  //注销组织.
  public async ZhuXiaoOrg() {
    const org = new BSEntity('BP.WF.Port.AdminGroup.Org', this.No);
    org.No = this.No;
    await org.Retrieve();
    const val = await org.DoMethodReturnString('DeleteOrg');
    return val;
  }

  public async ChangerAdminer(adminer: string) {
    const emp = new Emp(adminer);
    if ((await emp.RetrieveFromDBSources()) == 0) return 'err@创始人编号错误.';
    //检查超级管理员是否存在？
    const oa = new OrgAdminer();
    oa.FK_Emp = emp.No;
    oa.EmpName = emp.Name;
    oa.OrgNo = this.No;
    oa.MyPK = this.No + '_' + oa.FK_Emp;
    if ((await oa.RetrieveFromDBSources()) == 1) return 'err@创始人已经存在';
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

    this.Adminer = emp.No;
    this.AdminerName = emp.Name;
    //检查超级管理员是否存在？
    return '创始人变更成功.';
  }

  public async DTSAllOrgTreeNos() {
    const orgs = new Orgs();
    await orgs.RetrieveAll();
    for (let index = 0; index < orgs.length; index++) {
      const org = orgs[index];
      const myorg = new Org(org.No);
      await myorg.RetrieveFromDBSources();
      await myorg.Update();
    }
    return '所有组织同步完成.';
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
export class Orgs extends EntitiesTree {
  get GetNewEntity(): EntityTree {
    return new Org();
  }
  constructor() {
    super();
  }
}
