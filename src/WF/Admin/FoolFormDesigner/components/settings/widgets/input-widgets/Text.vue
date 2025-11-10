<template>
  <BaseOptions>
    <n-form-item :label="'组件ID'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.KeyOfEn" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'组件名'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.title" maxlength="40" @update-value="updateConfigToDatabase('Name', $event, false)" />
    </n-form-item>
    <n-form-item :label="'字段提示'" :show-feedback="false">
      <n-input v-model:value="selectedWidget.placeholder" :placeholder="'请输入提示'" @update-value="updateConfigToDatabase('Tip', $event, false)" />
    </n-form-item>
    <n-form-item :label="'后置提示'" :show-feedback="false">
      <n-input
        :disabled="selectedWidget.inputType === 'textarea'"
        v-model:value="selectedWidget.suffix"
        :placeholder="'输入后置内容'"
        @update-value="updateConfigToDatabase('suffix', $event, true)"
      />
    </n-form-item>

    <n-form-item :label="'文本类型'" :show-feedback="false">
      <n-select v-model:value="selectedWidget.inputType" :options="selectOptions" @update-value="updateConfigToDatabase('TextModel', $event, false)" />
    </n-form-item>

    <n-form-item :label="'前置图标'" :show-feedback="false">
      <div class="icon-select">
        <i v-if="selectedWidget.inputIcon !== '0'" class="input-prefix-icon" :class="selectedWidget.inputIcon"></i>
        <span class="un-selected" v-else>未选择...</span>
        <n-button secondary @click="pickerVisible = true">{{ '选择图标' }}</n-button>
      </div>
    </n-form-item>

    <!--多行文本设置项-->
    <n-form-item v-if="['2', '3'].includes(selectedWidget.inputType)" :label="'UI高度'" :show-feedback="false">
      <n-input-number
        v-model:value="selectedWidget.dto.UIHeight"
        @update:value="checkMultiTBHeight"
        :min="45"
        :max="2000"
        :update-value-on-input="false"
        :placeholder="'输入UI高度'"
        @update-value="updateConfigToDatabase('UIHeight', $event, false)"
      />
    </n-form-item>

    <n-form-item v-if="['2', '3'].includes(selectedWidget.inputType)" :label="'超长文本'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.isSuperText" size="small" @update-value="updateConfigToDatabase('IsSupperText', $event ? 1 : 0, false)" />
    </n-form-item>

    <n-form-item :label="'是否可见'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.visible" size="small" @update-value="updateConfigToDatabase('UIVisible', $event ? 1 : 0, false)" />
    </n-form-item>
    <n-form-item :label="'清空按钮'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.clearable" size="small" @update-value="updateConfigToDatabase('clearable', $event ? 1 : 0, true)" />
    </n-form-item>

    <n-form-item :label="'是否只读'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.readonly" size="small" @update-value="updateConfigToDatabase('UIIsEnable', $event ? 0 : 1, false)" />
    </n-form-item>

    <n-form-item :label="'是否必填'" :show-feedback="false">
      <n-switch v-model:value="selectedWidget.required" size="small" @update-value="updateConfigToDatabase('UIIsInput', $event ? 1 : 0, false)" />
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
  <n-modal v-model:show="pickerVisible" to="body" preset="card" :title="'图标切换'" :style="bodyStyle">
    <icon-picker @pick-icon="updateIcon" />
  </n-modal>
</template>

<script lang="ts" setup>
  import { useDesignerStore } from '/@/store/modules/form';
  import { computed, ref, ComputedRef, reactive } from 'vue';
  import { NInput, NInputNumber, NFormItem, NSwitch, NSelect, NButton, NModal } from 'naive-ui';
  import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  import SpanHelper from '/@form/components/helper/SpanHelper.vue';
  import Event from '/@/utils/Events';
  const checkMultiTBHeight = (height: number) => {
    selectedWidget.value.dto.UIHeight = height > 2000 ? 2000 : height <= 45 ? 45 : height;
  };

  const store = useDesignerStore();
  const cols = computed(() => store.globalFormConfig.cols);
  // 所选组件
  const selectedWidget: ComputedRef = computed(() => store.selectedWidget);

  const selectOptions = reactive([
    {
      label: '文本框',
      value: '0',
    },
    {
      label: '密码框',
      value: '1',
    },
    {
      label: '大块文本',
      value: '2',
    },
    {
      label: '富文本',
      value: '3',
    },
  ]);
  const updateConfigToDatabase = (key: string, val: any, isExtraPara: boolean) => {
    const { selectedWidgetDto } = store;
    // 处理UI高度, 如果能设置肯定是多行类型
    if (key === 'UIHeight') {
      let height = parseInt(val);
      if (!height || height < 45) {
        height = 45;
      }
      selectedWidgetDto?.setVal('UIHeight', height);
      selectedWidget.value.dto.UIHeight = height;
    }
    // 文本类型切换处理
    if (key === 'TextModel') {
      // 多行时如果发现高度小于45，设置多行最小值45
      if (['2', '3'].includes(val) && selectedWidgetDto?.getData().UIHeight < 45) {
        selectedWidgetDto?.setVal('UIHeight', 45);
        selectedWidget.value.dto.UIHeight = 45;
        // 单行切换为23
      }
      if (['0', '1'].includes(val) && selectedWidgetDto?.getData().UIHeight !== 23) {
        selectedWidgetDto?.setVal('UIHeight', 23);
        selectedWidget.value.dto.UIHeight = 23;
      }
    }
    // 判断是不是AtPara参数
    if (isExtraPara) {
      selectedWidgetDto?.setPara(key, val);
    } else {
      selectedWidgetDto?.setVal(key, val);
    }
    selectedWidgetDto?.Update();
  };

  const bodyStyle = computed(() => {
    return {
      width: '800px',
      height: '600px',
    };
  });

  const pickerVisible = ref(false);
  const updateIcon = (item: string) => {
    selectedWidget.value.inputIcon = item;
    updateConfigToDatabase('ICON', item, false);
    pickerVisible.value = false;
    Event.emit('reloadForm', false);
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

  .icon-select {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #eeeeee;
    padding-left: 12px;
    font-size: 14px;

    .un-selected {
      color: #999999;
    }
  }
</style>
