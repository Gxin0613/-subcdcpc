import { DataVBase } from '/@/bp/UIEntity/DataVBase';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
/**
 * 流程类别流程
 */
export class DataV_Service extends DataVBase {
  orgExp = '';
  constructor() {
    super('DataV_Service');
    this.PageTitle = '服务监控';
  }

  //重写的构造方法.
  override async Init() {
    this.AddTable({
      title: 'CPU',
      colSpan: 2,
      icon: 'icon-settings',
      exp: `SELECT XB, Count(*) as Num FROM Demo_Student GROUP BY XB `,
    });
    this.AddTable({
      title: '内存',
      colSpan: 2,
      icon: 'icon-settings',
      exp: `SELECT XB, Count(*) as Num FROM Demo_Student GROUP BY XB `,
    });
    this.AddTable({
    title: '服务信息',
    colSpan: 4,
    icon: 'icon-settings',
    exp: `SELECT XB, Count(*) as Num FROM Demo_Student GROUP BY XB `,
    });
   this.AddTable({
    title: '磁盘状态',
    colSpan: 4,
    icon: 'icon-settings',
    exp: `SELECT XB, Count(*) as Num FROM Demo_Student GROUP BY XB `,
    });

    
  }
}
