<template>
  <div class="en-wrapper" style="overflow-y: auto">
    <div class="frm-view-toolbar">
      <FrmViewToolBar
        v-if="pageReady"
        :frmID="query.FrmID || props.frmID"
        :init-col="mapDataRef.TableCol"
        :init-display-mode="mapDataRef.FrmShowType"
        :init-display-mobile-mode="mapDataRef.MobileFrmShowType"
        :init-width="mapDataRef.FrmW"
        @update-columns="onUpdateCols"
        @update-device="onDeviceChange"
        @update-form-display-mode="onUpdateFrmDisplayMode"
        @update-mobile-form-display-mode="onUpdateMobileFrmDisplayMode"
        @update-form-width="onUpdateWidth"
        @update-form-frm-layout="onUpdateLayout"
        @update-lang="reloadPage"
      />
    </div>
    <div v-if="!loading" class="frm-body">
      <template v-if="activeDevice === 'mobile'">
        <MobilePreview :url="mobilePreviewUrl" />
      </template>
      <template v-else>
        <component :is="loadPage(pageName)" :params="params" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { message } from 'ant-design-vue';
  import { onMounted, ref, nextTick } from 'vue';
  import FrmViewToolBar from '/@/WF/CCForm/FrmViewToolBar.vue';
  import En from '/@/WF/Comm/En.vue';
  import FrmGener from '/@/WF/CCForm/FrmGener.vue';
  import FrmSelf from '/@/WF/CCForm/FrmSelf.vue';
  import ChartFrm from '/@/WF/CCForm/ChartFrm.vue';
  import { MapData } from '../Admin/FrmLogic/MapData';
  import MobilePreview from '../Admin/FoolFormDesigner/components/design/MobilePreview.vue';
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
  const query = route.query || {};

  const loading = ref(false);

  const activeDevice = ref('pc');
  const mobilePreviewUrl = ref(
    `index.html#/CCMobile/CCForm/Frm?FrmID=${route.query.FrmID}&skipPlatformCheck=1&EnName=${route.query.FrmID}&WorkID=0&FK_Flow=${route.query.FK_Flow}&FK_Node=${route.query.nodeID}`,
  );

  const mapDataRef = ref(new MapData(query.FrmID as string));
  const pageMap = new Map<string, any>([
    ['En', En],
    ['FrmGener', FrmGener],
    ['FrmSelf', FrmSelf],
    ['ChartFrm', ChartFrm],
  ]);
  const pageName = ref('');
  const loadPage = (pageName) => {
    return pageMap.get(pageName);
  };
  const params = ref<Recordable>({});
  const pageReady = ref(false);
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query);
      handler.AddPara('FK_MapData', query.frmID);
      //章节表单中解析自定义表单使用，路由的FrmID和props.FrmID不同
      // 需要判空
      if (!!props.frmID) {
        if (query.FrmID != props.frmID) handler.AddPara('FrmID', props.frmID);
        if (query.EnsName != props.frmID) handler.AddPara('EnsName', props.frmID);
      }
      handler.AddPara('PageType', 'Vue3');
      const data: string = await handler.DoMethodReturnString('Frm_Init');
      if (typeof data === 'object') {
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        pageName.value = data['PageName'] || '';
        if (pageName.value === 'FrmVSTO') pageName.value = 'FrmGener';
        delete data['PageName'];
        params.value = data;
        return;
      }
      if (data.includes('err@')) {
        message.error(data.replace('err@', ''));
      }
    } catch (e) {
      message.error(e);
    } finally {
      loading.value = false;
    }
  };
  const reloadPage = async () => {
    loading.value = true;
    delete params.value['EnsName'];
    await nextTick();
    loading.value = false;
  };
  const onUpdateCols = async (cols) => {
    mapDataRef.value.SetValByKey('TableCol', cols);
    await mapDataRef.value.Update();
    await reloadPage();
  };
  const onUpdateFrmDisplayMode = async (val: string) => {
    mapDataRef.value.SetValByKey('FrmShowType', val);
    await mapDataRef.value.Update();
    await reloadPage();
  };
  const onUpdateMobileFrmDisplayMode = async (val: string) => {
    mapDataRef.value.SetValByKey('MobileFrmShowType', val);
    await mapDataRef.value.Update();
    await reloadPage();
  };
  
  const onUpdateWidth = async (width: number) => {
    mapDataRef.value.SetValByKey('FrmW', width);
    await mapDataRef.value.Update();
    await reloadPage();
  };
  const onUpdateLayout = async (layout: number) => {
    if (layout === 0 || layout === 2) {
      mapDataRef.value.SetPara('LabelPosition', 'left');
      if (layout === 0) mapDataRef.value.SetPara('LabelAlign', 'right');
      if (layout === 2) mapDataRef.value.SetPara('LabelAlign', 'left');
    }
    if (layout === 1) {
      mapDataRef.value.SetPara('LabelPosition', 'top');
      mapDataRef.value.SetPara('LabelAlign', 'left');
    }

    await mapDataRef.value.Update();
    await reloadPage();
  };
  const onDeviceChange = async (device: string) => {
    activeDevice.value = device;
    await reloadPage();
  };
  onMounted(async () => {
    await InitPage();
    await mapDataRef.value.Retrieve();
    pageReady.value = true;
  });
  // const baseData = shallowRef<InstanceType<typeof FrmGener>>();
  // const Save = async () => {
  //   try {
  //     loading.value = true;
  //     //更改数据字段值的类型
  //     return await baseData.value?.Save(1);
  //   } catch (e) {
  //     errorObj.hasError = true;
  //     errorObj.tips = e as string;
  //     return false;
  //   } finally {
  //     loading.value = false;
  //   }
  // };
  // //获取主表字段
  // const GetMainData = () => {
  //   return baseData.value?.GetMainData();
  // };
  // //更改主表表单字段
  // const UpdateData = (val) => {
  //   return baseData.value?.UpdateData(val);
  // };
  // defineExpose({ Save, GetMainData, UpdateData });
</script>

<style lang="less" scoped>
  .frm-view-toolbar {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    z-index: 100;
  }

  .frm-body {
    padding-top: 53px;
    height: calc(100vh);
  }
</style>
