import { DataType } from '../en/DataType';
import { getRequestParams } from '/@/utils/request/decode';
import { message } from 'ant-design-vue';

//列表模式.
export enum Rpt3DWorkType {
  Left = 0,
  Top = 1,
}

//求和求平均.
export enum SumAvg {
  None = 0,
  Sum = 1,
  Avg = 2,
  //按照D2约定字段计算.
  ByPromiseExpModel = 3,
}

//工作模式.
export enum RptWorkModel {
  Readonly = 0,
  Edit = 1,
}

type Dimensions = {
  title: string; //维度标题
  rowKey: string; // key
  list: Recordable[]; //维度数据源
};

export abstract class Rpt3DBase {
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */
  public PageTitle: string | null = '3D报表标题'; //页面标题.
  public Icon: string | null = 'icon-file'; //标题.
  public ClassID?: string; //实体类ID.
  public WorkType = Rpt3DWorkType.Left; //实体类ID.
  public WorkModel = RptWorkModel.Readonly; //实体类ID.

  public _SumAvgRow = SumAvg.None; //对行的求和请平均.
  public _SumAvgRowColor = 'Gainsboro'; //显示颜色.
  public SetSumAvgRow(sumAvgRow: SumAvg, color = 'Gainsboro') {
    this._SumAvgRow = sumAvgRow;
    this._SumAvgRowColor = color;
  }

  public _SumAvgCol = SumAvg.None; //对列的求和求平均.
  public _SumAvgColColor = '#Azure'; //显示颜色.
  public SetSumAvgCol(sumAvgCol: SumAvg, color = 'Azure') {
    this._SumAvgCol = sumAvgCol;
    this._SumAvgColColor = color;
  }

  public CellDataType = DataType.AppFloat; //默认的浮点类型.
  public CellDataBit = 2; //如果是小数,小数据位数.

  public BtnsOfRow = ''; //行操作按钮 逗号隔开
  public BtnOfToolbar = ''; //工具栏按钮.
  dimension = { title: '', rowKey: '', myColor: '', list: [] };
  public D1Src: Dimensions = Object.assign({}, this.dimension); //第1维度
  public D2Src: Dimensions = Object.assign({}, this.dimension); //第2维度
  public D3Src: Dimensions = Object.assign({}, this.dimension); //第3维度
  public SetD1Src(title: string, list: Record<string, any>[], rowKey: string, myLabColor = 'yellow', _NoKey = 'No', _NameKey = 'Name') {
    this.D1Src = {
      title: title,
      rowKey: rowKey,
      myColor: myLabColor,
      list: list.map((en) => {
        return { No: en[_NoKey] || en.No, Name: en[_NameKey] || en.Name };
      }),
    };
  }
  /**
   *
   * @param title 标题
   * @param list 数据源
   * @param rowKey 数据源的字段绑定
   * @param myColor label的颜色 | 数据源的列作为字段.(可以为空)
   * @param _NoKey 编号列
   * @param _NameKey 名称列
   * @param _RefSortKey 关联大的类,可以为空.
   */
  public SetD2Src(title: string, list: Record<string, any>, rowKey: string, myColor = 'yellow', _NoKey = 'No', _NameKey = 'Name', _RefSortKey = '', _SumAvgKey = '') {
    this.RefKey = 'RefSortKey';
    //判断颜色是颜色还是字段
    const keys = Object.keys(list[0]) || [];
    const isColorKey = keys.includes(myColor);
    this.D2Src = {
      title: title,
      rowKey: rowKey,
      myColor: !isColorKey ? '' : myColor,
      list: list.map((en) => {
        return { No: en[_NoKey] || en.No, Name: en[_NameKey] || en.Name, RefSortKey: en[_RefSortKey] || '', Color: en[myColor] || '', SumAvg: en[_SumAvgKey] || '' };
      }),
    };
  }
  public SetD3Src(title: string, list: Record<string, any>, rowKey: string, myColor = 'yellow', _NoKey = 'No', _NameKey = 'Name') {
    this.D3Src = {
      title: title,
      rowKey: rowKey,
      myColor: myColor,
      list: list.map((en) => {
        return { No: en[_NoKey] || en.No, Name: en[_NameKey] || en.Name };
      }),
    };
  }
  public RefKey?: string; //实体类ID.
  /**
   * 维度之间的关联关系，如果
   * WorkType = Left 这个key表示1/2维度的关联key。
   * WorkType = Top  这个key表示2/3维度的关联key
   * 如果为空表示没有关联，数据将会平铺展示
   */
  public Rows: Recordable[] = []; //数据源.
  public RowValKey = ''; //数值的Key.
  // 参数，从外部传过来的
  public params: Record<string, any> = {};
  public setParams(params: Record<string, any>) {
    this.params = params;
  }

  public TableData: Recordable[] = []; //处理的页面数据
  /**
   * 获得外部的参数, 此方法为实现.
   * @param key 参数key
   * @returns
   */
  public RequestVal(key: string) {
    return this.params[key] || getRequestParams(key);
  }

  private reloadFunc: Function | null = null;
  public setReloadFunc(_func: Function) {
    this.reloadFunc = _func;
  }
  public async Reload() {
    await this.Init();
    this.reloadFunc?.(this);
  }

  //显示的列.
  public Columns: Array<Record<string, any>> = [];

  /**
   * 构造方法
   * @param clsId 类的ID.
   */
  protected constructor(clsId) {
    this.ClassID = clsId;
  }

  //初始化数据.
  abstract Init();

  //赋值.
  public SetVal(d1: string, d2: string, d3: string, val: string | number) {
    const result = {};
    result[this.D1Src.rowKey] = d1;
    result[this.D2Src.rowKey] = d2;
    result[this.D3Src.rowKey] = d3;
    result[this.RowValKey] = val;
    return result;
  }
  //获得值.
  public GetValByD(_d1: string, _d2: string, _d3: string) {
    if (this.WorkType == Rpt3DWorkType.Left) {
      const record = this.TableData.find((item) => item[this.D1Src.rowKey + 'Key'] === _d1 && item[this.D2Src.rowKey + 'Key'] === _d2);
      if (!!record) return record[_d3 + '_' + this.RowValKey];
      return null;
    }

    if (this.WorkType == Rpt3DWorkType.Top) {
      //需要确定查询的行
      const index = this.D3Src.list.findIndex((item) => item.No === _d3);
      if (index === -1) {
        message.error('在三维的集合中没有找到值为[' + _d3 + ']的数据');
        return null;
      }
      const record = this.TableData[index];
      return record[_d1 + '_' + _d2 + '_' + this.RowValKey];
    }
    return null;
  }
  //获得值.
  public GetValByIdx(_rowIdx: number, _colIdx: number) {
    if (_rowIdx > this.TableData.length - 1) {
      message.error('没有找到行[' + _rowIdx + ']的数据');
      return null;
    }
    const record = this.TableData[_rowIdx];
    if (this.WorkType == Rpt3DWorkType.Left) {
      const en = this.D3Src.list.find((item, index) => index == _colIdx);
      if (!!en) return record[en.No + '_' + this.RowValKey];
      message.error('行[' + _rowIdx + '],列[' + _colIdx + ']没有找到值');
    }
    if (this.WorkType == Rpt3DWorkType.Top) {
      const keys = Object.keys(record);
      if (_colIdx * 2 + 2 > keys.length - 1) {
        message.error('行[' + _rowIdx + '],列[' + _colIdx + ']没有找到值');
        return null;
      }
      return record[keys[_colIdx * 2 + 2]];
    }
    return null;
  }

  //焦点移动,并且数值变化.
  abstract CellOnBlur(_object: Record<string, any>, _d1?: string, _d2?: string, _d3?: string, _val?: string, _valOld?: string, _rowIdx?: number, _colIdx?: number);

  /** 按钮点击事件 */
  abstract BtnClick(_btnName: string, _record: Record<string, any>, _d1?: string, _d2?: string, _d3?: string, _rowIdx?: number, _colIdx?: number);
}
