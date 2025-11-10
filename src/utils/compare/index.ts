/**
 * 比较两个数据对象，识别变更和新增，生成差异标识
 * @param base 基础版本数据
 * @param compare 比较版本数据
 * @returns 差异标识对象，true表示有变更或新增
 */
export function compareDataChanges(base: Record<string, string>, compare: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};

  // 处理每个顶级键（FrmDB、FrmDtlDB、FrmAthDB）
  Object.keys(base).forEach((topKey) => {
    // 解析基础版本和比较版本的JSON数据
    let baseData: any, compareData: any;
    try {
      baseData = JSON.parse(base[topKey]);
      compareData = compare[topKey] ? JSON.parse(compare[topKey]) : {};
    } catch (e) {
      console.error(`解析${topKey}失败:`, e);
      return;
    }

    const topResult: Record<string, boolean> = {};

    // 根据不同顶级键处理子数据
    if (topKey === 'FrmDB') {
      // 主表：比较所有基础版本存在的字段
      Object.keys(baseData).forEach((field) => {
        // 只关注比较版本中存在的字段
        if (compareData.hasOwnProperty(field)) {
          topResult[field] = baseData[field] !== compareData[field];
        }
      });
    } else if (topKey === 'FrmDtlDB') {
      // 从表：比较每个子表
      Object.keys(baseData).forEach((tableKey) => {
        const baseTable = baseData[tableKey];
        const compareTable = compareData[tableKey] || [];

        // 标记为有变更（true）或无变更（false）
        let hasChange = false;
        if (baseTable.length !== compareTable.length) {
          hasChange = true;
        } else {
          // 比较每个子表项
          baseTable.forEach((item: any, index: number) => {
            const compareItem = compareTable[index];
            if (!compareItem) {
              hasChange = true;
              return;
            }
            // 比较所有字段值
            Object.keys(item).forEach((key) => {
              if (item[key] !== compareItem[key]) {
                hasChange = true;
              }
            });
          });
        }
        topResult[tableKey] = hasChange;
      });
    } else if (topKey === 'FrmAthDB') {
      // 附件表：检测变更或新增
      Object.keys(baseData).forEach((attachKey) => {
        const baseAttach = baseData[attachKey];
        const compareAttach = compareData[attachKey] || [];

        // 有新增数据（数量增加）
        if (compareAttach.length > baseAttach.length) {
          topResult[attachKey] = true;
          return;
        }

        // 数量相同但内容有变更
        let hasChange = false;
        baseAttach.forEach((item: any, index: number) => {
          const compareItem = compareAttach[index];
          if (!compareItem || item.MyPK !== compareItem.MyPK) {
            hasChange = true;
            return;
          }
          // 比较其他字段
          Object.keys(item).forEach((key) => {
            if (item[key] !== compareItem[key]) {
              hasChange = true;
            }
          });
        });
        topResult[attachKey] = hasChange;
      });
    }

    result[topKey] = topResult;
  });

  return result;
}

/**
 * 根据主表差异字段，为sys_Mapattr中对应字段添加红色标识
 * @param sysMapattr 系统属性配置数组
 * @param mainTableChanges 主表差异标识对象（FrmDB部分）
 * @returns 处理后的系统属性配置数组
 */
export function markChangedFields(sysMapattr: Array<Record<string, any>>, mainTableChanges: Record<string, boolean>): Array<Record<string, any>> {
  // 复制原数组避免直接修改源数据
  return sysMapattr.map((attr) => {
    // 提取字段的KeyOfEn（如"WenBenA"）
    const fieldKey = attr.KeyOfEn;

    // 检查该字段是否在主表差异中且值为true
    if (mainTableChanges.hasOwnProperty(fieldKey) && mainTableChanges[fieldKey]) {
      // 添加color属性为red（不覆盖原有属性）
      return {
        ...attr,
        color: 'red',
      };
    }

    // 无差异的字段保持不变
    return attr;
  });
}

/**
 * 根据从表和附件的差异标识，为Sys_GroupField中对应项添加"有变更"文本
 * @param sysGroupField 分组字段配置数组（包含从表和附件信息）
 * @param dtlAndAthChanges 从表和附件的差异标识对象（{FrmDtlDB: {...}, FrmAthDB: {...}}）
 * @returns 处理后的分组字段配置数组
 */
// export function markGroupFieldChanges(
//   sysGroupField: Array<Record<string, any>>,
//   dtlAndAthChanges: {
//     FrmDtlDB: Record<string, boolean>;
//     FrmAthDB: Record<string, boolean>;
//   },
// ): Array<Record<string, any>> {
//   // 复制原数组避免直接修改源数据
//   return sysGroupField.map((item) => {
//     // 只处理CtrlID有值的项
//     if (!item.CtrlID) {
//       return item;
//     }

//     // 1. 处理从表（CtrlType为Dtl）
//     if (item.CtrlType === 'Dtl') {
//       // 从表的CtrlID与FrmDtlDB的键直接匹配（如Frm_CeShi001CongBiaoA）
//       const isChanged = dtlAndAthChanges.FrmDtlDB[item.CtrlID];
//       if (isChanged) {
//         return { ...item, isCompare: 1 };
//       }
//     }
//     debugger;

//     console.log('item.CtrlType ', item.CtrlType);
//     // 2. 处理附件（CtrlType为Ath）
//     if (item.CtrlType === 'Ath' && item.ath) {
//       // 附件通过ath.NoOfObj与FrmAthDB的键匹配（如BiaoGeFuJianA）
//       const athKey = item.ath.NoOfObj;
//       const isChanged = dtlAndAthChanges.FrmAthDB[athKey];
//       if (isChanged) {
//         return { ...item, isCompare: 1 };
//       }
//     }

//     // 无变更或不匹配的项保持原样
//     return item;
//   });
// }

/**
 * 根据从表和附件的差异标识，为Sys_GroupField中对应项添加"有变更"标记
 * @param sysGroupField 分组字段配置数组（包含从表和附件信息）
 * @param dtlAndAthChanges 从表和附件的差异标识对象
 * @param sysFrmAttachment 附件配置数组（Sys_FrmAttachment）
 * @returns 处理后的分组字段配置数组
 */
export function markGroupFieldChanges(
  sysGroupField: Array<Record<string, any>>,
  dtlAndAthChanges: {
    FrmDtlDB: Record<string, boolean>;
    FrmAthDB: Record<string, boolean>;
  },
  sysFrmAttachment: Array<Record<string, any>>, // 新增参数：附件配置数组
): Array<Record<string, any>> {
  // 1. 构建Sys_FrmAttachment的映射表（以MyPK为键，便于快速查找）
  const athMap = sysFrmAttachment.reduce((map, athItem) => {
    map.set(athItem.MyPK, athItem); // MyPK如"Frm_CeShi001_BiaoGeFuJianA"
    return map;
  }, new Map<string, Record<string, any>>());

  // 2. 遍历sysGroupField处理每个项
  return sysGroupField.map((item) => {
    // 只处理有CtrlID的项
    if (!item.CtrlID) {
      return item;
    }

    // 3. 处理从表（CtrlType为Dtl）：逻辑不变
    if (item.CtrlType === 'Dtl') {
      const isChanged = dtlAndAthChanges.FrmDtlDB[item.CtrlID];
      if (isChanged) {
        return { ...item, isCompare: 1 };
      }
      return item;
    }

    // 4. 处理附件（CtrlType为Ath）：从sysFrmAttachment获取ath信息
    if (item.CtrlType === 'Ath') {
      debugger;
      // 通过CtrlID匹配Sys_FrmAttachment中的MyPK，获取附件配置
      const matchedAth = athMap.get(item.CtrlID);
      if (matchedAth) {
        // 用映射中获取的ath信息，匹配差异标识
        const athKey = matchedAth.NoOfObj; // 如"BiaoGeFuJianA"
        const isChanged = dtlAndAthChanges.FrmAthDB[athKey];
        if (isChanged) {
          return { ...item, isCompare: 1 };
        }
      }
      return item;
    }

    // 其他类型项保持原样
    return item;
  });
}
