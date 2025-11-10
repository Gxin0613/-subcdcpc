<template>
  <BaseOptions>
    <n-form-item :label="'组件ID'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.id" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'组件名'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.title" maxlength="40" @update-value="updateConfigToDatabase('Lab', $event, false)" />
    </n-form-item>
  </BaseOptions>
</template>

<script lang="ts" setup>
  import { useDesignerStore } from '/@/store/modules/form';
  import { computed, ComputedRef, ref } from 'vue';
  import { NInput, NFormItem } from 'naive-ui';
  import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';

  const store = useDesignerStore();
  const selectedWidget: ComputedRef = computed(() => store.selectedWidget);

  const collapse = ref(false);
  collapse.value = selectedWidget.value.dto.IsZDMobile == 1;

  const updateConfigToDatabase = (key: string, val: any, isExtraPara: boolean) => {
    const { selectedWidgetDto } = store;
    if (isExtraPara) {
      selectedWidgetDto?.setPara(key, val);
    } else {
      selectedWidgetDto?.setVal(key, val);
      selectedWidget.value.dto[key] = val;
    }
    selectedWidgetDto?.Update();
  };
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
