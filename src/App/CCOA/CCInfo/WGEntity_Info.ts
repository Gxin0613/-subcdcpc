import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { GloComm } from '/@/WF/Comm/GloComm';

/**
 * 缴费单-外挂 文档: https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl
 */
export class WGEntity_Info extends WaiGuaBaseEntity {
  override Init() {
    //throw new Error('Method not implemented.');
  }
  constructor() {
    super('WGEntity_Info', 'TS.CCOA.CCInfo.Info');
    this.SearchToolbarBtns = '信息类别,关键字,关键字类别';
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
    if (_btnLab === '信息类别') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, GloComm.UrlEns('TS.CCOA.CCInfo.InfoType', ''));
    }
    if (_btnLab === '关键字') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, GloComm.UrlEns('TS.CCOA.CCInfo.Keyword', ''));
    }
    if (_btnLab === '关键字类别') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, GloComm.UrlEns('TS.CCOA.CCInfo.KeywordType', ''));
    }
    if (_btnLab === '发布预览') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, GloComm.UrlGenerList('GL_InfoList', ''));
    }
    alert('没有判断的按钮标签,按钮标签:' + _btnLab + ',选择的ID:[' + _selectedRowIDs + '],Row:' + _row);
  }
}
