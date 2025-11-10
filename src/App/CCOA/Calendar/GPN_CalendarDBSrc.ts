import { CalendarDBSrc } from './CalendarDBSrc';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { SFSearchs } from '/@/WF/Admin/FrmLogic/SFSearch/SFSearch';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_CalendarDBSrc extends PageBaseGroupNew {
  constructor() {
    super('GPN_CalendarDBSrc');
    this.PageTitle = '新建任务'; //实体名称.
    this.ForEntityClassID = 'TS.CCOA.CalendarDBSrc';
  }
  public async GeneYears() {
    return JSON.stringify([
      { No: '2024', Name: '2024' },
      { No: '2025', Name: '2025' },
      { No: '2026', Name: '2026' },
      { No: '2027', Name: '2027' },
    ]);
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '选择方式');
    this.SelectItemsByList('Task', '选择查询', this.HelpTodo, false, new SFSearchs()); // 写sql
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts() {
    return Promise.resolve([]);
  }
  /**
   * @author
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const en = new CalendarDBSrc();
    en.Name = tb2;
    en.SearchNo = tb1;
    en.SearchName = tb2;

    await en.Insert();
    return new GPNReturnObj(GPNReturnType.Close);
    // return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.CCOA.CalendarDBSrc', en.MyPK));
  }
}
