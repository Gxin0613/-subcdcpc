import { containerList } from '../props/form/FormComponents';

export default function useValidator() {
  // 验证值是否异常
  const isFalsyValue = (val: any) => {
    return val === null || val === undefined || (typeof val === 'string' && val.trim() === '');
  };
  // 判断是否是容器
  const isContainer = (category: string, key: string) => {
    try {
      return containerList.includes(`${category}_${key}`);
    } catch (e) {
      return false;
    }
  };
  return { isFalsyValue, isContainer };
}
