// 字表位置
export enum SubTablePosition {
  //左侧
  Left = 0,
  //底部
  Bottom = 1,
  //标签页.
  Tab = 2,
}

// 兼容错误拼写
export const SubTablePostion = SubTablePosition;

export type DtlRelationConfig = {
  TableRowSelection?: 'checkbox' | 'radio' | 'none';
  DisableSearch?: boolean; // 禁用搜索
  HideDefaultTitle?: boolean; // 隐藏默认标题
  IgnoreErrorSave?: boolean; // 忽略错误保存
  SortColumns?: string; // 排序字段
  EnableSorter?: '0' | '1'; // 是否启用前端排序，0-否，1-是
};
