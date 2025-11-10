// 实体类
import { useClassFactoryLoader } from '/@/hooks/ens/useClassFactoryLoader';
import EntityMetaData from 'virtual:entity-metadata';
import GPNMetaData from 'virtual:gpn-metadata';
import GLMetaData from 'virtual:gl-metadata';

export default class GPNMenuExt {
  public static TableCols() {
    return [
      {
        title: '类名',
        key: 'Name',
        width: 120,
      },
      {
        title: 'ClassID',
        key: 'No',
        width: 140,
      },
      {
        title: '存储表',
        key: 'PTable',
        width: 120,
      },
    ];
  }

  public static EntityNoNameFunc() {
    return JSON.stringify([
      {
        No: 'Home',
        Name: '主页:通过En组件链接到列表、分析、报表、大屏链接.',
      },
      {
        No: 'Search',
        Name: '列表:链接到流程实例分析.',
      },
      {
        No: 'Group',
        Name: '分析:分组分析数据.',
      },
      {
        No: 'Rpt',
        Name: '报表:2维,3维报表',
      },
      {
        No: 'BS',
        Name: '大屏:BS可以定制化分析内容.',
      },
    ]);
  }
  public static BillFunc() {
    return JSON.stringify([
      {
        No: 'Home',
        Name: '主页:通过En组件链接到列表、分析、报表、大屏链接.',
      },
      {
        No: 'Search',
        Name: '列表:查询单据.',
      },
      {
        No: 'Group',
        Name: '分析:分组分析数据.',
      },
      {
        No: 'Rpt',
        Name: '报表:2维,3维报表',
      },
      {
        No: 'BS',
        Name: '大屏:BS可以定制化分析内容.',
      },
      {
        No: 'NewBill',
        Name: '新建单据.',
      },
      {
        No: 'Todolist',
        Name: '待办',
      },
    ]);
  }
  public static GenerFlowFunc() {
    return JSON.stringify([
      {
        No: 'SearchPanel',
        Name: '综合查询',
        Desc: '查询该流程所有实例',
      },
      {
        No: 'FlowSearch',
        Name: '查询Search',
        Desc: '链接到流程实例查询',
      },
      {
        No: 'FlowGroup',
        Name: '分析Group:链接到流程实例分析.',
      },
      {
        No: 'Start',
        Name: '发起Start:发起指定的流程.',
      },
      {
        No: 'Todolist',
        Name: '待办Todolist:查看指定流程的待办.',
      },
      {
        No: 'Runing',
        Name: '在途Runing:查看指定流程的在途.',
      },
      {
        No: 'Complete',
        Name: '已完成GL_Complete:查看指定流程的已经完成的.',
      },
      {
        No: 'Home',
        Name: '流程主页Home:查看流程主页.',
      },
      {
        No: 'GPN_StartFlowByImpExcel',
        Name: '导入Excel发起流程',
      },
      {
        No: 'DataV',
        Name: '流程分析页:白色大屏.',
      },
    ]);
  }
  public static DBSrcModel() {
    return JSON.stringify([
      {
        No: 'Self',
        Name: '自定义SQL(从指定的关系数据库数据源中查询的数据)',
      },
      {
        No: 'Search',
        Name: '查询数据源(在数据源配置SQL或者WebApi接口)',
      },
    ]);
  }
  public static DBSrcModelGener() {
    return JSON.stringify([
      {
        No: 'Self',
        Name: '自定义SQL(从指定的关系数据库数据源中查询的数据)',
      },
      {
        No: 'SFDBsrc',
        Name: '系统定义的数据源获取.',
      },
    ]);
  }
  public static AskFrmUserModel() {
    return JSON.stringify([
      {
        No: 'Inside',
        Name: '内部用户',
      },
      {
        No: 'Outside',
        Name: '外部用户',
      },
    ]);
  }
  public static AskFrmDBTime() {
    return JSON.stringify([
      {
        No: '0',
        Name: '单次填写(比如:调查问卷、活动报名)',
      },
      {
        No: '1',
        Name: '多次填写(比如:订单、问题反馈单、建议单)',
      },
    ]);
  }
  public static GenerFlowMenu() {
    return JSON.stringify([
      {
        No: 'GL_Start',
        Name: '发起',
      },
      {
        No: 'GL_Todolist',
        Name: '待办',
      },
      {
        No: 'GL_Running',
        Name: '在途',
      },
      {
        No: 'GL_CC',
        Name: '抄送',
      },
      {
        No: 'GL_Draft',
        Name: '草稿',
      },
      {
        No: 'GL_Recent',
        Name: '近期',
      },
      {
        No: 'GL_Complete',
        Name: '已完成',
      },

      {
        No: 'TreeEns_FlowSort2Flow',
        Name: '流程管理',
      },
      {
        No: 'TreeEns_FrmSort2Frm',
        Name: '表单管理',
      },
    ]);
  }
  public static GenerEntitySort() {
    return JSON.stringify([
      {
        No: 'Search',
        Name: '查询组件Search',
      },
      {
        No: 'Batch',
        Name: '批处理组件Batch',
      },
      {
        No: 'Ens',
        Name: '批量修改组件Ens',
      },
      {
        No: 'Group',
        Name: '统计分析组件Group',
      },
      {
        No: 'SearchRpt',
        Name: '报表组件SearchRpt',
      },
      {
        No: 'Tree',
        Name: '树实体组件Tree',
      },
      {
        No: 'En',
        Name: '实体属性(En)',
      },
      {
        No: 'EnOnly',
        Name: '实体属性(EnOnly)',
      },
    ]);
  }
  //获得列表.
  public static async GenerEnsList(enType: string) {
    if (enType === 'GPN') {
      // const factory = await useClassFactoryLoader('ClassFactoryOfGroupPageNew');
      // return await factory.toJSON([]);
      if (GPNMetaData.length === 0) {
        alert('未获取到GPN类数据，请检查更新vite插件代码，位于base/vite-config/src下');
        return;
      }
      return JSON.stringify(
        GPNMetaData.map((gpn) => {
          return {
            No: gpn.classId,
            Name: gpn.pageTitle,
          };
        }),
      );
    }
    if (enType === 'Tabs') {
      const factory = await useClassFactoryLoader('ClassFactoryOfTabs');
      return await factory.toJSON([]);
    }
    if (enType === 'Rpt2D') {
      const factory = await useClassFactoryLoader('ClassFactoryOfRpt2D');
      return await factory.toJSON([]);
    }
    if (enType === 'Rpt3D') {
      const factory = await useClassFactoryLoader('ClassFactoryOfRpt3D');
      return await factory.toJSON([]);
    }
    if (enType === 'TreeEns') {
      const factory = await useClassFactoryLoader('ClassFactoryOfPageBaseTreeEns');
      return factory.toJSON([]);
    }
    if (enType === 'GL') {
      if (GLMetaData.length === 0) {
        alert('未获取到GL类数据，请检查更新vite插件代码，位于base/vite-config/src下');
        return;
      }
      return JSON.stringify(
        GLMetaData.map((gpn) => {
          return {
            No: gpn.classId,
            Name: gpn.pageTitle,
          };
        }),
      );
    }
    if (enType === 'PG') {
      const factory = await useClassFactoryLoader('ClassFactoryOfPanelGroup');
      return factory.toJSON([]);
    }
    if (enType === 'Entity') {
      if (GLMetaData.length === 0) {
        alert('未获取到Entity类数据，请检查更新vite插件代码，位于base/vite-config/src下');
        return;
      }
      return JSON.stringify(
        EntityMetaData.map((info) => {
          return {
            No: info.classId,
            Name: info.desc,
            PTable: info.tableName,
          };
        }),
      );
    }

    if (enType === 'DataV') {
      const factory = await useClassFactoryLoader('ClassFactoryOfDataV');
      return await factory.toJSON([]);
    }
    return JSON.stringify([]);
  }
  public static RptModel() {
    return JSON.stringify([
      {
        No: 'RptWhite',
        Name: '通用大屏',
      },
      {
        No: 'FlowRptWhite',
        Name: '基于流程的大屏',
      },
      {
        No: 'BillRptWhite',
        Name: '基于单据的大屏',
      },
      {
        No: 'EnRptWhite',
        Name: '基于实体的大屏',
      },
      {
        No: 'EntityRptWhite',
        Name: '基于高代码的大屏',
      },
    ]);
  }
}
