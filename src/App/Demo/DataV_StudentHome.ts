import { DataVBase } from '/@/bp/UIEntity/DataVBase';
import DBAccess from '/@/utils/gener/DBAccess';

export class DataV_StudentHome extends DataVBase {
  constructor() {
    super('DataV_StudentHome');
    this.PageTitle = '学生统计分析(执行标记)'; //执行标记,获得数据.
  }

  //重写的构造方法.
  override async Init() {
    //  this.Self_Weather();
    this.Self_FlowZhiBiaoEmp(); //人员的流程指标.

    const allStuNum = 'DemoStudent_DataV_StudentHome_AllStus';
    const allStuNum1 = 'Ens://TS.Demo.Student/Count(*) as Num/';
    const tuanYuanNumExp = 'Ens://TS.Demo.Student/Count(*) as Num/WHERE 1=1';

    //  http://xxxx/Rpt.vue?EnName=BP.Port.AAA
    // http://xxxx/Rpt.vue?EnName=DataV_StudentHome

    this.AddHtmlVar({
      title: '学生信息',
      icon: 'icon-user',
      colSpan: 2,
      children: [
        { title: '学生总数', exp: await DBAccess.RunSQLReturnTable('DemoStudent_DataV_StudentHome_AllStus'), fontColor: 'black', icon: 'icon-user' },
        {
          title: '团员数',
          exp: await DBAccess.RunSQLReturnTable('DemoStudent_DataV_StudentHome_ZZMM1'),
          fontColor: 'yellow',
          icon: 'icon-user',
        }, ////执行标记是:Demo_DataV_StudentHome_XBNum 参数是: @Key=1, 多个参数用@p1=val1格式分割. Key是默认的参数，一般只有一个参数.
        {
          title: '女同学数',
          exp: await DBAccess.RunSQLReturnTable('DemoStudent_DataV_StudentHome_XBNum@Key=0'),
          fontColor: 'red',
          icon: 'icon-user',
        },
        {
          title: '男同学数',
          exp: await DBAccess.RunSQLReturnTable('DemoStudent_DataV_StudentHome_XBNum@Key=1'),
          fontColor: 'green',
          icon: 'icon-user',
        },
      ],
    });

    this.AddChartZZT({
      title: '男女分布',
      colSpan: 2,
      icon: 'icon-settings',
      exp: await DBAccess.RunSQLReturnTable('DemoStudent_DataV_StudentHome_GroupXB'),
    });

    // this.AddTable({
    //   title: '男女分布',
    //   colSpan: 2,
    //   icon: 'icon-settings',
    //   exp: `SELECT XB, Count(*) as Num FROM Demo_Student GROUP BY XB `,
    // });

    this.AddChartPie({
      title: '政治面貌分布',
      colSpan: 4,
      icon: 'icon-settings',
      exp: await DBAccess.RunSQLReturnTable('DemoStudent_DataV_StudentHome_GroupZZMM'),
    });
  }
}
