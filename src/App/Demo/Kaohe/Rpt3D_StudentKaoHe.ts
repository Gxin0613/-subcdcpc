import { message } from 'ant-design-vue';
import { KaoHeDtl, KaoHeDtls } from './KaoHeDtl';
import { Sort1s } from './Sort1';
import { Sort2s } from './Sort2';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { Rpt3DBase, Rpt3DWorkType, RptWorkModel, SumAvg } from '/@/bp/UIEntity/Rpt3DBase';
import { GloComm } from '/@/WF/Comm/GloComm';
import WebUser from '/@/bp/web/WebUser';
import { DataType } from '/@/bp/en/DataType';

export class Rpt3D_StudentKaoHe extends Rpt3DBase {
  constructor() {
    super('Rpt3D_StudentKaoHe');
    this.PageTitle = '大小类考核3D交叉表';
  }
  //重写的构造方法.
  override async Init() {
    this.WorkType = Rpt3DWorkType.Left; //2维度的位置.
    this.WorkModel = RptWorkModel.Edit; //是否可以编辑？
    this.CellDataType = DataType.AppInt;
    this.CellDataBit = 0; //小数位数，对float有效.

    this.SetSumAvgRow(SumAvg.ByPromiseExpModel); //对行的求和平均.
    this.SetSumAvgCol(SumAvg.Sum); //对列的求和平均.

    if (WebUser.No == 'admin') this.BtnOfToolbar = '考核大类,小类,启动流程'; //工具栏上的按钮.
    this.BtnsOfRow = '按钮1,按钮2'; //行的按钮.

    //显示的数据源.
    const dtls = new KaoHeDtls();
    await dtls.Retrieve('ND', '2025', 'StudentNo', 'admin');
    this.Rows = dtls;
    this.RowValKey = 'Cent'; //数值.

    //1维度数据源.
    const sort1s = new Sort1s();
    await sort1s.RetrieveAll();
    this.SetD1Src('大类', sort1s, 'Sort1', 'Bisque', 'No', 'Name');

    //2维度数据源.
    const sort2s = new Sort2s();
    await sort2s.RetrieveAll();
    this.SetD2Src('小类', sort2s, 'Sort2', 'LabColor', 'No', 'Name', 'Sort1', 'RowExpModel');

    //3维度数据源.
    const yuefen = [
      { No: '01', Name: '1月份' },
      { No: '02', Name: '2月份' },
      { No: '03', Name: '3月份' },
      { No: '04', Name: '4月份' },
      { No: '05', Name: '5月份' },
      { No: '06', Name: '6月份' },
      { No: '07', Name: '7月份' },
      { No: '08', Name: '8月份' },
      { No: '09', Name: '9月份' },
      { No: '10', Name: '10月份' },
      { No: '11', Name: '11月份' },
      { No: '12', Name: '12月份' },
    ];
    this.SetD3Src('月份', yuefen, 'YF');
  }
  override async CellOnBlur(_object: Record<string, any>, _d1?: string, _d2?: string, _d3?: string, _val?: string, _valOld?: string) {
    if (_val == _valOld) return;

    const dtl = new KaoHeDtl();
    const mypk = _d1 + '_' + _d2 + '_' + _d3;
    dtl.MyPK = mypk;
    const i = await dtl.RetrieveFromDBSources();
    dtl.Sort1 = _d1;
    dtl.Sort2 = _d2;
    dtl.YF = _d3;
    dtl.ND = '2025';
    dtl.StudentNo = 'admin';
    dtl.NY = dtl.ND + '-' + dtl.YF;
    dtl.Cent = _val;
    dtl.Msg = '我的消息, Msg是默认字段，如果该字段有值就会现实CellPop.';
    if (i == 0) dtl.Insert();
    else dtl.Update();
    message.info('更新成功.');
    // throw new Error('Method not implemented.');
  }
  CellDoubleClick(_object: Record<string, any>, _d1?: string, _d2?: string, _d3?: string, _rowIdx: number, _colIdx: number) {
    alert('CellDoubleClick:' + _d1 + ' ' + _d2 + ' ' + _d3 + '  _object:' + _object + ' ' + _rowIdx + ' ' + _colIdx);

    // throw new Error('Method not implemented.');
  }
  override BtnClick(btnName: string, record: Record<string, any>, _d1?: string, _d2?: string, _d3?: string, _rowIdx: number, _colIdx: number) {
    if (btnName == '启动流程') {
      alert(btnName + record + '-_rowIdx' + _rowIdx + '-_colIdx' + _colIdx);
      const val = this.GetValByD(_d1, _d2, _d3);
      const val2 = this.GetValByIdx(_rowIdx + 1, _colIdx);
      alert(val + ' - ' + val2);
      return;
    }
    if (btnName == 'CellPopClick') {
      alert('CellPopClick:_d1=' + _d1 + '  _d2=' + _d2 + '  _d3=' + _d3);
      //const url = GloComm.UrlEns('TS.Demo.Sort1');
      // return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, url);
    }
    if (btnName == '考核大类') {
      const url = GloComm.UrlEns('TS.Demo.Sort1');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, url);
    }
    if (btnName == '小类') {
      const url = GloComm.UrlEns('TS.Demo.Sort2');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    alert(btnName + record);
  }
}
