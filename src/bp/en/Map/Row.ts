import { DataType } from '/@/bp/en/DataType';
// import BigNumber from 'bignumber.js';
import { Attrs } from './Attrs';
import { type Attr } from './Attr';
import WebUser from '../../web/WebUser';
import dayjs from 'dayjs';

export class Row extends Map<string, any> {
  constructor(_row: Record<string, any> = {}) {
    super(Object.entries(_row));
  }

  LoadObject(_row: Record<string, any>) {
    for (const [key, value] of Object.entries(_row)) {
      this.set(key, value);
    }
  }

  setOrReplaceString(attr: Attr) {
    switch (attr.DefaultVal) {
      case '@WebUser.No':
      case '@CurrWorker':
        this.set(attr.Key, WebUser.No);
        break;
      case '@WebUser.Name':
        this.set(attr.Key, WebUser.Name);
        break;
      case '@WebUser.DeptNo':
        this.set(attr.Key, WebUser.DeptNo);
        break;
      case '@WebUser.DeptName':
        this.set(attr.Key, WebUser.DeptName);
        break;
      case '@WebUser.DeptNoNameOfFull':
      case '@WebUser.DeptNoFullName':
        this.set(attr.Key, WebUser.DeptNoNameOfFull);
        break;
      case '@WebUser.OrgNo':
        this.set(attr.Key, WebUser.OrgNo);
        break;
      case '@WebUser.OrgName':
        this.set(attr.Key, WebUser.OrgName);
        break;
      case '@WebUser.Roles':
        this.set(attr.Key, WebUser.Roles);
        break;
      case '@RDT':
        let format = 'YYYY-MM-DD';
        if (attr.MyDataType === DataType.AppDateTime) format = attr?.DateTimeConfig?.format || 'YYYY-MM-DD HH:mm';
        if (attr.MyDataType === DataType.AppDate) format = attr?.DateConfig?.format || 'YYYY-MM-DD';
        this.set(attr.Key, dayjs().format(format));
        break;
      default:
        this.set(attr.Key, attr.DefaultVal);
        break;
    }
  }

  setOrReplaceDate(attr: Attr) {
    if (attr.DefaultVal === '@RDT') {
      let format = 'YYYY-MM-DD';
      if (attr.MyDataType === DataType.AppDateTime) format = attr?.DateTimeConfig?.format || 'YYYY-MM-DD HH:mm';
      if (attr.MyDataType === DataType.AppDate) format = attr?.DateConfig?.format || 'YYYY-MM-DD';
      this.set(attr.Key, dayjs().format(format));
    } else {
      this.set(attr.Key, attr.DefaultVal);
    }
  }

  /// 初始化数据.
  LoadAttrs(attrs: Attrs) {
    for (const attr of attrs) {
      switch (attr.MyDataType) {
        case DataType.AppInt:
          this.set(attr.Key, parseInt(JSON.stringify(attr.DefaultVal)));
          break;
        case DataType.AppFloat:
        case DataType.AppMoney:
        case DataType.AppDouble:
          this.set(attr.Key, parseFloat(JSON.stringify(attr.DefaultVal)));
          break;
        case DataType.AppDate:
        case DataType.AppDateTime:
          this.setOrReplaceDate(attr);
          break;
        case DataType.AppString:
          this.setOrReplaceString(attr);
          break;
        default:
          this.set(attr.Key, attr.DefaultVal);
          break;
      }
    }
  }

  /// <summary>
  /// 设置一个值by key .
  /// </summary>
  /// <param name="key"></param>
  /// <param name="val"></param>
  SetValByKey(key: string, val: unknown) {
    if (!key) {
      return;
    }
    this.set(key, val);
  }

  public GetValStrByKey(key: string) {
    return JSON.stringify(this.get(key));
  }

  public GetValByKey(key: string) {
    return this.get(key);
  }

  // map => json
  public ToJson() {
    return Object.entries(this);
  }
}
