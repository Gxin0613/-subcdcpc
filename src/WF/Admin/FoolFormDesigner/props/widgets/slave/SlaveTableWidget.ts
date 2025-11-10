import { FormGroup } from '../../form/FormComponents';

// 输入类单元格额外属性
export interface SlaveTableItemProps extends FormGroup {
  clearable: boolean; // 显示清除按钮
  readonly: boolean; // 是否只读
  placeholder: string; // 占位符提示
  modelVal: '';
  columns: Array<any>[]; // 从表列
  entity?: object; // 从表实体属性
}

// 额外属性
const props: Partial<SlaveTableItemProps> = {
  clearable: false,
  readonly: false,
  placeholder: '',
  modelVal: '',
  columns: [],
};

export default props;
