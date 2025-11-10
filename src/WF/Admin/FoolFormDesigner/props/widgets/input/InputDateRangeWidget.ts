import { FormItem } from '../../form/FormComponents';
// 输入类单元格额外属性
export interface InputDateItemProps extends FormItem {
  modelVal: number; // 控件绑定值
  prefix: string; // 前缀
  suffix: string; // 后缀
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
}

// 额外属性
const props: Partial<InputDateItemProps> = {
  modelVal: 0,
  prefix: '',
  suffix: '',
  clearable: false,
  readonly: false,
  placeholder: '',
};

export default props;
