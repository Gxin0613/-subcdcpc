import { Student, Students } from './Student';
import Dev2Interface from '/@/WF/TSClass/Dev2Interface';
import { message } from 'ant-design-vue';
import Dev2InterfaceCCBill from '/@/CCFast/Dev2InterfaceCCBill';
import WebUser from '/@/bp/web/WebUser';
import { DeptEmpStations } from '/@/bp/port/DeptEmpStation';
import { Station } from '/@/bp/port/Station';
import HttpHandler from '/@/WF/Admin/FoolFormDesigner/dto/HttpHandler';
import { BanJi } from './BanJi';
import DBAccess from '/@/utils/gener/DBAccess';

//学生科目s
export class TestCase {
  public static async CurrentWebUser() {
    const no = WebUser.No; //登录账号
    const name = WebUser.Name; //登录名称.
    const deptNo = WebUser.DeptNo; //登录部门编号.
    const deptName = WebUser.DeptName; //登录部门名称.
    const orgNo = WebUser.OrgNo; //登录组织编号.
    const orgName = WebUser.OrgName; //登录组织名称.

    //获取登录人员的角色.
    const deptEmpStations = new DeptEmpStations();
    deptEmpStations.Retrieve('FK_Emp', WebUser.No);

    let staNos = ''; //角色编号.
    let staNames = ''; //角色名称.
    for (let index = 0; index < deptEmpStations.length; index++) {
      const element = deptEmpStations[index];
      staNos += ',' + element.FK_Station;

      const station = new Station(element.FK_Station);
      station.RetrieveFromDBSources();
      staNames += ',' + station.Name;
    }
  }
  public static async HttpHandler() {
    const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
    handler.AddPara('No', 'zhangsna');
    handler.AddPara('Name', '张三');
    // handler.AddPara('Note', note);
    // handler.AddPara('JE', jine);
    //handler.AddFile
    return await handler.DoMethodReturnString('Student_JiaoNaXueFei');
  }
  // 实体的操作.
  public static async TestEntityDemo() {
    const en = new LIEmp();
    en.No = 'xxxx';
    en.Name = 'xxx';
    en.DeptNo = '001';
    en.Insert();

    const bj = new BanJi();
    bj.No = DBAccess.GenerGUID(); // bj; //给主键赋值.
    bj.Name = '1年级1班'; //给属性赋值.
    bj.Tel = '1558998778';
    bj.BZR = '李老师.';
    await bj.Insert();

    // const cy = new ChengYuan();
    // cy.Name = 'xxx';
    // cy.Tel = 'xxx';
    // cy.Insert();

    //创建一个对象.
    const stu = new Student();
    stu.No = 'zhangsan'; //给主键赋值.
    stu.Name = '张三'; //给属性赋值.
    stu.Age = 19;
    stu.XB = 0; //设置枚举值.
    stu.BirthDT = '2023-01-01'; //出生日期.
    await stu.Insert();

    const stu1 = new Student(); //执行查询.
    stu1.No = 'zhangsan';
    const num = await stu1.RetrieveFromDBSources(); //返回影响数据量，不抛一场.
    if (num == 0) {
      alert('没有查询到编号' + stu1.No + '的数据.');
      return;
    }
    // stu1.Update('Tel,Age');
    // stu1.EnMap.rms['xx']();
    await stu1.Retrieve(); //如果查询不到就会抛出异常，注意两个查询有区别.
    //输出信息.
    const str1 = `
        编号:${stu1.No};名称:${stu1.Name};年龄:${stu1.Age};性别:${stu1.XB};性别:${stu1.XBText};
        `;
    alert('编号:[' + stu1.No + '],名称:[' + stu1.Name + ']Age:[' + stu1.Age + ']性别:[' + stu1.XB + ']性别Text[' + stu1.XBText + ']');
    alert(str1);
    //执行更新.
    stu1.Name = '张三1';
    await stu1.Update();
    //执行删除.
    await stu1.Delete(); //如何保障安全,请参考文档 ccflow.org/Ke.htm 数据安全专题
  }
  // 实体集合的操作.
  public static async TestEntitiesDemo() {
    //从数据源查询出来: 所有的学生经过缓存设置.
    const ens = new Students();
    await ens.RetrieveAll(); //查询全部的学生,如果有缓存就从缓存查询.
    //输出内容
    for (let index = 0; index < ens.length; index++) {
      const element = ens[index];
      alert(element.Name);
    }

    //从数据源查询出来: 所有的学生，不经过缓存设置.
    const ens4 = new Students();
    await ens4.RetrieveAllFromDBSource(); //查询全部的学生.

    //查询出来性别=男的学生集合.
    const ens2 = new Students();
    await ens2.Retrieve('XB', 1); //查询出来性别=1的学生.
    await ens2.Retrieve('XB', 1, 'BanJiNo', '002'); //查询出来性别=1的学生.

    //查询操作.
    const ens1 = new Students();
    await ens1.Retrieve('XB', 1, 'BDT'); //查询出来性别=1的学生,按照出生日期排序.

    await ens1.Retrieve('XB', 1, 'BDT DESC'); //查询出来性别=1的学生,按照出生日期排序.
  }

  //单据api
  public static async BillAPI_Demo() {
    const frmID = 'Bill_JiaoFeiBill';
    //创建空白的ID.
    const billOID = await Dev2InterfaceCCBill.CreateBlankOID(frmID);
    //保存数据.
    await Dev2InterfaceCCBill.SaveAsDraftByOID(frmID, billOID);
    //设置单据标题.
    await Dev2InterfaceCCBill.SetTitle(billOID, '我的单据标题');

    //预制处理人:PreplaceChecker
    await Dev2InterfaceCCBill.PreplaceChecker(billOID, 'zhangsan,lisi,wangwu');

    //提交审核.
    await Dev2InterfaceCCBill.Submit(frmID, billOID);

    //撤销提交.
    await Dev2InterfaceCCBill.UnSubmit(frmID, billOID);

    //执行发送.
    await Dev2InterfaceCCBill.Send(frmID, billOID, '执行发送.');
  }
  //流程API的demo操作.
  public static async FlowAPI_Demo() {
    //创建workID.
    const flowNo = '001';
    const workID = await Dev2Interface.Node_CreateBlank(flowNo);

    //设置草稿,标识该workID已经被占用.
    await Dev2Interface.Node_SetDraft(workID);

    //设置主表数据:
    const frmData = `@Tel=18660153393@Addr=济南高新区@Email=ccbpm#@ccbmp.cn`;
    await Dev2Interface.Node_SaveWork(workID, frmData);

    //设置流程变量:这些变量用于控制方向条件，接受人.
    const flowParas = `@JE=1000.00@QingJiaTianShu=9@PrjType=1`;
    await Dev2Interface.Flow_SetFlowParas(workID, flowParas);

    //发送到下一个节点1: 直接发送
    const msg1 = await Dev2Interface.Node_SendWork(flowNo, workID);
    message.info(msg1);

    //发送到下一个节点2: 发送到指定的节点
    const msg2 = await Dev2Interface.Node_SendWork(flowNo, workID, 105);
    message.info(msg2);

    //发送到下一个节点3: 发送到指定的节点指定的人.
    const msg3 = await Dev2Interface.Node_SendWork(flowNo, workID, 105, 'lisi');
    message.info(msg3);

    //退回操作:
    const msg4 = await Dev2Interface.Node_ReturnWork(workID, 101, '报销内容有误...');
    message.info(msg4);

    //移交.
    const msg5 = await Dev2Interface.Node_ShiftWork(workID, 'wangwu,zhaoliu', '同事已经离职，把工作已交给您.');
    message.info(msg5);

    //结束流程.
    const msg6 = await Dev2Interface.Node_ShiftWork(workID, 'wangwu,zhaoliu', '同事已经离职，把工作已交给您.');
    message.info(msg6);
  }
}
