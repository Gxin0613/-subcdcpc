<template>
  <select-helper :widget="widgetInfo" class="input-text" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :label-placement="labelPlacement" :show-feedback="false" :required="widgetInfo.required">
      <n-input-group>
        <n-input-group-label v-if="widgetInfo.prefix">{{ widgetInfo.prefix }}</n-input-group-label>
        <n-input
          v-model:value="value"
          :placeholder="widgetInfo.placeholder"
          :theme-overrides="InputTheme"
          :clearable="widgetInfo.clearable"
          :disabled="widgetInfo.readonly"
          :type="getType(widgetInfo.inputType)"
          :style="allowWholeLine(widgetInfo) ? `height:${widgetInfo?.dto?.UIHeight}px` : ``"
        >
          <template #prefix v-if="widgetInfo.inputIcon">
            <i class="input-prefix-icon" :class="widgetInfo.inputIcon"></i>
          </template>
        </n-input>
        <n-input-group-label v-if="widgetInfo.suffix && getType(widgetInfo.inputType) !== 'textarea'">
          {{ widgetInfo.suffix }}
        </n-input-group-label>
      </n-input-group>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, computed, ComputedRef } from 'vue';
  import { NFormItem, NInput, NInputGroup, NInputGroupLabel } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { InputItemProps } from '/@form/props/widgets/input/InputTextWidget';
  import { allowWholeLine } from '/@form/utils/SpanUtils';
  type NInputType = 'text' | 'password' | 'textarea' | undefined;

  const types = new Map<string, string>([
    ['0', 'text'],
    ['1', 'password'],
    ['2', 'textarea'],
    ['3', 'textarea'],
  ]);

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'InputText',
    components: {
      NFormItem,
      NInput,
      NInputGroup,
      NInputGroupLabel,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<InputItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const numberValue = ref<number | null>(0);
      const modelValue = ref<string | [string, string] | null>('');
      const label = ref<String>(props.widgetInfo.title);
      const labelPlacement: ComputedRef = computed(() => {
        const { widgetInfo } = props;
        return allowWholeLine(widgetInfo as unknown as Recordable) && widgetInfo.inputSpan && widgetInfo.inputSpan > 3 ? 'top' : undefined;
        // 存在inputSpan参数并且 类型为 textarea
      });

      return {
        modelValue,
        labelPlacement,
        label,
        numberValue,
        InputTheme,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrString&PKVal=${props.widgetInfo.id}&s=${Math.random()}`,
        getType: (type: string) => {
          return types.get(type) as NInputType;
        },
        value: ref(props.widgetInfo.modelVal),
        allowWholeLine,
      };
    },
  });
</script>

<style lang="less" scoped>
  .input-text {
    &:deep(.n-form-item-label) {
      height: 100%;
      align-items: center;
      padding: 0;
    }
  }
</style>
