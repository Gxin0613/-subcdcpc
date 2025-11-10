<template>
  <div class="loading-panel">
    <div class="main">
      <template v-for="task of taskList" :key="task.id">
        <div class="loading-item item" v-if="task.status === 'loading'">
          <LoadingOutlined style="margin: 0 10px 0 10px" />
          任务：{{ task.id }} <span class="task-info"> 处理中...</span>
        </div>
        <div class="finished-item item" v-if="task.status === 'finished'">
          <div class="task-status">
            <CheckCircleTwoTone two-tone-color="#52c41a" style="margin-right: 12px" />
            任务id：{{ task.id }}
            <Tag color="success" style="margin-left: 12px">success</Tag>
          </div>
          <div class="result">
            <span style="font-size: 16px; margin-right: 12px">Msg:</span>
            <span>{{ task.text }} </span>
          </div>
        </div>
        <div class="fail-item item" v-if="task.status === 'fail'">
          <CloseCircleOutlined color="#ff5555" style="margin: 0 10px 0 10px" />
          任务：{{ task.id }}<span class="task-info">{{ task.text }} </span>
        </div>
        <Divider />
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { PropType } from 'vue';
  import { Divider, Tag } from 'ant-design-vue';
  import { LoadingOutlined, CloseCircleOutlined, CheckCircleTwoTone } from '@ant-design/icons-vue';

  type TaskInfo = {
    id: string;
    text: string;
    status: 'loading' | 'finished' | 'fail';
  };
  defineProps({
    taskList: {
      type: Object as PropType<TaskInfo[]>,
    },
  });
</script>

<style lang="less" scoped>
  .loading-panel {
    width: 100%;
    height: 600px;
    overflow: hidden scroll;
    background-color: white;

    .item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .loading-item {
      .task-info {
        color: #1890ff;
      }
    }

    .finished-item {
      flex-direction: column;
      align-items: flex-start;
      padding: 0 12px;
      box-sizing: border-box;

      .task-status {
        font-size: 16px;
      }

      .result {
        margin-left: 32px;
        margin-top: 6px;
      }
    }

    .fail-item {
      color: #ff5555;
    }
    .task-info {
      margin-left: 12px;
    }
  }
</style>
