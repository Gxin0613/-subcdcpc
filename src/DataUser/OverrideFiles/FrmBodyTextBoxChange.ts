/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 1. 事件类: 当文字变化的时候.
 */
export class FrmBodyTextBoxChange {
  constructor() {}

  /**
   * 文本框变化后事件.
   * @param pkval 主表的主键值
   * @param frmID 从表的ID.
   * @param attrKey 字段名
   * @param bodyJson 主表的输入的数据.
   * @returns null;
   */
  public static async OnChange(pkval: number, frmID: string, attrKey: string, rowData: Record<string, any>) {
    if (frmID == 'Dict_Student' && attrKey == 'SLSX') {
      return;
    }
    return null; //如果ruturn null, 或者返回 不是结果集，就不要更新.
  }
  /**
   * 设置控件值.
   * @param rowID 从表的OID
   * @param attrKey 要设置的字段.
   * @param val 设置的值.
   * @returns 设置成功与失败.
   */
  public static SetTextBoxVal(rowData: Record<string, any>, attrKey: string, val: string) {
    rowData[attrKey] = val;
  }
  /**
   * 获得指定行的执行字段的值.
   * @param rowID 从表的OID
   * @param attrKey 字段属性
   * @returns 字段的值.
   */
  public static GetTextBoxVal(rowData: Record<string, any>, attrKey: string) {
    return rowData[attrKey];
  }
}
