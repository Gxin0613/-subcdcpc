<template>
  <div>
    <!-- <NavBar :title="'首页'" :fixed="true" /> -->
    <Search v-model="searchKey" :placeholder="'请输入搜索关键词'" background="#2970FF" @search="onSearch" @cancel="onSearch" class="search" :left-icon="search" />
    <div style="padding: 75px 20px 0 20px; background-color: #f2f4f7; height: 100%">
      <div class="head-menu">
        <div class="van-doc-card-head design-func" style="" v-for="item in userHeaderCont" :key="item.No" @click="btnClick(item)">
          <div style="display: flex; flex-direction: column">
            <div class="design-cont" style="color: #101828; font-size: 17px">{{ item.Name }}</div>
            <div class="design-cont">
              <span class="count" :style="{ color: item.color, backgroundColor: item.BgColor }">{{ item.Num }}条</span>
            </div>
          </div>
          <div> <img v-if="item.Src" :src="item.Src" alt="" style="width: 60pt" /></div>
        </div>
      </div>
      <div class="van-doc-card">
        <!-- <h5 class="van-h5">{{'常用功能'}}</h5> -->
        <div class="funcs">
          <div v-for="(item, index) in useFuncs" class="func" :key="item.No" @click="btnClick(item)" :class="getGridItemClass(index)">
            <div style="font-size: 24px; text-align: center">
              <img v-if="item?.Src" :src="item?.Src" alt="" style="width: 25px" />
              <i v-else :class="item.Icon" style="height: auto; color: #4194fc"></i>
            </div>
            <div class="van-text">{{ item.Name }} </div>
          </div>
        </div>
      </div>
      <h5 class="van-h5">{{ '最近发起' }}</h5>
      <div class="van-doc-card">
        <div class="recent-flows">
          <div v-for="item in flows" class="rf-item" :key="item.FK_Flow" @click="StartFlow(item)">
            <div style="font-size: 24px; text-align: center" class="van-select">
              <i :class="item.Icon === '' ? 'icon-folder' : item.Icon" style="height: auto; color: #ff4405"></i>
            </div>
            <div class="van-text">{{ item.FlowName }}</div>
          </div>
        </div>
      </div>
      <InnerApps />
      <!-- <div v-for="item in useBottomCont" :key="item.No" @click="btnClick(item)">
        <div style="margin-bottom: 30px; text-align: center">
          <img :src="item.Src" alt="" style="width: 88px; height: 83px; position: fixed; left: 75%; bottom: 5%" />
        </div>
      </div> -->
    </div>
    <template v-if="VITE_GLOB_MOBILE_SHOW_LOGOUT == 0">
      <div class="logout">
        <Button @click="logout" class="btnOut">{{ '退出登录' }}</Button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { Toast, Search, Button, NavBar } from 'vant';
  import { ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MySystems } from '/@/CCFast/GPM/MySystem';
  import { useRouter } from 'vue-router';
  // import CC from '/@/assets/images/cc.png';
  import FaQi from '/@/assets/images/faqi.png';
  // import CaoGao from '/@/assets/images/caogao.png';
  // import YiWanCheng from '/@/assets/images/yiwancheng.png';
  import Runing from '/@/assets/images/Runing.png';
  import Todolist from '/@/assets/images/Todolist.png';
  // import TongYong from '/@/assets/images/tongyong.png';
  import search from '/@/assets/images/search.png';
  import InnerApps from '../CCFastMobile/InnerApps.vue';
  import { useUserStore } from '../store/modules/user';
  import { getAppEnvConfig } from '../utils/env';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  //常使用的功能
  //待办，在途数量
  const infoNums = ref<Record<string, any>>({});
  //搜索
  const searchKey = ref('');
  const userHeaderCont = ref([
    {
      Name: '待办',
      No: 'GL_Todolist',
      Icon: 'fa fa-file-text-o',
      Src: Todolist,
      Num: '0',
      color: '#2970FF',
      BgColor: '#E4EDFF',
    },
    {
      Name: '在途',
      No: 'GL_Runing',
      Icon: 'fa fa-indent',
      Src: Runing,
      Num: '0',
      color: '#DC6803',
      BgColor: '#FFFAEB',
    },
  ]);
  const useFuncs = [
    {
      Name: '发起',
      No: 'GL_Start',
      Icon: 'icon-paper-plane',
      // Src: FaQi,
    },
    {
      Name: '抄送',
      No: 'GL_CC',
      Icon: 'icon-bag',
      // Src: CC,
    },
    {
      Name: '草稿',
      No: 'GL_Draft',
      Icon: 'fa fa-file-text-o',
      // Src: CaoGao,
    },
    {
      Name: '批处理',
      No: 'GL_Batch',
      Icon: 'icon-layers',
      // Src: TongYong,
    },
    {
      Name: '已完成',
      No: 'GL_Complete',
      Icon: 'icon-check',
      // Src: YiWanCheng,
    },
    {
      Name: '查询',
      No: 'GL_RecentWork',
      Icon: 'fa fa-search',
      // Src: TongYong,
    },
    {
      Name: '分页待办',
      No: 'TS.WF.Todolist',
      Icon: 'icon-clock',
      // Src: TongYong,
    },
    {
      Name: '综合查询',
      No: 'TS.FlowData.GenerWorkFlowView',
      Icon: 'icon-screen-desktop',
      // Src: TongYong,
    },
    {
      Name: '抄送(待阅)',
      No: 'GL_CC&Sta=0',
      Icon: 'icon-bag',
      // Src: CC,
    },
    {
      Name: '抄送(已阅)',
      No: 'GL_CC&Sta=1',
      Icon: 'icon-bag',
      // Src: CC,
    },
  ];
  //发起
  // const useBottomCont = [
  //   {
  //     Name: '发起',
  //     No: 'GL_Start',
  //     Icon: 'fa fa-paper-plane-o',
  //     Src: FaQi,
  //   },
  // ];
  const router = useRouter();
  const userStore = useUserStore();
  const { VITE_GLOB_MOBILE_SHOW_LOGOUT } = getAppEnvConfig();
  //最近发起的流程
  const flows = ref<Record<string, string>[]>([]);
  const flowsList = ref<Record<string, string>[]>([]);
  //应用中心
  const systems = ref<MySystems[]>([]);
  const InitPage = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
    const data = await handler.DoMethodReturnString('Default_Init');
    if (typeof data === 'string' && data.includes('err@')) {
      Toast.fail(data.replace('err@', ''));
      return;
    }
    const result = JSON.parse(JSON.stringify(data));
    const oflows = result['Flows'];
    let flowNos = ',';
    oflows.forEach((flow) => {
      if (flowNos.includes(',' + flow.FK_Flow + ',') == false) flows.value.push(flow);
      flowNos += flow.FK_Flow + ',';
    });
    flowsList.value = flows.value;
    systems.value = result['Systems'];
    const handlerNum = new HttpHandler('BP.CCBill.WF_CCBill_Portal');
    infoNums.value = await handlerNum.DoMethodReturnJson('Default_TodoNums');
    console.log(infoNums.value);
    for (const item of userHeaderCont.value) {
      switch (item.No) {
        case 'GL_Todolist':
          if (infoNums.value?.Todolist_EmpWorks > 99) item.Num = '99+';
          else item.Num = infoNums.value?.Todolist_EmpWorks + '';
          break;
        case 'GL_Runing':
          if (infoNums.value?.MyStart_Runing > 99) item.Num = '99+';
          else item.Num = infoNums.value?.MyStart_Runing + '';
          break;
      }
    }
  };
  InitPage();
  const btnClick = (item) => {
    if (item.No.startsWith('TS.')) {
      router.push('/CCFastMobile/FastRoute?EnName=' + item.No + '&title=' + item.Name);
    } else {
      router.push('/CCMobile/GenerList?EnName=' + item.No + '&Title=' + item.Name);
    }
  };
  /**
   * 发起流程
   * @param flow
   * @constructor
   */
  const StartFlow = (flow) => {
    const url = `${location.pathname}#/CCMobile/MyFlow?FlowNo=${flow.FK_Flow}`;
    window.location.href = url;
  };
  /**
   * 到系统模块页面
   * @param system
   * @constructor
   */
  const ToModule = (system) => {
    router.push('/CCFastMobile/Apps?SystemNo=' + system.No);
  };
  /**
   * 查询 我发起的
   */
  const onSearch = () => {
    //清空之前的搜索结果
    const list = ref<any[]>([]);
    if (searchKey.value) {
      const ar = JSON.parse(JSON.stringify(flows.value));
      const str = new RegExp(searchKey.value, 'i');
      ar.forEach((item) => {
        for (const key in item) {
          if (str.test(item[key])) {
            list.value.push(item);
            break;
          }
        }
      });
      flows.value = list.value;
    } else {
      flows.value = flowsList.value;
    }
  };
  //列边框显示
  const getGridItemClass = (Idx) => {
    if (Idx % 4 !== 0) {
      return 'vant-setBorder';
    } else {
      return '';
    }
  };
  /**
   * 退出登录
   */
  const logout = () => {
    userStore.confirmLoginOut();
  };
</script>

<style lang="less" scoped>
  .funcs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .vant-setBorder {
    position: relative;
  }
  .vant-setBorder::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 0;
    width: 1px;
    height: 65%;
    background-color: #e0e0e0;
    z-index: 1;
  }
  .van-doc-card {
    // margin-bottom: 24px;
    margin-bottom: 0;
    padding: 24px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-doc-card-head {
    margin-bottom: 24px;
    padding: 8px 0 0 10px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }

  .recent-flows {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 10px;
  }

  .van-h5 {
    position: relative;
    padding: 15px 0;
    margin-bottom: 0;
    color: #000;
    font-size: 18px;
    font-weight: 500;
  }

  .van-h5::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    // background-color: #ff7346;
    background-color: transparent;
  }

  .van-select {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    text-align: center;
    width: 45px;
    height: 45px;
    margin: auto;
    border-radius: 15px;
    // background-color: #f2f5ff;
    background-color: #fff4ed;
  }

  .van-text {
    text-align: center;
    padding: 5px 0px;
    // font-size: 12px;
    font-size: 17px;
    overflow: visible;
    display: block;
    -webkit-box-orient: unset; /* 移除弹性盒的垂直排列设置 */
    -webkit-line-clamp: unset; /* 移除行数限制 */
    text-overflow: clip;
  }
  :deep(.van-nav-bar--fixed) {
    background-color: #2970ff;
    z-index: 999;
  }
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
  .van-hairline--bottom:after {
    border-bottom-width: 0;
  }
  .search {
    // margin-top: 45px;
    padding: 12px 15px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;
  }
  :deep(.van-search__content) {
    border-radius: 10px;
  }
  :deep(.van-search__field) {
    height: 40px;
  }
  :deep(.van-icon__image) {
    width: 24px;
    height: 24px;
  }
  .head-menu {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    grid-template-rows: auto;
  }
  .design-func {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .design-cont {
    margin: 5px 0;
  }

  .name-new {
    margin-right: 5px;
    color: rgba(52, 64, 84, 1);
    font-size: 12px;
  }
  .count {
    overflow-wrap: break-word;
    color: rgba(41, 112, 255, 1);
    // font-size: 9px;
    font-size: 14px;
    font-weight: normal;
    text-align: left;
    white-space: nowrap;
    line-height: 12px;
    background-color: rgba(228, 237, 255, 1);
    border-radius: 999px;
    padding: 5px;
  }
  .image_4 {
    width: 88px;
    height: 83px;
    align-self: center;
    margin-top: 16px;
  }
  .logout {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 45px;
    background: #fff;
    text-align: center;
  }
  .btnOut {
    width: 100%;
    height: 100%;
  }
</style>
