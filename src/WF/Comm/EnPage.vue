<template>
  <div class="en-page">
    <En :PKVal="PKVal" :EnName="EnName" :params="params" is-child-component />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import En from './En.vue';
  import { cloneDeep } from 'lodash-es';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const query = route.query || {};
  const PKVal = ref(route.query.PKVal as string);
  const EnName = ref(route.query.EnName as string);
  const params = ref(cloneDeep(query));

  // components  En.vue
  // Views EnPage.vue htm  FlowEntity.vue  En.vue
</script>
