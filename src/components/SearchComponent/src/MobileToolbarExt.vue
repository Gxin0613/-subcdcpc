<template>
  <div class="extend-func">
    <div class="func-item" v-for="btn in buttonList.filter((btn) => !['新建', '查询', '删除', '分析', '报表'].includes(btn.name))" :key="btn.key" @click="btn.onClick">
      <FunctionOutlined style="font-size: 18px; margin-bottom: 12px" />
      {{ btn.name }}</div
    >
    <div v-if="settingButtonVisible" class="func-item" @click="$emit('open-dict-settings')">
      <VantIcon name="setting-o" style="font-size: 18px; margin-bottom: 12px" />{{'设置'}}</div>
  </div>
</template>

<script lang="ts" setup>
  import { Icon as VantIcon } from 'vant';
  import type { ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import WebUser from '/@/bp/web/WebUser';
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { FunctionOutlined } from '@ant-design/icons-vue';

  defineProps({
    buttonList: {
      type: Array as PropType<ToolbarButtonDef[]>,
      default: () => [],
    },
  });

  const route = useRoute();
  // 设置按钮在表单中不显示
  const settingButtonVisible = computed(() => {
    return WebUser.IsAdmin && !route.path.startsWith('/WF/Designer/Form');
  });
  defineEmits(['GroupInitPage', 'view-as-rpt', 'view-as-table', 'open-dict-settings', 'update-first-ddl']);
</script>

<style lang="less" scoped>
  .extend-func {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    .func-item {
      height: 80px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #1989fa;
      background-color: #1989fa;
      font-size: 12px;
      color: white;
      flex-direction: column;
    }
  }
</style>
