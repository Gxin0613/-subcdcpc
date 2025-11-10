<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" :isShowCloseBtn="false" />
      </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <!-- pc预览表单风格设置 -->
        <template v-if="previewType === PreviewType.PC">
          <ToolBarStyle class="header" :frmID="props.params.FrmID || props.params.FK_MapData" />
        </template>
        <!--表单内容-->
        <div class="content wrapper" :style="getStyle()">
          <FrmFool v-if="frmData" ref="basicData" :frmData="frmData" :isReadonly="params.isReadonly || params.IsReadonly" :params="params" />
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { inject, reactive, ref, shallowRef } from 'vue';
  import { message, Spin } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  import FlowError from '/@/WF/FlowError.vue';
  import ToolBarStyle from '/@/WF/CCForm/ToolbarStyle.vue';
  import { useRoute } from 'vue-router';
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    previewType: {
      type: String,
      default: '',
    },
  });
  enum PreviewType {
    Mobile = 'mobile',
    PC = 'pc',
  }
  //获取传的参数
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const frmData = ref(null);
  const route = useRoute();
  const contentStyle = reactive({
    width: 'calc(100% - 230px)',
  });
  //如果在章节表单解析文件引用，需要做一些样式的配置
  const isChapterForm = inject('isChapterForm');

  //pc端预览:表单风格设置
  const previewType = ref(props.previewType);

  const isLoad = ref(false);

  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取表单的数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(props.params);
      handler.AddPara('PageType', 'Vue3');
      if (!!props.frmID) {
        if (query.FrmID != props.frmID) handler.AddPara('FrmID', props.frmID);
        if (query.EnsName != props.frmID) handler.AddPara('EnsName', props.frmID);
      }
      const data = await handler.DoMethodReturnString('FrmGener_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
      contentStyle.width = frmData?.value?.Sys_MapData?.[0].FrmW + 'px';
      isLoad.value = true;
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
      if (isLoad.value == false) return true;
      if (!!basicData.value) {
        //更改数据字段值的类型
        const rowData = await basicData.value?.VerifyFormData(type === 0);
        if (rowData == null) return false;
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
        for (const key in rowData) {
          handler.AddPara(key, encodeURIComponent(rowData[key]));
        }
        props.params.EnsName = props.params.FrmID;
        handler.AddJson(props.params);
        const data = await handler.DoMethodReturnString('FrmGener_Save');
        if (typeof data == 'string' && data.includes('err@') == true) {
          message.error(data.replace('err@', ''));
          return false;
        }
        if (type == 0) message.success('保存成功');
      }

      return true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return false;
    }
  };
  const getStyle = () => {
    if (isChapterForm === '1')
      return reactive({
        width: 'auto',
        height: 'auto',
        padding: '0',
      });
    else return contentStyle;
  };
  //获取主表字段
  const GetMainData = () => {
    return basicData.value?.mainData;
  };
  //更改主表表单字段
  const UpdateData = (val) => {
    return basicData.value?.handleUpdate(val);
  };
  defineExpose({ Save, GetMainData, UpdateData });
  InitPage();
</script>

<style lang="less" scoped>
  .header {
    padding: 5px 140px 5px 0;
  }
  .toolBar {
    background-color: white;
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }
  .wrapper {
    margin: 0 auto;
    padding: 10px 24px 24px;
    height: 100%;
  }

  .content {
    position: relative;
    left: 0;
    top: 0;
    z-index: 10;
    /**width: 1030px !important;*/
    border-radius: 5px;
  }
</style>
