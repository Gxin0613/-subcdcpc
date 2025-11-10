<template>
  <component v-if="!!currentModal" :is="currentModal" :params="params" :EnName="enName" :PKVal="query.PKVal" :WGFlow="WGFlow" />
</template>

<script lang="ts" setup>
  import { ComponentOptions, shallowRef, ref, PropType } from 'vue';
  import type { Component } from 'vue';
  import EnOnly from '/@/CCMobile/Comm/EnOnly.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { CC } from '/@/WF/WorkOpt/SendAndCC/CC';
  import { CCORShare } from '/@/WF/WorkOpt/SendAndCC/CCORShare';
  import { HungupList } from '/@/WF/WorkOpt/HungupList';
  import { HuiQian } from '/@/WF/WorkOpt/HuiQian';
  import { Shift } from '/@/WF/WorkOpt/Shift';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  const BasisComponents = import.meta.glob('./*.vue', { eager: true }) as Recordable;
  const components = {};
  // 遍历生成对象集合
  for (const key in BasisComponents) {
    const com = BasisComponents[key].default;
    if (!!com.name) components[com.name] = com;
  }
  // 外部传过来的属性
  const props = defineProps({
    modalType: {
      type: String,
      default: '',
    },
    params: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {},
    },
    isDelayedSend: {
      type: Boolean,
      defalut: false,
    },
    WGFlow: {
      type: Object as PropType<WaiGuaFlow>,
      default: null,
    },
  });
  const enName = ref('');
  const currentModal = shallowRef<Component>();
  const query = ref<Record<string, any>>();
  const InitPage = async () => {
    query.value = props.params;
    query.value.PKVal = '';
    if (components[props.modalType] == undefined) {
      query.value.PKVal = WebUser.No + '_' + query.value.FK_Node + '_' + query.value.WorkID;
      //引用了其他位置的组件
      let entity: any = null;
      switch (props.modalType) {
        case 'CC':
          enName.value = 'TS.WorkOpt.CC';
          entity = new CC(query.value.PKVal);
          break;
        case 'CCORShare':
          enName.value = 'TS.WorkOpt.CCORShare';
          entity = new CCORShare(query.value.PKVal);
          break;
        case 'HuiQian':
          enName.value = 'TS.WorkOpt.HuiQian';
          entity = new HuiQian(query.value.PKVal);
          break;
        case 'Shift':
          enName.value = 'TS.WorkOpt.Shift';
          entity = new Shift(query.value.PKVal);
          break;
        case 'Hungup':
          enName.value = 'TS.WorkOpt.HungupList';
          entity = new HungupList(query.value.PKVal);
          break;
      }
      const exist = await entity.RetrieveFromDBSources();
      // if (!exist || entity.GetValByKey('WorkID') != props.params.WorkID) {
      if (!exist) {
        entity.WorkID = props.params.WorkID;
        entity.NodeID = props.params.FK_Node;
        entity.ToNodeID = props.params.ToNode || 0;
        entity.EmpNo = WebUser.No;
        entity.EmpName = WebUser.Name;
        await entity.Insert();
      }
      currentModal.value = EnOnly;
      return;
    }
    currentModal.value = components[props.modalType] as ComponentOptions;
    currentModal.value.tag = props.modalType;
  };
  InitPage();
</script>

<style scoped></style>
