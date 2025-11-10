<template>
  <div class="num-range-picker">
    <input class="min-val" v-model="startVal" :placeholder="searchNumAttr.label" @change="startValChange" />
    <span class="symbol"> ~ </span>
    <input class="max-val" v-model="endVal" :placeholder="searchNumAttr.label" @change="endValChange" />
  </div>
</template>
<script lang="ts" setup>
    import { onMounted, ref } from 'vue';
  import { SearchNumAttr } from '/@/bp/en/Map/SearchNumAttr';
  import { message } from 'ant-design-vue';

  const props = defineProps({
    searchNumAttr: {
      type: Object as PropType<SearchNumAttr>,
      default: () => {
        return new SearchNumAttr();
      },
    },
  });

  const startVal = ref<string>('');
  const endVal = ref<string>('');

  const emit = defineEmits(['update-range']);
  const updateRange = () => {
    emit('update-range', props.searchNumAttr, startVal.value, endVal.value);
  };
  const endValChange = () => {
    const eVal = parseFloat(endVal.value);
    const sVal = parseFloat(startVal.value);
    if (startVal.value != '' && eVal < sVal) {
      message.error('结束值不能小于起始值');
      endVal.value = startVal.value;
    }
    updateRange();
  };
  const startValChange = () => {
    const eVal = parseFloat(endVal.value);
    const sVal = parseFloat(startVal.value);
    if (endVal.value != '' && sVal > eVal) {
      message.error('起始值不能大于结束值');
      startVal.value = endVal.value;
    }
    updateRange();
  };

  onMounted(() => {
    startVal.value = props.searchNumAttr.startVal;
    endVal.value = props.searchNumAttr.endVal;
  });
</script>

<style lang="less" scoped>
  .num-range-picker {
    height: 32px;
    line-height: 32px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .symbol {
      height: 32px;
      line-height: 32px;
      width: 32px;
      color: #aaa;
      text-align: center;
    }
    .min-val,
    .max-val {
      width: calc(50% - 16px);
      text-align: center;
      height: 100%;
      border: none;
      outline: none;
    }
  }
</style>
