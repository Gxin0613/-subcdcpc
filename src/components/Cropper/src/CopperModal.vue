<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="'头像上传'"
    width="800px"
    :body-style="{
      height: '400px',
    }"
    :canFullscreen="false"
    @ok="handleOk"
    :okText="'确认并上传'"
  >
    <div :class="prefixCls">
      <div :class="`${prefixCls}-left`">
        <div :class="`${prefixCls}-cropper`">
          <CropperImage v-if="src" :src="src" height="300px" :circled="circled" :aspectRatio="aspect" @cropend="handleCropend" @ready="handleReady" />
        </div>

        <div :class="`${prefixCls}-toolbar`">
          <Upload :fileList="[]" accept="image/*" :beforeUpload="handleBeforeUpload">
            <Tooltip :title="'选择图片'" placement="bottom">
              <a-button size="small" preIcon="ant-design:upload-outlined" type="primary">{{'选择图片'}}</a-button>
            </Tooltip>
          </Upload>
          <Space>
            <Tooltip :title="'重置'" placement="bottom">
              <a-button type="primary" preIcon="ant-design:reload-outlined" size="small" :disabled="!src" @click="handlerToolbar('reset')" />
            </Tooltip>
            <Tooltip :title="'逆时针旋转'" placement="bottom">
              <a-button type="primary" preIcon="ant-design:rotate-left-outlined" size="small" :disabled="!src" @click="handlerToolbar('rotate', -45)" />
            </Tooltip>
            <Tooltip :title="'顺时针旋转'" placement="bottom">
              <a-button type="primary" preIcon="ant-design:rotate-right-outlined" size="small" :disabled="!src" @click="handlerToolbar('rotate', 45)" />
            </Tooltip>
            <Tooltip :title="'水平翻转'" placement="bottom">
              <a-button type="primary" preIcon="vaadin:arrows-long-h" size="small" :disabled="!src" @click="handlerToolbar('scaleX')" />
            </Tooltip>
            <Tooltip :title="'垂直翻转'" placement="bottom">
              <a-button type="primary" preIcon="vaadin:arrows-long-v" size="small" :disabled="!src" @click="handlerToolbar('scaleY')" />
            </Tooltip>
            <Tooltip :title="'放大'" placement="bottom">
              <a-button type="primary" preIcon="ant-design:zoom-in-outlined" size="small" :disabled="!src" @click="handlerToolbar('zoom', 0.1)" />
            </Tooltip>
            <Tooltip :title="'缩小'" placement="bottom">
              <a-button type="primary" preIcon="ant-design:zoom-out-outlined" size="small" :disabled="!src" @click="handlerToolbar('zoom', -0.1)" />
            </Tooltip>
          </Space>
        </div>
      </div>
      <div :class="`${prefixCls}-right`">
        <div :class="`${prefixCls}-preview`">
          <img :src="previewSource" v-if="previewSource" :alt="'预览'" />
        </div>
        <template v-if="previewSource">
          <div :class="`${prefixCls}-group`">
            <Avatar :src="previewSource" size="large" />
            <Avatar :src="previewSource" :size="48" />
            <Avatar :src="previewSource" :size="64" />
            <Avatar :src="previewSource" :size="80" />
          </div>
        </template>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import type { CropendResult, Cropper } from './typing';
  import { defineComponent, ref } from 'vue';
  import CropperImage from './Cropper.vue';
  import { Space, Upload, Avatar, Tooltip } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { dataURLtoBlob } from '/@/utils/file/base64Conver';
  import { isFunction } from '/@/utils/is';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { compressBase64Image } from '/@/utils/file/download';

  type apiFunParams = { file: Blob; name: string; filename: string; fileSrc?: File; btnText?: string };

  const props = {
    circled: { type: Boolean, default: false },
    uploadApi: {
      type: Function as PropType<(params: apiFunParams) => Promise<any>>,
    },
    btnText: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: '',
    },
    aspectRatio: {
      type: [String, Number],
      default: 1,
    },
  };

  export default defineComponent({
    name: 'CropperModal',
    components: { BasicModal, Space, CropperImage, Upload, Avatar, Tooltip },
    props,
    emits: ['uploadSuccess', 'register'],
    setup(props, { emit }) {
      let filename = '';
      //图片回显
      const src = ref(props.src || '');
      //裁剪宽高比
      const aspect = ref(props.aspectRatio);
      const previewSource = ref('');
      const cropper = ref<Cropper>();
      let scaleX = 1;
      let scaleY = 1;

      const { prefixCls } = useDesign('cropper-am');
      const [register, { closeModal, setModalProps }] = useModalInner();
      const { t } = useI18n();

      // Block upload
      function handleBeforeUpload(file: File) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        src.value = '';
        previewSource.value = '';
        reader.onload = function (e) {
          src.value = (e.target?.result as string) ?? '';
          filename = file.name;
        };
        return false;
      }

      function handleCropend({ imgBase64 }: CropendResult) {
        compressBase64Image(imgBase64, 90, 90)
          .then((compressedBase64: any) => {
            console.log(compressedBase64); // 输出压缩后的base64字符串
            previewSource.value = compressedBase64;
          })
          .catch((error) => {
            console.error(error);
          });
        // previewSource.value = imgBase64;
      }

      function handleReady(cropperInstance: Cropper) {
        cropper.value = cropperInstance;
      }

      function handlerToolbar(event: string, arg?: number) {
        if (event === 'scaleX') {
          scaleX = arg = scaleX === -1 ? 1 : -1;
        }
        if (event === 'scaleY') {
          scaleY = arg = scaleY === -1 ? 1 : -1;
        }
        cropper?.value?.[event]?.(arg);
      }
      function dataURLToFile(dataURL, filename) {
        const arr = dataURL.split(','),
          mime = arr[0].match(/:(.*?);/)[1], //mime类型 image/png
          bstr = atob(arr[1]); //base64 解码

        let n = bstr.length,
          u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
        //return new Blob([a8arr], {type: mime});
      }
      async function handleOk() {
        const uploadApi = props.uploadApi;
        const btnText = props.btnText;
        if (uploadApi && isFunction(uploadApi)) {
          const blob = dataURLtoBlob(previewSource.value);
          try {
            setModalProps({ confirmLoading: true });
            const result = await uploadApi({ name: 'file', file: blob, filename, fileSrc: dataURLToFile(previewSource.value, filename), btnText: btnText });
            emit('uploadSuccess', { source: previewSource.value, data: result.data });
            closeModal();
          } finally {
            setModalProps({ confirmLoading: false });
          }
        }
      }

      return {
        t,
        prefixCls,
        src,
        register,
        previewSource,
        handleBeforeUpload,
        handleCropend,
        handleReady,
        handlerToolbar,
        handleOk,
        aspect,
      };
    },
  });
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-cropper-am';

  .@{prefix-cls} {
    display: flex;

    &-left,
    &-right {
      height: 340px;
    }

    &-left {
      width: 55%;
    }

    &-right {
      width: 45%;
    }

    &-cropper {
      height: 300px;
      background: #eee;
      background-image: linear-gradient(45deg, rgb(0 0 0 / 25%) 25%, transparent 0, transparent 75%, rgb(0 0 0 / 25%) 0),
        linear-gradient(45deg, rgb(0 0 0 / 25%) 25%, transparent 0, transparent 75%, rgb(0 0 0 / 25%) 0);
      background-position: 0 0, 12px 12px;
      background-size: 24px 24px;
    }

    &-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }

    &-preview {
      width: 220px;
      height: 220px;
      margin: 0 auto;
      overflow: hidden;
      border: 1px solid @border-color-base;
      border-radius: 0;

      img {
        width: 100%;
        height: 100%;
      }
    }

    &-group {
      display: flex;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid @border-color-base;
      justify-content: space-around;
      align-items: center;
    }
  }
</style>
