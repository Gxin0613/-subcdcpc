<template>
  <div class="stats-container">
    <template v-if="loading"> loading... </template>
    <div v-else class="stats-card stats-card-completed">
      <div class="card-content">
        <!-- 顶部主要指标 -->
        <div class="main-stats">
          <div class="icon-wrapper accent-green">
            <i :class="todoBojectFinish.icon"></i>
          </div>
          <div class="stats-info">
            <div class="stats-label">{{ todoBojectFinish?.title }}</div>
            <div class="stats-value"
              >{{ todoBojectFinish?.exp || 0 }}<span class="stats-unit">{{ '个' }}</span></div
            >
          </div>
        </div>

        <!-- 详细数据部分 -->
        <div class="detailed-stats">
          <div v-for="(item, index) in extractedFinishArray" :key="index" class="stat-item" :class="getStatClassCompleted(item.title)">
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
              <div class="trend-label">{{ yesterdayNewFinish?.title }}</div>
              <div class="trend-value">{{ yesterdayNewFinish?.exp || 0 }}</div>
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
              <div class="trend-label">{{ dadyNewFinish?.title }}</div>
              <div class="trend-value">{{ dadyNewFinish?.exp || 0 }}</div>
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
  //已完成更多状态
  let extractedFinishArray: any = reactive([]);
  //累计已完成
  let todoBojectFinish: any = reactive({});
  // 昨日新增
  let yesterdayNewFinish: any = reactive({});
  //今日新增
  let dadyNewFinish: any = reactive({});
  //加载
  const loading = ref(false);

  // 获取已完成状态的类名
  const getStatClassCompleted = (title) => {
    switch (title) {
      case '正常结束':
        return 'status-normal-end';
      case '非正常结束':
        return 'status-abnormal-end';
      case '按期完成':
        return 'status-on-time';
      case '逾期完成':
        return 'status-overdue';
      case '按期完成率':
        return 'status-rate';
      default:
        return '';
    }
  };

  const InitPage = async () => {
    const targetFinishTitles = ['正常结束', '非正常结束', '按期完成', '逾期完成', '按期完成率'];
    // 已完成
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyComplate');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedFinishArray = data.filter((item) => targetFinishTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "昨日新增" 的对象
        yesterdayNewFinish = data.find((item) => item.title === '昨日新增');
        todoBojectFinish = data.find((item) => item.title === '累计已完成');
        dadyNewFinish = data.find((item) => item.title === '今日新增');
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
        const response = await handler.DoMethodReturnString('EmpHome_MyComplate');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedFinishArray = data.filter((item) => targetFinishTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "昨日新增" 的对象
        yesterdayNewFinish = data.find((item) => item.title === '昨日新增');
        todoBojectFinish = data.find((item) => item.title === '累计已完成');
        dadyNewFinish = data.find((item) => item.title === '今日新增');
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
