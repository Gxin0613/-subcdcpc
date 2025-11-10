<template>
  <slot name="title"></slot>
  <VantField
    v-for="kwItem in keywordList"
    :label="kwItem.label"
    :key="kwItem.key"
    v-model="kwItem.value"
    :placeholder="kwItem.placeholder || '请输入关键字'"
  />
  <template v-if="Array.isArray(selectList) && selectList.length > 0">
    <VantField readonly :label="selectList[0].label" :placeholder="'请选择' + selectList[0].label">
      <template #input>
        <VantRadioGroup v-model="firstSelectVal" :max="1" :direction="selectList[0].options.length <= 3 ? 'horizontal' : undefined">
          <VantRadio v-for="option in selectList[0].options" :key="option.value" :name="option.value">{{ option.label }}</VantRadio>
        </VantRadioGroup>
      </template>
    </VantField>
  </template>
  <VantField
    v-for="dateItem in dateList"
    :key="dateItem.key"
    readonly
    v-model="dateItem.strValue"
    :label="dateItem.label"
    :placeholder="`${dateItem.startPlaceholder} ~ ${dateItem.endPlaceholder}`"
    @click="openCalendar(dateItem)"
  />
  <VantCalendar v-model:show="calendarOption.visible" :min-date="minDate" :type="calendarOption.type" @confirm="onCalendarChecked" />
  <template v-for="condition in selectList.filter((item) => item.key !== 'date-query-key')" :key="condition.key">
    <VantField
      :label="condition.label"
      v-model="condition.valStr"
      is-link
      readonly
      @click="
        () => {
          picker.options = condition.options as any;
          picker.onConfirm = ({selectedOptions }) => {
            condition.valStr = selectedOptions[0]?.text;
            condition.value = selectedOptions[0]?.value;
            picker.visible = false;
          };
          picker.visible = true;
        }"
    />
  </template>
  <VanPopup v-model:show="picker.visible" position="bottom">
    <VanPicker :columns="picker.options" @confirm="picker.onConfirm" @cancel="picker.visible = false" />
  </VanPopup>
  <template v-for="button in buttonList.filter((btn) => ['查询', '分析', '报表'].includes(btn.name))">
    <VantButton v-if="button.name === '查询'" style="margin-top: 24px" block size="small" round :key="button.key" type="primary" :shape="button.shape" @click="viewAsTable(button)">
      {{ button.name }}
    </VantButton>
    <VantButton v-if="button.name === '分析'" style="margin-top: 24px" block size="small" round :key="button.key" type="primary" :shape="button.shape" @click="unImpl">{{
      button.name
    }}</VantButton>
    <VantButton v-if="button.name === '报表'" style="margin-top: 24px" block size="small" round :key="button.key" type="primary" :shape="button.shape" @click="unImpl">{{
      button.name
    }}</VantButton>
  </template>
</template>

<script lang="ts" setup>
  
  import {
    Field as VantField,
    Popup as VanPopup,
    RadioGroup as VantRadioGroup,
    Radio as VantRadio,
    Button as VantButton,
    CalendarType,
    Picker as VanPicker,
    Calendar as VantCalendar,
    Toast,
  } from 'vant';
  import type { DateConditionDef, KeyWordConditionDef, SelectConditionDef, ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import { computed, reactive } from 'vue';
  import dayjs from 'dayjs';
  import { on } from 'events';
  const props = defineProps({
    buttonList: {
      type: Array as PropType<ToolbarButtonDef[]>,
      default: () => [],
    },
    keywordList: {
      type: Array as PropType<KeyWordConditionDef[]>,
      default: () => [],
    },
    dateList: {
      type: Array as PropType<DateConditionDef[]>,
      default: () => [],
    },
    selectList: {
      type: Array as PropType<SelectConditionDef[]>,
      default: () => [],
    },
    displayButtonAsDropdown: {
      type: Boolean,
      default: false,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    displayMode: {
      type: String,
      default: 'table',
    },
    isShowSetting: {
      type: Boolean,
      default: true,
    },
  });
  const handleTimestamp = (ts: number | undefined | null) => {
    if (ts) {
      return dayjs(ts).locale('zh-cn').format('YYYY-MM-DD');
    }
    return '';
  };
  const unImpl = () => {
    Toast.info('开发中');
  };
  const picker = reactive<{
    visible: boolean;
    options: { label: string; value: string; text: string }[];
    onConfirm: Function;
  }>({
    visible: false,
    options: [],
    onConfirm: () => {},
  });
  const minDate = dayjs().subtract(30, 'day').toDate();
  const onCalendarChecked = (date) => {
    calendarOption.onChange(date);
    if (calendarOption.dateOption) {
      calendarOption.dateOption.value = date;
      if (Array.isArray(date)) {
        calendarOption.dateOption.strValue = `${handleTimestamp(date[0])} ~ ${handleTimestamp(date[1])}`;
      } else {
        calendarOption.dateOption.strValue = handleTimestamp(date);
      }
    }
    calendarOption.visible = false;
  };
  const calendarOption = reactive<{
    visible: boolean;
    type: CalendarType;
    dateOption: DateConditionDef | null;
    onChange: Function;
  }>({
    visible: false,
    type: 'range',
    dateOption: null,
    onChange: () => {},
  });
  const openCalendar = (dateOption) => {
    calendarOption.type = dateOption.type.includes('range') ? 'range' : ('single' as CalendarType);
    calendarOption.onChange = dateOption.onChange;
    calendarOption.dateOption = dateOption;
    calendarOption.visible = true;
  };
  const emit = defineEmits(['close-filter', 'clean-filter', 'GroupInitPage', 'view-as-rpt', 'view-as-table', 'open-dict-settings', 'update-first-ddl']);
  const viewAsTable = async (button: ToolbarButtonDef) => {
    await button?.onClick?.();
    emit('close-filter');
    // emit('view-as-table');
  };
  const firstSelectVal = computed({
    get() {
      if (Array.isArray(props.selectList) && props.selectList.length > 0) {
        return props.selectList[0].value;
      }
      return '';
    },
    set(val) {
      emit('update-first-ddl', val);
    },
  });
</script>
