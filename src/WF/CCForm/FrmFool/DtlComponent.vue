<template>
  <div>
    <Dtl
      v-if=" gf.dtl?.ListShowModel === 0"
      :groupField="gf"
      :frmStyleContent="frmConfigs.frmStyleContent"
      :isShowGF="isShowGF"
      ref="dtl"
      :dtl-info="gf.dtl"
      :params="props.params"
      :main-data="mainData"
      :main-mapExts="GetDtlMapExt(gf.dtl?.No)"
      :is-readonly="props.fieldIsReadonly || props.isReadonly"
      @update-prop-data="frmConfigs.handleUpdate"
    />
    <DtlCard
      v-if="gf.dtl?.ListShowModel === 1"
      :groupField="gf"
      :frmStyleContent="frmConfigs.frmStyleContent"
      :isShowGF="isShowGF"
      ref="dtlCard"
      :dtl-info="gf.dtl"
      :params="props.params"
      :main-data="mainData"
      :main-mapExts="GetDtlMapExt(gf.dtl.No)"
      :is-readonly="props.fieldIsReadonly || props.isReadonly"
    />
    <iframe
      v-if="gf.dtl?.ListShowModel === 2"
      :src="GetIFrameSrc(gf.dtl,props.params, props.fieldIsReadonly)"
      ref="frameRef"
      style="width: 100%; height: 100%"
      :style="({ height: gf.dtl.H + 'px' } as StyleValue)"
    ></iframe>
    <DtlRpt
      v-if=" gf.dtl?.ListShowModel === 3 || gf.dtl?.ListShowModel === 4 || gf.dtl?.ListShowModel === 5"
      :groupField="gf"
      :frmStyleContent="frmConfigs.frmStyleContent"
      :isShowGF="isShowGF"
      ref="dtlRpt"
      :dtl-info="gf.dtl"
      :params="props.params"
      :main-data="mainData"
      :main-mapExts="GetDtlMapExt(gf.dtl?.No)"
      :is-readonly="props.fieldIsReadonly"
      @ChangeMainData="frmConfigs.ChangeMainData"
    />
    <DtlTree
      v-if="gf.dtl?.ListShowModel === 6"
      :groupField="gf"
      :frmStyleContent="frmConfigs.frmStyleContent"
      :isShowGF="isShowGF"
      ref="dtlTree"
      :dtl-info="gf.dtl"
      :params="props.params"
      :main-data="mainData"
      :main-mapExts="GetDtlMapExt(gf.dtl.No)"
      :is-readonly="props.fieldIsReadonly"
      @ChangeMainData="frmConfigs.ChangeMainData"
    />
    <DtlSort
      v-if="gf.dtl?.ListShowModel === 7"
      :groupField="gf"
      :frmStyleContent="frmConfigs.frmStyleContent"
      :isShowGF="isShowGF"
      ref="dtlSort"
      :dtl-info="gf.dtl"
      :params="props.params"
      :main-data="mainData"
      :main-mapExts="GetDtlMapExt(gf.dtl.No)"
      :is-readonly="props.fieldIsReadonly"
      @ChangeMainData="frmConfigs.ChangeMainData"
    />
  </div>
</template>
<script lang="ts" setup>
  import Dtl from '/@/WF/CCForm/Dtl.vue';
  import DtlCard from '/@/WF/CCForm/DtlCard.vue';
  import DtlRpt from '/@/WF/CCForm/DtlRpt.vue';
  import DtlSort from '/@/WF/CCForm/DtlSort.vue';
  import DtlTree from '/@/WF/CCForm/DtlTree.vue';
  import { FrmConfig, GroupFieldExt } from '/@/WF/CCForm/FrmFool/frm';
  import { shallowRef, StyleValue } from 'vue';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import { useFrmFoolMethod } from '/@/WF/CCForm/FrmEnd';
  import { message } from 'ant-design-vue';

  // 父组件传过来的属性
  const props = defineProps({
    frmConfigs: {
      //表单属性集合
     type: Object as PropType<FrmConfig>,
      default: () => {},
    },
    gf: {
      //表单属性集合
     type: Object as PropType<GroupFieldExt>,
      default: () => {},
    },
    isSetHeight: {
      type: Boolean,
      default: true,
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    mainData:{
      type: Object,
      default: () => {},
    },
    componetKeys:{
      type: Object,
      default: () => {},
    },
    autoLayout: {
      type: Boolean,
      default: false,
    },
    fieldIsReadonly: {
      type: Boolean,
      default: false,
    },
    isShowGF: {
      type: Boolean,
      default: false,
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    WGFrm: {
      type: Object as PropType<WaiGuaBaseFrm>,
      default: null,
    },
  });
  const {GetDtlMapExt, GetIFrameSrc} = useFrmFoolMethod(props.frmConfigs,props.autoLayout,props.isSetHeight);
  /**
   *
   * @param targetUrl 判断是否跨域
   */
  const sameOriginCheck = (targetUrl: any) => {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      message.error('自定义从表必须配置完整路径，以http(s):// 开头');
      return false;
    }
    return targetUrl && targetUrl.startsWith(window.location.origin);
  };
  const dtl = shallowRef<InstanceType<typeof Dtl>>();
  const dtlCard = shallowRef<InstanceType<typeof DtlCard>>();
  const dtlRpt = shallowRef<InstanceType<typeof DtlRpt>>();
  const dtlTree = shallowRef<InstanceType<typeof DtlTree>>();
  const dtlSort = shallowRef<InstanceType<typeof DtlSort>>();
  const frameRef = shallowRef<
    HTMLIFrameElement & {
      contentWindow: {
        window: {
          SaveAll: Function;
        };
      };
    }
  >();
  /**
   * 从表的保存方法
   * @param isOnlySave 
   */
  const SaveAll=async (isOnlySave)=>{
    if(props.fieldIsReadonly === true) return true;
    const listShowModel = props.gf.dtl?.ListShowModel || 0;
    if (listShowModel == 2) {
      const iframeUrl = props.gf.dtl?.UrlDtl;
      const isSameOrigin = sameOriginCheck(iframeUrl);
      if (!!frameRef.value && Array.isArray(frameRef.value)) frameRef.value = frameRef?.value[0];
      const frameWin = frameRef.value?.contentWindow;
      // 同源
      if (isSameOrigin) {
        frameWin?.window?.SaveAll?.();
      }
      frameWin?.postMessage(
        {
          cmd: 'SaveAll',
          params: {},
        },
        '*',
      );
    }
    //根据类型保存从表数据
    //表格模式
    if(listShowModel === 0){
       if(await dtl.value?.SaveAll(isOnlySave)==false)
        return false;
       if(isOnlySave == false && await dtl.value?.CheckDtlNum()==false)
        return false
    }
     //卡片模式
    if(listShowModel === 1){
      if(isOnlySave == false && await dtl.value?.CheckDtlNum()==false)
         return false;
    }
    if((listShowModel === 3 || listShowModel === 4 || listShowModel === 5) && await dtlRpt.value?.SaveAll(isOnlySave)==false)
      return false;
    if(listShowModel === 6 && await dtlTree.value?.SaveAll(isOnlySave)==false)
      return false;
    if(listShowModel === 7 && await dtlSort.value?.SaveAll(isOnlySave)==false)
      return false;
    return true;
  }
  defineExpose({ SaveAll });
</script>

<style lang="less" scoped>

  :deep(.ant-card-body) {
    padding: 6px 24px;
  }
</style>
