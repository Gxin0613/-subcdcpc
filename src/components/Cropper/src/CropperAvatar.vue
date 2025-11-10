<template>
  <div :class="getClass" :style="getStyle">
    <div :class="`${prefixCls}-image-wrapper`" :style="getImageWrapperStyle" style="display: flex; align-items: center" @click="openModal">
      <div :class="`${prefixCls}-image-mask`" :style="getImageWrapperStyle">
        <Icon icon="ant-design:cloud-upload-outlined" :size="getIconWidth" :style="getImageWrapperStyle" color="#d6d6d6" />
      </div>
      <img :src="sourceValue" v-if="sourceValue" @error="defaultIcon" />
    </div>
    <a-button :class="`${prefixCls}-upload-btn`" @click="openModal" v-if="showBtn" v-bind="btnProps">
      {{ btnText ? btnText : '选择图片' }}
    </a-button>
    <CopperModal @register="register" @upload-success="handleUploadSuccess" :btnText="btnText" :uploadApi="uploadApi" :src="sourceValue" :aspectRatio="aspect" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, unref, ref, watchEffect, watch, PropType } from 'vue';
  import CopperModal from './CopperModal.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { ButtonProps } from '/@/components/Button';
  import Icon from '/@/components/Icon';
  import { getAppEnvConfig } from '/@/utils/env';

  const props = {
    width: { type: [String, Number], default: '150px' },
    height: { type: [String, Number], default: '150px' },
    aspectRatio: { type: [String, Number], default: 1 },
    value: { type: String },
    showBtn: { type: Boolean, default: true },
    btnProps: { type: Object as PropType<ButtonProps> },
    btnText: { type: String, default: '' },
    uploadApi: { type: Function as PropType<(params: { file: Blob; name: string; filename: string; fileSrc?: File; btnText?: string }) => Promise<{ data: string }>> },
  };

  export default defineComponent({
    name: 'CropperAvatar',
    components: { CopperModal, Icon },
    props,
    emits: ['update:value', 'change'],
    setup(props, { emit, expose }) {
      const sourceValue = ref(props.value || '');
      const aspect = ref(props.aspectRatio);
      const { prefixCls } = useDesign('cropper-avatar');
      const [register, { openModal, closeModal }] = useModal();
      const { createMessage } = useMessage();
      const { t } = useI18n();

      const getClass = computed(() => [prefixCls]);

      const getWidth = computed(() => `${props.width}`.replace(/px/, '') + 'px');

      const getHeight = computed(() => `${props.height}`.replace(/px/, '') + 'px');

      const getIconWidth = computed(() => parseInt(`${props.width}`.replace(/px/, '')) / 2 + 'px');

      const getStyle = computed(() => ({ width: unref(getWidth) }));

      const getImageWrapperStyle = computed(() => ({ width: unref(getWidth), height: unref(getHeight) }));

      watchEffect(() => {
        sourceValue.value = props.value || '';
      });

      watch(
        () => sourceValue.value,
        (v: string) => {
          emit('update:value', v);
        },
      );
      const { VITE_GLOB_API_URL } = getAppEnvConfig();
      const basicPath = VITE_GLOB_API_URL;
      let default_icon_path = basicPath + 'DataUser/UserIcon/Default.png';
      if (!basicPath.endsWith('/')) {
        default_icon_path = basicPath + '/' + 'DataUser/UserIcon/Default.png';
      }

      function defaultIcon(e) {
        const img = e.srcElement;
        img.src = default_icon_path;
        img.onerror = null;
        // sourceValue.value = '';
      }

      function handleUploadSuccess({ source }) {
        sourceValue.value = source;
        emit('change', source);
        createMessage.success('上传成功');
      }

      expose({ openModal: openModal.bind(null, true), closeModal });

      return {
        t,
        prefixCls,
        register,
        openModal: openModal as any,
        getIconWidth,
        sourceValue,
        getClass,
        getImageWrapperStyle,
        getStyle,
        handleUploadSuccess,
        defaultIcon,
        aspect,
      };
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-cropper-avatar';

  .@{prefix-cls} {
    display: inline-block;
    text-align: center;

    &-image-wrapper {
      overflow: hidden;
      cursor: pointer;
      background: @component-background;
      border: 1px solid @border-color-base;
      border-radius: 0;

      img {
        width: 100%;
      }
    }

    &-image-mask {
      opacity: 0%;
      position: absolute;
      width: inherit;
      height: inherit;
      border-radius: inherit;
      border: inherit;
      background: rgb(0 0 0 / 40%);
      cursor: pointer;
      transition: opacity 0.4s;

      :deep(svg) {
        margin: auto;
      }
    }

    &-image-mask:hover {
      opacity: 4000%;
    }

    &-upload-btn {
      margin: 10px auto;
    }
  }
</style>
