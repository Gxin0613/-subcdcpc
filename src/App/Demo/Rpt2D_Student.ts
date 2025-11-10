import { message } from 'ant-design-vue';
import { BanJis } from './BanJi';
import { Rpt2DBase } from '/@/bp/UIEntity/Rpt2DBase';
import { Rpt2DWorkType } from '/@/bp/UIEntity/Rpt2DBase';

export class Rpt2D_Student extends Rpt2DBase {
  constructor() {
    super('Rpt2D_Student');
    this.PageTitle = '学生2D统计分析报表';
  }

  //重写的构造方法.
  override async Init() {
    //1维度数据源.
    this.WorkType = Rpt2DWorkType.TopLeft; //这个标记应该不需要.
    //1维度数据源.
    const banjs = new BanJis();
    await banjs.RetrieveAll();
    this.SetD1Src('班级', banjs, 'BanJiNo', 'No', 'Name');
    //2维度数据源.
    const zzmm = [
      { No: 0, Name: '群众' },
      { No: 1, Name: '团员' },
      { No: 2, Name: '党员' },
      { No: 3, Name: '其他' },
    ];
    this.SetD2Src('政治面貌', zzmm, 'ZZMM', 'No', 'Name');
    //显示的数据源.
    this.Rows = [
      { BanJiNo: '001', ZZMM: 1, Num: 32 },
      { BanJiNo: '002', ZZMM: 2, Num: 2 },
      { BanJiNo: '003', ZZMM: 1, Num: 23 },
      { BanJiNo: '004', ZZMM: 2, Num: 5 },
      { BanJiNo: '005', ZZMM: 3, Num: 3 },
    ];

    //关联的Key.
    this.RowValKey = 'Num';
  }
  override CellOnBlur(_object: Record<string, any>, _d1: string, _d2: string, _val: string, _valOld: string) {
    // throw new Error('Method not implemented.');
    message.info('单元格失去焦点事件,d1:[' + _d1 + ']d2:[' + _d2 + ']d3:[' + _d3 + ']val:[' + _val + '] valOld:[' + _valOld + ']');
    //return this.SetVal(_d1, _d2, _d3, 100);
    //this.GetVal()
    // return _valOld; //赋值给原来的文本框.
  }
  override CellFieldClick(object: Record<string, any>) {
    alert(object);
    //  throw new Error('Method not implemented.');
  }
  override BtnClick(btnName: string, record: Record<string, any>, ids?: string) {
    alert(btnName + record + ids);
    // throw new Error('Method not implemented.');
  }
}
