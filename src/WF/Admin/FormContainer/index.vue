<template>
  <div class="form-designer-container">
    <component v-if="currentDesigner" :is="currentDesigner" :params="params" :key="componetKey" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, shallowRef } from 'vue';
  import { useRoute } from 'vue-router';

  import Events from '/@/utils/Events';
  import { MapData } from '../FrmLogic/MapData';
  import { message } from 'ant-design-vue';
  import { FrmType } from '../EnumLab';
  import { CHANGE_FORM_TYPE } from '/@/enums/eventsEnum';

  const route = useRoute();
  const params = ref<Recordable>({});
  const componetKey = ref(0);

  const mapInstance = ref<Nullable<MapData>>(null);
  const currentDesigner = shallowRef<Nullable<any>>(null);
  // 动态按需加载各设计器，降低首屏体积
  const getCurrentDesigner = async () => {
    const frmID = route.query.FrmID || route.query.FK_MapData;
    if (!mapInstance.value) return null;
    // 开发者表单
    if ([FrmType.Develop, FrmType.FreeForm].includes(mapInstance.value.FrmType)) {
      params.value = {
        FK_MapData: frmID + '',
        FrmID: frmID + '',
      };
      mapInstance.value.FrmType = 0;
      await mapInstance.value.Update();
      return (await import('/@form/index.vue')).default;
    }
    // URL

    // 实体
    if (mapInstance.value.FrmType === FrmType.Entity) {
      params.value = {
        EnName: mapInstance.value.PTable,
      };
      return (await import('/@/WF/Comm/Ens.vue')).default;
    }
    //章节表单
    if (mapInstance.value.FrmType === FrmType.ChapterFrm) {
      params.value = {
        FrmID: frmID,
      };
      return (await import('../ChapterFrmDesigner/index.vue')).default;
      // return FoolFormDesigner;
    }
    return (await import('/@form/index.vue')).default;
  };

  const initForm = async () => {
    const frmID = route.query.FrmID || route.query.FK_MapData;
    if (!frmID) {
      message.error('请传入正确的frmID');
    }
    const mapData = new MapData(frmID + '');
    await mapData.RetrieveFromDBSources();
    mapInstance.value = mapData;
    currentDesigner.value = await getCurrentDesigner();
  };
  onMounted(async () => {
    await initForm();
    Events.on(CHANGE_FORM_TYPE, async (type: FrmType) => {
      debugger;
      if (!mapInstance.value) {
        message.error('MapData 未被正确初始化，请检查');
        return;
      }
      await mapInstance.value.RetrieveFromDBSources();
      mapInstance.value.FrmType = type === 8 ? 0 : type;
      await mapInstance.value.Update();
      currentDesigner.value = null;
      setTimeout(async () => {
        currentDesigner.value = await getCurrentDesigner();
        componetKey.value++;
      }, 50);
    });
  });
</script>

<style lang="less" scoped>
  .form-designer-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>
