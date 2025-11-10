<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false" :required="widgetInfo.required">
      <n-input-group class="date">
        <n-input v-model:value="value" :placeholder="getCurrentFormat" :clearable="widgetInfo.clearable" :disabled="widgetInfo.readonly" :theme-overrides="InputTheme">
          <template #prefix>
            <i class="input-prefix-icon icon-calendar"></i>
          </template>
        </n-input>
        <n-input-group-label v-if="widgetInfo.suffix">{{ widgetInfo.suffix }}</n-input-group-label>
      </n-input-group>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, computed } from 'vue';
  import { NInput, NFormItem, NInputGroup, NInputGroupLabel } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { InputDatetimeItemProps } from '/@form/props/widgets/input/InputDatetimeWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'InputDatetime',
    components: {
      NInput,
      NFormItem,
      NInputGroup,
      NInputGroupLabel,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<InputDatetimeItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const numberValue = ref<number | null>(0);
      const modelValue = ref<string | [string, string] | null>('');
      const label = ref<String>(props.widgetInfo.title);
      const computedDatetime = computed(() => {
        // todo 组件时间从哪里取值
        return new Date();
      });
      return {
        modelValue,
        label,
        numberValue,
        InputTheme,
        computedDatetime,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrDT&PKVal=${props.widgetInfo.id}&s=${Math.random()}`,
        getCurrentFormat: computed((): string => {
          return props.widgetInfo?.dateFormatOptions.find((item) => item.value === props.widgetInfo?.selectedFormat)?.label as string;
        }),
        value: ref(props.widgetInfo.modelVal),
      };
    },
  });
</script>
