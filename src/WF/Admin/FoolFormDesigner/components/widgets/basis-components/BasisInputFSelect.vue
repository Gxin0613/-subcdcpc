<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false" :required="widgetInfo.required">
      <n-select v-model:value="modelVal" :options="widgetInfo.options" />
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NFormItem, NSelect } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { InputSelectItemProps } from '/@form/props/widgets/input/InputSelectWidget';

  export default defineComponent({
    name: 'InputFselect',
    components: {
      NFormItem,
      NSelect,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<InputSelectItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      const modelVal = ref(props.widgetInfo.modelVal);
      return {
        label,
        modelVal,
        InputTheme,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrSFSQL&PKVal=${props.widgetInfo.id}&s=${Math.random()}`,
      };
    },
  });
</script>
