<template>
  <RptWhite :edit="false" v-bind="$props" />
</template>

<script setup lang="ts">
  import RptWhite from '../components/RptWhite.vue';

  defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
</script>
