import { GloWF } from '../../GloWF';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFSearch } from './SFSearch';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_SFSearch extends PageBaseGroupNew {
  constructor() {
    super('GPN_SFSearch');
    this.ForEntityClassID = 'TS.FrmUI.SFSearch';
    this.PageTitle = '创建查询';
  }
  public Init() {
    this.AddGroup('A', '新建查询'); //增加分组.
    this.TextBox3_NameNoNote('Search', '创建查询', this.HelpSearch, 'S', '编号', '名称', '备注', '我的查询');
    //const sql = `SELECT No,Name FROM Sys_SFDBsrc `;
    this.SelectItemsByList('Search.DBSrc', '选择数据源', this.HelpSearch, false, GloWF.srcDBSrc);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (pageNo != 'Search.DBSrc') return;

    const en = new SFSearch();
    en.No = this.RequestVal('tb2', 'Search');
    if ((await en.IsExits()) == true) {
      return new GPNReturnObj(GPNReturnType.Error, '编号已经存在');
    }
    en.Name = this.RequestVal('tb1', 'Search');

    //数据源.
    en.FK_SFDBSrc = this.RequestVal('tb1', 'Search.DBSrc');
    // en.DBSrcType = pageNo;
    en.Remark = this.RequestVal('tb3', 'Search'); //备注.

    const dbsrc = new SFDBSrc(en.FK_SFDBSrc);
    await dbsrc.Retrieve();
    if (dbsrc.DBSrcType == 'Url' || dbsrc.DBSrcType == 'WebApi') {
      en.SetPara('EnName', 'TS.FrmUI.SFSearchWebApi');
      en.ConnString = dbsrc.ConnString;
    } else {
      en.SetPara('EnName', 'TS.FrmUI.SFSearchSQL');
    }
    await en.Insert();

    const url = '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public readonly HelpSearch = `
  #### 帮助
  - 查询与字典表不同，他需要参数据才能执行.
  #### 用到场景
  - 文本框自动完成, 级联下拉框、自动填充.
  `;
}
