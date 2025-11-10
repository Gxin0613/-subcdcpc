<template>
  <BaseOptions>
    <n-form-item :label="'组件ID'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.KeyOfEn" :disabled="true" />
    </n-form-item>
    <n-form-item v-if="isFK" :label="'外键值'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.enumKey" :disabled="true" />
    </n-form-item>
    <n-form-item v-else :label="'枚举key'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.enumKey" :disabled="true" />
      <!-- <n-button color="#1890ff" @click="editEnums">{{'编辑'}}</n-button> -->
    </n-form-item>
    <n-form-item :label="'组件名'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.title" maxlength="40" @update-value="updateConfigToDatabase('Name', $event, false)" />
    </n-form-item>
    <!--    这里启用禁用文字当且仅当是开关时生效-->
    <template v-if="selectedWidget.dto.LGType === 0 && selectedWidget.dto.UIContralType === DBEnums.CheckBok">
      <n-form-item :label="'启用文字'" :show-feedback="false">
        <n-input v-model:value="selectedWidget.checkedTips" @update-value="updateConfigToDatabase('checkedTips', $event, true)" />
      </n-form-item>
      <n-form-item :label="'禁用文字'" :show-feedback="false">
        <n-input v-model:value="selectedWidget.unCheckedTips" @update-value="updateConfigToDatabase('unCheckedTips', $event, true)" />
      </n-form-item>
    </template>
    <n-form-item :label="'是否可见'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.visible" size="small" @update-value="updateConfigToDatabase('UIVisible', $event ? 1 : 0, false)" />
    </n-form-item>
    <n-form-item :label="'是否只读'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.readonly" size="small" @update-value="updateConfigToDatabase('UIIsEnable', $event ? 0 : 1, false)" />
    </n-form-item>
    <n-form-item v-if="!(selectedWidget.uiType === DBEnums.CheckBok && selectedWidget.dto.LGType === 0)" :label="'是否必填'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.required" size="small" @update-value="updateConfigToDatabase('UIIsInput', $event ? 1 : 0, false)" />
    </n-form-item>
    <template v-if="selectedWidget.dto.LGType !== 0">
      <n-form-item :label="'选项布局'" :show-feedback="false">
        <n-radio-group
          v-model:value="selectedWidget.direction"
          :disabled="selectedWidget.uiType === 1"
          size="small"
          :theme-overrides="RadioGroupTheme"
          @update-value="updateConfigToDatabase('RBShowModel', $event, true)"
        >
          <n-radio-button value="3">{{ '横向' }}</n-radio-button>
          <n-radio-button value="0">{{ '竖向' }}</n-radio-button>
        </n-radio-group>
      </n-form-item>

      <n-form-item :label="'控件类型'" :show-feedback="false">
        <n-radio-group v-model:value="selectedWidget.uiType" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateConfigToDatabase('UIContralType', $event, false)">
          <n-radio-button :value="1">{{ '下拉' }}</n-radio-button>
          <n-radio-button :value="2">{{ '复选' }}</n-radio-button>
          <n-radio-button :value="3">{{ '单选' }}</n-radio-button>
        </n-radio-group>
      </n-form-item>
    </template>

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
  import { useDesignerStore } from '/@/store/modules/form';
  import { computed, ComputedRef } from 'vue';
  import { NInput, NFormItem, NRadioGroup, NRadioButton, NSwitch } from 'naive-ui';
  import { RadioGroupTheme } from '/@form/theme/index';
  import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
  import { DBEnums } from '/@form/props/database/DatabaseFormItem';
  import SpanHelper from '/@form/components/helper/SpanHelper.vue';

  const store = useDesignerStore();
  const cols = computed(() => store.globalFormConfig.cols);
  // 所选组件
  const selectedWidget: ComputedRef = computed(() => store.selectedWidget);
  const updateConfigToDatabase = (key: string, val: any, isExtraPara: boolean) => {
    const { selectedWidgetDto } = store;
    if (isExtraPara) {
      selectedWidgetDto?.setPara(key, val);
    } else {
      selectedWidgetDto?.setVal(key, val);
    }
    selectedWidgetDto?.Update();
  };

  // 判断是否外键
  const isFK = computed(() => {
    const data = store?.selectedWidgetDto?.getData();
    return data?.LGType === 0 && data?.UIContralType === 1;
  });

  // const editEnums = () => {
  //   store.professionSettingUrl = '../../Admin/CCFormDesigner/DialogCtr/EnumerationNew.htm?DoType=FrmEnumeration_SaveEnum&EnumKey=' + selectedWidget.value.enumKey;
  //   store.professionSettingTitle = '枚举值编辑';
  //   store.professionSettingType = 'EN';
  //   store.professionSettingVisible = true;
  // };
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
