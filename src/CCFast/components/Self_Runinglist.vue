<template>
  <div class="stats-container">
    <template v-if="loading"> loading... </template>
    <div class="stats-card stats-card-inprogress">
      <div class="card-content">
        <!-- 顶部主要指标 -->
        <div class="main-stats">
          <div class="icon-wrapper accent-red">
            <i :class="todoBojectTARun.icon"></i>
          </div>
          <div class="stats-info">
            <div class="stats-label">{{ todoBojectTARun?.title }}</div>
            <div class="stats-value"
              >{{ todoBojectTARun?.exp || 0 }}<span class="stats-unit">{{ '个' }}</span></div
            >
          </div>
        </div>

        <!-- 详细数据部分 -->
        <div class="detailed-stats inprogress-stats">
          <div v-for="(item, index) in extractedTARunArray" :key="index" class="stat-item stat-item-large" :class="getStatClassInProgress(item.title)">
            <div class="stat-icon">
              <svg
                v-if="item.title === '退回中'"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H11" />
              </svg>
              <svg
                v-else-if="item.title === '移交中'"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 3v10" />
                <path d="m21 7-4-4-4 4" />
                <path d="M7 21v-10" />
                <path d="m3 17 4 4 4-4" />
              </svg>
              <svg
                v-else-if="item.title === '逾期中'"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <svg
                v-else-if="item.title === '挂起中'"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6.5 3v18" />
                <path d="M17.5 3v18" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ item.title }}</div>
              <div class="stat-value">{{ item.exp }}</div>
            </div>
          </div>
        </div>

        <!-- 空白底部占位区 -->
        <div class="bottom-placeholder"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { ref, onMounted, reactive } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import WebUser from '/@/bp/web/WebUser';

  // 定义一个响应式变量来存储数据
  let data: any = reactive([]);
  //在途
  let extractedTARunArray: any = reactive([]);
  //累计在途
  let todoBojectTARun: any = reactive({});
  //加载
  const loading = ref(false);

  // 获取在途状态的类名
  const getStatClassInProgress = (title) => {
    switch (title) {
      case '退回中':
        return 'status-returned';
      case '移交中':
        return 'status-transferred';
      case '逾期中':
        return 'status-overdue';
      case '挂起中':
        return 'status-suspended';
      default:
        return '';
    }
  };

  const InitPage = async () => {
    const targetTARunTitles = ['退回中', '移交中', '逾期中', '挂起中'];
    // 在途
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyRuning');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedTARunArray = data.filter((item) => targetTARunTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "在途数" 的对象
        todoBojectTARun = data.find((item) => item.title === '在途数');
      } catch (e: any) {
        message.error(e.toString());
        console.error(e);
      } finally {
        loading.value = false;
      }
    } else {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_OneFlow');
        const response = await handler.DoMethodReturnString('EmpHome_MyRuning');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedTARunArray = data.filter((item) => targetTARunTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "在途数" 的对象
        todoBojectTARun = data.find((item) => item.title === '在途数');
      } catch (e: any) {
        message.error(e.toString());
        console.error(e);
      } finally {
        loading.value = false;
      }
    }
  };

  //页面数据
  onMounted(async () => {
    await InitPage();
  });
</script>

<style lang="scss" scoped>
  @import url(./less/flowcard.less);
</style>
