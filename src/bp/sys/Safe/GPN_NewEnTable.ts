import WebUser from '../../web/WebUser';
import { EnTable } from './EnTable';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';

export class GPN_NewEnTable extends PageBaseGroupNew {
  constructor() {
    super('GPN_NewEnTable');
    this.PageTitle = '新建EnTable';
    this.ForEntityClassID = 'TS.Sys.EnTable';
  }

  public async Init() {
    //数据源.
    // const srcOfList = 'SELECT No,Name FROM Sys_SFDBSrc WHERE ';
    //  this.SelectItemsByList('DBSrc', '数据源', '选择数据源', false, srcOfList);
    this.SelectItemsByList('Table', '表', '请选择表', false, this.DBSrc_GenerTables);
    // this.SelectItemsByList('DBSrc.Table.PKField', '表的主键', this.DBSrcTable, false, this.DBSrc_GenerTable_PKField, true, true);
    // this.SelectItemsByList('DBSrc.Table.PKField.Fields', '要同步的字段', this.DBSrcTable, true, this.DBSrc_GenerTable_PKField, true, true);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  private async DBSrc_GenerTables() {
    //获得指定页面的参数. .
    const dbSrcNo = 'local'; //this.RequestVal('tb1', 'DBSrc');
    const sfDBSrc = new BSEntity('BP.Sys.SFDBSrc', dbSrcNo);
    await sfDBSrc.Retrieve();
    const result = await sfDBSrc.DoMethodReturnJSON('GetTablesJson');

    //如何去掉: NDTrack,WF_,Frm_,Port_,Sys_,GPM_ 开头的表？
    return JSON.stringify(result);
  }
  // private async DBSrc_GenerTable_PKField() {
  //   const dbSrcNo = this.RequestVal('tb1', 'DBSrc');
  //   const table = this.RequestVal('tb1', 'DBSrc.Table');
  //   const sfDBSrc = new BSEntity('BP.Sys.SFDBSrc', dbSrcNo);
  //   await sfDBSrc.Retrieve();
  //   const result = await sfDBSrc.DoMethodReturnJSON('GetTableFieldsJson', table);
  //   return JSON.stringify(result);
  // }
  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageNo == 'Table') {
      const en = new EnTable();
      en.No = 'EnTable_' + _tb1;
      en.Name = _tb1;
      en.TableName = _tb1;
      en.OrgNo = WebUser.OrgNo;
      await en.Insert();
      alert('增加成功.');
      // alert('没有判断的页面类型:[' + pageNo + ']');
      return;
    }
  }
}
