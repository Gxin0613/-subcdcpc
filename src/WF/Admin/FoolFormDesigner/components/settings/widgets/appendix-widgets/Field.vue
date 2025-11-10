<template>
  <BaseOptions>
    <n-form-item :label="'组件ID'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.id" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'组件名'" :show-feedback="false">
      <n-input
        v-model:value="selectedWidget.title"
        maxlength="40"
        @update-value="
          updateConfigToDatabase('Name', $event, false);
          updateAttachConfig('Name', $event, false);
        "
      />
    </n-form-item>
    <n-form-item :label="'格式要求'" :show-feedback="false">
      <n-input v-model:value="setting.Exts" maxlength="40" @update-value="updateAttachConfig('Exts', $event, false)" />
    </n-form-item>
    <!-- <n-form-item :label="'允许上传'" :show-feedback="false">
      <n-switch v-model:value="setting.IsUpload" size="small" @update-value="updateAttachConfig('IsUpload', $event ? 1 : 0, true)" />
    </n-form-item>
    <n-form-item :label="'允许下载'" :show-feedback="false">
      <n-switch v-model:value="setting.IsDownload" size="small" @update-value="updateAttachConfig('IsDownload', $event ? 1 : 0, true)" />
    </n-form-item> -->
    <n-form-item :label="'是否可见'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.visible" size="small" @update-value="updateConfigToDatabase('UIVisible', $event ? 1 : 0, true)" />
    </n-form-item>
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
  </BaseOptions>
</template>

<script lang="ts" setup>
  /**
   * 行内附件
   */
  import { useDesignerStore } from '/@/store/modules/form';
  import { computed, ref, ComputedRef } from 'vue';
  import { NInput, NFormItem, NSwitch } from 'naive-ui';
  import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
  import SpanHelper from '/@form/components/helper/SpanHelper.vue';
  import Entity from '/@form/dto/Entity';

  const store = useDesignerStore();
  const cols = computed(() => store.globalFormConfig.cols);
  const selectedWidget: ComputedRef = computed(() => store.selectedWidget);
  const setting = ref<{
    IsUpload: boolean;
    IsDownload: boolean;
    Exts: string;
  }>({
    IsUpload: false,
    IsDownload: false,
    Exts: '',
  });
  const attachment = new Entity('BP.Sys.FrmAttachment', selectedWidget.value.id);
  attachment.Init().then(() => {
    try {
      setting.value = JSON.parse(JSON.stringify(attachment.getData()));
    } catch (e) {
      setting.value = {
        IsUpload: false,
        IsDownload: false,
        Exts: '',
      };
    }
  });

  const updateAttachConfig = (key: string, val: any, isExtraPara: boolean) => {
    if (isExtraPara) {
      attachment?.setPara(key, val);
    } else {
      attachment?.setVal(key, val);
    }
    attachment?.Update();
  };

  const updateConfigToDatabase = (key: string, val: any, isExtraPara: boolean) => {
    const { selectedWidgetDto } = store;
    if (isExtraPara) {
      selectedWidgetDto?.setPara(key, val);
    } else {
      selectedWidgetDto?.setVal(key, val);
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
