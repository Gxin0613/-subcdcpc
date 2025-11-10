<template>
  <div>
    <div>{{ '设置延期时间' }}</div>
    <div style="display: flex; align-items: center">
      <Select v-model:value="tVals.days" style="width: 150px" :options="OptionsDays" @change="(e) => updateParent('days', e)" />
      <span class="set_time set_time_margin">{{ '天' }}</span>
      <Select v-model:value="tVals.hours" style="width: 150px" :options="OptionsHours" @change="(e) => updateParent('hours', e)" />
      <span class="set_time set_time_margin">{{ '小时' }}</span>
      <Select ref="select" v-model:value="tVals.mins" style="width: 150px" @change="(e) => updateParent('mins', e)">
        <SelectOption value="0">0</SelectOption>
        <SelectOption value="15">15</SelectOption>
        <SelectOption value="30">30</SelectOption>
        <SelectOption value="45">45</SelectOption>
      </Select>
      <span class="set_time">{{ '分钟' }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, watch } from 'vue';
  import { Select, SelectOption } from 'ant-design-vue';
  const props = defineProps({
    delaySendTime: {
      type: Object,
      default: () => {
        return {
          days: 0,
          hours: 0,
          mins: 0,
        };
      },
    },
  });
  const tVals = reactive({
    days: 0,
    hours: 0,
    mins: 0,
  });
  watch(
    () => props.delaySendTime,
    (val) => {
      Object.assign(tVals, val);
    },
  );

  const emit = defineEmits(['update-time']);
  const OptionsDays = [...Array(31)].map((_, i) => ({ value: i }));
  const OptionsHours = [...Array(25)].map((_, i) => ({ value: i }));
  // 更新父组件
  const updateParent = (key, val) => {
    emit('update-time', key, val);
  };
</script>

<style lang="less" scoped>
  .set_time {
    background: #f4f4f4;
    height: 32px;
    width: 90px;
    text-align: right;
    line-height: 32px;
    padding-right: 10px;
  }
  .set_time_margin {
    margin-right: 65px;
  }
</style>
