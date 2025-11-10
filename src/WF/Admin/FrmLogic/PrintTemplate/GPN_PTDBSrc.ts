import { message } from 'ant-design-vue';
import { GloWF } from '../../GloWF';
import { PTDBSrc, PTDBSrcs } from './PTDBSrc';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_PTDBSrc extends PageBaseGroupNew {
  constructor() {
    super('GPN_PTDBSrc');
    this.PageTitle = '打印数据源';
    this.ForEntityClassID = 'TS.Sys.Printer.PTDBSrc';
  }

  public async Init() {
    this.AddGroup('A', '打印数据源', 'icon-print'); //增加分组.

    this.SelectItemsByGroupList('Bill', '单据', this.HelpBillEntity, false, GloWF.srcFrmTree, GloWF.srcFrmListOfBill);
    this.SelectItemsByGroupList('EntityNoName', '实体', this.HelpBillEntity, false, GloWF.srcFrmTree, GloWF.srcFrmEntityNoName);
    this.SelectItemsByGroupList('Search', '查询', this.HelpBillEntity, false, GloWF.srcDBSrc, GloWF.srcDBSFSearch);

    const sql = ` SELECT No,Name,Tel,Email FROM Port_Emp WHERE FK_Dept='@DeptNo' `;
    this.AddGroup('B', '自定义数据源', 'icon-print'); //增加分组.
    this.TextBox2_NameNo('SQLTable', '自定义主表SQL', this.HelpTodo, 'SQLTable_', '输入编号', '输入名称', '我的SQL');
    this.TextSQL('SQLTable.Doc', 'SQL内容', this.SQLDoc, '输入支持ccbpm表达式的SQL', sql, '参考帮助输入SQL');

    this.TextBox2_NameNo('SQLDtl', '自定义从表SQL', this.SQLDoc, 'SQLDtl_', '输入编号', '输入名称', '我的SQL');
    this.TextSQL('SQLDtl.Doc', 'SQL内容', this.SQLDoc, '输入支持ccbpm表达式的SQL', sql, '参考帮助输入SQL');

    this.AddGroup('C', '其他数据源', 'icon-print'); //增加分组.
    this.TextBox2_NameNo('Picture', '插入图片', this.HelpTodo, 'SQL_', '输入编号', '输入名称', '我的SQL');
    this.TextBox1_Name('Picture.Url', '路径', this.Picture, '图片路径', '参考帮助');

    this.TextBox2_NameNo('Chart', '插入饼图', this.HelpTodo, 'SQL_', '输入编号', '输入名称', '我的SQL');
    this.TextSQL('Chart.Doc', '饼图SQL表达式', this.SQLDoc, '输入支持ccbpm表达式的SQL', sql, '参考帮助输入SQL');

    this.AddGroup('D', '新建查询', 'icon-print'); //增加分组.
    this.AddGoToUrl('NewSearch', '新建查询', '');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(_pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    const enSrc = new PTDBSrc();
    enSrc.DBTypeID = _pageNo;
    enSrc.DBTypeName = this.GetPageName(_pageNo);
    enSrc.FrmPrintTemplateID = this.RefPKVal;

    //单据实体.
    if (_pageNo === 'Bill' || _pageNo == 'EntityNoName') {
      enSrc.RefFrmID = _tb1;
      enSrc.RefFrmName = _tb2;
      enSrc.SetPara('EnName', 'TS.Sys.Printer.PTDBSrcBill');
      const ensrcs = new PTDBSrcs();
      await ensrcs.Retrieve('FrmPrintTemplateID', enSrc.FrmPrintTemplateID, 'RefFrmID', enSrc.RefFrmID);
      if (ensrcs.length > 0) {
        message.error('此数据源已存在');
        return new GPNReturnObj(GPNReturnType.DoNothing);
      }
      await enSrc.Insert();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enSrc.GetParaString('EnName'), enSrc.MyPK));
    }
    //查询.
    if (_pageNo === 'Search') {
      enSrc.RefFrmID = _tb1;
      enSrc.RefFrmName = _tb2;
      enSrc.SetPara('EnName', 'TS.Sys.Printer.PTDBSrcSearch');
      await enSrc.Insert();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enSrc.GetParaString('EnName'), enSrc.MyPK));
    }

    //SQL.
    if (_pageNo === 'SQLTable.Doc' || _pageNo == 'SQLDtl.Doc') {
      const pageID = _pageNo.substring(0, _pageNo.indexOf('.'));
      enSrc.DBTypeID = pageID;
      enSrc.DBTypeName = this.GetPageName(pageID);

      enSrc.DBSrc = _tb1; //数据源.
      enSrc.SQLSelect = _tb2; //查询.

      enSrc.SetPara('EnName', 'TS.Sys.Printer.PTDBSrcSQL');
      await enSrc.Insert();
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enSrc.GetParaString('EnName'), enSrc.MyPK));
    }
  }
  // 本机导入说明
  public readonly HelpBillEntity = `
    #### 帮助 
    - 主表的单据
    - 未完成
     
          `;

  // 本机导入说明
  public readonly SQLDoc = `
  #### 帮助 
   - 支持内置表达式, @WebUser.*, 是当前登录人员信息: @WebUser.No 登录账号, @WebUser.Name 名称, @WebUser.DeptNo 部门账号,  
   - 比如： SELECT No,Name,Tel,Email FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
   - 支持表单主表数据表达式.
   - 比如：表单主表有@XXX字段, 编写SQL可以使用 SELECT ZZ,AA,BB FROM IIII WHERE OID=@XXX  
        `;
  //图片路径
  public readonly Picture = `
  #### 帮助
   - 输入基于DataUser作为根目录的文件路径.
  `;
}
