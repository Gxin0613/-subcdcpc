import { message } from 'ant-design-vue';
import { BanJis } from './BanJi';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { Rpt3DBase, Rpt3DWorkType, RptWorkModel, SumAvg } from '/@/bp/UIEntity/Rpt3DBase';
import { GloComm } from '/@/WF/Comm/GloComm';
import WebUser from '/@/bp/web/WebUser';

export class Rpt3D_Student extends Rpt3DBase {
  constructor() {
    super('Rpt3D_Student');
    this.PageTitle = '学生3D统计分析报表';
  }

  //重写的构造方法.
  override async Init() {
    this.WorkType = Rpt3DWorkType.Left; //2维度的位置.
    if (WebUser.No === 'admin') this.WorkModel = RptWorkModel.Readonly; //是否可以编辑？
    else this.WorkModel = RptWorkModel.Readonly; //是否可以编辑？

    this.SetSumAvgRow(SumAvg.Sum); //对行的求和平均.
    this.SetSumAvgCol(SumAvg.Sum); //对列的求和平均.

    //显示的数据源.
    this.Rows = [
      { BanJiNo: '001', ZZMM: 1, XB: 1, Num: 32 },
      { BanJiNo: '002', ZZMM: 2, XB: 0, Num: 45 },
      { BanJiNo: '003', ZZMM: 1, XB: 1, Num: 98 },
      { BanJiNo: '004', ZZMM: 2, XB: 0, Num: 53 },
      { BanJiNo: '005', ZZMM: 3, XB: 1, Num: 32 },
    ];

    const banjs = new BanJis();
    await banjs.RetrieveAll();
    this.SetD1Src('班级', banjs, 'BanJiNo', 'AntiqueWhite', 'No', 'Name');

    //2维度数据源.
    const xb = [
      { No: 0, Name: '女' },
      { No: 1, Name: '男' },
    ];
    this.SetD2Src('性别', xb, 'XB', 'DarkSlateGray4', 'No', 'Name');

    //3维度数据源.
    const zzmm = [
      { No: 0, Name: '群众' },
      { No: 1, Name: '团员' },
      { No: 2, Name: '党员' },
      { No: 3, Name: '其他' },
    ];
    this.SetD3Src('政治面貌', zzmm, 'ZZMM', 'red', 'No', 'Name');

    this.BtnOfToolbar = 'Toolbar按钮1,Toolbar按钮2';
    this.BtnsOfRow = '按钮1,按钮2';

    //维度之间的关系.
    this.RefKey = ''; //维度之间的关联，比如：大类小类的关联的字段.
    this.RowValKey = 'Num'; //分析的值.
  }
  override CellDoubleClick(_object: Record<string, any>, _d1?: string, _d2?: string, _d3?: string, _rowIdx?: number, _colIdx?: number) {
    //throw new Error('Method not implemented.');
  }
  // 失去焦点的时候.
  override CellOnBlur(_object: Record<string, any>, _d1: string, _d2: string, _d3: string, _val: string, _valOld: string) {
    // throw new Error('Method not implemented.');
    message.info('单元格失去焦点事件,d1:[' + _d1 + ']d2:[' + _d2 + ']d3:[' + _d3 + ']val:[' + _val + '] valOld:[' + _valOld + ']');
    return;
    //  return this.SetVal(_d1, _d2, _d3, 100); //设置值.
    //this.GetVal()
    // return _valOld; //赋值给原来的文本框.
  }
  override BtnClick(btnName: string, record: Record<string, any>, _ids?: string) {
    if (btnName == '考核大类') {
      const url = GloComm.UrlEns('TS.Demo.Sort1');
      return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer50, url);
    }
    if (btnName == '小类') {
      const url = GloComm.UrlEns('TS.Demo.Sort2');
      return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer50, url);
    }
    alert(btnName + record);
    // throw new Error('Method not implemented.');
  }
}
