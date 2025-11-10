<template>
  <div class="en-wrapper">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError">
        <FlowError :doc="errorObj.tips" />
      </div>
      <div v-else>
        <MyAskFrm v-if="isloadAfter && query.AskFrmApp === 'AskBill'" :params="{ FrmID: query.FrmID, No: pkVal, RefNo: pkVal, FrmType: 4 }" />
        <MyFlow v-if="isloadAfter && query.AskFrmApp === 'AskFlow'" :params="{ FlowNo: query.FlowNo, WorkID: pkVal }" />
      </div>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { Spin } from 'ant-design-vue';
  import FlowError from '/@/WF/FlowError.vue';
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@form/dto/HttpHandler';
  import MyAskFrm from '/@/CCFast/CCBill/AskFrm/MyAskFrm.vue';
  import MyFlow from '/@/WF/MyFlow.vue';
  const route = useRoute();
  //获取参数
  const query = route.query;
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const pkVal = ref(''); //主键
  const isloadAfter = ref(false);
  const InitPage = async () => {
    loading.value = true;
    try {
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('AskFrm_GenerPK');
      if (!data) {
        errorObj.hasError = true;
        errorObj.tips = '问卷没有创建成功';
        return;
      }
      pkVal.value = data;
      isloadAfter.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>
<style scoped lang="less"></style>
