<template>
  <div class="movenment-main">
    <Spin :spinning="loading" style="background-color: white">
      <div class="card-container">
        <!-- 流程实例本年 -->
        <div class="card-item">
          <Card :title="'流程实例'" class="cardBox">
            <template #extra>{{ '本年' }}</template>
            <p>{{ '10233条' }}</p>
            <p>{{ '总数xxxx条,同比xx 环比xx' }}</p>
          </Card>
        </div>
        <!-- 流程实例本月 -->
        <div class="card-item">
          <Card :title="'流程实例'" class="cardBox">
            <template #extra>{{ '本月' }}</template>
            <p>{{ '10233条' }}</p>
            <p>{{ '总数xxxx条,同比xx 环比xx' }}</p>
          </Card>
        </div>
        <!-- 按期完成数本年 -->
        <div class="card-item">
          <Card :title="'按期完成数'" class="cardBox">
            <template #extra>{{ '本年' }}</template>
            <p>{{ '10233条' }}</p>
            <p>{{ '总数xxxx条,同比xx 环比xx' }}</p>
          </Card>
        </div>
        <!-- 按期完成数本月 -->
        <div class="card-item">
          <Card :title="'按期完成数'" class="cardBox">
            <template #extra>{{ '本月' }}</template>
            <p>{{ '10233条' }}</p>
            <p>{{ '总数xxxx条,同比xx 环比xx' }}</p>
          </Card>
        </div>
        <!-- 退回数本年 -->
        <div class="card-item">
          <Card :title="'退回数'" class="cardBox">
            <template #extra>{{ '本年' }}</template>
            <p>{{ '10233条' }}</p>
            <p>{{ '退回率 10%' }}</p>
          </Card>
        </div>
        <!-- 退回数本月 -->
        <div class="card-item">
          <Card :title="'退回数'" class="cardBox">
            <template #extra>{{ '本月' }}</template>
            <p>{{ '10233条' }}</p>
            <p>{{ '退回率 10%' }}</p>
          </Card>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { Card, message, Spin } from 'ant-design-vue';
  import { ref, onMounted, reactive, computed } from 'vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { User } from '/@/bp/web/WebUser';
  import headerImg from '/@/assets/images/header.jpg';
  import WebUser from '/@/bp/web/WebUser';
  import { Item } from 'ant-design-vue/es/menu';
  // 定义一个响应式变量来存储数据
  let data: any = reactive([]);
  const loading = ref(false);
  const userStore = useUserStore();
  const getUserInfo = computed(() => {
    const { avatar, Name = '', No } = (userStore.getUserInfo as User) || {};
    return { avatar: avatar || headerImg, Name, No };
  });

  const InitPage = async () => {
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('Self_MovementFlow_More');
        // 更新响应式变量
        data = response;
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
  getUserInfo.value.avatar = basicPath + '/DataUser/UserIcon/' + getUserInfo.value.No + '.png';
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
  .movenment-main {
    display: flex;
    flex-direction: row;
    margin-left: 30px;
    width: calc(100% - 30px);
    margin-top: -30px;
    height: calc(100% - 30px);
    .movement-flow {
      width: 100%;
      height: 100%;
    }
  }
  .prop_top {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    align-items: center;
    width: 100%;
    padding: 0px 12px 0 12px;
    height: 30px;
    border-bottom: 1px solid #eee;
    box-sizing: border-box;
  }

  .card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px; /* 设置卡片之间的间隔 */
    // justify-content: center;
  }

  .card-container > .ant-card {
    flex: 0 0 300px; /* 每个卡片的宽度为300px */
    box-sizing: border-box;
  }
  .card-cover-image {
    height: 180px; /* 设置封面图片的固定高度 */
    object-fit: cover; /* 确保图片按比例缩放以填满容器 */
    width: 100%; /* 使图片宽度填满卡片宽度 */
  }
  .movenment-main {
    display: flex;
    flex-direction: row;
    margin-left: 30px;
    width: calc(100% - 30px);
    margin-top: -30px;
    height: calc(100% - 30px);
    .movement-flow {
      width: 100%;
      height: 100%;
    }
  }
  .cardBox {
    width: 300px;
    height: 150px;
  }
  .card-item {
    margin-left: 30px;
  }
</style>
