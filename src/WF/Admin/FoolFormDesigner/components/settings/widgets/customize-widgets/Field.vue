<template>
  <BaseOptions>
    <n-form-item :label="'组件ID'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.id" :disabled="true" />
    </n-form-item>

    <n-form-item :label="'组件名'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.title" maxlength="40" @update-value="updateConfigToDatabase(selectedWidget.key !== 'iframe' ? 'Name' : 'Lab', $event, false)" />
    </n-form-item>

    <!-- <n-form-item :label="'组件状态'" :show-feedback="false">
      <n-select v-model:value="selectedWidget.inputType" :options="selectOptions" @update-value="updateConfigToDatabase('UIIsEnable', $event, false)" />
    </n-form-item> -->
    <n-form-item :label="'组件状态'" :show-feedback="false">
      <n-radio-group
        v-model:value="selectedWidget.dto.UIIsEnable"
        :theme-overrides="RadioGroupTheme"
        size="small"
        @update-value="updateConfigToDatabase('UIIsEnable', $event, false)"
        class="span-control"
      >
        <n-radio-button v-for="btn in selectOptions" :key="btn.value" :value="btn.value">{{ btn.label }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <template v-if="selectedWidget.key !== 'iframe'">
      <n-form-item :label="'标签栅格'" :show-feedback="false">
        <SpanHelper
          :cols="cols"
          :change-span-type="'labelSpan'"
          :compare-span-type="'inputSpan'"
          :alias="'LabelColSpan'"
          :update-func="updateConfigToDatabase"
          :selected-widget="selectedWidget"
          @update-span="(key: string, val: number) => selectedWidget[key] = val"
        />
      </n-form-item>
      <n-form-item :label="'控件栅格'" :show-feedback="false">
        <SpanHelper
          :cols="cols"
          :change-span-type="'inputSpan'"
          :compare-span-type="'labelSpan'"
          :alias="'ColSpan'"
          :update-func="updateConfigToDatabase"
          :selected-widget="selectedWidget"
          @update-span="(key: string, val: number) => selectedWidget[key] = val"
        />
      </n-form-item>
    </template>
  </BaseOptions>
</template>

<script lang="ts" setup>
  import { useDesignerStore } from '/@/store/modules/form';
  import { computed, reactive } from 'vue';
  import { NInput, NFormItem, NRadioGroup, NRadioButton } from 'naive-ui';
  import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
  import SpanHelper from '/@form/components/helper/SpanHelper.vue';
  import { RadioGroupTheme } from '/@form/theme';
  const store = useDesignerStore();
  const selectedWidget: any = computed(() => store.selectedWidget);

  const cols = computed(() => store.globalFormConfig.cols);

  const updateConfigToDatabase = (key: string, val: any, isExtraPara: boolean) => {
    const { selectedWidgetDto } = store;
    if (isExtraPara) {
      selectedWidgetDto?.setPara(key, val);
    } else {
      selectedWidgetDto?.setVal(key, val);
    }
    selectedWidgetDto?.Update();
  };
  const selectOptions = reactive([
    {
      label: '禁用',
      value: 0,
    },
    {
      label: '启用',
      value: 1,
    },
    {
      label: '只读',
      value: 2,
    },
  ]);
</script>

<style lang="less" scoped>
  .input-options {
    width: 100%;
    height: 100%;

    &:deep(.n-form-item .n-form-item-blank) {
      padding-left: 8px;
      padding-right: 8px;
    }
  }
</style>
