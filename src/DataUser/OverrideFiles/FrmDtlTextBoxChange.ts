import { CommonConfig } from "/@/DataUser/OverrideFiles/CommonConfig";

/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 1. 事件类: 当文字变化的时候.
 */
export class FrmDtlTextBoxChange {
  constructor() {}

  /**
   * 文本框变化后事件.
   * @param pkval 主表的主键值
   * @param dtlEnName 从表的ID.
   * @param dtlOID 从表的行OID
   * @param fieldName 字段名
   * @param bodyJson 主表的输入的数据.
   * @returns 返回执行的数据;
   */
  public static async TextBoxChange(pkval: number, dtlEnName: string, dtlOID: number, attrKey: string, rowData: Record<string, any>, tableData: any[]) {
    return null; //如果ruturn null, 或者返回 不是结果集，就不要更新.
  }
  public static async Blur(pkval: number, dtlEnName: string, dtlOID: number, attrKey: string, rowData: Record<string, any>, tableData: any[]) {
    if (dtlEnName == 'ND101Dtl1' && (attrKey == 'SLXX' || attrKey == 'SLSX')) {
      //获得批次ID.
      const batchID = FrmDtlTextBoxChange.GetTextBoxVal(rowData, 'BatchID');

      const textVal = FrmDtlTextBoxChange.GetTextBoxVal(rowData, attrKey); //获得输入的值.
      tableData.forEach((item) => {
        if (item['BatchID'] === batchID && item['OID'] != dtlOID) {
          FrmDtlTextBoxChange.SetTextBoxVal(item, attrKey, textVal); //设置输入的值.
        }
      });
      return tableData;
    }
    if (CommonConfig.IsGZFrm) {
      //预期收入/合同金额=预期占比
      if (dtlEnName == 'HeTongShouFeiTiaoKua') {

      }
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
