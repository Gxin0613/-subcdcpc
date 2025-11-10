<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false" class="image-upload">
      <n-upload :default-file-list="widgetInfo.fileList" list-type="image-card" :show-preview-button="false" @before-upload="handleUpload" :max="widgetInfo.maxFiles" />
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NFormItem, NUpload, useMessage } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { AppendixImageItemProps } from '/@form/props/widgets/appendix/AppendixImageWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'AppendixImage',
    components: {
      NFormItem,
      NUpload,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<AppendixImageItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const message = useMessage();
      const label = ref<String>(props.widgetInfo.title);
      return {
        label,
        InputTheme,
        handleUpload: () => {
          message.info('选择了文件');
          return Promise.resolve();
        },
        settingUrl: `../../Comm/EnOnly.htm?EnName=TS.FrmUI.FrmImgAth&PKVal=${props.widgetInfo.id}&s=${Math.random()}`,
      };
    },
  });
</script>

<style lang="less" scoped>
  .image-upload {
    &:deep(.n-form-item-label) {
      height: 100%;
    }

    &:deep(.n-form-item-blank) {
      border: 1px solid #eeeeee;
      overflow: hidden;
    }
  }
</style>
