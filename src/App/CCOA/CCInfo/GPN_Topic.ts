import { Info } from './Info';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_Topic extends PageBaseGroupNew {
  constructor() {
    super('GPN_Topic');
    this.PageTitle = '新建专题';
    this.ForEntityClassID = 'TS.CCOA.CCInfo.Topic';
  }
  public Init() {
    this.AddGroup('A', '输入专题');
    // this.TextBox2_NameNote('TopicTitle', '专题名称', this.Desc1, '专题名称', '提示词');
    this.Table('Topic', '确认文章标题内容', this.HelpTodo, true, this.GenerDtls);
  }
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public async GenerDtls() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    const Words = this.RequestVal('tb1', 'Topic');
    handler.AddPara('Words', Words);
    const data: any = await handler.DoMethodReturnString('Info_GenerInfos');
    if (data.includes('err@') == true) {
      alert(data);
      return null;
    }
    return JSON.stringify(data);
  }
  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageNo == 'Topic') {
      //0. 把生成的内容插入到数据库.
      const strs = _tb2.split(',');
      for (let index = 0; index < strs.length; index++) {
        const str = strs[index];
        const info = new Info();
        info.Name = str;
        info.TopicNo = this.RefPKVal;
        await info.Insert();
      }
      return new GPNReturnObj(GPNReturnType.Message, '插入成功.');
    }
  }
  // 发票控件
  public readonly Desc1 = `
  #### 帮助
  - 专题是指生成一类的文章的统称, 首先通过专题生成标题列表.
  - 比如: 对工作流宣传的专题,

  #### Demo1:
  我想编写一批驰骋BPM，工作流引擎方面的软文，该软件的特点请搜集网络知识，要求标题具有一定的吸引人阅读。

  我想做关于驰骋低代码方面的软文，请你给我一些软文标题，要求能够吸引人去点击阅读，充满技术特征。

  #### Demo2:
  我想编写一批驰骋BPM，工作流引擎方面的软文，该软件的特点请搜集网络知识，要求标题具有一定的吸引人阅读。

    `;
}
