import { FormItem } from '../../form/FormComponents';
import { SelectMixedOption } from 'naive-ui/es/select/src/interface';
// 输入类单元格额外属性
export interface InputDateItemProps extends FormItem {
  modelVal: string; // 控件绑定值
  prefix: string; // 前缀
  suffix: string; // 后缀
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  dateFormatOptions: SelectMixedOption[];
  selectedFormat: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | undefined;
}

// 额外属性
const props: Partial<InputDateItemProps> = {
  modelVal: '',
  prefix: '',
  suffix: '',
  clearable: false,
  readonly: false,
  placeholder: '',
  dateFormatOptions: [
    { value: '0', label: 'yyyy-MM-dd' },
    { value: '1', label: 'yyyy-MM-dd HH' },
    { value: '2', label: 'yyyy-MM-dd HH:mm' },
    { value: '3', label: 'yyyy-MM-dd HH:mm:ss' },
    { value: '4', label: 'yyyy-MM' },
    { value: '5', label: 'HH:mm' },
    { value: '6', label: 'HH:mm:ss' },
    { value: '7', label: 'MM-dd' },
    { value: '8', label: 'yyyy' },
    { value: '9', label: 'MM' },
    { value: '10', label: 'yyyy年MM月dd日' },
    { value: '11', label: 'yyyy年MM月' },
    { value: '12', label: 'yyyy年' },
  ],
  selectedFormat: '0',
};

export default props;
