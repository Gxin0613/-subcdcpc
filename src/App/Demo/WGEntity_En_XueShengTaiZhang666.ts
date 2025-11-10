import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';

/**
 * 缴费单-外挂 文档: https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl
 */
export class WGEntity_En_XueShengTaiZhang666 extends WaiGuaBaseEntity {

  constructor() {
    super('WGEntity_En_XueShengTaiZhang666', 'En_XueShengTaiZhang666');

    //为从表增加时间.
    // this.AddDtl('DtlEnName', ONcel(),"xxx");
  }
  override Init() {
    //throw new Error('Method not implemented.');

    this.SearchToolbarBtns = '批处理按钮'; //查询工具栏上的按钮.
    this.SearchOptBtns = '轨迹,测试按钮'; //列表的操作按钮.
    this.EntityToolbarBtns = '卡片测试按钮'; //单个单据的按钮.
  }
  OnSearchDtlSave(): Promise<string | null> {
    //message.info('触发了:FrmLoadAfter:FrmID:' + this.FrmID + ',WorkID:' + this.WorkID);
    return Promise.resolve(null);
  }

  override FrmLoadBefore(): Promise<string | null> {
  //  message.info('触发了:FrmLoadBefore:FrmID:' + this.FrmID + ',WorkID:' + this.WorkID);
    return Promise.resolve(null);
  }
  override FrmLoadAfter(): Promise<string | null> {
  //  message.info('触发了:FrmLoadAfter:FrmID:' + this.FrmID + ',WorkID:' + this.WorkID);
    return Promise.resolve(null);
  }

  override FrmBodyItemChange(_attrKey: string, _selectVal: string): Promise<string | null> {
   // message.info('触发了:FrmBodyItemChange:_attrKey:' + _attrKey + ',_selectVal:' + _selectVal);
    return Promise.resolve(null);
  }
  override FrmBodyBtnClick(_attrKey: string, _Val: string): Promise<string | null> {
   // message.info('触发了:FrmBodyBtnClick:_attrKey:' + _attrKey + ',_Val:' + _Val);
    return Promise.resolve(null);
  }
  override FrmBodyTextBoxBlur(_attrKey: string, _Val: string): Promise<string | null> {
   // message.info('触发了:FrmBodyTextBoxBlur:_attrKey:' + _attrKey + ',_Val:' + _Val);
    return Promise.resolve(null);
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
    if (_srcEvent == 'SearchToolbar' && _btnLab === '地图') {
      alert('正在打开地图:' + _selectedRowIDs + 'row' + _row);
      return;
    }

    if (_btnLab == '验证') {
      ///  alert(_selectedRowIDs);
      return;
    }

    if (_btnLab == '批处理按钮') {
      alert(_selectedRowIDs);
      return;
    }
    if (_btnLab == '测试按钮') {
      alert(_row.OID);
      return;
    }
    alert('没有判断的按钮标签,按钮标签:' + _btnLab + ',选择的ID:' + _selectedRowIDs + ',Row:' + _row);
  }
}
