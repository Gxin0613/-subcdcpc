<template>
  <Loading v-if="loading === true" />
</template>

<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { showFailToast, Loading } from 'vant';
  import { ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  const route = useRoute();
  const query = route.query || {};
  const loading = ref(false);
  const Tel = ref(query.Tel as string);
  const DoWhat = ref(query.DoWhat as string);
  const userStore = useUserStore();
  let token = userStore.token;
  const router = useRouter();
  /**
   * 微信小程序通过Tel自动登录页面
   * @constructor
   */
  const InitPage = async () => {
    try {
      loading.value = true;
      if (!token && Tel.value) {
        const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
        handler.AddPara('Tel', Tel.value);
        const data = await handler.DoMethodReturnString('getWXAppletUserInfo');
        userStore.setToken(data);
      }
      token = userStore.token;
      if (token && DoWhat.value) {
        if (DoWhat.value == 'Home') {
          window.location.replace('');
          return;
        } else if (DoWhat.value == 'Todolist') {
          router.replace('/CCMobile/GenerList?EnName=GL_Todolist&Title=待办');
          return;
        }
      }
      loading.value = false;
      if (typeof window !== 'undefined') {
  //      debugger;
        window.location.replace('');
        return;
      }
    } catch (e) {
      showFailToast(e);
      return;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>

<style scoped></style>
