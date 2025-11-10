import { FormGroup } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface UniversalFieldItemProps extends FormGroup {
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  modelVal: '';
  url: '';
}

// 额外属性
const props: Partial<UniversalFieldItemProps> = {
  clearable: false,
  readonly: false,
  modelVal: '',
  url: '',
};

export default props;
