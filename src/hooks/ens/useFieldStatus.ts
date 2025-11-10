import { Attr } from '/@/bp/en/Map/Attr';

export function useFieldStatus(pk: string, pkVal: string, savedState: boolean) {
  // 当前行是否隐藏
  // - 当前是主键并且主键为空
  // - 当前字段属性隐藏
  const isHidden = (attr: Attr) => {
    return (attr.Key === pk && !pkVal) || !attr.UIVisible;
  };
  // 当前行是否只读
  const isReadOnly = (attr: Attr): boolean => {
    const readonly = attr.UIIsReadonly || (attr.Key === pk && !!pkVal) || (attr.Key === pk && savedState);
    return readonly as boolean;
  };

  return { isHidden, isReadOnly };
}
