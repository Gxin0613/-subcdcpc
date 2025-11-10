<template>
  <div class="change-avatar">
    <CropperAvatar
      :uploadApi="uploadApi"
      :value="avatar"
      :btnText="$tt('views.sys.user.uploadsignature._key2')"
      :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
      @change="updateAvatar"
      width="200"
      height="100"
      :aspectRatio="0"
    />
  </div>
</template>

<script setup lang="ts">
  import { translateText } from '/@/locales/setupI18n';
  import { computed } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { User } from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import { CropperAvatar } from '/@/components/Cropper';

  const userStore = useUserStore();
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basicPath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  const avatar = computed(() => {
    const { No } = userStore.getUserInfo as User;
    const avatar = basicPath + `DataUser/Siganture/${No}.jpg?t=${Date.now()}`;

    return avatar;
  });
  function updateAvatar({ src }) {
    const userinfo = userStore.getUserInfo as User;
    userinfo.avatar = src;
    userStore.setUserInfo(userinfo);
  }
  const uploadApi = async (uploadParams: { file: Blob; name: string; filename: string; fileSrc?: File | undefined; btnText?: string }) => {
    const { fileSrc, btnText } = uploadParams;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Setting');
  //  debugger;
    handler.AddFile(fileSrc);
    if (btnText == translateText('views.sys.user.uploadsignature._key1')) {
      let response = await handler.DoMethodReturnString('Siganture_Save');
      return {
        data: response,
      };
    } else {
      let response = await handler.DoMethodReturnString('HeadPic_Save');
      return {
        data: response,
      };
    }
  };
</script>

<style lang="less" scoped>
  .change-avatar {
    width: 100%;
    height: 400px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    :deep(.vben-cropper-avatar-image-wrapper) {
      //border-radius: 50%;
      overflow: hidden;
    }
    img {
      display: block;
      margin-bottom: 15px;
    }
  }
</style>
