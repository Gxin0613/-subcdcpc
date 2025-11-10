<template>
  <select-helper :widget="widgetInfo" class="appendix-write" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false">
      <div class="upload-tips">{{ '写字板组件' }}</div>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NFormItem } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { AppendixWriteItemProps } from '/@form/props/widgets/appendix/AppendixWriteWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'AppendixWrite',
    components: {
      NFormItem,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<AppendixWriteItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      return {
        label,
        InputTheme,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrString&PKVal=${props.widgetInfo?.id}&s=${Math.random()}`,
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
