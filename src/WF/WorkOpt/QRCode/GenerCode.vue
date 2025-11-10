<template>
  <Spin :spinning="loading" size="large">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <template v-else>
      <h3>使用时手机扫描下面的二维码,即可查看表单信息.</h3>
      <div style="border: 5px solid rgb(238, 238, 238); padding: 15px 75px; display: flex; flex-direction: column">
        <img :src="imgUrl" style="margin: 0 auto; text-align: center; align-content: center" alt="" />
        <div
          >{{ '移动端链接：' }}<div>{{ MobileUrl }} </div>
        </div>
      </div>
    </template>
  </Spin>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { getAppEnvConfig } from '/@/utils/env';
  import { Methods } from '/@/CCFast/CCBill/Method/Method';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const loading = ref(true);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const params = ref(props.params);
  const MobileUrl = ref();
  const imgUrl = ref();
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      //获得数数量，并把数量绑定.
      const workID = params.value.WorkID || params.value.No;
      if (params.value.FK_Node && params.value.FK_Flow) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_QRCode');
        handler.AddUrlData();
        handler.AddPara('WorkID', workID);
        const data = await handler.DoMethodReturnString('GenerCode_Init_Vue3');
        MobileUrl.value = data;
      } else {
        //获得数据源.
        const frmID = params.value?.FrmID;
        const methods = new Methods();
        await methods.Retrieve('FrmID', frmID);
        const MethodNo = methods.find((item) => item.MethodModel == 'QRCode')?.GroupID;
        const handler = new HttpHandler('BP.CCBill.WF_CCBill_OptComponents');
        handler.AddUrlData();
        handler.AddPara('WorkID', workID);
        handler.AddPara('MethodNo', MethodNo);
        handler.AddPara('FrmID', frmID);
        handler.AddPara('MenuNo', params.value.No);
        const data = await handler.DoMethodReturnString('QRCode_Init_Vue3');
        MobileUrl.value = data;
      }

      const { VITE_GLOB_API_URL } = getAppEnvConfig();
      // //获取代理路径
      // const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
      // //用户头像图片存放地址
      // const avatarPath: string = basicPath + '/DataUser/Temp/';
      const basicPath = VITE_GLOB_API_URL;
      //用户头像图片
      const codeIcon = basicPath + '/DataUser/Temp/' + workID + '.png';
      imgUrl.value = codeIcon;
      // $('#docs').html("<img style='text-align:center;align-content:center' src='../../../DataUser/Temp/" + workID + ".png'><br>");
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>
<style lang="less" scoped></style>
