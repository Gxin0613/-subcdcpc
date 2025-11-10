import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import DBAccess from '/@/utils/gener/DBAccess';
export class GL_SearchLinkField extends PageBaseGenerList {
  constructor() {
    super('GL_SearchLinkField');
    this.PageTitle = '数据链接';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = ''; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = '';
    this.ShowIdx = true;
    // this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    // this.GroupFieldDefault = 'FlowName'; //分组字段.
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 100; // 分页的页面行数, 0不分页.
    const dbSrc = this.RequestVal('dbSrc');
    const data = await DBAccess.RunSQLReturnSearch(dbSrc);
    if (data.length > 0) {
      const row = data?.[0];
      const keys = Object.keys(row);
      const customCols: Recordable[] = [];
      for (const key of keys) {
        customCols.push({
          Key: key,
          Name: key,
          IsShow: true,
          DataType: 1,
          width: 150,
        });
      }
      this.Columns = customCols;
    }

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Data = data;
  }
  override LinkFieldClick(_object: Record<string, any>) {}
  async BtnClick(_btnName: string, _object: Record<string, any>) {}
}
