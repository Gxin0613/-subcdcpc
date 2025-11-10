<template>
  <div class="example">
    <Spin :spinning="loading" size="large">
      <div v-if="errMsg" class="ant-tag-red">{{ errMsg }} </div>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { showToast } from 'vant';
  import { message, Spin } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import HttpHandler from '../utils/gener/HttpHandler';
  import { getAllRequestParams } from '/@/utils/request/decode';
  //获取url地址？后的值并以对象的形式返回
  const urlParams = getAllRequestParams(window.location.href);
  console.log(urlParams);
  //const ticket: any = ref(urlParams?.ticket);
  const doWhat: any = ref(urlParams?.DoWhat);
  const router = useRouter();
  const loading = ref(true);
  const errMsg = ref('');
  const userStore = useUserStore();
  const Init = async () => {
    try {
      const handler = new HttpHandler('BP.NBPORT.CCMobileSSO');
      handler.AddPara('Ticket', urlParams.ticket);
      if (doWhat.value != undefined) {
        handler.AddPara('DoWhat', doWhat.value);
        handler.AddPara('DoParam', urlParams?.DoParam);
      }
      let data: any = await handler.DoMethodReturnJson('getUserInfo');
      if (data.code == 200) {
        //提示错误信息
        showToast({
          message: data.path,
          wordBreak: 'break-word',
        });
        return;
      } else {
        //有登录信息直接进入返回的页面
        const GetToken = data.param.split('&')[0].split('=')[1];
        userStore.setToken(GetToken);
        router.replace(data.path + '?' + data.param);
        return;
      }
    } catch (e: any) {
      message.error(e);
    }
  };
  Init();
</script>
<style lang="less" scoped>
  .example {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    :deep(.ant-spin-lg .ant-spin-dot) {
      font-size: 55px;
      .ant-spin-dot-item {
        width: 25px;
        height: 25px;
      }
    }
  }
</style>
