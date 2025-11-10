<template>
  <h2
    v-if="props.loginType == 'Single'"
    class="mb-3 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left"
    style="color: #0076fe; margin-top: 20px; margin-bottom: 15px; text-align: center"
  >
    {{ VITE_GLOB_SX_TITLE }}BPM{{ getFormTitle }}&nbsp;-&nbsp; <span style="font-size: 35px">vue3</span></h2
  >
  <h2
    v-if="props.loginType == 'Group'"
    class="mb-3 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left"
    style="color: #0076fe; margin-top: 20px; margin-bottom: 15px; text-align: center"
  >
    {{ VITE_GLOB_SX_TITLE }}BPM集团版{{ getFormTitle }}&nbsp;-&nbsp; <span style="font-size: 35px">vue3</span></h2
  >
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState } from './useLogin';
  import { getAppEnvConfig } from '/@/utils/env';
  const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();

  const props = defineProps({
    loginType: {
      //单组织版和集团版公用一个登录表单：Single单组织，Group集团版登录
      type: String,
      default: '',
    },
  });

  const { t } = useI18n();

  const { getLoginState } = useLoginState();

  const getFormTitle = computed(() => {
    const titleObj = {
      [LoginStateEnum.RESET_PASSWORD]: '重置密码',
      [LoginStateEnum.LOGIN]: '登录',
      [LoginStateEnum.REGISTER]: '注册',
      [LoginStateEnum.MOBILE]: '手机登录',
      [LoginStateEnum.QR_CODE]: '二维码登录',
    };
    return titleObj[unref(getLoginState)];
  });
</script>
