import { UploadFileInfo } from 'naive-ui';
import { FormGroup } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface AppendixTableItemProps extends FormGroup {
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  inputButton?: boolean; // 输入框符号
  fileList: Array<UploadFileInfo>;
  modelVal: '';
  maxFiles: number;
  fileType: string;
}

// 额外属性
const props: Partial<AppendixTableItemProps> = {
  clearable: false,
  readonly: false,
  placeholder: '',
  inputButton: true,
  fileList: [],
  modelVal: '',
  maxFiles: 4,
  children: [],
  fileType: '0',
};

export default props;
