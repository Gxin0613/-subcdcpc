import { FormItem } from '../../form/FormComponents';
// 输入类单元格额外属性
export interface InputEnumsItemProps extends FormItem {
  modelVal: number; // 控件绑定值
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  checkedTips: string;
  unCheckedTips: string;
  enumKey: string;
  uiType: number;
  direction: number | string;
}

// 额外属性
const props: Partial<InputEnumsItemProps> = {
  modelVal: 0,
  clearable: false,
  readonly: false,
  placeholder: '',
  checkedTips: '开启',
  unCheckedTips: '关闭',
  enumKey: '',
  uiType: 1,
  direction: 0,
};

export default props;
