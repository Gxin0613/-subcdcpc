import { GloWF } from '../GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';

export class GPN_Adminer extends PageBaseGroupNew {
  constructor() {
    super('GPN_Adminer');
    this.PageTitle = '设置二级管理员';
  }
  public Init() {
    //增加子页面.
    const deptNo = this.RequestVal('RefPKVal');
    //const sqlDept = `SELECT No,Name,ParentNo FROM Port_Dept WHERE ParentNo='${deptNo}' OR No='${deptNo}'    UNION   SELECT No,Name,ParentNo FROM Port_Dept WHERE ParentNo  IN ( SELECT No FROM Port_Dept WHERE ParentNo='${deptNo}' OR No='${deptNo}' )  `;
    //const sqlEmps = `SELECT No,Name FROM Port_Emp B WHERE FK_Dept='@Key'`;
    this.AddGroup('A', '设置二级管理员');
    this.SelectItemsByTreeEns('Emp', '选择管理员', this.HelpUn, false, GloWF.SQLOfSelectAdminer(deptNo), deptNo, GloWF.SQLOfAdminerEmpByDept, '');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const deptNo = this.RequestVal('RefPKVal');
    const adminer = tb1;
    const adminerName = tb2;
    const dept = new BSEntity('BP.WF.Port.Dept', deptNo);
    await dept.RetrieveFromDBSources();
    const msg = await dept.DoMethodReturnString('DoSetAdminer', adminer, adminerName);
    return new GPNReturnObj(GPNReturnType.CloseAndReload, msg);
  }
  // 经典表单说明
  public readonly NewDept = `
  #### 帮助
   - ccbpm支持一人多部门,每个部门支持多岗位.
  #### 详细说明
   - 组织结构可以与现在的系统集成, 集成信息: https://doc.ccbpm.cn
`;
}
