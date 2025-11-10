<template>
  <Select
    :mode="multiple ? 'multiple' : undefined"
    :value="internalValue"
    :options="options"
    :placeholder="placeholder"
    :style="computedStyle"
    :disabled="disabled"
    :loading="loading"
    show-search
    allow-clear
    :filter-option="false"
    :search-value="searchKey"
    @search="handleSearch"
    @popup-scroll="handleScroll"
    @dropdown-visible-change="handleVisibleChange"
    @change="handleChange"
    :maxTagCount="maxTagCount"
    style="width: 100%"
  >
    <template #option="{ label, ...rest }">
      <template v-if="optionKeys.length > 0">
        <span v-for="(key, index) in optionKeys" :key="key" style="margin-right: 5px; color: #6b7280; font-size: 12px"> {{ index > 0 ? '|' : '' }} {{ rest[key] }} </span>
      </template>
      <template v-else>
        <span> {{ label }}</span>
      </template>
    </template>
    <template #tagRender="{ onClose, option }">
      <Tag :closable="!disabled" @close="onClose" class="ddl-tag" style="margin-right: 5px">
        {{ option?.[refText!] ?? option?.label ?? '' }}
      </Tag>
    </template>
  </Select>
</template>

<script lang="ts" setup>
  import { ref, computed, reactive, onMounted } from 'vue';
  import type { CSSProperties } from 'vue';
  import { Select, Tag } from 'ant-design-vue';
  import { EnMapExt } from '/@/bp/en/Map/EnMapExt';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { debounce } from 'lodash-es';
  type OptionItem = { value: string | number; label: string; [key: string]: any };

  const props = withDefaults(
    defineProps<{
      modelValue: string | number | Array<string | number> | null;
      // 实体类标识（必须），仅支持实体型 FK 下拉
      enClassId: string;
      // 值与显示字段，可按 Map 配置覆盖
      refKey?: string; // 默认 'No'
      refText?: string; // 默认 'Name'
      orderBy?: string; // 默认按 refText 排序
      // 绑定 label（用于写入 key+'T'）
      nameValue?: string | null;
      placeholder?: string;
      pageSize?: number;
      initialOptions?: OptionItem[];
      disabled?: boolean;
      style?: CSSProperties;
      width?: number;
      mapExts?: EnMapExt[];
    }>(),
    {
      refKey: 'No',
      refText: 'Name',
      placeholder: '请选择',
      pageSize: 20,
      initialOptions: () => [],
      disabled: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', v: string | number | Array<string | number> | null): void;
    (e: 'update:nameValue', v: string): void;
    (e: 'change', v: string | number | Array<string | number> | null, labels: string[], options: OptionItem[]): void;
  }>();

  const pagination = reactive({
    page: 1,
    pageSize: 20,
  });

  const multiple = computed(() => {
    return props.mapExts?.some((ext) => ext.ExtType === 'DDLSelect' && ext.AtPara?.GetValStrByKey('IsMultipleChoice') === '1');
  });
  const optionKeys = computed(() => {
    return (
      props.mapExts
        ?.find((ext) => ext.ExtType === 'DDLSelect')
        ?.AtPara?.GetValStrByKey('OptionKeys')
        ?.split(',') || []
    );
  });

  const maxTagCount = computed(() => {
    const maxTagCount = props.mapExts?.find((ext) => ext.ExtType === 'DDLSelect')?.AtPara?.GetValIntByKey('MaxTagCount');
    return maxTagCount ? Math.max(maxTagCount, 2) : 2;
  });
  const options = ref<OptionItem[]>([...props.initialOptions]);
  const total = ref<number>(0);
  const loading = ref<boolean>(false);
  const searchKey = ref<string>('');
  const opened = ref<boolean>(false);

  const computedStyle = computed(() => ({ width: (props.width || 200) + 'px', ...(props.style || {}) }));

  const internalValue = computed({
    get() {
      const mv = props.modelValue as any;
      if (multiple.value) {
        if (Array.isArray(mv)) {
          const cleaned = mv.filter((v) => v !== '' && v != null);
          return cleaned;
        }
        if (mv === '' || mv == null) return [];
        if (typeof mv === 'string') return mv.split(',').filter((v) => v !== '' && v != null);
        return Array.isArray(mv) ? mv : [mv];
      }
      // 单选
      if (mv === '' || mv == null) return undefined;
      if (Array.isArray(mv)) return mv[0];
      return mv;
    },
    set(v: any) {
      if (multiple.value) emit('update:modelValue', Array.isArray(v) ? v.join(',') : v ?? null);
      else emit('update:modelValue', v ?? null);
    },
  });

  function uniquePush(target: OptionItem[], items: OptionItem[]) {
    const valueSet = new Set(target.map((i) => String(i.value)));
    //const labelSet = new Set(target.map((i) => String(i.label)));
    for (const it of items) {
      const vStr = String(it.value);
      const lStr = String(it.label);
      if (valueSet.has(vStr)) continue;
      // if (valueSet.has(vStr) || labelSet.has(lStr)) continue;
      target.push({ ...it, value: vStr as any, label: lStr });
      valueSet.add(vStr);
      //  labelSet.add(lStr);
    }
  }

  async function loadPage(reset = false) {
    if (loading.value) return;
    loading.value = true;
    try {
      if (reset) pagination.page = 1;
      const { items, total: t } = await fetchOptions();
      total.value = t || 0;
      // 保留选中的options
      const selectedOptions = options.value.filter((o) => internalValue.value?.includes(o.value));
      if (reset) options.value = [...selectedOptions];
      uniquePush(options.value, items || []);
    } finally {
      loading.value = false;
    }
  }

  const extSearchKeys = computed(() => {
    return (
      props.mapExts
        ?.find((ext) => ext.ExtType === 'DDLSelect')
        ?.AtPara?.GetValStrByKey('ExtSearchKeys')
        ?.split(',') || []
    );
  });

  async function fetchOptions(): Promise<{ items: OptionItem[]; total: number }> {
    const orderBy = props.orderBy;
    const classId = props.mapExts?.find((ext) => ext.ExtType === 'DDLSelect')?.Tag2 || '';
    if (!classId) return { items: [], total: 0 };
    const entities = await ClassFactory.GetEns(classId);
    const resp = await entities.RetrieveByPage(pagination.page, pagination.pageSize, searchKey.value, [props.refKey!, props.refText!, ...extSearchKeys.value], orderBy);
    let data = resp.Data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (_) {
        return { items: [], total: 0 };
      }
    }
    const list: OptionItem[] = data.map((r) => ({ value: String(r[props.refKey!]), label: String(r[props.refText!]), ...r }));
    const totalCount = resp.TotalCount ?? 0;
    return { items: list, total: totalCount };
  }

  function handleVisibleChange(v: boolean) {
    opened.value = v;
    if (v && options.value.length === 0) {
      pagination.page = 1;
      loadPage(true);
    }
  }

  function handleScroll(e: UIEvent) {
    const el = e.target as HTMLElement;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    const hasMore = options.value.length < total.value;
    if (opened.value && nearBottom && hasMore && !loading.value) {
      pagination.page += 1;
      loadPage(false);
    }
  }

  const handleSearch = debounce((val: string) => {
    searchKey.value = val || '';
    pagination.page = 1;
    loadPage(true);
  }, 300);

  function handleChange(value: any, option: any) {
    // 归一化 labels
    const opts: OptionItem[] = Array.isArray(option)
      ? option.map((o: any) => ({ value: o.value, label: o[props.refText!] ?? o.label }))
      : option
      ? [{ value: option.value, label: option[props.refText!] ?? option.label }]
      : [];
    const labels: string[] = opts.map((o) => o.label);
    // 点击后清空输入
    if (props.mapExts?.find((ext) => ext.ExtType === 'DDLSelect')?.AtPara?.GetValStrByKey('ClearInputWhenChecked') === '1') {
      searchKey.value = '';
    }
    const updateVals = Array.isArray(value) ? value.join(',') : value;
    emit('update:modelValue', updateVals ?? null);
    emit('update:nameValue', labels.join(','));
    emit('change', updateVals ?? null, labels, opts);
  }

  const loadSelectedOptions = async () => {
    let vals = props.modelValue || '';
    if (typeof vals === 'string') {
      if (vals.trim() === '') return;
      if (vals.includes(',')) {
        vals =
          '(' +
          vals
            .split(',')
            .map((val) => {
              return `'${val}'`;
            })
            .join(',') +
          ')';
      } else {
        vals = `('${vals}')`;
      }
    }
    const entities = await ClassFactory.GetEns(props.enClassId);
    await entities.RetrieveIn(entities.GetNewEntity.PK, vals as string);
    const list: OptionItem[] = entities.map((r) => {
      const row = Object.fromEntries(r.Row);
      return { value: String(r[props.refKey!]), label: String(row[props.refText!]), ...row };
    });
    uniquePush(options.value, list);
  };

  onMounted(() => {
    const pageSize = props.mapExts?.find((ext) => ext.ExtType === 'DDLSelect')?.AtPara?.GetValIntByKey('PageSize');
    pagination.pageSize = pageSize || 20;
    loadSelectedOptions().then(() => {
      loadPage(true);
    });
  });
</script>

<style scoped lang="less">
  .ddl-tag {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    color: #1e40af;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    font-size: 12px;
    padding: 2px 8px;

    :deep(.ant-tag-close-icon) {
      color: #6b7280;
      margin-left: 4px;

      &:hover {
        color: #ef4444;
      }
    }
  }
</style>
