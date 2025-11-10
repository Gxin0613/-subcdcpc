<script setup lang="ts">
  import { RadioGroupTheme } from '/@form/theme';
  import { FormItem } from '/@form/props/form/FormComponents';
  import { computed, type PropType } from 'vue';
  import { NRadioGroup, NRadioButton } from 'naive-ui';
  import { allowWholeLine } from '/@form/utils/SpanUtils';
  type UpdateFunc = (fieldName: string, originEvt: any, isExtraProp: boolean) => void;
  type SelectedWidget = FormItem & {
    inputSpan: number;
    labelSpan: number;
    inputType: string;
    dto: Recordable;
  };

  const props = defineProps({
    selectedWidget: {
      type: Object as PropType<SelectedWidget>,
      required: true,
    },
    changeSpanType: {
      type: String,
      required: true,
    },
    compareSpanType: {
      type: String,
      required: true,
    },
    alias: {
      type: String,
      default: '',
    },
    updateFunc: {
      type: Function as PropType<UpdateFunc>,
      required: true,
    },
    cols: {
      type: Number,
      required: true,
    },
  });
  const emit = defineEmits(['update-span']);
  const widgetSpan = computed({
    get() {
      const { selectedWidget, changeSpanType } = props;
      return selectedWidget[changeSpanType];
    },
    set(val: number) {
      emit('update-span', props.changeSpanType, val);
    },
  });
</script>

<template>
  <n-radio-group v-model:value="widgetSpan" size="small" :theme-overrides="RadioGroupTheme" @update-value="updateFunc(alias, $event, false)" class="span-control">
    <n-radio-button :value="1">1</n-radio-button>
    <n-radio-button :value="2" :disabled="selectedWidget[compareSpanType] + 2 > cols">2</n-radio-button>
    <n-radio-button :value="3" :disabled="selectedWidget[compareSpanType] + 3 > cols">3</n-radio-button>
    <template v-if="cols === 6">
      <n-radio-button :value="4" :disabled="selectedWidget[compareSpanType] + 4 > cols">4</n-radio-button>
      <n-radio-button :value="5" :disabled="selectedWidget[compareSpanType] + 5 > cols">5</n-radio-button>
    </template>
    <template v-if="allowWholeLine(selectedWidget) && changeSpanType === 'inputSpan'">
      <n-radio-button v-if="cols === 4" :value="4">{{ '整行' }}</n-radio-button>
      <n-radio-button v-else-if="cols === 6" :value="6">{{ '整行' }}</n-radio-button>
    </template>
  </n-radio-group>
</template>

<style scoped lang="less">
  .span-control {
    :deep(.n-radio-button) {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
</style>
