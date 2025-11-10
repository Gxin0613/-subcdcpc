import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '/@/WF/Comm/GloComm';

/**
 * 缴费单-外挂 文档: https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl
 * SearchBill.vue, MyBill.vue,
 * SearchEntityNoName.vue, MyEntityNoName.vue,
 * Search.vue,  En.vue
 */
export class WGEntity_Stock extends WaiGuaBaseEntity {
  constructor() {
    super('WGEntity_Stock', 'TS.Quest.Stock');
    this.SearchToolbarBtns = '同步数据,求推荐度,推演,生成测试数据'; //查询工具栏上的按钮.
    this.SearchOptBtns = '折线图'; //列表的操作按钮.
  }

  override Init() {
    this.SearchToolbarBtns = '同步数据'; //查询工具栏上的按钮.
    // this.SearchOptBtns = '按钮1,按钮2'; //列表的操作按钮.
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
       if (_selectedRowIDs == null || _selectedRowIDs == '') {
        message.error('请选择要同步的数据.');
        return;
      }
      message.info('同步数据，需要一段时间，请耐心等待。');
      //const token= WebUser.Token;
      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      handler.AddPara('ids', _selectedRowIDs);
      const data = await handler.DoMethodReturnString('TB_AllDataForIDS');
      alert(data);
      return new GPNReturnObj(GPNReturnType.Reload);
    }
    if (_srcEvent == 'SearchToolbar' && _btnLab === '推演') {
      if (_selectedRowIDs == null || _selectedRowIDs == '') {
        message.error('请选择要推演的股票.');
        return;
      } else {
        const val = window.confirm('您选择的记录在推演之前必须求推荐度,您确认要执行如下股票的推演吗? ' + _selectedRowIDs);
        if (val == false) return;
        message.info('正在执行推演请稍后....');
      }
      //执行推演.
      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      handler.AddPara('StockNos', _selectedRowIDs); //选择的股票.
      const data = await handler.DoMethodReturnString('GPN_TuiYan_DoIt');
      const no = data.No;
      const url = GloComm.UrlEn('TS.Quest.TuiYan', no);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (_srcEvent == 'SearchToolbar' && _btnLab === '求推荐度') {
      const dtFrom = window.prompt('请输时间点From', '2025-09-01');
      if (dtFrom == undefined) return;

      const dtTo = window.prompt('请输时间点To', '2025-10-01');
      if (dtTo == undefined) return;

      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      handler.AddPara('DTFrom', dtFrom);
      handler.AddPara('DTTo', dtTo);
      const val = await handler.DoMethodReturnString('Stock_AreaAll');
      alert(val);
      return new GPNReturnObj(GPNReturnType.Reload);
    }
    if (_srcEvent == 'SearchToolbar' && _btnLab === '生成测试数据') {
      message.info('同步数据，需要一段时间，请耐心等待。');
      const handler = new HttpHandler('BP.App.Demo.Handler_Stock');
      const data = await handler.DoMethodReturnString('GenerTestData');
      alert(data);
      return new GPNReturnObj(GPNReturnType.Reload);
    }

    if (_srcEvent == 'SearchOpt' && _btnLab === '折线图') {
      let url = GloComm.UrlWhiteScreenViewer('DataV_Stock');
      url += '&StockNo=' + _row.No;
      alert(url);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    alert('没有判断的按钮标签:' + _btnLab + ',来源:[' + _srcEvent + ']选择的ID:[' + _selectedRowIDs + '],Row:' + _row);
  }
}
