import { GloWF } from '../../GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { Org } from '/@/WF/Admin/Organization/AdminGroup/Org';

export class GPN_GenerOrg extends PageBaseGroupNew {
  constructor() {
    super('GPN_GenerOrg');
    this.PageTitle = '设置独立组织';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('A', '独立组织'); //增加分组.
    const deptNo = this.RequestVal('RefPKVal');
    this.SelectItemsByTreeEns('AdminEmp', '选择管理员', this.AdminEmp, false, GloWF.SQLOfSelectAdminer(deptNo), deptNo, GloWF.srcEmpLazily, '');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const deptNo = this.RequestVal('RefPKVal');
    if (!window.confirm('温馨提示: 您确定要设置独立组织并把[' + tb1 + ',' + tb2 + ']设置为管理员吗?')) {
      return;
    }

    const adminer = tb1;
    const dept = new BSEntity('BP.WF.Port.Admin2Group.Dept', deptNo);
    await dept.RetrieveFromDBSources();
    const msg = await dept.DoMethodReturnString('SetDept2Org2024', adminer, deptNo);

    //更新组织权限.
    const org = new Org(deptNo);
    const num = await org.RetrieveFromDBSources();
    if (num == 1) org.Update();

    return new GPNReturnObj(GPNReturnType.CloseAndReload, msg);
  }
  // 设置独立组织
  public readonly AdminEmp = `
  #### 独立组织帮助 
   ##### 选择管理员
   - 请从左树右表中选择管理员.
   - 选择的管理员将会被设置为组织的管理员.
`;
}
