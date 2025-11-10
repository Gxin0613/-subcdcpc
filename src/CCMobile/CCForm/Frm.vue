<template>
  <div class="en-wrapper" :style="loadingSta">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="en-body">
        <FrmGener v-if="pageName === 'FrmGener'" :params="params" ref="baseData" />
        <En v-if="pageName === 'En'" :params="params" />
        <ChartFrm v-if="pageName === 'ChapterFrm'" :params="params" />
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { message, Spin } from 'ant-design-vue';
  import { computed, onMounted, onUnmounted, reactive, ref, shallowRef } from 'vue';
  import En from '/@/CCMobile/Comm/En.vue';
  import FrmGener from '/@/CCMobile/CCForm/FrmGener.vue';
  import ChartFrm from '/@/CCMobile/CCForm/ChartFrm.vue';
  import Event from '/@/utils/Events';
  const props = defineProps({
    frmID: {
      type: String,
      default: '',
    },
  });
  const route = useRoute();

  const loading = ref(false);
  console.log(route);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const pageName = ref('');
  const params = ref<Record<string, string>[]>([]);
  const InitPage = async () => {
    try {
      loading.value = true;
      const query = route.query || {};
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query);
      handler.AddPara('FK_MapData', props.frmID);
      if (!!props.frmID) {
        if (query.FrmID != props.frmID) handler.AddPara('FrmID', props.frmID);
        if (query.EnsName != props.frmID) handler.AddPara('EnsName', props.frmID);
      }
      handler.AddPara('PageType', 'Vue3');
      const data: string = (await handler.DoMethodReturnString('Frm_Init')) || '';
      loading.value = false;
      if (typeof data === 'object') {
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        pageName.value = data['PageName'] || '';
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
  const Save = async (type) => {
    try {
      loading.value = true;
      //更改数据字段值的类型
      return await baseData.value?.Save(type);
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
    callBack(baseData.value?.mainData);
  };
  //更改主表表单字段
  const UpdateData = (val) => {
    return baseData.value?.handleUpdate(val);
  };
  const loadingSta = computed(() => {
    return {
      padding: loading.value ? '60% 50%' : 0,
    };
  });

  onMounted(() => {
    Event.on('isPreviewload', (data: any) => {
      if (data) {
        location.reload();
      }
    });
  });
  onUnmounted(() => {
    Event.off('isPreviewload');
  });

  defineExpose({ Save, GetMainData, UpdateData });
</script>

<style scoped></style>
