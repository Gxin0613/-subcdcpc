import { FormItem } from '../../form/FormComponents';
// 输入类单元格额外属性
export interface InputRadioItemProps extends FormItem {
  modelVal: number; // 控件绑定值
  readonly: boolean; // 是否只读
  enumKey: string;
}

// 额外属性
const props: Partial<InputRadioItemProps> = {
  modelVal: 0,
  readonly: false,
  enumKey: '',
};

export default props;
