import { DataVBase } from '/@/bp/UIEntity/DataVBase';
import DataPacket from '/@/utils/gener/DataPacket';

export class DataV_StudentHomeDP extends DataVBase {
  constructor() {
    super('DataV_StudentHomeDP');
    this.PageTitle = '学生统计分析(执行数据包)';
  }

  //重写的构造方法.
  override async Init() {
    //  this.Self_Weather();
    // this.Self_FlowZhiBiaoEmp(); //人员的流程指标.

    const dp = new DataPacket('BP.Demo.DataPacket_Student');
    await dp.Init(); //初始化数据.

    this.AddHtmlVar({
      title: '学生信息',
      icon: 'icon-user',
      colSpan: 2,
      children: [
        { title: '学生总数', exp: dp.GetValString('AllStuNum'), fontColor: 'black', icon: 'icon-user' },
        {
          title: '团员数',
          exp: dp.GetValString('ZZMM1'),
          fontColor: 'yellow',
          icon: 'icon-user',
        }, ////执行标记是:Demo_DataV_StudentHome_XBNum 参数是: @Key=1, 多个参数用@p1=val1格式分割. Key是默认的参数，一般只有一个参数.
        {
          title: '女同学数',
          exp: dp.GetValString('XB0'),
          fontColor: 'red',
          icon: 'icon-user',
        },
        {
          title: '男同学数',
          exp: dp.GetValString('XB1'),
          fontColor: 'green',
          icon: 'icon-user',
        },
      ],
    });

    this.AddChartZZT({
      title: '男女分布',
      colSpan: 2,
      icon: 'icon-settings',
      exp: dp.GetJson('XBFB'),
    });

    this.AddChartPie({
      title: '政治面貌分布',
      colSpan: 4,
      icon: 'icon-settings',
      exp: dp.GetJson('ZZMMFB'),
    });
  }
}
