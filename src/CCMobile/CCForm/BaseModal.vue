<template>
  <component :is="currentModal" :mapExt="mapExt" :mainData="mainData" />
</template>

<script lang="ts" setup>
  import { ComponentOptions, shallowRef, ref } from 'vue';
  import { MapExt } from '/#/entity';
  // import HandWriting from "/@/WF/CCForm/HandWriting.vue";
  const BasisComponents = import.meta.glob('./Pop/*.vue', { eager: true });
  const components = {};
  // 遍历生成对象集合
  for (const key in BasisComponents) {
    const com = BasisComponents[key].default;
    components[com.name] = com;
  }

  // 外部传过来的属性
  const props = defineProps({
    modalType: {
      type: String,
      default: '',
    },
    mapExt: {
      type: Object,
      default: {},
    },
    mainData: {
      type: Object,
      default: {},
    },
  });
  const currentModal = shallowRef<Nullable<ComponentOptions>>(null);
  const mapExt = ref<MapExt>();
  const InitPage = () => {
    if (props.modalType === 'HandWriting') {
      //currentModal.value=HandWriting;
      return;
    }

    currentModal.value = components[props.modalType] as ComponentOptions;
    currentModal.value.tag = props.modalType;
    mapExt.value = props.mapExt as MapExt;
  };
  InitPage();
</script>

<style scoped></style>
