<template>
  <iframe v-if="isFrame" :src="iframeUrl" class="modal-iframe" @changeVal="changeVal"> </iframe>
  <Component v-else :is="component" :params="cparams" @changeVal="changeVal" />
</template>

<script lang="ts" setup>
  import { ComponentOptions, markRaw, onMounted, ref, shallowRef } from 'vue';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';

  const props = defineProps({
    url: {
      type: String,
      default: '',
    },
    mypk: {
      type: String,
      default: '',
    },
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    refPKVal: {
      type: [String, Number],
      default: '',
    },
    mapExt: {
      type: Object,
      default: () => {
        return {};
      },
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const isFrame = ref(false);
  const iframeUrl = ref('');
  const component = shallowRef<Nullable<ComponentOptions>>(null);
  const cparams = ref({});
  const { loadComponent, getComponentParamsByUrl } = useComponentLoader();
  // 选中的节点
  const checkedList = ref<string[]>([]);
  const checkedNames = ref<string[]>([]);

  onMounted(async () => {
    const url = props.url;
    if (url.startsWith('/#/')) {
      isFrame.value = true;
      iframeUrl.value = url;
      return;
    }
    const params = url.split('?');
    if (params.length >= 1) {
      const compName = params[0].endsWith('.vue') ? params[0] : params[0] + '.vue';
      component.value = markRaw(loadComponent(compName));
      cparams.value = getComponentParamsByUrl(url);
    }
  });
  const changeVal = (nos, names) => {
    checkedList.value = nos;
    checkedNames.value = names;
  };
  defineExpose({
    checkedList,
    checkedNames,
  });
</script>

<style scoped></style>
