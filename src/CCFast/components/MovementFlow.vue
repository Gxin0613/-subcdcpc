<template>
  <div class="movement-container">
    <Spin :spinning="loading">
      <div v-if="data.length > 0" class="movement-list">
        <div v-for="(item, index) in data" :key="index" class="movement-item">
          <!-- 用户头像 -->
          <div class="avatar-wrapper">
            <img :src="generateAvatarPath(item.Starter)" :onerror="defaultIcon" class="user-avatar" />
          </div>

          <!-- 内容区域 -->
          <div class="content-wrapper">
            <!-- 标题和操作 -->
            <div class="item-header">
              <span class="user-name">{{ item.StarterName }}</span>
              <span class="action-text">
                {{ getActionText(item) }}
                <span class="highlight-text">{{ item.FlowName }}</span>
              </span>
            </div>

            <!-- 详细信息 -->
            <div class="item-body">
              <div class="node-info">
                <span class="highlight-text">"{{ item.NodeName }}"</span>
                <span class="todo-info"
                  >{{ '待办人：' }}<span class="highlight-text">{{ item.TodoEmps }}</span></span
                >
              </div>

              <div class="status-info">
                <Tag :color="getStatusColor(item.WFState)" class="status-tag">
                  {{ getStatusText(item.WFState) }}
                </Tag>
              </div>
            </div>

            <!-- 时间 -->
            <div class="item-footer">
              <span class="time-info">{{ FirendlyDT(item.SendDT) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <div class="empty-text">{{ '您还没有流程动态！' }}</div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { message, Tag, Spin } from 'ant-design-vue';
  import { ref, onMounted, reactive } from 'vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import WebUser from '/@/bp/web/WebUser';

  // 定义一个响应式变量来存储数据
  let data: any = reactive([]);
  const loading = ref(false);

  // 获取操作文本
  const getActionText = (item) => {
    if (item.WFState === 5) {
      return '退回了 ';
    } else if (item.WFState === 2) {
      return '发送了 ';
    } else if (item.WFState === 3) {
      return '完成了 ';
    } else {
      return '处理了 ';
    }
  };

  // 获取状态颜色
  const getStatusColor = (state) => {
    switch (state) {
      case 2:
        return 'green';
      case 3:
        return 'blue';
      case 5:
        return 'red';
      default:
        return 'orange';
    }
  };

  // 获取状态文本
  const getStatusText = (state) => {
    switch (state) {
      case 2:
        return '进行中';
      case 3:
        return '已完成';
      case 5:
        return '退回';
      default:
        return '其他';
    }
  };

  const InitPage = async () => {
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('Self_MovementFlow_More');
        // 更新响应式变量
        data = response;
        data.forEach((en) => {
          // 处理发送人 for ningbogang
          const sender = en.Sender;
          if (sender != null && sender != '' && sender != undefined) {
            en.Sender = sender.split(',').length > 1 ? sender.split(',')[1].replace(';', ',') : sender.split(',')[0];
            if (!!en.Sender && en.Sender.endsWith(',')) en.Sender = en.Sender.substring(0, en.Sender.length - 1);
          }
          //处理待办人 for ningboang
          const todoEmps = en.TodoEmps;
          if (!!todoEmps) {
            en.TodoEmps = todoEmps.split(',').length > 1 ? todoEmps.split(',')[1].replace(';', ',') : todoEmps.split(',')[0] || '';
            if (!!en.TodoEmps && en.TodoEmps.endsWith(',')) en.TodoEmps = en.TodoEmps.substring(0, en.TodoEmps.length - 1);
          }
        });
        console.log('data.value data.value ', data);
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
        const response = await handler.DoMethodReturnString('Self_MovementFlow_My');
        // 更新响应式变量
        data = response;
      } catch (e: any) {
        message.error(e.toString());
        console.error(e);
      } finally {
        loading.value = false;
      }
    }
  };

  //获取代理路径
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basicPath = VITE_GLOB_API_URL;
  //用户头像图片
  const generateAvatarPath = (userNo) => {
    return `${basicPath}/DataUser/UserIcon/${userNo}.png`;
  };
  //没有用户头像图片时获取默认图片
  const defaultIcon = (e) => {
    let img = e.srcElement;
    img.src = basicPath + '/DataUser/UserIcon/Default.png';
    img.onerror = null;
  };

  const FirendlyDT = (adt: string) => {
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const time1 = new Date().getTime(); //当前的时间戳
    const time2 = Date.parse(new Date(adt).toString()); //指定时间的时间戳
    const time = time1 - time2;

    let result = '';
    if (time < 0) {
      result = '--';
    } else if (time / month >= 1) {
      result = parseInt(time / month) + '月前';
    } else if (time / week >= 1) {
      result = parseInt(time / week) + '周前';
    } else if (time / day >= 1) {
      result = parseInt(time / day) + '天前';
    } else if (time / hour >= 1) {
      result = parseInt(time / hour) + '小时前';
    } else if (time / minute >= 1) {
      result = parseInt(time / minute) + '分钟前';
    } else {
      result = '刚刚';
    }
    return result;
  };

  //页面数据
  onMounted(async () => {
    await InitPage();
  });
</script>

<style scoped lang="less">
  .movement-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #fff;
    padding: 0;
    position: relative;
    overflow-y: auto;
  }

  .movement-list {
    height: 100%;
    overflow-y: auto;
  }

  .movement-item {
    display: flex;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f9f9f9;
    }
  }

  .avatar-wrapper {
    margin-right: 12px;
    flex-shrink: 0;

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    .user-name {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin-right: 6px;
    }

    .action-text {
      font-size: 14px;
      color: #666;
    }
  }

  .item-body {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .node-info {
      font-size: 14px;

      .todo-info {
        margin-left: 8px;
        color: #666;
      }
    }

    .status-info {
      flex-shrink: 0;

      .status-tag {
        font-size: 12px;
      }
    }
  }

  .item-footer {
    .time-info {
      font-size: 12px;
      color: #999;
    }
  }

  .highlight-text {
    color: #1890ff;
    font-weight: 500;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 280px;
    color: #999;

    .empty-icon {
      margin-bottom: 16px;
      color: #d9d9d9;
    }

    .empty-text {
      font-size: 16px;
    }
  }
</style>
