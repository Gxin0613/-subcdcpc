<template>
  <div class="stats-container">
    <template v-if="loading"> loading... </template>
    <div v-else class="stats-card stats-card-initiated">
      <div class="card-content">
        <!-- 顶部主要指标 -->
        <div class="main-stats">
          <div class="icon-wrapper accent-blue">
            <i :class="todoBojectMyStart.icon"></i>
          </div>
          <div class="stats-info">
            <div class="stats-label">{{ todoBojectMyStart?.title }}</div>
            <div class="stats-value"
              >{{ todoBojectMyStart?.exp || 0 }}<span class="stats-unit">{{ '个' }}</span></div
            >
          </div>
        </div>

        <!-- 详细数据部分 -->
        <div class="detailed-stats">
          <div v-for="(item, index) in extractedMyStartArray.slice(0, 6)" :key="index" class="stat-item" :class="getStatClass(item.title)">
            <div class="stat-label">{{ item.title }}</div>
            <div class="stat-value">{{ item.exp }}</div>
          </div>
        </div>

        <!-- 趋势指标 -->
        <div class="trend-stats">
          <div class="trend-item yesterday">
            <div class="trend-icon">
              <svg
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
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div class="trend-info">
              <div class="trend-label">{{ yesterdayNewMyStart?.title }}</div>
              <div class="trend-value">{{ yesterdayNewMyStart?.exp || 0 }}</div>
            </div>
          </div>

          <div class="trend-divider"></div>

          <div class="trend-item today">
            <div class="trend-icon">
              <svg
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="trend-info">
              <div class="trend-label">{{ dadyNewMyStart?.title }}</div>
              <div class="trend-value">{{ dadyNewMyStart?.exp || 0 }}</div>
            </div>
          </div>
        </div>
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
  //我发起的更多状态
  let extractedMyStartArray: any = reactive([]);
  //我发起的
  let todoBojectMyStart: any = reactive({});
  // 昨日新增
  let yesterdayNewMyStart: any = reactive({});
  //今日新增
  let dadyNewMyStart: any = reactive({});
  //加载
  const loading = ref(false);

  // 获取特定状态的类名
  const getStatClass = (title) => {
    switch (title) {
      case '已完成':
        return 'status-completed';
      case '未完成':
        return 'status-incomplete';
      case '按期完成':
        return 'status-on-time';
      case '逾期完成':
        return 'status-overdue';
      case '按期完成率':
        return 'status-rate';
      case '上月新增':
        return 'status-last-month';
      case '本月新增':
        return 'status-this-month';
      default:
        return '';
    }
  };

  const InitPage = async () => {
    const targetMyStartTitles = ['已完成', '未完成', '按期完成', '逾期完成', '按期完成率', '上月新增', '本月新增'];
    // 我发起的
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyStart');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedMyStartArray = data.filter((item) => targetMyStartTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "昨日新增" 的对象
        yesterdayNewMyStart = data.find((item) => item.title === '昨日新增');
        todoBojectMyStart = data.find((item) => item.title === '发起总数');
        dadyNewMyStart = data.find((item) => item.title === '今日新增');
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
        const response = await handler.DoMethodReturnString('EmpHome_MyStart');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedMyStartArray = data.filter((item) => targetMyStartTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "昨日新增" 的对象
        yesterdayNewMyStart = data.find((item) => item.title === '昨日新增');
        todoBojectMyStart = data.find((item) => item.title === '发起总数');
        dadyNewMyStart = data.find((item) => item.title === '今日新增');
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
