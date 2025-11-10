import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class WGEntity_TuiYan extends WaiGuaBaseEntity {
  constructor() {
    super('WGEntity_TuiYan', 'TS.Quest.TuiYan');
    this.SearchToolbarBtns = '同步数据,选股,生成测试数据'; //查询工具栏上的按钮.
    this.SearchOptBtns = '按钮1,按钮2'; //列表的操作按钮.
    this.EntityToolbarBtns = '重新计算';
  }
  override Init() {
    this.SearchToolbarBtns = '同步数据'; //查询工具栏上的按钮.
    this.SearchOptBtns = '按钮1,按钮2'; //列表的操作按钮.
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
    if (_srcEvent == 'SearchToolbar' && _btnLab === '同步数据') {
      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      const data = handler.DoMethodReturnString('Stock_DTS');
      alert('同步结果:' + data);
      return;
    }
    if (_srcEvent == 'SearchToolbar' && _btnLab === '选股') {
      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      const data = handler.DoMethodReturnString('Stock_Selected');
      alert('同步结果:' + data);
      return;
    }
    if (_srcEvent == 'SearchToolbar' && _btnLab === '生成测试数据') {
      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      const data = handler.DoMethodReturnString('GenerTestData');
      alert('同步结果:' + data);
      return;
    }

    alert('没有判断的按钮标签,按钮标签:' + _btnLab + ',选择的ID:[' + _selectedRowIDs + '],Row:' + _row);
  }
}
