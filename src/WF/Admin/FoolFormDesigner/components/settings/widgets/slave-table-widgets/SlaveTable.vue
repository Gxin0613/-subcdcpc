<template>
  <BaseOptions>
    <n-form-item :label="'分组id'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.id" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'从表id'" :show-feedback="false">
      <n-input v-model:value="entity.No" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'组件名'" :show-feedback="false">
      <n-input v-model:value="entity.Name" maxlength="40" @update-value="updateConfigToDatabase('Lab', $event, false)" />
    </n-form-item>
    <n-form-item :label="'存储表'" :show-feedback="false">
      <n-input v-model:value="entity.PTable" maxlength="40" @update-value="updateConfigToDatabase('PTable', $event, false)" />
    </n-form-item>
    <n-form-item :label="'是否可见'" :show-feedback="false">
      <n-radio-group v-model:value="entity.IsView" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateConfigToDatabase('IsView', $event, false)">
        <n-radio-button :value="1">{{ '是' }}</n-radio-button>
        <n-radio-button :value="0">{{ '否' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'是否只读'" :show-feedback="false">
      <n-radio-group v-model:value="entity.IsReadonly" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateConfigToDatabase('IsReadonly', $event, false)">
        <n-radio-button :value="1">{{ '是' }}</n-radio-button>
        <n-radio-button :value="0">{{ '否' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'允许更新'" :show-feedback="false">
      <n-radio-group v-model:value="entity.IsUpdate" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateConfigToDatabase('IsUpdate', $event, false)">
        <n-radio-button :value="1">{{ '是' }}</n-radio-button>
        <n-radio-button :value="0">{{ '否' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'允许插入行'" :show-feedback="false">
      <n-radio-group v-model:value="entity.IsInsert" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateConfigToDatabase('IsInsert', $event, false)">
        <n-radio-button :value="1">{{ '是' }}</n-radio-button>
        <n-radio-button :value="0">{{ '否' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'允许删除行'" :show-feedback="false">
      <n-radio-group v-model:value="entity.IsDelete" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateConfigToDatabase('IsDelete', $event, false)">
        <n-radio-button :value="1">{{ '是' }}</n-radio-button>
        <n-radio-button :value="0">{{ '否' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <!--    <n-form-item :label="'启用多附件'" :show-feedback="false">
      <n-radio-group
        v-model:value="entity.IsEnableAthM"
        size="small"
        :theme-overrides="RadioGroupTheme"
        @update-value="updateConfigToDatabase('IsEnableAthM', $event, false)"
      >
        <n-radio-button :value="1">{{'是'}}</n-radio-button>
        <n-radio-button :value="0">{{'否'}}</n-radio-button>
      </n-radio-group>
    </n-form-item>-->
    <n-form-item :label="'列表格式'" :show-feedback="false">
      <n-radio-group v-model:value="entity.ListShowModel" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateConfigToDatabase('ListShowModel', $event, false)">
        <n-radio-button :value="0">{{ '表格' }}</n-radio-button>
        <n-radio-button :value="1">{{ '卡片' }}</n-radio-button>
        <n-radio-button :value="2">URL</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item v-if="entity.ListShowModel === 2" :label="'自定义url'" :show-feedback="false">
      <n-input v-model:value="entity.UrlDtl" maxlength="40" @update-value="updateConfigToDatabase('UrlDtl', $event, false)" />
    </n-form-item>
  </BaseOptions>
</template>

<script lang="ts" setup>
  import { useDesignerStore } from '/@/store/modules/form';
  import { computed, ComputedRef } from 'vue';
  import { NInput, NFormItem, NRadioGroup, NRadioButton } from 'naive-ui';
  import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
  import { RadioGroupTheme } from '/@form/theme/index';

  const store = useDesignerStore();
  const selectedWidget: ComputedRef = computed(() => store.selectedWidget);

  const entity = computed(() => selectedWidget.value?.entity.getData());
  const updateConfigToDatabase = (key: string, val: any, isExtraPara: boolean) => {
    const dtlEntity = selectedWidget.value.entity;

    if (key === 'Lab') {
      const dto = store.selectedWidgetDto;
      dto?.setVal('Lab', val);
      dto?.Update();
      dtlEntity?.setVal('Name', val);
      dtlEntity?.Update();
      return;
    }
    if (isExtraPara) {
      dtlEntity?.setPara(key, val);
    } else {
      dtlEntity?.setVal(key, val);
    }
    dtlEntity?.Update();
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
