<template>
  <RptBlue :edit="false" v-bind="$props" />
</template>

<script setup lang="ts">
  import RptBlue from '../components/RptBlue.vue';

  defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
</script>
