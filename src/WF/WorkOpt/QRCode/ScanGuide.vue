<template>
  <Spin :spinning="loading" size="large">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
  </Spin>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRouter, useRoute } from 'vue-router';
  import { Spin, message } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { Menu } from '/@/CCFast/GPM/CCMenu/Menu';
  const loading = ref(true);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const data: any = ref();
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_QRCode');
      handler.AddUrlData();
      data.value = await handler.DoMethodReturnString('ScanGuide_Init_Vue3');
      if (data.value.toString().indexOf('err@') == 0 || data.value.toString().indexOf('warning@') == 0) {
        loading.value = false;
        errorObj.hasError = true;
        errorObj.tips = data.value as string;
        console.error(data);
        return;
      }
      handleRoute();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const handleRoute = async () => {
    const pageName = data.value['PageName'];
    delete data.value['PageName'];
    let token = data.value['Token'] || '';
    if (!token) {
      token = route.query.token || route.query.Token;
    }
    if (!token) {
      message.error('没有获取到Token值');
      return;
    }
    userStore.setToken(token);
    switch (pageName) {
      case 'MyView':
        //查看某条待办
        router.push('/CCMobile/MyView?FK_Flow=' + data.value?.FK_Flow + '&FK_Node=' + data.value?.FK_Node + '&NodeID=' + data.value?.FK_Node + '&WorkID=' + data.value?.WorkID);
        break;
      case 'MyDictFrameWork':
        const menu = new Menu();
        menu.No = data.value?.MenuNo;
        await menu.Retrieve();
        router.push({
          path: '/CCFastMobile/SearchRoute',
          query: {
            title: data.value?.Title,
            component: 'MyDictFrameWork',
            WorkID: data.value?.WorkID,
            FrmID: data.value?.FrmID,
            isReadonly: 1,
            ...menu,
          },
        });
        break;
    }
  };
  InitPage();
</script>
<style lang="less" scoped></style>
