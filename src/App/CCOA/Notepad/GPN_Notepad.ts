import { Notepad } from './Notepad';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_Notepad extends PageBaseGroupNew {
  constructor() {
    super('GPN_Notepad'); //实体的类名，以GPE_开头.
    this.PageTitle = '新建记事本'; //实体名称.
    // this.ForEntityClassID = 'TS.CCOA.NetDisk.FileDtl';
  }

  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '选择方式');
    this.TextArea('Docs', '内容', this.HelpTodo, '', '', '');
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts() {
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
    if (pageID === 'Docs') {
      const en = new Notepad();
      en.Name = tb1;
      en.Docs = tb1;
      await en.Insert();
    }
  }
}
