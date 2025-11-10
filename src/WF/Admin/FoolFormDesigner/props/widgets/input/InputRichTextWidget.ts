import { FormItem } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface InputRichTextItemProps extends FormItem {
  modelVal: string; // 控件绑定值
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
}

const props: Partial<InputRichTextItemProps> = {
  modelVal: '',
  clearable: false,
  readonly: false,
  placeholder: '',
};

export default props;
