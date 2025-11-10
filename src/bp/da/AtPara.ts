// 前端重构
import { decodeExtraParams } from '/@/bp/tools/ParamUtils';
import { DataType } from '/@/bp/en/DataType';

export class AtPara {
  private readonly map: Map<any, any> = new Map<any, any>();

  get HisHT() {
    return this.map;
  }

  // 转换成字符串
  public GenerAtParaStrs() {
    if (this.map.size == 0) return '';
    return '@' + [...this.map].map((item) => `${item[0]}=${item[1]}`).join('@');
  }

  constructor(para = '') {
    if (!para) return;
    const map = decodeExtraParams(para);
    if (map) {
      this.map = map;
    }
  }

  public DelKey(key: string) {
    this.map.delete(key);
  }

  public SetVal(key: string, val: string) {
    this.map.set(key, val);
  }

  public GetValStrByKey(key: string) {
    return this.map.get(key);
  }

  public GetValIntByKey(key: string, isNullAsVal = 0) {
    const str = this.GetValStrByKey(key);
    return DataType.IsNullOrEmpty(str) ? isNullAsVal : parseInt(str);
  }

  // 这里应该用大整数
  public GetValInt64ByKey(key: string, isNullAsVal = 0) {
    const str = this.GetValStrByKey(key);
    return DataType.IsNullOrEmpty(str) ? isNullAsVal : BigInt(str);
  }

  // 获取boolean值
  public GetValBooleanByKey(key: string, isNullAsVal = false) {
    const str = this.GetValStrByKey(key);
    return DataType.IsNullOrEmpty(str) ? isNullAsVal : this.GetValIntByKey(key) != 0;
  }

  // 这里应该用大整数
  public GetValFloatByKey(key: string, isNullAsVal = 0) {
    const str = this.GetValStrByKey(key);
    try {
      return parseFloat(str);
    } catch (e) {
      return isNullAsVal;
    }
  }
}
