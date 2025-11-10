import { CSSProperties, unref, type Ref, readonly, ref } from 'vue';
import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
import { message } from 'ant-design-vue';
import { ExtModel } from '/@/bp/en/Map/EnMapExt';
import { Key } from 'ant-design-vue/es/_util/type';
import dayjs, { type Dayjs } from 'dayjs';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { debounce } from 'lodash-es';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import { DealExp } from '/@/utils/gener/StringUtils';

type DDLRelation = { source: string; target: string; sql: string | Function | null; refKey?: string | null };
type FieldCalcRelation = { target: string; exp: string | Function | null; triggerKeys: string[] };
type PopupFillRelation = { source: string; sql: string | null };
type RemoteSearch = { source: string; sql: string | Function | null };
type SearchOption = { label: string; value: string; [key: string]: any };
type DateRange = { startDateKey: string; endDateKey: string };
type CascadeControl = { controlledKey: string; controlKey: string; validator: Function | null };
type SetCustomStyle = { attrKey: string; style: CSSProperties };
type FieldLink = { attrKey: string; url: string };
type GLSearchLink = { attrKey: string; dbSrc: string; width: string; height: string; title: string };
type FieldChangeListener = { targetKey: string; callback: (targetValue: any, row: Recordable, mapAttrs: any[], tableData?: Recordable[]) => void };
type VisibleControl = { targetKey: string; validFunc: (row: Recordable) => boolean; controlKeys: string[] };
type DDLSelect = { source: string; sql: string | null };

export default function useMapExtHandler(rowRef: Ref<Recordable>, remoteSearchOptions: Ref<SearchOption[]>, props: { mapExts: any[]; mapAttrs?: any }) {
  const dropdownRels: DDLRelation[] = [];
  const calcRels: FieldCalcRelation[] = [];
  const popupFillRels: PopupFillRelation[] = [];
  const remoteSearchList: RemoteSearch[] = [];
  const dateRangeRels: DateRange[] = [];
  const cascadeControlRels: CascadeControl[] = [];
  const customStyles: SetCustomStyle[] = [];
  const fieldLink: FieldLink[] = [];
  const glSearchLink: GLSearchLink[] = [];
  const fieldChangeListeners: FieldChangeListener[] = [];
  const visibleControls: VisibleControl[] = [];
  const ddlSelectRels: DDLSelect[] = [];
  const exts = Array.isArray(props.mapExts) ? props.mapExts : [];
  const loadMapExts = (mapExts: any[]) => {
    for (const ext of mapExts) {
      if (!ext) continue;
      const tag1 = ext.Tag1 ?? '';
      const tag2 = ext.Tag2 ?? '';
      const attrOfOper = ext.AttrOfOper ?? '';

      switch (ext.ExtType) {
        case ExtModel.DDLRelation:
          if (tag1 && tag2) dropdownRels.push({ source: tag1, target: tag2, sql: ext.Doc, refKey: ext.Tag4 ?? null });
          break;
        case ExtModel.AutoEval:
          if (tag1) {
            let triggerKeys: string[] = [];
            if (typeof ext.Doc === 'string') {
              triggerKeys = (ext.Doc.match(/@(\w+)/g) || []).map((m: string) => m.substring(1));
            }
            calcRels.push({ target: tag1, exp: ext.Doc, triggerKeys });
          }
          break;
        case ExtModel.PopupFill:
          if (tag1) popupFillRels.push({ source: tag1, sql: ext.Doc });
          break;
        case ExtModel.FieldFill:
          if (tag1) remoteSearchList.push({ source: tag1, sql: ext.Doc });
          break;
        case ExtModel.CascadeControl:
          if (tag1 && tag2) cascadeControlRels.push({ controlKey: tag1, controlledKey: tag2, validator: ext.Validator });
          break;
        case ExtModel.SetStyle:
          if (tag1 && ext.Styles) customStyles.push({ attrKey: tag1, style: ext.Styles });
          break;
        case ExtModel.DateRange:
          if (tag1 && tag2) dateRangeRels.push({ startDateKey: tag1, endDateKey: tag2 });
          break;
        case ExtModel.FieldLink:
          if (attrOfOper && tag1) fieldLink.push({ attrKey: attrOfOper, url: tag1 });
          break;
        case ExtModel.FieldLinkGenerList:
          if (attrOfOper && tag1) glSearchLink.push({ attrKey: attrOfOper, dbSrc: tag1, width: ext.W ?? '80%', height: ext.H ?? '80%', title: ext.Tag ?? '选择' });
          break;
        case ExtModel.FieldChangeListener:
          if (tag1 && typeof ext.Doc === 'function') {
            fieldChangeListeners.push({ targetKey: tag1, callback: ext.Doc });
          }
          break;
        case ExtModel.VisibleControl:
          if (tag1 && typeof ext.validFunc === 'function' && Array.isArray(ext.VisibleControlKeys)) {
            visibleControls.push({
              targetKey: tag1,
              validFunc: ext.validFunc,
              controlKeys: ext.VisibleControlKeys,
            });
          }
          break;
        case ExtModel.DDLSelect:
          ddlSelectRels.push({ source: tag1, sql: ext.Doc });
          break;
      }
    }
  };

  const { getDBSource } = useDBSourceLoader();

  const handleFieldChangeListenersCore = (currentRow: Recordable, targetKey: string, tableData: Recordable[] = []) => {
    if (!currentRow) return;
    const targetValue = currentRow[targetKey];
    const mapAttrs = getMapAttrs();

    const listeners = fieldChangeListeners.filter((listener) => listener.targetKey === targetKey);
    if (listeners.length === 0) return;
    let msg = '';
    for (const listener of listeners) {
      try {
        listener.callback(targetValue, currentRow, mapAttrs, tableData);
      } catch (error) {
        console.error(`执行字段变更监听器 (${listener.targetKey}) 时出错:`, error);
        msg += `执行字段[${listener.targetKey}]变更监听器时出错。\n`;
      }
    }
    if (msg) {
      message.error(msg);
    }
  };

  const handleDropdownEventsCore = async (currentRow: Recordable, changedKey: string) => {
    if (!currentRow) return;
    let msg = '';
    const relevantRels = dropdownRels.filter((rel) => rel.source === changedKey);
    if (relevantRels.length === 0) return;
    const mapAttrs = getMapAttrs();

    for (const rel of relevantRels) {
      const targetAttr = mapAttrs.find((attr) => attr.Key === rel.target);
      if (!targetAttr) {
        console.warn(`未找到目标下拉框 '${rel.target}' 的 MapAttr 定义，选项列表可能未在界面更新。`);
        continue;
      }
      // 如果包含了关联key
      if (!!rel.refKey) {
        const refEnsId = targetAttr.BindEntityID;
        if (!refEnsId) continue;
        const refEns = await ClassFactory.GetEns(refEnsId);
        await refEns.Retrieve(rel.refKey, currentRow[rel.source]);
        targetAttr.ddl = refEns.map((item) => ({ label: item.Name, value: item[item.PK], ...item }));
        await handleDropdownEventsCore(currentRow, rel.target);
        continue;
      }
      if (!rel.sql) {
        msg += `字段[${rel.source}] -> [${rel.target}] 没有正确配置关联SQL\n`;
        continue;
      }
      try {
        const sourceValue = currentRow[rel.source] ?? '';
        let _sql_exp = '';
        if (typeof rel.sql === 'function') {
          _sql_exp = await rel.sql(sourceValue, currentRow);
        } else if (typeof rel.sql === 'string') {
          _sql_exp = rel.sql;
        }
        const sql = _sql_exp.replace(/@Key/g, String(sourceValue));
        const dbParam = `@Key=${sourceValue}`;
        const ddl = await getDBSource(sql, 'local', dbParam);
        if (!Array.isArray(ddl) || ddl.length === 0) {
          targetAttr.ddl = [];
        }
        const options = ddl.map((item) => ({ label: item.Name, value: item.No, ...item }));
        targetAttr.ddl = options;
        const currOption = targetAttr.ddl.find((item) => item.value === currentRow[rel.target]);
        if (currOption) {
          currentRow[rel.target + 'T'] = currOption.label;
        } else {
          currentRow[rel.target + 'T'] = '';
          currentRow[rel.target] = '';
        }
        await handleDropdownEventsCore(currentRow, rel.target);
      } catch (error) {
        console.error(`处理下拉框关联 ${rel.source} -> ${rel.target} 时出错:`, error);
        msg += `处理字段[${rel.source}] -> [${rel.target}]关联时出错。\n`;
      }
    }
    if (msg) {
      message.error(msg);
    }
  };

  const handleFieldCalcEventsCore = (currentRow: Recordable, triggerKey: string) => {
    if (!currentRow) return;
    for (const rel of calcRels) {
      try {
        if (typeof rel.exp === 'function') {
          currentRow[rel.target] = rel.exp(currentRow) ?? '';
          continue;
        }
        if (!rel.triggerKeys.includes(triggerKey) || !currentRow.hasOwnProperty(rel.target)) continue;
        if (typeof rel.exp === 'string' && rel.exp) {
          const formula = rel.exp.replace(/@(\w+)/g, (_match, key) => String(Number(currentRow[key] ?? 0) || 0));
          try {
            const calculate = new Function(`return ${formula}`);
            currentRow[rel.target] = calculate();
          } catch (evalError) {
            console.error(`计算字段 '${rel.target}' 的公式时出错: "${formula}"`, evalError);
            currentRow[rel.target] = undefined;
          }
        }
      } catch (error) {
        console.error(`计算字段 '${rel.target}' 时发生错误:`, error);
        currentRow[rel.target] = undefined;
      }
    }
  };

  const handleAutoFillEventsCore = async (currentRow: Recordable, sourceKey: string, selectedValue: Key, selectedData?: Recordable | null) => {
    if (!currentRow) return;
    let msg = '';
    const relevantRels = popupFillRels.filter((rel) => rel.source === sourceKey);
    if (relevantRels.length === 0) return;
    for (const rel of relevantRels) {
      let dataToFill: Recordable | null = null;
      if (rel.sql) {
        try {
          let sql = rel.sql;
          if (sql.includes('@')) sql = DealExp(sql, currentRow);
          const keyParam = String(selectedValue ?? '');
          if (sql.startsWith('DBSrc.')) {
            sql = `${sql}@Key=${keyParam}`;
          } else {
            sql = sql.replace(/@Key/g, keyParam);
          }
          const dbParam = `@Key=${keyParam}`;

          const res = await getDBSource(sql, 'local', dbParam);
          if (Array.isArray(res)) {
            if (res.length > 1) {
              msg += `字段[${rel.source}]的填充SQL返回了多个结果，将使用第一个。\n`;
              console.warn(`字段[${rel.source}]的填充SQL返回了多个结果，将使用第一个。`);
            }
            if (res.length >= 1) dataToFill = res[0];
          } else {
            console.warn(`字段[${rel.source}]的填充操作未返回数组。`);
          }
        } catch (error) {
          console.error(`获取字段[${rel.source}] (选中值: '${selectedValue}') 的填充数据时出错:`, error);
          msg += `获取字段[${rel.source}]填充数据出错。\n`;
        }
      } else if (selectedData && Object.keys(selectedData).length > 0) {
        dataToFill = selectedData;
      } else {
        msg += `字段[${rel.source}]无SQL配置且未提供直接填充数据。\n`;
      }

      if (dataToFill) {
        Object.keys(dataToFill).forEach((key) => {
          if (currentRow.hasOwnProperty(key)) {
            currentRow[key] = dataToFill![key];
            handleFieldCalcEventsCore(currentRow, key);
            handleDropdownEventsCore(currentRow, key);
          }
        });
      }
    }
    if (msg) {
      message.warning(msg);
    }
  };

  const handleRemoteSearch = debounce(async (attrKey: string, keyword: string) => {
    const rel = remoteSearchList.find((r) => r.source === attrKey);
    remoteSearchOptions.value = [];
    if (!rel || !rel.sql || !keyword) return;
    try {
      if (typeof rel.sql === 'function') {
        const res = await rel.sql(keyword, unref(rowRef));
        if (Array.isArray(res) && res.length > 0) {
          remoteSearchOptions.value = res.map((item) => ({ label: item.Name, value: item.No, ...item }));
        }
        return;
      }
      let sql = rel.sql;
      const keyParam = String(keyword ?? '');
      if (sql.startsWith('DBSrc.')) {
        sql = `${sql}@Key=${keyParam}`;
      } else {
        sql = rel.sql.replace(/@Key/g, keyParam);
      }
      const dbParam = `@Key=${keyParam}`;
      const res = await getDBSource(sql, 'local', dbParam);
      if (Array.isArray(res) && res.length > 0) {
        remoteSearchOptions.value = res.map((item) => ({ label: item.Name, value: item.No, ...item }));
      }
    } catch (error) {
      console.error(`远程搜索字段[${attrKey}] (关键词: '${keyword}') 时出错:`, error);
      message.error(`搜索 '${keyword}' 时出错`);
      remoteSearchOptions.value = [];
    }
  }, 300);

  const handleRemoteSelectCore = async (currentRow: Recordable, selectedValue: string, option: SearchOption, attrKey: string) => {
    if (!currentRow) return;
    currentRow[attrKey] = option.label;
    await handleAutoFillEventsCore(currentRow, attrKey, selectedValue, option);
    remoteSearchOptions.value = [];
  };

  const isControlFieldReadonlyCore = (currentRow: Recordable, attrKey: string): boolean => {
    if (!currentRow) return false;
    const ccr = cascadeControlRels.find((c) => c.controlledKey === attrKey);
    if (!ccr) return false;
    const controlValue = currentRow[ccr.controlKey];
    if (typeof ccr.validator === 'function') {
      try {
        return !ccr.validator(controlValue, currentRow);
      } catch (error) {
        console.error(`执行级联控制校验器时出错 (${ccr.controlKey} -> ${ccr.controlledKey}):`, error);
        return true;
      }
    } else {
      return !controlValue;
    }
  };

  const getDisabledDateCore = (currentRow: Recordable, attrKey: string): ((current: Dayjs) => boolean) | null => {
    const drr = dateRangeRels.find((dr) => dr.endDateKey === attrKey);
    if (!drr || !currentRow) return null;
    const startDate = currentRow[drr.startDateKey];
    return (current: Dayjs): boolean => {
      if (!startDate) return false;
      return current && current.isBefore(dayjs(startDate).startOf('day'));
    };
  };

  const isDateReadonlyCore = (currentRow: Recordable, attrKey: string): boolean => {
    if (!currentRow) return false;
    const drr = dateRangeRels.find((dr) => dr.endDateKey === attrKey);
    return !!drr && !currentRow[drr.startDateKey];
  };

  const getFieldLinkUrlCore = (currentRow: Recordable, key: string): string | null => {
    const link = fieldLink.find((fl) => fl.attrKey === key);
    if (!link || !link.url || !currentRow) return null;
    let finalUrl = link.url;
    const placeholders = finalUrl.match(/[@{](\w+)}?/g) || [];
    for (const placeholder of placeholders) {
      const fieldName = placeholder.replace(/[@{}]/g, '');
      if (currentRow.hasOwnProperty(fieldName)) {
        finalUrl = finalUrl.replace(placeholder, encodeURIComponent(String(currentRow[fieldName] ?? '')));
      } else {
        console.warn(`字段链接模板中的占位符 '${placeholder}' 在行数据中未找到 (字段: '${key}')。`);
        finalUrl = finalUrl.replace(placeholder, '');
      }
    }
    return finalUrl;
  };

  const getGLLinkConfigCore = (currentRow: Recordable, key: string): GPNReturnObj | null => {
    const glLink = glSearchLink.find((fl) => fl.attrKey === key);
    if (!glLink || !glLink.dbSrc || !currentRow) return null;
    let finalDbSrc = glLink.dbSrc;
    const placeholders = finalDbSrc.match(/@(\w+)/g) || [];
    for (const placeholder of placeholders) {
      const fieldName = placeholder.substring(1);
      if (currentRow.hasOwnProperty(fieldName)) {
        finalDbSrc = finalDbSrc.replace(placeholder, String(currentRow[fieldName] ?? ''));
      } else {
        console.warn(`GL搜索链接数据源模板中的占位符 '${placeholder}' 在行数据中未找到 (字段: '${key}')。`);
        finalDbSrc = finalDbSrc.replace(placeholder, '');
      }
    }
    return new GPNReturnObj(
      GPNReturnType.OpenCompByModal,
      { compUrl: '/@/WF/views/GenerList.vue', params: { EnName: 'GL_SearchLinkField', dbSrc: finalDbSrc }, width: glLink.width, height: glLink.height },
      glLink.title,
    );
  };

  const getAttrLinkCore = (currentRow: Recordable, key: string): GPNReturnObj | null => {
    const attr = (Array.isArray(props.mapAttrs) ? props.mapAttrs : []).find((a) => a.Key === key);
    if (!attr || attr.UIContralType !== 9 || !currentRow) return null;
    const url = attr.LinkUrl;
    if (!url) return null;
    let finalUrl = url;
    const placeholders = finalUrl.match(/[@{](\w+)}?/g) || [];
    for (const placeholder of placeholders) {
      const fieldName = placeholder.replace(/[@{}]/g, '');
      if (currentRow.hasOwnProperty(fieldName)) {
        finalUrl = finalUrl.replace(placeholder, encodeURIComponent(String(currentRow[fieldName] ?? '')));
      } else {
        console.warn(`字段链接模板中的占位符 '${placeholder}' 在行数据中未找到 (字段: '${key}')。`);
        finalUrl = finalUrl.replace(placeholder, '');
      }
    }
    return new GPNReturnObj(attr.LinkOpenType, finalUrl, attr.Desc || '查看详情');
  };

  const getTitleLinkCore = (currentRow: Recordable, key: string): string | GPNReturnObj | null => {
    if (!currentRow || !key) return null;
    return getGLLinkConfigCore(currentRow, key) || getFieldLinkUrlCore(currentRow, key) || getAttrLinkCore(currentRow, key);
  };
  const handleVisibleControlEventsCore = (currentRow: Recordable, triggerKey: string, mapAttrs?: any[]) => {
    if (!currentRow) return;
    const relevantControls = visibleControls.filter((control) => control.targetKey === triggerKey);
    if (relevantControls.length === 0) return;
    const attrs = Array.isArray(mapAttrs) ? mapAttrs : Array.isArray(props.mapAttrs) ? props.mapAttrs : [];
    for (const control of relevantControls) {
      try {
        // 执行验证函数判断是否应该显示
        const shouldShow = control.validFunc(currentRow);
        // 更新所有被控制字段的可见性
        for (const controlledKey of control.controlKeys) {
          const targetAttr = attrs.find((attr) => attr.Key === controlledKey);
          if (targetAttr) {
            targetAttr.UIVisible = shouldShow;
          }
        }
      } catch (error) {
        console.error(`处理可见性控制时出错 (${control.targetKey} -> ${control.controlKeys.join(', ')}):`, error);
      }
    }
  };

  const isRemoteSearch = (attrKey: string): boolean => {
    return remoteSearchList.some((rel) => rel.source === attrKey);
  };

  const isDDLSelect = (attrKey: string): boolean => {
    return ddlSelectRels.some((rel) => rel.source === attrKey);
  };

  const mixedStyles = (key: string): CSSProperties => {
    return customStyles.find((s) => s.attrKey === key)?.style || {};
  };

  const handleFieldChangeListeners = (targetKey: string) => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 handleFieldChangeListeners');
      return;
    }
    return handleFieldChangeListenersCore(currentRow, targetKey);
  };

  const handleDropdownEvents = (changedKey: string) => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 handleDropdownEvents');
      return;
    }
    return handleDropdownEventsCore(currentRow, changedKey);
  };

  const handleFieldCalcEvents = (triggerKey: string) => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 handleFieldCalcEvents');
      return;
    }
    return handleFieldCalcEventsCore(currentRow, triggerKey);
  };

  const handleAutoFillEvents = (sourceKey: string, selectedValue: Key, selectedData?: Recordable | null) => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 handleAutoFillEvents');
      return;
    }
    return handleAutoFillEventsCore(currentRow, sourceKey, selectedValue, selectedData);
  };

  const handleRemoteSelect = (selectedValue: string, option: SearchOption, attrKey: string) => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 handleRemoteSelect');
      return;
    }
    return handleRemoteSelectCore(currentRow, selectedValue, option, attrKey);
  };

  const isControlFieldReadonly = (attrKey: string): boolean => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 isControlFieldReadonly');
      return false;
    }
    return isControlFieldReadonlyCore(currentRow, attrKey);
  };

  const getDisabledDate = (attrKey: string): ((current: Dayjs) => boolean) | null => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 getDisabledDate');
      return null;
    }
    return getDisabledDateCore(currentRow, attrKey);
  };

  const isDateReadonly = (attrKey: string): boolean => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 isDateReadonly');
      return false;
    }
    return isDateReadonlyCore(currentRow, attrKey);
  };

  const getTitleLink = (key: string): string | GPNReturnObj => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 getTitleLink');
      return '';
    }
    return getTitleLinkCore(currentRow, key) || '';
  };

  const _mapAttrs = ref([]);
  const getMapAttrs = () => {
    let attrs: Array<Recordable> = [];
    if (Array.isArray(props.mapAttrs)) {
      attrs = props.mapAttrs;
    }
    if (attrs.length === 0) {
      attrs = _mapAttrs.value;
    }
    return attrs;
  };

  const setMapAttr = (attrs) => {
    _mapAttrs.value = attrs;
  };

  const handleVisibleControlEvents = (triggerKey: string) => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 handleVisibleControlEvents');
      return;
    }
    const mapAttrs = getMapAttrs();
    return handleVisibleControlEventsCore(currentRow, triggerKey, mapAttrs);
  };

  const checkAllFieldVisibility = () => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 checkAllFieldVisibility');
      return;
    }
    const mapAttrs = getMapAttrs();

    // 检查所有可见性控制规则
    for (const control of visibleControls) {
      handleVisibleControlEventsCore(currentRow, control.targetKey, mapAttrs);
    }
  };

  const checkAllFieldChangeEvent = () => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 checkAllFieldChangeListener');
      return;
    }
    const uniKeys = Array.from(new Set(fieldChangeListeners.map((listener) => listener.targetKey)));
    for (const key of uniKeys) {
      // 执行所有监听器
      handleFieldChangeListenersCore(currentRow, key);
    }
  };

  const checkAllFieldCalculation = () => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 checkAllFieldCalculation');
      return;
    }

    // 对于函数类型的计算公式，直接执行
    for (const rel of calcRels) {
      if (typeof rel.exp === 'function') {
        try {
          currentRow[rel.target] = rel.exp(currentRow) ?? '';
        } catch (error) {
          console.error(`计算字段 '${rel.target}' 时发生错误:`, error);
          currentRow[rel.target] = undefined;
        }
      }
    }

    // 对于字符串类型的计算公式，需要检查所有相关字段
    for (const rel of calcRels) {
      if (typeof rel.exp === 'string' && rel.exp && rel.triggerKeys.length > 0) {
        // 检查是否有相关字段存在于当前行数据中
        const hasValidTriggers = rel.triggerKeys.some((key) => currentRow.hasOwnProperty(key));
        if (hasValidTriggers && currentRow.hasOwnProperty(rel.target)) {
          try {
            const formula = rel.exp.replace(/@(\w+)/g, (_match, key) => String(Number(currentRow[key] ?? 0) || 0));
            const calculate = new Function(`return ${formula}`);
            currentRow[rel.target] = calculate();
          } catch (error) {
            console.error(`计算字段 '${rel.target}' 的公式时出错: "${rel.exp}"`, error);
            currentRow[rel.target] = undefined;
          }
        }
      }
    }
  };

  const checkAllDropdownRelations = async () => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 checkAllDropdownRelations');
      return;
    }

    // 获取所有有值的源字段
    const sourceKeys = dropdownRels
      .filter((rel) => currentRow[rel.source] !== undefined && currentRow[rel.source] !== null && currentRow[rel.source] !== '')
      .map((rel) => rel.source);

    // 去重并执行下拉框关联检查
    const uniqueSourceKeys = Array.from(new Set(sourceKeys));
    for (const sourceKey of uniqueSourceKeys) {
      await handleDropdownEventsCore(currentRow, sourceKey);
    }
  };

  const initializeAllEvents = async () => {
    const currentRow = unref(rowRef);
    if (!currentRow) {
      console.warn('行数据(rowRef)尚未准备好，无法执行 initializeAllEvents');
      return;
    }

    try {
      // 1. 首先执行字段计算，确保计算字段的值是最新的
      checkAllFieldCalculation();

      // 2. 执行下拉框关联检查，基于当前字段值加载相关下拉选项
      await checkAllDropdownRelations();

      // 3. 执行可见性控制检查
      checkAllFieldVisibility();

      // 4. 执行字段变更监听器检查
      checkAllFieldChangeEvent();

      console.log('表单初始化事件检查完成');
    } catch (error) {
      console.error('表单初始化事件检查时发生错误:', error);
    }
  };
  loadMapExts(exts);
  return {
    // 字段变更事件
    handleFieldChangeListeners,

    handleDropdownEvents,
    handleFieldCalcEvents,
    handleAutoFillEvents,
    handleRemoteSearch,
    handleRemoteSelect,
    isRemoteSearch,
    isDDLSelect,
    isControlFieldReadonly,
    getDisabledDate,
    isDateReadonly,
    mixedStyles,
    getTitleLink,
    // 新增可见性控制方法
    handleVisibleControlEvents,

    // 新增初始化方法
    initializeAllEvents,

    core: readonly({
      handleDropdownEventsCore,
      handleFieldChangeListenersCore,
      handleFieldCalcEventsCore,
      handleAutoFillEventsCore,
      handleRemoteSelectCore,
      isControlFieldReadonlyCore,
      getDisabledDateCore,
      isDateReadonlyCore,
      getTitleLinkCore,
      handleRemoteSearch,
      isRemoteSearch,
      isDDLSelect,
      mixedStyles,
      loadMapExts,
      // 新增可见性控制核心方法
      handleVisibleControlEventsCore,
      setMapAttr,
    }),
  };
}
