<template>
  <div class="movenment-main">
    <Spin :spinning="loading" style="background-color: white">
      <div class="card-container">
        <!-- 待办 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="tag">{{ todoBoject?.title }}</div>
              <div class="title">{{ todoBoject?.exp }}个</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <div style="margin-left: -10px; font-weight: bold">{{ yesterdayNew?.title }}：{{ yesterdayNew?.exp }}</div>
            </Card-meta>
          </Card>
        </div>
        <!-- 待办更多状态 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="dataBox" v-for="(item, index) in extractedArray" :key="index">{{ item.title }}：{{ item.exp }}</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <div style="margin-left: -10px; font-weight: bold">{{ dadyNew?.title }}：{{ dadyNew?.exp }}</div>
            </Card-meta>
          </Card>
        </div>
        <!-- 已完成 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="tag">{{ todoBojectFinish?.title }}</div>
              <div class="title">{{ todoBojectFinish?.exp }}个</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <div style="margin-left: -10px; font-weight: bold">{{ yesterdayNewFinish?.title }}：{{ yesterdayNewFinish?.exp }}</div>
            </Card-meta>
          </Card>
        </div>
        <!-- 结束状态 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="dataBox" v-for="(item, index) in extractedFinishArray" :key="index">{{ item.title }}:{{ item.exp }}</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <div style="margin-left: -10px; font-weight: bold">{{ dadyNewFinish.title }}:{{ dadyNewFinish.exp }}</div>
            </Card-meta>
          </Card>
        </div>
        <!-- 在途 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="tag">{{ todoBojectTARun?.title }}</div>
              <div class="title">{{ todoBojectTARun?.exp }}个</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <!-- <div style="margin-left: -10px; font-weight: bold">{{'上月新增：xx'}}</div> -->
            </Card-meta>
          </Card>
        </div>
        <!-- 在途更多状态 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="dataBox" style="padding-top: 7px" v-for="(item, index) in extractedTARunArray" :key="index">{{ item.title }}：{{ item.exp }}</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <!-- <div style="margin-left: -10px; font-weight: bold">{{'本月新增：xx'}}</div> -->
            </Card-meta>
          </Card>
        </div>
        <!-- 我发起的 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="tag">{{ todoBojectMyStart?.title }}</div>
              <div class="title">{{ todoBojectMyStart?.exp }}个</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <div style="margin-left: -10px; font-weight: bold">{{ yesterdayNewMyStart.title }}：{{ yesterdayNewMyStart.exp }}</div>
            </Card-meta>
          </Card>
        </div>
        <!-- 我发起的更多状态 -->
        <div class="card-item">
          <Card hoverable class="cardBox">
            <template #cover>
              <div class="dataBox" v-for="(item, index) in extractedMyStartArray" :key="index">{{ item.title }}：{{ item.exp }}</div>
            </template>
            <Card-meta title="Card title" description="This is the description">
              <div style="margin-left: -10px; font-size: 13px; font-weight: bold">{{ dadyNewMyStart?.title }}：{{ dadyNewMyStart?.exp }}</div>
            </Card-meta>
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
  import { title } from 'process';
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
  //已完成更多状态
  let extractedFinishArray: any = reactive([]);
  //累计已完成
  let todoBojectFinish: any = reactive({});
  // 昨日新增
  let yesterdayNewFinish: any = reactive({});
  //今日新增
  let dadyNewFinish: any = reactive({});
  //在途
  let extractedTARunArray: any = reactive([]);
  //累计在途
  let todoBojectTARun: any = reactive({});
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

  const InitPage = async () => {
    // 待办
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyTodolist');
        // 更新响应式变量
        data = response;
        const targetTitles = ['退回', '未完成', '会签', '挂起', '未读', '移交'];
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
        const targetTitles = ['退回', '未完成', '会签', '挂起', '未读', '移交'];
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
    // 已完成
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyComplate');
        // 更新响应式变量
        data = response;
        const targetFinishTitles = ['正常结束', '非正常结束', '按期完成', '逾期完成', '按期完成率'];
        // // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedFinishArray = data.filter((item) => targetFinishTitles.includes(item.title));
        // // 使用 find 方法找到 title 为 "昨日新增" 的对象
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
        const targetFinishTitles = ['正常结束', '非正常结束', '按期完成', '逾期完成', '按期完成率'];
        // // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedFinishArray = data.filter((item) => targetFinishTitles.includes(item.title));
        // // 使用 find 方法找到 title 为 "昨日新增" 的对象
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
    // 在途
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyRuning');
        // 更新响应式变量
        data = response;
        const targetTARunTitles = ['退回中', '移交中', '逾期中', '挂起中'];
        // // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedTARunArray = data.filter((item) => targetTARunTitles.includes(item.title));
        // // 使用 find 方法找到 title 为 "在途数" 的对象
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
        const targetTARunTitles = ['退回中', '移交中', '逾期中', '挂起中'];
        // // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedTARunArray = data.filter((item) => targetTARunTitles.includes(item.title));
        // // 使用 find 方法找到 title 为 "在途数" 的对象
        todoBojectTARun = data.find((item) => item.title === '在途数');
      } catch (e: any) {
        message.error(e.toString());
        console.error(e);
      } finally {
        loading.value = false;
      }
    }
    // 我发起的
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('EmpHome_MyStart');
        // 更新响应式变量
        data = response;
        console.log('我是方式是的话', data);
        const targetMyStartTitles = ['已完成', '未完成', '按期完成', '逾期完成', '按期完成率', '上月新增', '本月新增'];
        // // // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedMyStartArray = data.filter((item) => targetMyStartTitles.includes(item.title));
        // // // 使用 find 方法找到 title 为 "昨日新增" 的对象
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
        const targetFinishTitles = ['正常结束', '非正常结束', '按期完成', '逾期完成', '按期完成率'];
        // // 使用 filter 过滤出符合条件的对象，并存储到新数组
        extractedFinishArray = data.filter((item) => targetFinishTitles.includes(item.title));
        // // 使用 find 方法找到 title 为 "昨日新增" 的对象
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
  .dataBox {
    padding-left: 10px;
    font-size: 15px;
  }
  .tag {
    padding: 10px;
    font-size: 20px;
    font-weight: bold;
  }
  .title {
    text-align: center;
    font-size: 32px;
    height: 90px;
    line-height: 70px;
  }
  .cardBox {
    width: 250px;
    height: 220px;
  }
  .card-item {
    margin-left: 20px;
  }
</style>
