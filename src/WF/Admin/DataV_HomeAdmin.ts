import { DataVBase } from '/@/bp/UIEntity/DataVBase';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
/**
 * 流程类别流程
 */
export class DataV_HomeAdmin extends DataVBase {
  orgExp = '';
  constructor() {
    super('DataV_HomeAdmin');
    this.PageTitle = 'Admin统计';
  }

  //重写的构造方法.
  override async Init() {
    const handler = new HttpHandler('BP.CCFast.DataV_Home');
    this.Self_Know(); //写在前面的一段话
    // this.Self_Weather(); //天气预报.
    this.Self_MovementFlowAdmin(); //组织流程动态.

    this.Self_TodolistAdmin(); //组织待办
    this.Self_RuningAdmin(); //组织在途
    this.Self_StartAdmin(); //组织发起
    this.Self_CompleteAdmin(); //组织完成
    // this.AddVueComponent('/src/CCFast/components/DataVDemoView.vue', '演示vue文件', 2, 'icon-refresh', 1, { flowNo: 'all', node: '456' });
    // this.AddVueComponent('/src/CCFast/components/DataVDemoView.vue', '演示vue文件', 2, 'icon-refresh', 1, { flowNo: 'test', node: '123' });

    //增加文本方块.
    this.AddHtmlDtls({
      title: '平台数据',
      icon: 'icon-settings',
      colSpan: 4,
      rowSpan: 1.25,
      children: [
        {
          icon: 'icon-organization',
          title: '支持组织结构',
          docs: '1.单组织,2.集团.3.SAAS' + '、单组织、集团版',
          leftText: 'ccfast',
          rightText: '2025-01-01',
        },
        { icon: 'fa fa-fw fa-database', title: '数据库', docs: 'Mysql,Sqlserver,DM,RDJC等10多种数据库', leftText: 'ccfast', rightText: '2025-01-01' },
        {
          icon: 'fa fa-fw fa-cog',
          title: '配置项',
          docs: '计' + ':4000+，附件、弹框、级联、定时、抄送.......',
          leftText: 'ccfast',
          rightText: '2025-01-01',
        },
        {
          icon: 'fa fa-fw fa-building-o',
          title: '属性页',
          docs: '计' + ':508个，实体、单据、经典表单、开发者.......',
          leftText: 'ccfast',
          rightText: '2025-01-01',
        },
        {
          icon: 'fa fa-fw fa-plus-square',
          title: '新建页面',
          docs: '计' + ':508个,左树右表、GL、GPN、流程.......',
          leftText: 'ccfast',
          rightText: '2025-01-01',
        },
        {
          icon: 'glyphicon glyphicon-stats',
          title: '左树右表',
          docs: '计' + ':12个，组织、流程树、表单树、数据源.......',
          leftText: 'ccfast',
          rightText: '2025-01-01',
        },
        {
          icon: 'icon-bell',
          title: '消息提醒',
          docs: '企业微信集成、钉钉集成.......',
          leftText: 'ccfast',
          rightText: '2025-01-01',
        },
        {
          icon: 'glyphicon glyphicon-stats',
          title: '高代码',
          docs: '计' + ':13个模式，查询、实体、通用列表.......',
          leftText: 'ccfast',
          rightText: '2025-01-01',
        },
      ],
    });

    // this.Self_FlowZhiBiaoAdmin(); //本组织的流程指标

    //插入饼图.
    this.AddChartPie({
      title: '部门发起分布',
      colSpan: 2,
      icon: 'icon-people',
      exp: await handler.DoMethodReturnString('Admin_DeptStartFlows'),
    });
    //插入饼图.
    this.AddChartPie({
      title: '流程发起分布',
      colSpan: 2,
      icon: 'icon-people',
      exp: await handler.DoMethodReturnString('Admin_StartFlows'),
    });

    this.AddChartZZT({
      title: '部门发起分布',
      colSpan: 2,
      icon: 'icon-organization',
      exp: await handler.DoMethodReturnString('Admin_DeptStartFlows'),
    });

    this.AddChartZZT({
      title: '流程发起分布',
      colSpan: 2,
      icon: 'icon-clock',
      exp: await handler.DoMethodReturnString('Admin_StartFlows'),
    });

    //插入饼图.
    // this.AddChartPie('人员部门分布图', 2, 'icon-drop', `SELECT FK_Dept AS '部门', count(*) as '人数' FROM Port_Emp WHERE 1=1 AND ${orgExp} GROUP BY FK_Dept `);
    //待办分布图
    // this.AddChartPie('流程待办', 2, 'icon-drop', `SELECT FlowName, count(*) as '个数' from WF_GenerWorkFlow GROUP BY FlowName `);
    //原生echarts配置
    this.AddNativeEChartsOption({
      title: '原生echarts配置',
      colSpan: 4,
      rowSpan: 2,
      icon: 'icon-settings',
      echartsOption: {
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ['product', '2012', '2013', '2014', '2015'],
            ['Matcha Latte', 41.1, 30.4, 65.1, 53.3],
            ['Milk Tea', 86.5, 92.1, 85.7, 83.1],
            ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4],
          ],
        },
        xAxis: [
          { type: 'category', gridIndex: 0 },
          { type: 'category', gridIndex: 1 },
        ],
        yAxis: [{ gridIndex: 0 }, { gridIndex: 1 }],
        grid: [{ bottom: '55%' }, { top: '55%' }],
        series: [
          // These series are in the first grid.
          { type: 'bar', seriesLayoutBy: 'row' },
          { type: 'bar', seriesLayoutBy: 'row' },
          { type: 'bar', seriesLayoutBy: 'row' },
          // These series are in the second grid.
          { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 },
          { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 },
          { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 },
          { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 },
        ],
      },
    });
  }
}
