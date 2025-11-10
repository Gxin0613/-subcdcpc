<template>
  <BaseOptions>
    <n-form-item :label="'附件ID'" :show-feedback="false">
      <n-input v-model:value="setting.NoOfObj" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'分组ID'" :show-feedback="false">
      <n-input v-model:value="setting.GroupID" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'控件ID'" :show-feedback="false">
      <n-input v-model:value="setting.CtrlID" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'组件名'" :show-feedback="false">
      <n-input v-model:value="setting.Name" maxlength="40" @update-value="updateConfigToDatabase('Name', $event, false)" />
    </n-form-item>
    <n-form-item :label="'格式要求'" :show-feedback="false">
      <n-input v-model:value="setting.Exts" maxlength="40" @update-value="updateConfigToDatabase('Exts', $event, false)" />
    </n-form-item>
    <n-form-item :label="'附件类型'" :show-feedback="false">
      <n-select v-model:value="selectedWidget.fileType" :options="options" @update-value="updateConfigToDatabase('FileType', parseInt($event), false)" />
    </n-form-item>
    <!-- <n-form-item :label="'允许上传'" :show-feedback="false">
      <n-switch v-model:value="setting.IsUpload" size="small" @update-value="updateConfigToDatabase('IsUpload', $event ? 1 : 0, true)" />
    </n-form-item>
    <n-form-item :label="'允许下载'" :show-feedback="false">
      <n-switch v-model:value="setting.IsDownload" size="small" @update-value="updateConfigToDatabase('IsDownload', $event ? 1 : 0, true)" />
    </n-form-item> -->
  </BaseOptions>
</template>

<script lang="ts" setup>
  /**
   * 表格附件
   */
  import { useDesignerStore } from '/@/store/modules/form';
  import { computed, ref, ComputedRef } from 'vue';
  import { NInput, NFormItem, NSelect } from 'naive-ui';
  import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
  import Entity from '/@form/dto/Entity';
  import { SelectMixedOption } from 'naive-ui/es/select/src/interface';

  const store = useDesignerStore();
  const selectedWidget: ComputedRef = computed(() => store.selectedWidget);

  const setting = ref<Recordable>({
    IsUpload: false,
    IsDownload: false,
    Exts: '',
    Name: '',
    NoOfObj: '',
    GroupID: -1,
    CtrlID: '',
  });
  const attachment = new Entity('BP.Sys.FrmAttachment', selectedWidget.value.dto.CtrlID);
  attachment.Init().then(() => {
    console.log(attachment);
    try {
      setting.value = JSON.parse(JSON.stringify(attachment.getData()));
    } catch (e) {
      setting.value = {
        IsUpload: false,
        IsDownload: false,
        Exts: '',
        Name: '',
        NoOfObj: '',
        GroupID: -1,
        CtrlID: '',
      };
    }
  });

  const options: SelectMixedOption[] = [
    { value: '0', label: '普通附件' },
    { value: '1', label: '图片附件' },
  ];

  const updateConfigToDatabase = (key: string, val: any, isExtraPara: boolean) => {
    const { selectedWidgetDto } = store;
    if (isExtraPara) {
      attachment?.setPara(key, val);
    } else {
      attachment?.setVal(key, val);
    }
    if (key === 'Name') {
      selectedWidgetDto?.setVal('Lab', val);
      selectedWidget.value.title = val;
      selectedWidgetDto?.Update();
    }
    if (key === 'FileType') {
      selectedWidget.value.fileType = val;
    }
    attachment?.Update();
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
