import { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import { FormItem } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface InputItemProps extends FormItem {
  modelVal: string; // 控件绑定值
  prefix: string; // 前缀
  suffix: string; // 后缀
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  // 下方两个条件互斥
  inputType: string; // 是否是文本域
  inputTypeOptions: SelectMixedOption[]; // 是否是密码框
  inputIcon: ''; // 输入框图标，只有文本有
}

const props: Partial<InputItemProps> = {
  modelVal: '',
  prefix: '',
  suffix: '',
  clearable: false,
  readonly: false,
  placeholder: '',
  inputType: '0', // 是否是文本域
  inputIcon: '',
};

export default props;
