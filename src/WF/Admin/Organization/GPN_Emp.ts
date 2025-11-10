import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GloWF } from '/@/WF/Admin/GloWF';
import { Dept } from '/@/bp/port/Dept';
import { Emp } from '/@/bp/port/Emp';
import WebUser from '/@/bp/web/WebUser';
import { DeptEmp } from '../../../bp/port/DeptEmp';
import { message } from 'ant-design-vue';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';

export class GPN_Emp extends PageBaseGroupNew {
  constructor() {
    super('GPN_Emp'); //实体的类名，以GPE_开头.
    this.PageTitle = '新建人员'; //实体名称.
  }
  public async Init() {
    if (WebUser.IsAdmin == false) {
      message.error('err@您好:' + WebUser.Name + ',非管理员用户不能查看.');
      return;
    }
    //增加子页面分组.
    this.AddGroup('A', '选择方式');
    this.TextBox2_NameNo('Emp', '新建人员', this.HelpUn, '', '登录账号', '人员名称', '');
    this.SelectItemsByGroupList('Emp.Station', '分配角色', '', true, GloWF.srcStationTypes, GloWF.srcStations);

    this.SelectItemsByTreeEns(
      'Imp',
      '导入其他部门人员',
      this.Imp,
      true,
      GloWF.srcDeptLazily,
      '0',
      GloWF.srcEmpLazily,
      '@No=账号@Name=名称@Tel=电话',
      true,
      GloWF.srcEmpSearchKey,
      true,
    );

    this.AddGroup('B', '批量导入');
    this.FileUpload('ImpExcel', '导入Excel', '请上传符合格式的Excel文件.', this.ImpExcel);
  }
  public async GenerSorts() {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const deptNo = this.RequestVal('DeptNo'); //部门编号.
    if (deptNo == '') {
      return new GPNReturnObj(GPNReturnType.Error, '未获取到部门编号，请选择部门后重试.');
    }
    const dept = new Dept(deptNo);
    if ((await dept.RetrieveFromDBSources()) == 0) {
      return new GPNReturnObj(GPNReturnType.Error, '部门编号[' + deptNo + ']错误或不存在.');
    }
    //如果是专业或者极简模式.
    if (pageID === 'Emp') {
      const empNo = tb2;
      const empName = tb1;
      const emp = new Emp(empNo);
      if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
        emp.UserID = empNo;
        emp.OrgNo = dept.OrgNo;
        emp.No = dept.OrgNo + '_' + empNo;
      }
      if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
        emp.OrgNo = dept.OrgNo;
      }
      if ((await emp.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '人员编号[' + empNo + '],已经存在.');
      }
      emp.FK_Dept = deptNo;
      emp.Name = empName;
      await emp.Insert();
      //设置部门信息.
      const deptEmp = new DeptEmp();
      deptEmp.MyPK = dept.No + '_' + emp.No;
      if ((await deptEmp.RetrieveFromDBSources()) == 0) {
        deptEmp.FK_Dept = deptNo;
        deptEmp.FK_Emp = empNo;
        deptEmp.OrgNo = dept.OrgNo;
        deptEmp.StationNo = tb1;
        deptEmp.StationNoT = tb2;
        await deptEmp.Insert();
      }
    }
    if (pageID === 'Emp.Station') {
      const empNo = this.RequestVal('tb2', 'Emp');
      if (!tb1) return new GPNReturnObj(GPNReturnType.Error, '分配的角色不能为空.');
      const deptEmp = new DeptEmp();
      deptEmp.MyPK = dept.No + '_' + empNo;
      await deptEmp.RetrieveFromDBSources();
      deptEmp.StationNo = tb1;
      deptEmp.StationNoT = tb2;
      await deptEmp.Update();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.Port.Emp', empNo));
    }

    //导入人员.
    if (pageID === 'Imp') {
      const deptNo = this.RequestVal('DeptNo');
      const empNoList = tb1.split(',');
      empNoList.forEach(async (empNo) => {
        const dept_emp = new DeptEmp(deptNo + '_' + empNo);
        const count = await dept_emp.RetrieveFromDBSources();
        if (count == 0) {
          dept_emp.FK_Dept = deptNo;
          dept_emp.FK_Emp = empNo;
          await dept_emp.Insert();
        }
      });
    }
  }

  public readonly Imp = `
  #### 帮助
   - 从其他部门的人员里导入人员，放入本部门中.
   - 一个人拥有多个部门.
  `;
  public readonly ImpExcel = `
  #### 帮助
   - 从excel导入数据.
   - 按照ccbpm的excel格式要求.
   - 格式文件位于 . 完善测试该方法.

  `;
}
