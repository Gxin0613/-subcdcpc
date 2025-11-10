import { DataType } from '/@/bp/en/DataType';
import type { Attrs } from '/@/bp/en/Map/Attrs';
import { UIContralType } from '/@/bp/en/EnumLab';
export function useEntityValidator() {
  const createFormRules = (mapAttrs: Attrs) => {
    const rules: Recordable = {};
    for (const attr of mapAttrs) {
      const { MaxLength, MinLength } = attr;
      if (attr.UIIsReadonly || !attr.UIVisible || attr.UIContralType != UIContralType.TB) continue;
      if (attr.MyDataType === DataType.AppString) rules[attr.Key] = [{ min: MinLength, max: MaxLength, message: `字段长度应该在${MinLength} - ${MaxLength}之间`, trigger: 'blur' }];
    }
    return rules;
  };
  const validateEnOnly = (mapAttrs: Attrs, row: Recordable) => {
    const keys = Object.keys(row);
    const errList: Array<{
      key: string;
      name: string;
      msg: string;
    }> = [];
    for (const key of keys) {
      const attr = mapAttrs.find((attr) => attr.Key == key);
      if (!attr) continue;
      const val = row[key];
      const err = {
        key,
        name: attr.Desc,
        msg: '',
      };
      if (typeof val == 'string') {
        if (val.length < attr.MinLength) err.msg += `
字段长度不能小于` + attr.MinLength;
        if (val.length > attr.MaxLength) err.msg += `
字段长度不能超过` + attr.MaxLength;
      }
      err.msg = err.msg.substring(1);
      if (err.msg.length > 0) {
        errList.push(err);
      }
    }
    return {
      valid: errList.length === 0,
      errList,
    };
  };
  return {
    createFormRules,
    validateEnOnly,
  };
}
