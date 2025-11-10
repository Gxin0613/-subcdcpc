<template>
  <div class="stats-container">
    <template v-if="loading"> loading... </template>
    <div v-else class="stats-card">
      <div class="card-content">
        <!-- 顶部主要指标 -->
        <div class="main-stats">
          <div class="icon-wrapper">
            <i :class="todoBoject.icon"></i>
          </div>
          <div class="stats-info">
            <div class="stats-label">{{ todoBoject?.title }}</div>
            <div class="stats-value">{{ todoBoject?.exp }}</div>
          </div>
        </div>

        <!-- 详细数据部分 -->
        <div class="detailed-stats">
          <div v-for="(item, index) in extractedArray" :key="index" class="stat-item" :class="getStatClass(item.title)">
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
              <div class="trend-label">{{ yesterdayNew?.title }}</div>
              <div class="trend-value">{{ yesterdayNew?.exp }}</div>
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
              <div class="trend-label">{{ dadyNew?.title }}</div>
              <div class="trend-value">{{ dadyNew?.exp }}</div>
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
  //待办
  let todoBoject: any = reactive({});
  // 昨日新增
  let yesterdayNew: any = reactive({});
  //待办更多状态
  let extractedArray: any = reactive([]);
  //今日新增
  let dadyNew: any = reactive({});
  //加载
  const loading = ref(false);

  // 获取特定状态的类名
  const getStatClass = (title) => {
    switch (title) {
      case '退回':
        return 'status-returned';
      case '挂起':
        return 'status-suspended';
      case '未读':
        return 'status-unread';
      case '会签':
        return 'status-countersign';
      case '移交':
        return 'status-transferred';
      case '抄送':
        return 'status-incomplete';
      default:
        return '';
    }
  };

  const InitPage = async () => {
    const targetTitles = ['退回', '会签', '挂起', '未读', '移交', '抄送'];
    // 待办
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyTodolist');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedArray = data.filter((item) => targetTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "昨日新增" 的对象
        yesterdayNew = data.find((item) => item.title === '昨日新增');
        todoBoject = data.find((item) => item.title === '待办');
        dadyNew = data.find((item) => item.title === '今日新增');
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
        const response = await handler.DoMethodReturnString('EmpHome_MyTodolist');
        // 更新响应式变量
        data = response;
        // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedArray = data.filter((item) => targetTitles.includes(item.title));
        // 使用 find 方法找到 title 为 "昨日新增" 的对象
        yesterdayNew = data.find((item) => item.title === '昨日新增');
        todoBoject = data.find((item) => item.title === '待办');
        dadyNew = data.find((item) => item.title === '今日新增');
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

<style scoped lang="less">
  .stats-container {
    width: 100%;
    height: 100%;

    .stats-card {
      width: 100%;
      height: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
      }

      .card-content {
        padding: 20px;
      }
    }

    .main-stats {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .icon-wrapper {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #4b6cb7, #182848);
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 16px;
        color: white;
        font-size: 26px;
        box-shadow: 0 4px 10px rgba(75, 108, 183, 0.3);
      }

      .stats-info {
        flex: 1;

        .stats-label {
          font-size: 16px;
          color: #666;
          margin-bottom: 4px;
        }

        .stats-value {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }
      }
    }

    .detailed-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;

      .stat-item {
        padding: 10px;
        background: #f7f9fc;
        border-radius: 8px;
        text-align: center;
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.03);
          background: #eef2f9;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
          white-space: nowrap;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        /* 状态特定样式 */
        &.status-returned {
          background: rgba(245, 34, 45, 0.08);
          .stat-value {
            color: #f5222d;
          }
        }

        &.status-incomplete {
          background: rgba(250, 173, 20, 0.08);
          .stat-value {
            color: #faad14;
          }
        }

        &.status-suspended {
          background: rgba(140, 140, 140, 0.08);
          .stat-value {
            color: #8c8c8c;
          }
        }

        &.status-unread {
          background: rgba(24, 144, 255, 0.08);
          .stat-value {
            color: #1890ff;
          }
        }

        &.status-countersign {
          background: rgba(82, 196, 26, 0.08);
          .stat-value {
            color: #52c41a;
          }
        }

        &.status-transferred {
          background: rgba(114, 46, 209, 0.08);
          .stat-value {
            color: #722ed1;
          }
        }
      }
    }

    .trend-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f7f9fc;
      border-radius: 10px;
      padding: 16px;

      .trend-item {
        display: flex;
        align-items: center;
        flex: 1;

        .trend-icon {
          margin-right: 8px;
          opacity: 0.7;
          color: #666;
        }

        .trend-info {
          .trend-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 2px;
          }

          .trend-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }

        &.yesterday .trend-value {
          color: #722ed1;
        }

        &.today .trend-value {
          color: #1890ff;
        }
      }

      .trend-divider {
        width: 1px;
        height: 30px;
        background: #e8e8e8;
        margin: 0 12px;
      }
    }
  }
</style>
