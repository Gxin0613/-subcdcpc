<template>
  <select-helper :widget="widgetInfo" class="appendix-write" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false">
      <n-input type="textarea" v-model:value="value" :placeholder="'公文组件'" />
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NFormItem, NInput } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { AppendixOfficeItemProps } from '/@form/props/widgets/appendix/AppendixOfficeWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'AppendixOffice',
    components: {
      NFormItem,
      NInput,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<AppendixOfficeItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      return {
        label,
        InputTheme,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrGovDocFile&PKVal=${props.widgetInfo?.id}&s=${Math.random()}`,
        value: ref(props.widgetInfo.modelVal),
      };
    },
  });
</script>

<style lang="less" scoped>
  .appendix-write {
    &:deep(.n-form-item-label) {
      height: 100%;
    }
  }

  .upload-tips {
    border: 1px solid #f2f5f7;
    width: 100%;
    height: 80px;
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    padding-left: 12px;
    padding-top: 4px;
    color: #999999;
  }
</style>
