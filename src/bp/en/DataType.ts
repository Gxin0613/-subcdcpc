import WebUser from '../web/WebUser';
import { GloWF } from '/@/WF/Admin/GloWF';
export class DataType {
  static AppString = 1;
  // int
  static AppInt = 2;
  // float
  // todo 和double 都解析为  浮点数
  static AppFloat = 3;
  // AppBoolean
  static AppBoolean = 4;
  // AppDouble
  static AppDouble = 5;
  // AppDate
  static AppDate = 6;
  // AppDateTime
  static AppDateTime = 7;
  // AppMoney
  // todo 解析为 x.00 格式
  static AppMoney = 8;
  // AppImageUpload 上传头像
  static AppImageUpload = 9;
  // AppMakeImage 上传头像
  static AppMakeImage = 10;

  // string 转 boolean
  static StringToBoolean(str: string): boolean {
    if (str == null || str == '' || str == ',nbsp;') return false;
    if (str == '0' || str == '1') {
      return str != '0';
    } else if (str == 'true' || str == 'false') {
      return str != 'false';
    } else if (str == '是' || str == '否') {
      return str != '否';
    } else throw new Error('@要转换的[' + str + ']不是bool 类型');
  }

  static TurnEnumStrToAttr(str: string) {
    //@拼接枚举
    // const str = '@0=按照模版的表单编号导入1@1=按照模版的表单编号导入2@2=按照模版的表单编号导入3';
    const json = GloWF.AtParaStringToJson(str);
    const jsonKeys = Object.keys(json);
    const list: { No: string; Name: string }[] = [];
    for (const key of jsonKeys) {
      list.push({
        No: key,
        Name: json[key],
      });
    }
    return JSON.stringify(list);
  }

  // 判空
  static IsNullOrEmpty(s: string) {
    return s == null || s === '' || s === 'null' || s === 'undefined';
  }

  static get CurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
    const date = now.getDate() >= 10 ? now.getDate() : `0${now.getDate()}`;
    return `${year}-${month}-${date}`;
  }
  static get CurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
    const date = now.getDate() >= 10 ? now.getDate() : `0${now.getDate()}`;
    const hour = now.getHours() >= 10 ? now.getHours() : `0${now.getHours()}`;
    const minutes = now.getMinutes() >= 10 ? now.getMinutes() : `0${now.getMinutes()}`;
    return `${year}-${month}-${date} ${hour}:${minutes}`;
  }
  static get CurrentDateTimes() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
    const date = now.getDate() >= 10 ? now.getDate() : `0${now.getDate()}`;
    const hour = now.getHours() >= 10 ? now.getHours() : `0${now.getHours()}`;
    const minutes = now.getMinutes() >= 10 ? now.getMinutes() : `0${now.getMinutes()}`;
    const seconds = now.getSeconds() >= 10 ? now.getSeconds() : `0${now.getSeconds()}`;
    return `${year}-${month}-${date} ${hour}:${minutes}:${seconds}`;
  }

  static GetDataTypeDese(dataType: number): string {
    if (WebUser.SysLang == 'CH') {
      switch (dataType) {
        case DataType.AppBoolean:
          return '布尔(Int)';
        case DataType.AppDate:
          return '日期nvarchar';
        case DataType.AppDateTime:
          return '日期时间nvarchar';
        case DataType.AppDouble:
          return '双精度(double)';
        case DataType.AppFloat:
          return '浮点(float)';
        case DataType.AppInt:
          return '整型(int)';
        case DataType.AppMoney:
          return '货币(float)';
        case DataType.AppString:
          return '字符(nvarchar)';
        default:
          throw new Error('@没有此类型');
      }
    }
    switch (dataType) {
      case DataType.AppBoolean:
        return 'Boolean';
      case DataType.AppDate:
        return 'Date';
      case DataType.AppDateTime:
        return 'Datetime';
      case DataType.AppDouble:
        return 'Double';
      case DataType.AppFloat:
        return 'Float';
      case DataType.AppInt:
        return 'Int';
      case DataType.AppMoney:
        return 'Money';
      case DataType.AppString:
        return 'Nvarchar';
      default:
        throw new Error('@没有此类型');
    }
  }
}
