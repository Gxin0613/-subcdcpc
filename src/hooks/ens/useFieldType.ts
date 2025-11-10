import { Attr } from '/@/bp/en/Map/Attr';
import { DataType } from '/@/bp/en/DataType';
import { FieldType, UIContralType } from '/@/bp/en/EnumLab';

// 判断文本框类型
export default function useFieldType() {
  // boolean
  const isBoolean = (attr: Attr) => attr.MyDataType === DataType.AppBoolean && (attr.MyFieldType === FieldType.Normal || attr.UIContralType === UIContralType.CheckBok);
  // 下拉框
  const isDDL = (attr: Attr) => attr.UIContralType === UIContralType.DDL;

  // Pop弹窗
  const isPopText = (attr: Attr) => attr.MyDataType === DataType.AppString && attr.UIContralType === UIContralType.TB;
  // 日期类型
  const isDate = (attr: Attr) => attr.MyDataType === DataType.AppDate && (attr.MyFieldType === FieldType.Normal || attr.UIContralType === UIContralType.TB);
  // 日期时间类型
  const isDateTime = (attr: Attr) => attr.MyDataType === DataType.AppDateTime && (attr.MyFieldType === FieldType.Normal || attr.UIContralType === UIContralType.TB);
  // 整数类型
  const isInt = (attr: Attr) => DataType.AppInt === attr.MyDataType && (attr.MyFieldType === FieldType.Normal || attr.MyFieldType === FieldType.PK);
  // 浮点数类型
  const isFloat = (attr: Attr) => [DataType.AppDouble, DataType.AppFloat].includes(attr.MyDataType) && (attr.MyFieldType === FieldType.Normal || attr.MyFieldType === FieldType.PK);
  // 数字类型
  const isNumber = (attr: Attr) =>
    [DataType.AppDouble, DataType.AppFloat, DataType.AppInt].includes(attr.MyDataType) && (attr.MyFieldType === FieldType.Normal || attr.MyFieldType === FieldType.PK);

  const isNumType = (attr: Attr) => [DataType.AppDouble, DataType.AppFloat, DataType.AppInt, DataType.AppMoney].includes(attr.MyDataType);
  // 金额类型
  const isMoney = (attr: Attr) => attr.MyDataType === DataType.AppMoney && attr.MyFieldType === FieldType.Normal;

  // 文本框类型
  const isTextBox = (attr: Attr) => {
    return !isPopTextArea(attr) && attr.MyDataType === DataType.AppString && attr.UIContralType === UIContralType.TB && [FieldType.Normal, FieldType.PK].includes(attr.MyFieldType);
  };

  // 文本段落
  const isTextArea = (attr: Attr) => {
    return !isPopTextArea(attr) && attr.MyDataType === DataType.AppString && attr.MyFieldType === FieldType.Normal && attr.UIContralType === UIContralType.TB && attr.UIHeight > 23;
  };

  // 富文本组件
  const isRichText = (attr: Attr) => attr.MyDataType === DataType.AppString && attr.MyFieldType === FieldType.Normal && attr.UIContralType === UIContralType.FrmHtml;
  // 文本弹出框
  const isPopTextArea = (attr: Attr) => {
    return Array.isArray(attr['mapExt']) && attr['mapExt'].find((ext) => ext.ExtModel == 'Pop');
  };

  // 单选按钮
  const isRadioButton = (attr: Attr) => attr.MyDataType === DataType.AppInt && attr.MyFieldType === FieldType.Enum && attr.UIContralType === UIContralType.RadioBtn;
  // 复选框
  const isCheckbox = (attr: Attr) => attr.MyDataType === DataType.AppString && attr.MyFieldType === FieldType.Enum && attr.UIContralType === UIContralType.CheckBok;
  // 连接
  const isLink = (attr: Attr) => attr.MyDataType === DataType.AppString && attr.UIContralType === UIContralType.HyperLink;
  //枚举单选
  const isEnumSingle = (attr: Attr & any) => attr.MyDataType === DataType.AppInt && attr.LGType === 1 && [UIContralType.RadioBtn, UIContralType.DDL].includes(attr.UIContralType);
  //枚举多选
  const isEnumCheckbox = (attr: Attr & any) => attr.MyDataType === DataType.AppString && attr.LGType === 1 && attr.UIContralType === UIContralType.CheckBok;
  //单附件类型
  const isSingleAth = (attr: Attr) => attr.MyDataType === DataType.AppString && attr.UIContralType == UIContralType.AthShow;
  //手写签字版
  const isHandWriting = (attr: Attr) => attr.MyDataType === DataType.AppString && attr.UIContralType === UIContralType.HandWriting;
  return {
    isBoolean,
    isDDL,
    isDate,
    isDateTime,
    isInt,
    isNumber,
    isFloat,
    isMoney,
    isTextBox,
    isTextArea,
    isRichText,
    isPopTextArea,
    isRadioButton,
    isSingleAth,
    isEnumSingle,
    isEnumCheckbox,
    isPopText,
    isNumType,
    isHandWriting,
    isLink,
    isCheckbox,
  };
}
