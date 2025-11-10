<template>
  <div :class="[prefixCls, { fullscreen }]">
    <Upload name="file" multiple @change="handleChange" :custom-request="uploadImg" :showUploadList="false" accept="image/*">
      <a-button type="primary" v-bind="{ ...getButtonProps }">
        {{ '图片上传' }}
      </a-button>
    </Upload>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { Upload } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Dev2Interface from '/@/WF/TSClass/Dev2Interface';
  import { getAppEnvConfig } from '/@/utils/env';

  export default defineComponent({
    name: 'TinymceImageUpload',
    components: { Upload },
    props: {
      fullscreen: {
        type: Boolean,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['uploading', 'done', 'error'],
    setup(props, { emit }) {
      let uploading = false;

      const { t } = useI18n();
      const { prefixCls } = useDesign('tinymce-img-upload');

      const getButtonProps = computed(() => {
        const { disabled } = props;
        return {
          disabled,
        };
      });

      function handleChange(info: Recordable) {
        const file = info.file;
        const status = file?.status;
        const url = file?.response;
        const name = file?.name;

        if (status === 'uploading') {
          if (!uploading) {
            emit('uploading', name);
            uploading = true;
          }
        } else if (status === 'done') {
          emit('done', name, url);
          uploading = false;
        } else if (status === 'error') {
          emit('error');
          uploading = false;
        }
      }
      const { VITE_GLOB_API_URL } = getAppEnvConfig();
      const uploadImg = async ({ file, onSuccess, onError }: any) => {
        const ext = file.name.split('.').pop();
        const fileName = `${file.uid}.${ext}`;
        try {
          const res = await Dev2Interface.Upload_File(file, fileName, 'rich_editor');
          const url = VITE_GLOB_API_URL + res;
          onSuccess(url, file);
          emit('done', fileName, url);
          uploading = false;
        } catch (e: any) {
          onError();
          emit('error');
          uploading = false;
        }
      };

      return {
        prefixCls,
        handleChange,
        t,
        getButtonProps,
        uploadImg,
      };
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-tinymce-img-upload';

  .@{prefix-cls} {
    position: absolute;
    top: 4px;
    right: 10px;
    z-index: 20;

    &.fullscreen {
      position: fixed;
      z-index: 10000;
    }
  }
</style>
