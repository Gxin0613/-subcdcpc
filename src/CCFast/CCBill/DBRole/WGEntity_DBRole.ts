import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { MapExts } from '/@/WF/Admin/FrmLogic/MapExt';

/**
 * 人员工作量计算
 */
export class WGEntity_DBRole extends WaiGuaBaseEntity {
  constructor() {
    super('WGEntity_DBRole', 'TS.CCBill.DBRoleShowAttrsStation');
  }
  Init() {
    this.SearchToolbarBtns = '控制的字段'; //查询工具栏上的按钮.
    this.EntityToolbarBtns = '控制的字段';
    //this.HisEntity? =new DBRoleShowAttrsStation();

    this.HisMapExts = new MapExts();

    //这里要设置：能够pop弹窗，显示字段分组， 字段的列表，。 @wanglu.
    //this.HisMapExts.AddPopList('');
    // this.TableHeaderConfig
  }

  /**
   * 按钮事件
   * @param srcEvent 来源:如下三种 SearchToolbar,SearchOpt,EntityToolbar
   * @param btnLab 按钮标签
   * @param _selectedRowIDs 选择数据,如果是MyBill就是OID.
   * @param _row  选择的行数据,对 SearchOptBtns 有效.
   * @returns 执行结果
   */
  public override async BtnClick(_srcEvent: string, _btnLab: string, _selectedRowIDs = '', _row) {
    if (_srcEvent == 'SearchToolbar') {
      if (_btnLab == '统计数据') {
        // const url = await WGEntity_SSGZLForm.GotoTJ();
        // if (url != '') {
        //   return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url, '统计');
        // }
      }
    }
  }
}
