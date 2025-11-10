<template>
  <div class="en-wrapper" style="overflow-y: auto">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="en-body">
        <FrmGener v-if="pageName === 'FrmGener'" :params="params" :preview-type="previewType" ref="baseData" />
        <En v-if="pageName === 'En'" :params="params" />
        <ChartFrm v-if="pageName === 'ChapterFrm'" :params="params" />
        <FrmSelf v-if="pageName === 'FrmSelf'" :params="params" />
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { message, Spin } from 'ant-design-vue';
  import { reactive, ref, shallowRef } from 'vue';
  import En from '/@/WF/Comm/En.vue';
  import FrmGener from '/@/WF/CCForm/FrmGener.vue';
  import FrmSelf from '/@/WF/CCForm/FrmSelf.vue';
  import ChartFrm from '/@/WF/CCForm/ChartFrm.vue';
  const props = defineProps({
    frmID: {
      type: String,
      default: '',
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const route = useRoute();
  const query = ref(props.params || route.query || {});

  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const pageName = ref('');
  const params = ref<Record<string, any>[]>([]);
  const previewType = ref(props.params?.PreviewType);
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      handler.AddPara('FK_MapData', props.frmID);

      //章节表单中解析自定义表单使用，路由的FrmID和props.FrmID不同
      // 需要判空
      if (!!props.frmID) {
        if (query.value.FrmID != props.frmID) handler.AddPara('FrmID', props.frmID);
        if (query.value.EnsName != props.frmID) handler.AddPara('EnsName', props.frmID);
        query.value['FrmID'] = props.frmID;
      }
      handler.AddPara('PageType', 'Vue3');
      const data: string = await handler.DoMethodReturnString('Frm_Init');
      loading.value = true;
      if (typeof data === 'object') {
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        pageName.value = data['PageName'] || '';
        if (pageName.value == 'FrmVSTO') {
          pageName.value = 'FrmGener';
        }
        delete data['PageName'];
        params.value = data;
        return;
      }
      if (data.includes('err@')) {
        message.error(data.replace('err@', ''));
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const baseData = shallowRef<InstanceType<typeof FrmGener>>();
  const Save = async () => {
    try {
      loading.value = true;
      //更改数据字段值的类型
      return await baseData.value?.Save(1);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return false;
    } finally {
      loading.value = false;
    }
  };
  //获取主表字段
  const GetMainData = () => {
    return baseData.value?.GetMainData();
  };
  //更改主表表单字段
  const UpdateData = (val) => {
    return baseData.value?.UpdateData(val);
  };
  defineExpose({ Save, GetMainData, UpdateData });
</script>

<style lang="less" scoped></style>
