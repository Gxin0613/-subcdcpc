import { GloWF } from '../../GloWF';
import { Dept } from '/@/bp/port/Dept';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { Org } from '/@/WF/Admin/Organization/AdminGroup/Org';

export class GPN_EditDepts extends PageBaseGroupNew {
  constructor() {
    super('GPN_EditDepts');
    this.PageTitle = '修改组织部门';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('Dep1t', '选择部门'); //增加分组.
    const deptNo = this.RequestVal('RefPKVal');
    // const sqlDept = `SELECT No,Name,ParentNo FROM Port_Dept WHERE ParentNo='${deptNo}' OR No='${deptNo}'
    // UNION
    // SELECT No,Name,ParentNo FROM Port_Dept WHERE ParentNo
    //    IN ( SELECT No FROM Port_Dept WHERE ParentNo='${deptNo}' OR No='${deptNo}' )
    // `;
    this.SelectItemsByTree('Depts', '选择部门s', this.Depts, true, GloWF.SQLOfSelectAdminer(deptNo), deptNo);

    //const sqlEmps = `SELECT B.No AS No,B.Name AS Name FROM Port_DeptEmp A, Port_Emp B WHERE A.FK_Emp=B.No AND A.FK_Dept='@Key'`;
    this.SelectItemsByTreeEns('Depts.Emp', '选择管理员', this.HelpUn, false, GloWF.SQLOfSelectAdminer(deptNo), deptNo, GloWF.srcEmpLazily, '');
    //this.TextBox1_Name('Imp2', '导入已存在系统', this.HelpTodo, '系统名称', '人力资源', '请输入中文的系统名称.');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const deptNo = this.RequestVal('RefPKVal');
    if (pageNo == 'Depts') {
      //转成数组. 1,2,3,
      const ids = tb1.split(',').filter((item) => !!item);
      const deptNames = tb2.split(',').filter((item) => !!item);

      //遍历选择的部门.
      let msg = '';
      for (let index = 0; index < ids.length; index++) {
        const deptID = ids[index];
        const deptName = deptNames[index];

        const dept = new Dept(deptID);
        dept.No = deptID;
        await dept.Retrieve();
        if (!dept.OrgNo) {
          msg += ' @ 部门:' + deptName + ' ,已经隶属于组织:' + dept.OrgNo;
        }
      }
      return new GPNReturnObj(GPNReturnType.Message, msg);
    }

    if (window.confirm('您确定要修改独立组织并把[' + tb1 + ',' + tb2 + ']设置为管理员吗?') == false) return new GPNReturnObj(GPNReturnType.Close, '您已经取消.');

    const adminer = tb1;
    const deptIDs = this.RequestVal('tb1', 'Depts'); //设置IDs.
    const dept = new BSEntity('BP.WF.Port.Admin2Group.Dept', deptNo);
    await dept.RetrieveFromDBSources();
    const msg = await dept.DoMethodReturnString('EditDept2Org2024', adminer, deptIDs);

    //更新组织权限.
    const org = new Org(deptNo);
    const num = await org.RetrieveFromDBSources();
    if (num == 1) org.Update();

    return new GPNReturnObj(GPNReturnType.CloseAndReload, msg);
  }
  // 经典表单说明
  public readonly Depts = `
  #### 帮助
   - 当组织的部门发生变化的时候，需要重新设置组织的包含部门.
`;
}
