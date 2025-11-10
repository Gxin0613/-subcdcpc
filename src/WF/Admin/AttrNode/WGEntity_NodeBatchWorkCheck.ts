import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

/**
 * 项目立项
 */
export class WGEntity_NodeBatchWorkCheck extends WaiGuaBaseEntity {
  override Init() {
    this.SearchToolbarBtns = '设置'; //查询工具栏上的按钮.
    this.SearchOptBtnsWidth = 360;
  }
  constructor() {
    super('WGEntity_NodeBatchWorkCheck', 'TS.WF.NodeBatchWorkCheck');
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
    if (_btnLab === '导入数据') {
      const myurl = GloComm.UrlGPN('GPN_ImpPMTSEntity', '&type=Prj&impType=0');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, myurl);
    }
  }
}
