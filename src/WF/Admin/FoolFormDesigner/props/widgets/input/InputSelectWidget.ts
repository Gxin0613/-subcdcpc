import { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import { FormItem } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface InputSelectItemProps extends FormItem {
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  options: Array<SelectMixedOption>;
  modelVal: '';
  enumKey: string;
}

// 额外属性
const props: Partial<InputSelectItemProps> = {
  clearable: false,
  readonly: false,
  placeholder: '',
  options: [],
  modelVal: '',
  enumKey: '',
};

export default props;
