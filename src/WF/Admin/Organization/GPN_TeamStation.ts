import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { DeptEmp } from '/@/bp/port/DeptEmp';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { GloWF } from '../GloWF';
import { Team } from '/@/bp/port/Team';
import { TeamEmp } from '/@/bp/port/TeamEmp';
import { TreeEns_Team2Emp } from './TreeEns_Team2Emp';

export class GPN_TeamStation extends PageBaseGroupNew {
  constructor() {
    super('GPN_TeamStation'); //实体的类名，以GPE_开头.
    this.PageTitle = '创建人员组和角色'; //实体名称.
    this.ForEntityClassID = 'TS.Port.TeamEmp';
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '选择组和角色');
    this.SelectItemsByTree('Team', '选择组', '', false, GloWF.srcTeams, GloWF.srcDeptRoot);
    this.SelectItemsByGroupList('Team.Station', '选择角色', '', true, GloWF.srcStationTypes, GloWF.srcStations);
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts() {
    // const ens = new Sorts();
    // await ens.RetrieveAll();
    // return ens;
    return Promise.resolve([]);
  }
  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const empNo = this.RefPKVal;
    if (pageID === 'Team.Station') {
      const teamNo = this.RequestVal('tb1', 'Team'); //组编号.
      if (teamNo == '') {
        return new GPNReturnObj(GPNReturnType.Error, '未获取到组的编号，请选择组后重试.');
      }
      const team = new Team(teamNo);
      if ((await team.RetrieveFromDBSources()) == 0) {
        return new GPNReturnObj(GPNReturnType.Error, '组编号[' + teamNo + ']错误或不存在.');
      }
      if (!tb1) return new GPNReturnObj(GPNReturnType.Error, '角色不能为空,请重新选择.');
      const myPK = teamNo + '_' + empNo;
      const teamEmp = new TeamEmp(myPK);
      teamEmp.MyPK = myPK;
      const count = await teamEmp.RetrieveFromDBSources();
      if (count === 0) {
        teamEmp.EmpNo = empNo;
        teamEmp.TeamNo = teamNo;
        teamEmp.TeamName = this.RequestVal('tb2', 'Team');
        teamEmp.StationNo = tb1;
        teamEmp.StationNoT = tb2;
        teamEmp.MyPK = teamNo + '_' + empNo;
        await teamEmp.Insert();
        return new GPNReturnObj(GPNReturnType.Reload);
      }
      const stationNos = teamEmp.StationNo;
      if (!stationNos) {
        teamEmp.StationNo = tb1;
        teamEmp.StationNoT = tb2;
      } else {
        const nos = tb1.split(',');
        const names = tb2.split(',');
        nos.forEach((no, idx) => {
          if ((stationNos + ',').includes(no + ',') == false) {
            teamEmp.StationNo += ',' + no;
            teamEmp.StationNoT += ',' + names[idx];
          }
        });
        await teamEmp.Update();
        return new GPNReturnObj(GPNReturnType.Reload);
      }
    }
  }
}
