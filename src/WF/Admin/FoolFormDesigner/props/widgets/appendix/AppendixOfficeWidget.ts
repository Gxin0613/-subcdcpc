import { FormItem } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface AppendixOfficeItemProps extends FormItem {
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  modelVal: '';
}

// 额外属性
const props: Partial<AppendixOfficeItemProps> = {
  clearable: false,
  readonly: false,
  placeholder: '',
  modelVal: '',
};

export default props;
