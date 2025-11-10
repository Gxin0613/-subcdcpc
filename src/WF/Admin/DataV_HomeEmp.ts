import { DataVBase } from '/@/bp/UIEntity/DataVBase';
import HttpHandler from '/@/utils/gener/HttpHandler';

/**
 * 主页
 */
export class DataV_HomeEmp extends DataVBase {
  //debugger;
  orgExp = '';
  constructor() {
    super('DataV_HomeEmp');
    this.PageTitle = '我的主页';
  }

  //重写的构造方法.
  override async Init() {
    //我的流程.
    // this.Self_Weather(); //天气预报.
    this.Self_MovementFlowMy(); //我的流程动态..

    this.Self_MyTodolist(); //待办
    this.Self_MyRuning(); //运行中.
    this.Self_MyStart(); //发起
    this.Self_MyComplete(); //已完成

    // this.Self_FlowZhiBiaoEmp(); // 我的流程指标.

    const handler = new HttpHandler('BP.CCFast.DataV_OneFlow');

    this.AddChartZZT({
      title: '待办流程分布',
      colSpan: 2,
      icon: 'icon-clock',
      exp: await handler.DoMethodReturnJson('EmpHome_MyStart'),
    });

    this.AddChartPie({
      title: '待办流程分布',
      colSpan: 2,
      icon: 'icon-clock',
      exp: await handler.DoMethodReturnJson('EmpHome_TodolistByNodeName'),
    });

    this.AddHtmlVar({
      title: '单据信息',
      icon: 'icon-user',
      colSpan: 2,
      children: await handler.DoMethodReturnJson('EmpHome_MyBillInfo'),
    });

    this.AddHtmlVar({
      title: '统计信息',
      icon: 'icon-user',
      colSpan: 2,
      children: await handler.DoMethodReturnJson('EmpHome_TongJi'),
    });
  }
}
