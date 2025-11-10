import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnType } from '../../UIEntity/PageBaseGroupNew';
export type DatePickerType = 'week' | 'month' | 'quarter' | 'year' | 'date';
export type DatePickerRangeType = `${DatePickerType}range`;
export type DateConfig = { type: DatePickerType; format: string };
export type DateTimeConfig = {
  type: 'datetime' | 'time';
  format: string;
  showTime: boolean;
};
// 属性
export class Attr {
  public MyFieldType: FieldType = FieldType.Normal;
  public MyDataType = 1;
  public Key = '';
  public Field = '';
  public Desc = '';
  public GroupName = ''; //分组信息.

  public _defaultVal: unknown = null;
  // 字段属性相关联的实体
  public relatedEns: Nullable<string> = null;
  public UIkeyRef: string | null = null;
  public BindEntityID = ''; // 绑定的实体ID,如果是外键则是外键实体ID.
  public LinkOpenType: GPNReturnType = GPNReturnType.OpenUrlByModal; //打开方式.
  public LinkUrl = ''; // 连接

  get IsDDL(): boolean {
    // 判断是不是下拉框
    return this.UIContralType == UIContralType.RadioBtn || this.UIContralType == UIContralType.DDL;
  }

  // 判断是不是外部数据源
  get IsDBSource(): boolean {
    return !!this.UIBindKey && this.UIContralType == UIContralType.DDL && this.MyDataType == DataType.AppString && FieldType.Normal === this.MyFieldType;
  }

  get IsDateField(): boolean {
    return this.MyDataType === DataType.AppDate || this.MyDataType === DataType.AppDateTime;
  }

  // 判断是否外键
  get IsFK(): boolean {
    return this.MyFieldType == FieldType.FK || this.MyFieldType == FieldType.PKFK;
  }

  get IsBoolean(): boolean {
    return this.MyDataType === DataType.AppBoolean;
  }

  // 是否为外键或者枚举值
  get IsFKorEnum(): boolean {
    return this.MyFieldType == FieldType.Enum || this.MyFieldType == FieldType.PKEnum || this.MyFieldType == FieldType.FK || this.MyFieldType == FieldType.PKFK;
  }

  // 是否为数字
  get IsNum(): boolean {
    const MyDataType = this.MyDataType;
    return [DataType.AppDouble, DataType.AppFloat, DataType.AppInt, DataType.AppMoney].includes(MyDataType) && this.MyFieldType == FieldType.Normal;
  }

  // 是否为枚举值
  get IsEnum(): boolean {
    return this.MyFieldType == FieldType.Enum || this.MyFieldType == FieldType.PKEnum;
  }

  // 是否为引用属性
  get IsRefAttr(): boolean {
    return this.MyFieldType == FieldType.RefText;
  }

  // 计算属性是不是PK
  get IsPK(): boolean {
    const MyFieldType = this.MyFieldType;
    return MyFieldType == FieldType.PK || MyFieldType == FieldType.PKFK || MyFieldType == FieldType.PKEnum;
  }

  // key是否与字段相等
  get IsKeyEqualField() {
    return this.Key === this.Field;
  }

  constructor() {}

  public HelperUrl: string | null = null;
  public DefValType = 0;
  get DefaultValOfReal(): unknown {
    if (this._defaultVal == null) return null;
    try {
      return JSON.stringify(this._defaultVal);
    } catch (error) {
      return '';
    }
  }

  set DefaultValOfReal(value: unknown) {
    this._defaultVal = value;
  }

  // 原文中defaultVal是object | null，但实际上object可能是js中 any的意思
  /// <summary>
  /// 字段默认值
  /// </summary>
  get DefaultVal(): unknown {
    switch (this.MyDataType) {
      case DataType.AppString:
        if (this._defaultVal == null) return '';
        return this._defaultVal;
      case DataType.AppInt:
        if (this._defaultVal == null) return 0;
        try {
          return parseInt(JSON.stringify(this._defaultVal));
        } catch {
          return 0;
          //throw new Exception("@设置["+this.Key+"]默认值出现错误，["+_defaultVal.ToString()+"]不能向 int 转换。");
        }
      case DataType.AppMoney:
        if (this._defaultVal == null) return 0;
        try {
          return parseFloat(JSON.stringify(this._defaultVal));
        } catch {
          return 0;
          //	throw new Exception("@设置["+this.Key+"]默认值出现错误，["+_defaultVal.ToString()+"]不能向 AppMoney 转换。");
        }
      case DataType.AppFloat:
        if (this._defaultVal == null) return 0;
        try {
          return parseFloat(JSON.stringify(this._defaultVal));
        } catch {
          return 0;
          //	throw new Exception("@设置["+this.Key+"]默认值出现错误，["+_defaultVal.ToString()+"]不能向 float 转换。");
        }

      case DataType.AppBoolean:
        if (this._defaultVal == null || !JSON.stringify(this._defaultVal)) return 0;
        try {
          return DataType.StringToBoolean(JSON.stringify(this._defaultVal)) ? 1 : 0;
        } catch {
          throw new Error('@设置[' + this.Key + ']默认值出现错误，[' + JSON.stringify(this._defaultVal) + ']不能向 bool 转换，请设置0/1。');
        }
      case DataType.AppDouble: //双精度.
        if (this._defaultVal == null) return 0;
        try {
          return parseFloat(JSON.stringify(this._defaultVal));
        } catch {
          throw new Error('@设置[' + this.Key + ']默认值出现错误，[' + JSON.stringify(this._defaultVal) + ']不能向 double 转换。');
        }

      case DataType.AppDate:
        if (this._defaultVal == null) return '';
        break;
      case DataType.AppDateTime:
        if (this._defaultVal == null) return '';
        break;
      case DataType.AppImageUpload:
        if (this._defaultVal == null) return '';
        break;
      case DataType.AppMakeImage:
        if (this._defaultVal == null) return '';
        break;
      default:
        throw new Error('@bulider insert sql error: 没有这个数据类型，字段名称:' + this.Desc + ' 英文:' + this.Key);
    }
    return this._defaultVal;
  }

  // unknown number / string / {}
  set DefaultVal(value: unknown) {
    this._defaultVal = value;
  }

  /// <summary>
  /// 数据类型。
  /// </summary>

  get MyDataTypeStr(): string {
    return DataType.GetDataTypeDese(this.MyDataType || -1);
  }

  get HisFKEns() {
    if (this.UIBindKey?.includes(',')) {
      const args = this.UIBindKey?.split(',');
      return args[args.length - 1];
    }
    return null;
  }

  // 最大长度
  public MaxLength = 50;
  /// 最小长度
  public MinLength = 0;
  public UIWidth = 100;
  public UIHeight = 23;
  public UIVisible: boolean | number = true;
  public UIIsLine = false;
  public UIIsReadonly = true;
  public UIContralType: UIContralType = UIContralType.TB;
  public UIBindKey: string | null = null;
  public IsSupperText = 0; //是否大文本，还解析了日期格式,这个地方需要修改.
  public Precision = 2; // 如果是浮点数或者金额，默认保留两位小数

  get UIIsDoc(): boolean {
    return this.UIHeight != 0 && this.UIContralType == UIContralType.TB;
  }

  // private _HisFKEn: Entity | null = null;

  // get HisFKEn() {
  //   return this.HisFKEns.GetNewEntity;
  // }
  // private _HisFKEns: Entities | null = null;
  // get HisFKEns(): Entities | null {
  //   if (this._HisFKEns == null) {
  //     if (this.MyFieldType == FieldType.Enum || this.MyFieldType == FieldType.PKEnum) {
  //       return null;
  //     } else if (this.MyFieldType == FieldType.FK || this.MyFieldType == FieldType.PKFK) {
  //       if (this.UIBindKey.Contains('.')) _HisFKEns = await ClassFactory.GetEns(this.UIBindKey);
  //       else _HisFKEns = new GENoNames(this.UIBindKey, this.Desc); // await ClassFactory.GetEns(this.UIBindKey);
  //     } else {
  //       return null;
  //     }
  //   }
  //   return _HisFKEns;
  // }

  /// 它关联的ens.这个只有在,这个属性是fk, 时有效。
  public UIRefKeyValue: string | null = null;
  /// 关联的实体val-key
  public UIRefKeyText: string | null = null;
  public UITag: string | null = null;
  // 日期字段处理
  public DateConfig: DateConfig | null = null;
  public DateTimeConfig: DateTimeConfig | null = null;
}
