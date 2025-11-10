import { message } from 'ant-design-vue';
import { GloWF } from '../Admin/GloWF';
import { DataVBase } from '/@/bp/UIEntity/DataVBase';

export class DataV_OneFlowEmp extends DataVBase {
  orgExp = '';
  constructor() {
    super('DataV_OneFlowEmp');
    this.PageTitle = '流程分析';
  }

  //重写的构造方法.
  override async Init() {
    let flowNo;
    if (this.RequestVal('PKVal') != '') {
      flowNo = this.RequestVal('PKVal');
    } else {
      flowNo = this.RequestVal('FlowNo');
    }

    if (flowNo == '' || flowNo == null) {
      message.info('当前需要传递过来FlowNo参数，但是没有接收到.');
      return;
    }
    // const db = new DBank_OneFlowEmp();
    // await db.Init(); //初始化.

    this.AddHtmlVar({
      title: '我的信息',
      icon: 'icon-user',
      colSpan: 2,
      children: [
        { title: '流程待办', exp: GloWF.SQLOfOneFlowEmp_Todo(flowNo), fontColor: 'green', icon: 'icon-user' },
        { title: '流程退回', exp: GloWF.SQLOfOneFlowEmp_Return(flowNo), fontColor: 'red', icon: 'icon-user' },
        { title: '流程未完成', exp: GloWF.SQLOfOneFlowEmp_Runing(flowNo), fontColor: '#fea443', icon: 'icon-user' },
        { title: '流程已完成', exp: GloWF.SQLOfOneFlowEmp_Complete(flowNo), fontColor: '#812f33', icon: 'icon-user' },
      ],
    });

    this.AddChartZZT({
      title: '待办流程分布',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await GloWF.SQLOfOneFlowEmp_TodoFlow(flowNo),
    });

    this.AddChartPie({
      title: '待办流程分布',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await GloWF.SQLOfOneFlowEmp_TodoFlow(flowNo),
    });
    this.AddChartPie({
      title: '节点平均用时',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await GloWF.SQLOfOneFlowEmp_TodoFlow(flowNo),
    });
  }
}
