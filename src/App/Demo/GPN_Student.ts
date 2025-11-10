import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { Student } from './Student';
import { DeptEmp } from '/@/bp/port/DeptEmp';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import Dev2InterfaceCCBill from '/@/CCFast/Dev2InterfaceCCBill';

export class GPN_Student extends PageBaseGroupNew {
  constructor() {
    super('GPN_Student'); //实体的类名，以GPE_开头.
    this.PageTitle = '新建学生'; //实体名称.
    this.ForEntityClassID = 'TS.Demo.Student';
  }
  public async getZZMM() {
    return JSON.stringify([
      { No: '0', Name: '团员' },
      { No: '1', Name: '党员' },
    ]);
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '选择方式');
    this.TextBox2_NameNo('NoName', '输入账号模式新建', this.Daily, '', '学生编号', '学生名称', '');
    this.SelectItemsByList('NoName.BanJi', '选择班级', this.HelpTodo, false, 'DemoStudent_Student_BanJi'); // 写sql
    // 配置性别
    const list: { No: string; Name: string }[] = [
      { No: '0', Name: '男' },
      { No: '1', Name: '女' },
      { No: '2', Name: '未知' },
    ];
    this.SelectItemsByList('NoName.BanJi.XB', '性别', this.HelpTodo, false, JSON.stringify(list)); // 写json
    this.SelectItemsByList('NoName.BanJi.XB.ZZMM', '政治面貌', this.HelpTodo, false, this.getZZMM); // 写方法
   // this.AddGoToUrl('GoTo', '默认模式新建', GloComm.UrlEn('TS.Demo.Student', '', ''));
    // this.SelectItemsByList('EmpList', '单选-账户列表', this.HelpTodo, false, 'SELECT * FROM Port_Emp ');
    // this.Table('EmpListTable', 'Table-账户列表', this.HelpTodo, false, 'SELECT * FROM Port_Emp ');
    // this.AddGoToUrl('GoTo', '转到新建页面', GloComm.UrlEn('TS.Demo.Student', ''));
    this.AddGroup('B', '批量导入');
    this.FileUpload('ImpExcel', '导入Excel', '请上传符合格式的Excel文件.', this.HelpTodo);
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
    //如果是专业或者极简模式.
    if (pageID === 'NoName') {
      const no = tb2; //第2个文本框.
      const stu = new Student(no);
      if ((await stu.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '学生人员编号[' + no + '],已经存在.');
      }
    }

    if (pageID === 'NoName.BanJi') {
      const no = this.RequestVal('tb2', 'NoName'); //第2个文本框.
      const name = this.RequestVal('tb1', 'NoName'); //第1个文本框.
      const stu = new Student(no);
      stu.BanJiNo = tb1;
      stu.BanJiNoT = tb2;
      stu.Name = name;
      stu.No = no;

      //记录信息.
      stu.RDT = DataType.CurrentDateTime;
      stu.RecNo = WebUser.No;
      stu.RecName = WebUser.Name;
      stu.RecDeptNo = WebUser.DeptNo;
      stu.RecDeptName = WebUser.DeptName;
      stu.OrgNo = WebUser.OrgNo; //组织编号.

      // stu.SetPara('EnName','TS.SB.ABZZZ');
      await stu.DirectInsert(); //插入到系统.
      await Dev2InterfaceCCBill.WriteTrack('Demo_Student', stu.No, '创建记录.'); //写入日志.
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.Demo.Student', no));
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

  public readonly Daily = `
  #### 帮助
   - 有科目作为明细，记账人员都可以记账，有项目组人员范围。
   - 没有时限要求，每个人的工作按照时间段记账，可以按照科目汇总项目成本，比如研发类项目，日常持续的投入。
  `;
  public readonly Section = `
  #### 帮助
   - 有先后顺序，不同工种协作完成，有一定的时限要求。
   - 比如开发类项目、技术支持类项目，有一定的明确的目标，类似于project项目管理。 
  `;
  public readonly Nondeterminacy = `
  #### 帮助 
  - 有目标，没有时限，多人协作，有项目里程碑、完成度。
  - 比如：客户跟踪类型项目，项目组有明确的人员分工，但是没有顺序，没有时限。不同的角色协助完成一个客户的跟踪，有完成度、概率，有阶段。
  `;
  public readonly Task = `
  #### 帮助
  - 也称为简单项目或者不确定性项目，没有模式的临时性任务。
  - 比如：申报知识产权，找几个人协作完成，可以有固定时限，每个子任务分给不同的人，处理完毕后需要汇报、认可、确认，可以树形结构的分发收回，子任务数不确定。
  `;
}
