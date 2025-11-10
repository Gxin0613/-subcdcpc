import { FormItem } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface AppendixWriteItemProps extends FormItem {
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  inputButton?: boolean; // 输入框符号
}

// 额外属性
const props: Partial<AppendixWriteItemProps> = {
  clearable: false,
  readonly: false,
  placeholder: '',
  inputButton: true,
};

export default props;
