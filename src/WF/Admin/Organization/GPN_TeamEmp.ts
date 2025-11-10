import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';
import WebUser from '/@/bp/web/WebUser';
import { TeamEmp } from '../../../bp/port/TeamEmp';
import { message } from 'ant-design-vue';
import { Team } from '/@/bp/port/Team';

export class GPN_TeamEmp extends PageBaseGroupNew {
  constructor() {
    super('GPN_TeamEmp');
    this.PageTitle = '新建人员组关联关系';
  }
  public async Init() {
    if (WebUser.IsAdmin == false) {
      message.error('err@您好:' + WebUser.Name + ',非管理员用户不能查看.');
      return;
    }
    this.AddGroup('A', '选择人员');
    this.SelectItemsByTreeEns('Emps', '选择人员', this.TeamEmp, true, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '', true);
  }
  public async GenerSorts() {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    const teamNo = this.RequestVal('TeamNo'); //组编号.
    if (teamNo == '') {
      return new GPNReturnObj(GPNReturnType.Error, '未获取到组的编号，请选择组后重试.');
    }
    const team = new Team(teamNo);
    if ((await team.RetrieveFromDBSources()) == 0) {
      return new GPNReturnObj(GPNReturnType.Error, '组编号[' + teamNo + ']错误或不存在.');
    }
    if (pageID === 'Emps') {
      const empNoList = tb1.split(',');
      for (const empNo of empNoList) {
        const myPK = teamNo + '_' + empNo;
        const teamEmp = new TeamEmp(myPK);
        const count = await teamEmp.RetrieveFromDBSources();
        if (count == 0) {
          teamEmp.TeamNo = teamNo;
          teamEmp.EmpNo = empNo;
          await teamEmp.Insert();
        }
      }
      return new GPNReturnObj(GPNReturnType.Reload);
    }
  }

  public readonly TeamEmp = `
  #### 帮助
   - 从部门中选择人员添加到组中.
   - 一个人拥有多个组.
  `;
}
