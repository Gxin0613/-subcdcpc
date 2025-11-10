import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { Stock1 as Stock } from './Stock1';

export class GPN_Judge extends PageBaseGroupNew {
  constructor() {
    super('GPN_Judge'); //实体的类名，以GPE_开头.
    this.PageTitle = '新建推断'; //实体名称.
    this.ForEntityClassID = 'TS.Demo.Stock';
  }
  public async getZZMM() {
    return JSON.stringify([
      { No: '0', Name: '平均数模型' },
      { No: '1', Name: '离线系数模型' },
    ]);
  }
  public async Stock() {
    return JSON.stringify([
      { No: '688', Name: '688' },
      { No: '400', Name: '400' },
    ]);
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '选择方式');

    this.TextBox2_NameNo('NoName', '输入推断名称', this.HelpTodo, '', '编号', '名称', '');
    this.SelectItemsByList('NoName.Model', '推断模式', this.HelpTodo, false, this.getZZMM); // 写方法
    this.SelectItemsByList('NoName.Model.Stock', '选择股票', this.HelpTodo, false, this.Stock); // 写方法
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts() {
    // const ens = new Sorts();
    // await ens.RetrieveAll();
    // return ens;
    return Promise.resolve([]);
  }
  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    //如果是专业或者极简模式.
    if (pageID === 'NoName') {
      const no = tb2; //第2个文本框.
      const stu = new Stock(no);
      if ((await stu.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + no + '],已经存在.');
      }
    }

    if (pageID === 'NoName.Model.Stock') {
      const no = this.RequestVal('tb2', 'NoName'); //第2个文本框.
      const name = this.RequestVal('tb1', 'NoName'); //第1个文本框.
      const stu = new Stock(no);
      stu.Name = name;
      stu.No = no;
      stu.StockNo = tb1; //股票编号.
      await stu.DirectInsert(); //插入到系统.
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.Demo.Stock', no));
    }
  }
}
