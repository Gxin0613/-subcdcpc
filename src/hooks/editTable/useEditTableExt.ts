import { computed, reactive, Ref, ref, ShallowRef, shallowRef } from 'vue';
import { EnMapExt, EnMapExts } from '/@/bp/en/Map/EnMapExt';
import { Entity } from '/@/bp/en/Entity';
import { Attr } from '/@/bp/en/Map/Attr';
import { useForm } from 'ant-design-vue/es/form';
import useMapExtHandler from '../ens/useMapExtHandler';
import useFieldType from '../ens/useFieldType';
import { DataType } from '/@/bp/en/DataType';
import dayjs from 'dayjs';

interface DDL {
  label: string;
  value: string | number;
}
interface CustomAttr extends Attr {
  Tag: string[];
  ddl: DDL[];
  validateErr: string;
  errStyle: any;
}

export function useEditTableExt(
  props: Recordable,
  entity: Ref<Entity | undefined>,
  tableColumns: Ref<any>,
  refPop: ShallowRef<any>,
  get_db_source_func: Ref<Function | undefined>,
) {
  const emptyRow = ref({});
  const remoteSearchOptions = ref([]);
  const evtProps = {
    mapExts: new EnMapExts(),
    mapAttrs: [],
  };

  const { core } = useMapExtHandler(emptyRow, remoteSearchOptions, evtProps);
  const { isNumber, isMoney, isDateTime, isDate } = useFieldType();
  const updateDDLText = (record: Recordable, attr: CustomAttr, event: any) => {
    const ddlItem = attr.ddl.find((ddlItem: DDL) => ddlItem.value === event);
    if (ddlItem) {
      record[attr.Key + 'T'] = ddlItem.label;
      core.handleDropdownEventsCore(record, attr.Key);
      core.handleAutoFillEventsCore(record, attr.Key, event);
      core.handleFieldChangeListenersCore(record, attr.Key);
    }
  };
  const mergeAttrStyle = (attr: CustomAttr) => {
    const errStyle = attr.errStyle || {};
    return {
      ...core.mixedStyles(attr.Key),
      ...errStyle,
    };
  };
  const mixedReadonly = (attr: CustomAttr, row: Recordable) => {
    if (gloReadonly.value) return true;
    if (core.isControlFieldReadonlyCore(row, attr.Key)) return true;
    if (isDate(attr) || isDateTime(attr)) return core.isDateReadonlyCore(row, attr.Key);
    return attr.UIIsReadonly;
  };
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: new EnMapExt(),
    enableSelect: false,
  });
  //取消按钮
  const popModalCancel = () => {
    popModal.visible = false;
  };
  const componentKey = ref(0);
  const selectedRow = ref();

  const PopModalShow = (attr, row) => {
    selectedRow.value = row;
    popModal.visible = true;
    popModal.title = attr.mapExt[0].AtPara?.GetValStrByKey('Label') || '请选择' + attr.Name;
    popModal.enableSelect = attr.mapExt[0].AtPara?.GetValStrByKey('IsMultipleChoice') == '1';
    popModal.keyOfEn = attr.Key;
    popModal.width = attr.mapExt[0].W || attr.mapExt[0].width || window.innerWidth * 0.8;
    popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
    popModal.height = {
      height: attr.mapExt[0].H || window.innerHeight * 0.8 + 'px',
    };
    popModal.mapExt = attr.mapExt[0];
    popModal.modalType = attr.mapExt[0].ExtType;
    componentKey.value++;
  };
  const PopModalOK = () => {
    const checkedInfo = refPop.value!.handlerPopOK();
    if (checkedInfo[0].length === 0) {
      selectedRow.value[popModal.keyOfEn] = '';
      selectedRow.value[popModal.keyOfEn + 'T'] = '';
    } else {
      selectedRow.value[popModal.keyOfEn] = checkedInfo?.[0].join(',');
      selectedRow.value[popModal.keyOfEn + 'T'] = checkedInfo?.[1].join(',');
    }
    tableColumns.value.forEach((item) => {
      if (item.Key == popModal.keyOfEn) item['Tag'] = !selectedRow.value[popModal.keyOfEn] ? [] : selectedRow.value[popModal.keyOfEn].split(',');
    });
    popModal.visible = false;
    core.handleAutoFillEventsCore(selectedRow.value, popModal.keyOfEn, checkedInfo?.[0]?.[0]);
  };
  const removeTag = (attr, ele, idx, row) => {
    const val = row[attr.Key];
    const valT = row[attr.Key + 'T'];
    if (!!val && !!valT) {
      const arrVal: [] = val.split(',');
      arrVal.splice(idx, 1);
      row[attr.Key] = arrVal.join(',');
      const arrValT: [] = valT.split(',');
      arrValT.splice(idx, 1);
      row[attr.Key + 'T'] = arrValT.join(',');
    }
    inputBlur(row);
  };

  /**
   * 处理字段函数
   * @param attr
   */
  const validFailMap = ref(new Map());

  const isValidFailed = (attr, row) => {
    const uniKey = row[entity.value!.PK] + '_' + attr.key;
    return validFailMap.value.has(uniKey);
  };
  // DtlBatch中暂时只执行简单校验
  const inputBlur = async (row: Recordable, key = '') => {
    try {
      debugger;
      if (!!key) {
        core.handleFieldChangeListenersCore(row, key, get_db_source_func.value?.() || []);
      }
      for (const [k, _v] of validFailMap.value) {
        if (k.startsWith(row[entity.value!.PK] + '_')) {
          validFailMap.value.delete(k);
        }
      }
      const validator = entity.value!._enMap._validator;
      const validatorKeys = Object.keys(validator);
      if (validatorKeys.length == 0) return;
      // 增强验证器，为每个 validator 注入行数据
      const enhancedValidator = Object.keys(validator).reduce((acc, key) => {
        acc[key] = validator[key].map((rule) => {
          if (rule.validator) {
            return {
              ...rule,
              validator: (ruleObj, value, callback) => {
                // 将行数据作为第四个参数传递
                return rule.validator.call(row, ruleObj, value, callback, row);
              },
            };
          }
          return rule;
        });
        return acc;
      }, {});
      const validatorRef = shallowRef(enhancedValidator);
      const { validate } = useForm(row, validatorRef);
      await validate();
    } catch (errors) {
      for (const err of errors.errorFields) {
        const key = row[entity.value!.PK] + '_' + err.name;
        validFailMap.value.set(key, err.errors);
      }
      throw new Error(errors.errorFields.map((item) => item.errors[0]).join(', '));
    }
  };

  const validTable = async () => {
    let errMsg = ``;
    const dataSource = get_db_source_func.value?.() || [];
    for (const row of dataSource) {
      try {
        await inputBlur(row);
      } catch (e: any) {
        const pkVal = row[entity.value!.PK];
        errMsg += `id=[${pkVal}] - 验证失败：${e.message}\n`;
      }
    }
    if (errMsg && !props.params?.IgnoreErrorSave) {
      throw new Error(errMsg);
    }
  };

  const calcTable = () => {
    const dataSource = get_db_source_func.value?.() || [];
    // 添加Key，并求和
    tableColumns.value = tableColumns.value.map((col) => {
      let summary: string | number = '';
      if (isNumber(col.params) || isMoney(col.params)) {
        let count = 0;
        for (const item of dataSource) {
          count += parseFloat(item[col.key]);
        }
        summary = count.toFixed(2);
      }
      return {
        ...col,
        Key: col.key,
        summary,
      };
    });
  };

  const formatEntityValue = (en, attr) => {
    const key = attr.Key;

    // 根据数据类型处理值
    if (attr.MyDataType == DataType.AppBoolean) {
      en.SetValByKey(key, en[key] == 1);
    } else if (attr.MyDataType == 6 || attr.MyDataType == 7) {
      // 日期类型处理
      const value = en.GetValByKey(key);
      en[key] = !value || value.length === 0 ? '' : dayjs(value);
    } else if (attr.MyDataType == 8) {
      // 数字格式化
      en[key] = en.GetValByKey(key).toFixed(2);
    } else {
      // 其他类型
      en[key] = attr.MyDataType == 4 ? en.GetValByKey(key) == 1 : en.GetValByKey(key);
    }
  };

  const processEntityData = (entities, attrs) => {
    for (const en of entities) {
      for (const attr of attrs) {
        formatEntityValue(en, attr);
      }
    }
  };

  const gloReadonly = computed(() => {
    return ['1', true].includes(props.params?.readonly) || props.readonly;
  });

  return {
    popModal,
    PopModalShow,
    PopModalOK,
    selectedRow,
    removeTag,
    isValidFailed,
    inputBlur,
    validTable,
    calcTable,
    processEntityData,
    updateDDLText,
    mergeAttrStyle,
    mixedReadonly,
    popModalCancel,
    remoteSearchOptions,
    core,
    gloReadonly,
  };
}
