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
  import { InputDateItemProps } from '/@form/props/widgets/input/InputDateWidget';
  import { IosAdd } from '@vicons/ionicons4';

  // 日期组件
  export default defineComponent({
    name: 'InputDate',
    components: {
      NFormItem,
      NInputGroup,
      NInputGroupLabel,
      SelectHelper,
      NInput,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<InputDateItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const numberValue = ref<number | null>(0);
      const modelValue = ref<string | [string, string] | null>('');
      const label = ref<String>(props.widgetInfo.title);
      return {
        modelValue,
        label,
        numberValue,
        IosAdd,
        InputTheme,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrDT&PKVal=${props.widgetInfo.id}&s=${Math.random()}`,
        getCurrentFormat: computed((): string => {
          return props.widgetInfo?.dateFormatOptions.find((item) => item.value === props.widgetInfo?.selectedFormat)?.label as string;
        }),
        value: ref(props.widgetInfo.modelVal),
      };
    },
  });
</script>

<style lang="less" scoped>
  .date {
    &:deep(.n-input__suffix) {
      display: none;
    }
  }
</style>
