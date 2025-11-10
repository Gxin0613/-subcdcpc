import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import DBAccess from '/@/utils/gener/DBAccess';
import { AutoTask } from './AutoTask';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_AutoTask extends PageBaseGroupNew {
  constructor() {
    super('GPN_AutoTask');
    this.ForEntityClassID = 'TS.Sys.AutoTask';
    this.PageTitle = '自动任务';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '新建任务');

    this.TextBox1_Name('SQL', 'SQL或存储过程', this.DescHelp, '输入任务名称', '自动任务', '给任务起一个名字');
    this.SelectItemsByList('BuessUnit', '业务单元-BuessUnit', this.HelpTodo, false, await this.GenerBuessUnit());
    this.SelectItemsByList('Method', '系统工具-Method', this.HelpTodo, false, await this.GenerMethod());
    // this.SelectItemsByGroupList('1', '选择字段列', this.DescHelp, true, await this.GenerGroups(), await this.GenerAttrs(), false, 'ShowCols');
  }
  public async GenerMethod() {
    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    const data: any = await handler.DoMethodReturnJson('MethodLink_Init');
    return JSON.stringify(data);
  }
  public async GenerBuessUnit() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionDtl_Init');
    return JSON.stringify(data);
  }
  public async GenerSorts(): Promise<any> {
    return Promise.resolve(JSON.stringify([]));
  }
  public override async Save_TextBox_X(_pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    const en = new AutoTask();
    en.MyPK = DBAccess.GenerGUID();
    en.TaskModel = _pageNo; //任务类型.

    if (_pageNo == 'SQL') {
      en.TaskName = _tb1;
      en.Docs = '请输入SQL语句或者存储过程.';
      en.SetPara('EnName', 'TS.Sys.AutoTaskSQL');
    }

    if (_pageNo == 'BuessUnit' || _pageNo == 'Method') {
      en.TaskName = _tb2;
      en.Docs = _tb1;
      en.SetPara('EnName', 'TS.Sys.AutoTaskBU');
    }
    await en.Insert();
    message.info('设置成功.');

    const enName = en.GetParaString('EnName');
    const url = GloComm.UrlEnOnly(enName, en.MyPK);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public readonly DescHelp = `
  #### 帮助
  - 选择要显示的列.
  - 系统列出的是所有可以显示的列.
  `;
}
