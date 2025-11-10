<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="background-color: rgb(240, 242, 245)">
        <!--表单内容-->
        <div>
          <FrmFool v-if="frmData" ref="basicData" :frmData="frmData" :isReadonly="params.isReadonly" :params="params" :isPreview="isPreview" />
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, shallowRef } from 'vue';
  import { message, Spin } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/CCMobile/CCForm/FrmFool.vue';
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  //获取传的参数
  const loading = ref(false);
  const isPreview = ref(true);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const frmData = ref(null);
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取表单的数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(props.params);
      handler.AddPara('PageType', 'Vue3');
      const data = await handler.DoMethodReturnString('FrmGener_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const basicData = shallowRef<InstanceType<typeof FrmFool>>();
  const Save = async (type) => {
    try {
      loading.value = true;
      //更改数据字段值的类型
      const rowData = await basicData.value?.VerifyFormData(type === 0 ? true : false);
      if (rowData == null) return false;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      for (const key in rowData) {
        handler.AddPara(key, encodeURIComponent(rowData[key]));
      }
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('FrmGener_Save');
      if (typeof data == 'string' && data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        return false;
      }
      if (type == 0) message.success('保存成功');
      return true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return false;
    } finally {
      loading.value = false;
    }
  };
  //获取主表字段
  const GetMainData = (callBack) => {
    callBack(basicData.value?.mainData);
  };
  //更改主表表单字段
  const UpdateData = (val) => {
    return basicData.value?.handleUpdate(val);
  };
  InitPage();
  defineExpose({ Save, GetMainData, UpdateData });
</script>

<style lang="less" scoped>
  .toolBar {
    background-color: white;
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }
  .wrapper {
    margin: 0 auto;
    padding: 60px 24px 24px;
  }
</style>
