import { Attr } from '/@/bp/en/Map/Attr';
import { DataType } from '/@/bp/en/DataType';
import { assign } from 'lodash-es';
import { TreeOption } from 'naive-ui';
import { BaseListData } from '/@/components/BaseCreateForm';

/**
 * 根据refKey 创建父子关系
 */
export function useDataConvert() {
  function convert(groups: Array<Record<string, any>>, ens: Array<Record<string, any>>, refKey: string) {
    // id 全部转换成字符串
    ens.forEach((en) => {
      en.No += '';
      en[refKey] += '';
    });
    groups.forEach((group) => {
      group.No += '';
    });
    return groups.map((group) => {
      return assign(group, { children: ens.filter((en) => en[refKey] === group.No) });
    }) as BaseListData[];
  }

  return convert;
}

export function useTreeConvert() {
  function listToTree(pid: string, arr: any[], notFoundAsNull = false): TreeOption[] | undefined {
    let children: TreeOption[] = [];
    let childrenNode: TreeOption[] = [];
    if (Array.isArray(arr) && arr.length > 0 && !arr[0].hasOwnProperty('ParentNo')) {
      return arr;
    }
    if (pid.includes(',')) {
      const pids = pid.split(',');
      pids.forEach((val) => {
        if (val.length == 0) return notFoundAsNull ? undefined : [];
        const parent = arr.filter((item) => item.No === val) as TreeOption[];
        if (parent.length > 0) childrenNode = parent;
        else childrenNode = arr.filter((item) => item.ParentNo === val) as TreeOption[];
        if (childrenNode.length === 0) {
          return notFoundAsNull ? undefined : [];
        }
        // 剪枝
        const remainsArr: any[] = arr.filter((arrItem) => {
          return childrenNode.every((childItem) => {
            return childItem.No !== arrItem.No;
          });
        });
        childrenNode.forEach((child) => {
          const children = listToTree(child.No as string, remainsArr, notFoundAsNull);
          if (Array.isArray(children) && children.length > 0) {
            child.children = children;
          }
        });
        childrenNode.forEach((row) => {
          children.push(row);
        });
      });
    } else {
      const parent = arr.filter((item) => item.No === pid) as TreeOption[];
      if (parent.length > 0) children = parent;
      else children = arr.filter((item) => item.ParentNo === pid) as TreeOption[];
      if (children.length === 0) {
        return notFoundAsNull ? undefined : [];
      }
      // 剪枝
      const remainsArr: any[] = arr.filter((arrItem) => {
        return children.every((childItem) => {
          return childItem.No !== arrItem.No;
        });
      });
      children.forEach((child) => {
        const children = listToTree(child.No as string, remainsArr, notFoundAsNull);
        if (Array.isArray(children) && children.length > 0) {
          child.children = children;
        }
      });
    }

    return children;
  }
  return {
    listToTree,
  };
}

// 类型转换工具
export function useTypeConvert() {
  /**
   * 将对象所有的boolean类型转为 0和1
   * 此方法不改变原始数据
   * @param mapAttrs
   * @param obj
   */
  function booleanToNumber(mapAttrs: Array<Attr>, obj: Record<string, any>) {
    const result: Record<string, any> = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (typeof obj[key] === 'string') {
        if (obj[key].includes('"')) obj[key] = obj[key].replace(/\"/g, '^');
        if (obj[key].includes("'")) {
          obj[key] = obj[key].replace(/\"/g, '~').replace(/\'/g, '~');
        }
      }
    }
    for (const attr of mapAttrs) {
      if (attr.MyDataType === DataType.AppBoolean) {
        result[attr.Key] = obj[attr.Key] ? 1 : 0;
        continue;
      }
      if (attr.MyDataType === DataType.AppInt) {
        result[attr.Key] = parseInt(obj[attr.Key]);
        continue;
      }
      if (attr.IsEnum) {
        result[attr.Key] = obj[attr.Key];
        continue;
      }
      result[attr.Key] = obj[attr.Key];
    }
    return result;
  }

  /**
   * 如果列是boolean型，而row中的值是数字型，转换为boolean型
   * 此方法不改变原始数据
   * @param mapAttrs
   * @param obj
   */
  function numberToBoolean(mapAttrs: Array<Attr>, obj: Record<string, any>) {
    const result: Record<string, any> = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (typeof obj[key] === 'string') {
        if (obj[key].includes('~~')) {
          obj[key] = obj[key].replace(/\~~/g, '"');
        }
        if (obj[key].includes('^')) {
          obj[key] = obj[key].replace(/\^/g, '"');
        }
        // if (obj[key].includes('~')) {
        //   obj[key] = obj[key].replace(/\~/g, "'");
        // }
      }
    }
    for (const attr of mapAttrs) {
      if (attr.MyDataType === DataType.AppBoolean) {
        let originData = obj[attr.Key];
        if (typeof originData === 'string') {
          originData = parseInt(originData);
        }
        result[attr.Key] = originData == 1;
        continue;
      }
      if (attr.MyDataType === DataType.AppInt) {
        result[attr.Key] = parseInt(obj[attr.Key]);
        continue;
      }
      if (attr.IsDateField) {
        result[attr.Key] = result[attr.Key] == 'Invalid Date' ? '' : obj[attr.Key];
        continue;
      }
      if (attr.IsEnum) {
        result[attr.Key] = obj[attr.Key];
        result[attr.Key + 'T'] = obj[attr.Key + 'T'] || '';
        continue;
      }
      result[attr.Key] = obj[attr.Key];
    }
    return result;
  }

  return {
    booleanToNumber,
    numberToBoolean,
  };
}
