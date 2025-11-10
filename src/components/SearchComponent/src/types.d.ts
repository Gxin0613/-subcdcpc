import type { ButtonType, ButtonShape } from 'ant-design-vue/lib/button';
import { DatePickerType } from 'naive-ui/es/date-picker/src/config';
import { CreateRowKey, RowData } from 'naive-ui/es/data-table/src/interface';
import { PropType } from 'vue';

export interface ToolbarButtonDef {
  type: ButtonType;
  key: string;
  name: string;
  shape: ButtonShape;
  isDanger: boolean;
  onClick?: Function;
  style?: Recordable;
  isGhost?: boolean;
  MethodModel?: string;
}

export interface KeyWordConditionDef {
  label: string;
  key: string;
  value: string;
  placeholder?: string;
}
export type DateValueType = [number, number] | number | undefined;
export type DatePlaceHolderType = [string, string] | string | '' | null;
export interface DateConditionDef {
  label: string;
  key: string | number;
  type: DatePickerType;
  value: [string, string] | [Dayjs, Dayjs] | undefined;
  strValue: string;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  onChange: (value: [string, string] | [Dayjs, Dayjs], dateString: [string, string]) => void;
}

export type OptionItem = { label: string; value: string };
export type SelectVal = OptionItem.value[] | OptionItem.value | null;
export interface SelectConditionDef {
  [key: string]: any;
  display: 'radio' | 'select';
  options: OptionItem[];
  isMultiSelect: boolean;
  value: SelectVal;
  label: string;
  key: string;
  onChange?: (value: SelectVal) => void;
}

export interface TableConfig {
  columns: TableBaseColumn[];
  dataSource: RowData[];
  rowKey?: PropType<CreateRowKey<any>>;
  rowProps?: PropType<CreateRowKey<any>>;
  checkedItems: any[];
  onUpdateCheckedItems: Function;
  page: number;
  pageSize: number;
  pageCount: number;
  itemCount?: number;
  onPageNumberChange?: (pageNum: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onhandleUpdateSorter?: (sorter) => void;
  primaryKey?: any;
  onRowClick?: (rowData: Recordable) => void;
  ready: boolean;
  onColWidthResize?: (col: any) => void;
}

export interface ToolbarProps {
  buttonList: ToolbarButtonDef[];
  keywordList: KeyWordConditionDef[];
  dateList?: DateConditionDef[];
  selectList: SelectConditionDef[];
}
