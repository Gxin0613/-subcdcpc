/**
 * 低代码实体的查询中个性化处理函数
 */
export class SearchBillExt {
  constructor() {}

  /**
   * 字段格式化,格式化后是文字时使用Text@标识，超链接的使用Href@
   * @param _frmID 实体表单编号
   * @param _key 字段编码
   * @param _row 行数据
   * @constructor
   */
  public static ForamtFunc(_frmID: string, _key: string, _row: Record<string, any>) {
    if (_frmID === 'Bill_CeShi') {
      if (_key == 'BillNo') return 'Text@测试文本';
      if (_key == 'CeShi') return 'Href@http://localhost:3000/#/WF/MyFlow?FK_Flow=022';
      return _row[_key];
    }
  }
}
