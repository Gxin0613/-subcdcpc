<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false" :required="widgetInfo.required">
      <n-input-group>
        <n-input-group-label v-if="widgetInfo.prefix">
          {{ widgetInfo.prefix }}
        </n-input-group-label>
        <n-input-number
          v-model:value="value"
          :placeholder="widgetInfo.placeholder"
          :theme-overrides="InputTheme"
          :clearable="widgetInfo.clearable"
          :disabled="widgetInfo.readonly"
          :show-button="widgetInfo.inputButton"
          :precision="2"
        />
        <n-input-group-label v-if="widgetInfo.suffix">
          {{ widgetInfo.suffix }}
        </n-input-group-label>
      </n-input-group>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NFormItem, NInputNumber, NInputGroup, NInputGroupLabel } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { InputAmountItemProps } from '/@form/props/widgets/input/InputAmountWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'InputAmount',
    components: {
      NFormItem,
      NInputNumber,
      NInputGroup,
      NInputGroupLabel,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<InputAmountItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<string>(props.widgetInfo.title);
      const modelVal = ref(0);
      modelVal.value = parseFloat(props.widgetInfo.modelVal) || 0.0;
      return {
        label,
        InputTheme,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrNum&PKVal=${props.widgetInfo.id}&s=${Math.random()}`,
        value: modelVal,
      };
    },
  });
</script>
<style scoped lang="less">
  .n-input-number {
    :deep(input) {
      text-align: right;
    }
  }
</style>
