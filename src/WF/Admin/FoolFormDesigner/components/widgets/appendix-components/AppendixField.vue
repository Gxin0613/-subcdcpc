<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false">
      <div class="upload-tips">{{ '请点击【字段附件】执行上传' }}</div>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, computed } from 'vue';
  import { NFormItem } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { AppendixFieldItemProps } from '/@form/props/widgets/appendix/AppendixFieldWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'AppendixField',
    components: {
      NFormItem,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<AppendixFieldItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      return {
        label,
        InputTheme,
        settingUrl: computed(() => {
          return `../../Comm/En.htm?EnName=TS.FrmUI.FrmAttachmentExt&PKVal=${props.widgetInfo.id}&s=${Math.random()}`;
        }),
      };
    },
  });
</script>

<style lang="less" scoped>
  .upload-tips {
    border: 1px solid #f2f5f7;
    width: 100%;
    height: var(--n-blank-height);
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-left: 12px;
    overflow: hidden;
    color: #999999;
    text-overflow: ellipsis;
  }
</style>
