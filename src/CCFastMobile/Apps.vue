<template>
  <div>
    <NavBar :title="'应用中心'" :fixed="true" left-arrow @click-left="onClickLeft" />
    <Tabs v-model:active="active" style="margin-top: 46px">
      <Tab v-for="system in customSystems" :name="system.name" :title="system.meta.title" :key="system.No">
        <template v-for="module in system.children" :key="module.No">
          <div v-if="module.children.length > 0" class="van-doc-card">
            <h5 class="van-h5">{{ module.meta.title }}</h5>

            <div class="menu-list">
              <div class="menu-item" v-for="menu in module.children" :key="menu.No" @click="btnClick(menu)">
                <div style="font-size: 24px; text-align: center" class="van-select">
                  <i :class="menu.Icon" style="height: auto; color: #5067ff"></i>
                </div>
                <div class="van-text">{{ menu.Name }}</div>
              </div>
            </div>
            <!-- <Row justify="start" gutter="20">
              <template v-for="menu in module.children" :key="menu.No">
                <Col span="6" @click="btnClick(menu)">
                  <div style="font-size: 24px; text-align: center" class="van-select">
                    <i :class="menu.Icon" style="height: auto; color: #5067ff"></i>
                  </div>
                  <div class="van-text">{{ menu.Name }}</div>
                </Col>
              </template>
            </Row> -->
          </div>
        </template>
      </Tab>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
  import { Tabs, Tab, NavBar, showFailToast } from 'vant';
  import { ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { cloneDeep } from 'lodash-es';
  import { Module as CCModule } from '/@/CCFast/GPM/Module';
  import { getParentLayout, LAYOUT } from '/@/router/constant';
  import { useRoute, useRouter } from 'vue-router';
  import { getAllRequestParams } from '../utils/request/decode';
  const route = useRoute();
  const router = useRouter();
  const customSystems = ref<Record<string, any>[]>([]);
  const active = ref(route.query.SystemNo as string);
  const isHttpUrl = (str: string) => !!str && (str.startsWith('http://') || str.startsWith('https://'));
  const isSelfUrl = (str: string) => !!str && str.startsWith('self://');
  const isUrl = (str: string) => isHttpUrl(str) || isSelfUrl(str);
  //初始化低代码菜单
  const InitPage = async () => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      handler.AddPara('isVue3', 1);
      const data: any = await handler.DoMethodReturnJson('Default_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
        return;
      }
      const systems = data.System; //系统
      const modules = data.Module; //模块
      const menus = data.Menu; //菜单
      customSystems.value = cloneDeep(
        // 过滤系统
        systems
          .filter((system) => system.Path !== '' && parseInt(system.IsEnable) !== 0 && system.No != '001')
          .map((system) => {
            // @ts-ignore

            const systemModules = modules
              .filter((module) => module.SystemNo === system.No && module.Path !== '' && parseInt(module.IsEnable) !== 0)
              .map((module: CCModule) => {
                const children = menus
                  .filter((menu: Recordable) => menu.ModuleNo === module.No) // 找到对应模块
                  .filter((menu: Recordable) => parseInt(menu.IsEnable) !== 0) // 启用
                  .filter((menu: Recordable) => isUrl(menu.UrlExt) || isUrl(menu.MobileUrlExt) || menu?.UrlPath?.includes('.vue')); // 是url或者vue路径
                //.map((menu: Recordable) => handleMenu(menu));
                return {
                  path: module.No,
                  name: module.No,
                  component: getParentLayout(),
                  meta: {
                    title: module.Name,
                    ...module,
                  },
                  // 过滤模块下的菜单
                  children,
                };
              }, []);
            return {
              path: '/' + system.No.replace(/\//g, ''),
              name: system.No,
              component: LAYOUT,
              meta: {
                title: system.Name,
                ...system,
              },
              // 过滤当前系统下的模块
              children: systemModules,
            };
          }),
      );
      console.log(customSystems.value);
    } catch (e) {
      showFailToast(e as string);
    }
  };

  const handleSelfUrl = (url: string) => {
    const { origin, pathname } = window.location;
    const urlPrefix = origin + pathname + '#/';
    return url.replace('self://', urlPrefix);
  };

  const btnClick = (menu) => {
    const link = menu.UrlExt || menu.MobileUrlExt;
    if (isUrl(link)) {
      location.href = handleSelfUrl(link);
      return;
    }
    const param = getAllRequestParams(link);
    const keys = Object.keys(param);
    let jumpUrl = `/CCFastMobile/FastRoute?MenuNo=${menu.No}&title=${menu.Name}`;
    for (const key of keys.filter((k) => k !== 'MenuNo' && k !== 'title')) {
      jumpUrl += `&${key}=${param[key]}`;
    }
    router.push(jumpUrl);
  };
  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
  InitPage();
</script>

<style lang="less">
  .van-doc-card {
    margin-bottom: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }

  .van-h5 {
    position: relative;
    padding: 15px 24px;
    margin-bottom: 0;
    color: #000;
    font-size: 15px;
    font-weight: 700;
  }

  .van-h5::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    background-color: #ff7346;
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
    border-radius: 50%;
    background-color: #f2f5ff;
  }

  .menu-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .van-text {
    text-align: center;
    padding: 5px 0px;
    font-size: 12px;
    overflow: hidden;
    display: -webkit-box;
    /*弹性伸缩盒子*/
    -webkit-box-orient: vertical;
    /*子元素垂直排列*/
    -webkit-line-clamp: 2;
    /*可以显示的行数，超出部分用...表示*/
    text-overflow: ellipsis;
  }
</style>
