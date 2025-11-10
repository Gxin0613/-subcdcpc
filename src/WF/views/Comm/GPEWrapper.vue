<template>
  <div class="en-page">
    <GPE :PKVal="PKVal" :EnName="EnName" :params="params" is-child-component />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import GPE from '/@/WF/Comm/UIEntity/GroupPageEdit.vue';
  import { cloneDeep } from 'lodash-es';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const query = route.query || {};
  const PKVal = ref(route.query.PKVal as string);
  const EnName = ref(route.query.EnName as string);
  const params = ref(cloneDeep(query));

  // components  En.vue
  // views EnPage.vue htm  FlowEntity.vue  En.vue
</script>
