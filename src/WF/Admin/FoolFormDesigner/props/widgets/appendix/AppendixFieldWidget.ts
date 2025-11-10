import { UploadFileInfo } from 'naive-ui';
import { FormItem } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface AppendixFieldItemProps extends FormItem {
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  inputButton?: boolean; // 输入框符号
  fileList: Array<UploadFileInfo>;
  modelVal: '';
}

// 额外属性
const props: Partial<AppendixFieldItemProps> = {
  clearable: false,
  readonly: false,
  placeholder: '',
  inputButton: true,
  fileList: [],
  modelVal: '',
};

export default props;
