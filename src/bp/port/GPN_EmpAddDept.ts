import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '../web/WebUser';
import { Dept } from './Dept';
import { DeptEmp } from './DeptEmp';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';

export class GPN_EmpAddDept extends PageBaseGroupNew {
  constructor() {
    super('GPN_EmpAddDept');
    this.PageTitle = '增加部门';
    this.ForEntityClassID = 'TS.Port.DeptEmp';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('Dep1t', '选择部门'); //增加分组.
    this.SelectItemsByTree('Dept', '选择部门', this.NewDept, true, GloWF.srcDeptLazily, GloWF.srcDeptRoot, false, '', true);
    //this.TextBox1_Name('Imp2', '导入已存在系统', this.HelpTodo, '系统名称', '人力资源', '请输入中文的系统名称.');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    //转成数组. 1,2,3,
    const ids = tb1.split(',').filter((item) => !!item);
    const deptNames = tb2.split(',').filter((item) => !!item);

    const empNo = this.RefPKVal;

    //遍历选择的部门.
    for (let index = 0; index < ids.length; index++) {
      const deptID = ids[index];

      const deptP = new Dept(deptID);
      deptP.No = deptID;
      await deptP.Retrieve();

      //该人员是否存在?
      const de = new DeptEmp();
      de.MyPK = deptID + '_' + empNo;
      const i = await de.RetrieveFromDBSources();
      if (i == 1) continue;

      de.FK_Emp = empNo;
      de.FK_Dept = deptID;
      de.DeptName = deptNames[index];
      de.StationNo = '';
      if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc)
          de.OrgNo = deptP.OrgNo;
      else
          de.OrgNo = WebUser.OrgNo;
      await de.Insert();
    }

    return new GPNReturnObj(GPNReturnType.CloseAndReload, '创建成功');
  }
  // 经典表单说明
  public readonly NewDept = `
  #### 帮助
   - ccbpm支持一人多部门，每个部门支持多岗位。
  #### 详细说明
   - 组织结构可以与现在的系统集成，集成信息: https://doc.ccbpm.cn
`;
}
