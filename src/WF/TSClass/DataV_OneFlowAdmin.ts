import { message } from 'ant-design-vue';
import { DataVBase } from '/@/bp/UIEntity/DataVBase';
import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
export class DataV_OneFlowAdmin extends DataVBase {
  constructor() {
    super('DataV_OneFlowAdmin');
    this.PageTitle = '管理员大屏';
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
    this.Self_MovementFlowAdmin(); //个性化的实体.
    const { getDBSource } = useDBSourceLoader();

    //信息
    this.AddHtmlVar({
      title: '我的信息',
      icon: 'icon-user',
      colSpan: 2,
      children: [
        {
          title: '待办',
          exp: await getDBSource('Flow_DataV_OneFlowAdmin_Todo@Key=' + flowNo),
          fontColor: 'black',
          icon: 'icon-user',
        },
        {
          title: '退回',
          exp: await getDBSource('Flow_DataV_OneFlowAdmin_Return@Key=' + flowNo),
          fontColor: 'red',
          icon: 'icon-user',
        },
        {
          title: '未完成',
          exp: await getDBSource('Flow_DataV_OneFlowAdmin_Runing@Key=' + flowNo),
          fontColor: 'red',
          icon: 'icon-user',
        },
        {
          title: '已完成',
          exp: await getDBSource('Flow_DataV_OneFlowAdmin_Complete@Key=' + flowNo),
          fontColor: 'yellow',
          icon: 'icon-user',
        },
      ],
    });

    this.AddChartZZT({
      title: '待办流程分布',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await getDBSource('Flow_DataV_OneFlowAdmin_TodoFlow@Key=' + flowNo),
    });

    this.AddChartPie({
      title: '待办流程分布',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await getDBSource('Flow_DataV_OneFlowAdmin_TodoFlow@Key=' + flowNo),
    });

    this.AddTable({
      title: '节点平均工作时长(H)',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await getDBSource('Flow_DataV_OneFlowAdmin_Average@Key=' + flowNo),
    });
    this.AddChartZZT({
      title: '节点平均工作时长(H)',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await getDBSource('Flow_DataV_OneFlowAdmin_Average@Key=' + flowNo),
    });
  }
}
