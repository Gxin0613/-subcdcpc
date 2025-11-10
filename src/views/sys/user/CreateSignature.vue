<template>
  <div class="create-signature">
    <div class="title">{{ $tt('views.sys.user.createsignature._key3') }}</div>
    <div class="content">
      <img :src="imageSrc" @click="openSignBox" @error="defaultIcon" style="height: 200px; width: 400px" :alt="$tt('views.sys.user.createsignature._key2')" />
      <Button style="margin-top: 24px" :type="'primary'" @click="openSignBox">{{ $tt('views.sys.user.createsignature._key4') }}</Button>
    </div>
    <Modal v-model:open="modal.noFooterModalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" :footer="null">
      <HandWriting :imageSrc="imageSrc" writingType="MakeImage" @change-write-img="updateSignature" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { translateText } from '/@/locales/setupI18n';
  import { onMounted, reactive, ref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { User } from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import HandWriting from '/@/WF/CCForm/HandWriting.vue';
  import { Modal, Button } from 'ant-design-vue';

  const imageSrc = ref<string>();
  const userStore = useUserStore();

  const modal = reactive({
    noFooterModalVisible: false,
    footerModalVisible: false,
    modalTitle: '',
    modalType: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basicPath = VITE_GLOB_API_URL;
  const defaultIcon = (e) => {
    const avatar = basicPath + '/DataUser/Siganture/UnName.jpg';
    const img = e.srcElement;
    img.src = avatar;
    img.onerror = null;
  };
  const openSignBox = () => {
    modal.noFooterModalVisible = true;
    modal.modalTitle = translateText('views.sys.user.createsignature._key1');
    modal.modalType = 'HandWriting';
    modal.modalHeight = {
      height: window.innerHeight * 0.7 + 'px',
    };
  };
  const getSignature = () => {
    //根据当前人的图片签名转成签字版图片
    const { No } = userStore.getUserInfo as User;
    //获取代理路径
    const apiUrl = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
    const basicPath = import.meta.env.MODE === 'development' ? '/api' : apiUrl;
    //默认签字版图片
    imageSrc.value = basicPath + `DataUser/Siganture/${No}.jpg?t=${Date.now()}`;
  };
  //改变签名
  const updateSignature = (imgSrc) => {
    imageSrc.value = imgSrc;
    modal.noFooterModalVisible = false;
  };
  onMounted(() => {
    getSignature();
  });
</script>

<style lang="less" scoped>
  .create-signature {
    width: 100%;
    height: 600px;
    background-color: white;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 30px;

    .title {
      width: 100%;
      text-align: left;
      font-size: 16px;
      font-weight: bold;
      padding-left: 24px;
      padding-bottom: 12px;
      box-sizing: border-box;
      border-bottom: 2px solid #f2f5f7;
    }

    .content {
      width: 400px;
      height: 400px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      flex-direction: column;
      justify-content: center;

      img {
        border: 2px solid #eee;
        &:hover {
          border: 2px solid #ccc;
          opacity: 0.7;
          cursor: pointer;
        }
      }
    }
  }
</style>
