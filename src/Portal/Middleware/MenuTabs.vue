<script setup lang="ts">
  import { ref, onMounted, unref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Tabs, TabPane } from 'ant-design-vue';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { DealExp } from '/@/utils/gener/StringUtils';
  import menuList from '/@/Portal/Middleware/menu';

  const emit = defineEmits(['removeCachePageId', 'addCachePageId', 'AddTabByKey']); //定义可调用的父组件方法名
  const activeTabStack = ref<string[]>([]); //存放曾经激活tab页的key，用于删除时计算应该激活的tab页
  const route = useRoute();
  const enName = route.query.EnName;
  const menus = menuList.map((menu) => menu.children).flat();

  const size = ref('small');
  // 此处有处理tab异常的bug
  interface PanelInfo {
    title: string;
    path: string;
    closable: boolean;
    Paras: string;
    Icon: string;
  }
  const panes = ref<PanelInfo[]>([]); //页签数组
  const activeKey = ref(''); //当前激活的tab页的key
  activeTabStack.value.push('');
  //缓存首页组件名称
  const $router = useRouter(); //全局路由对象
  console.log($router);
  const add = async (paneObj) => {
    let queryArgs = paneObj.Paras;
    if (paneObj.Paras.includes('EnName=TS.User.MySetting') == false) queryArgs = DealExp(paneObj.Paras);
    //添加tab页签，选中侧边栏菜单项时调用
    const routerInfo = { path: paneObj.path, query: { ...getAllRequestParams(queryArgs), title: paneObj.title } };
    await $router.replace(routerInfo);
    const existTab = getTabByKey(paneObj.path + queryArgs);

    if (!existTab) {
      panes.value.push(paneObj);
      setActiveedKeyId(paneObj.path + queryArgs);
      //页签不存在，创建页签
      emit('addCachePageId', paneObj.path + queryArgs); //调用父组件函数，加入组件缓存列表
    } else {
      setActiveedKeyId(existTab.path + DealExp(existTab.Paras));
    }
    console.log(unref(panes));
  };
  onMounted(() => {
    let firstScreenTab: PanelInfo | undefined = panes.value.find((pane) => pane.Paras.includes(enName as string));
    //不存在需要增加这个pane
    if (firstScreenTab === undefined) {
      emit('AddTabByKey', enName as string, false);
      return;
    }
    if (firstScreenTab) add(firstScreenTab);
  });

  const remove = (targetKey) => {
    emit('removeCachePageId', targetKey);
    panes.value = panes.value.filter((pane) => pane.path + pane.Paras !== targetKey);
    if (activeKey.value === targetKey) {
      let endIndex = -1;
      for (let i = activeTabStack.value.length - 1; i >= 0; i--) {
        let keyId = activeTabStack.value.pop();
        if (keyId != targetKey) {
          const existTab = panes.value.find((pane) => pane.path + pane.Paras === keyId);
          if (existTab) {
            setActiveedKeyId(existTab.path + existTab.Paras);
            $router.push({ path: existTab.path, query: getAllRequestParams(existTab.Paras) });
            endIndex = i;
            break;
          }
        }
      }
      if (endIndex == -1) {
        //没有找到，激活第一个页签
        setActiveedKeyId(panes.value[0].path + panes.value[0].Paras);
        $router.push({ path: panes.value[0].path, query: getAllRequestParams(panes.value[0].Paras) });
      }
    }
  };

  const onEdit = (targetKey, action) => {
    const pane = menus.find((menu) => menu.Path + menu.Paras == targetKey);
    if (action === 'add' && !!pane) {
      add(pane);
    } else {
      remove(targetKey);
    }
  };

  const selectedTab = (activeKeyId) => {
    //选择某页签时激活该页签
    const tab = getTabByKey(activeKeyId);
    if (tab) {
      setActiveedKeyId(tab.path + tab.Paras);
      $router.push({ path: tab.path, query: getAllRequestParams(tab.Paras) });
    }
  };

  const getTabByKey = (key: string) => {
    for (const item of panes.value) {
      if (!item.Paras) item.Paras = '';
      if (item.path + item.Paras == key) {
        return item;
      }
    }
    return null;
  };

  const setActiveedKeyId = (keyId) => {
    activeKey.value = keyId;
    activeTabStack.value.push(keyId);
  };

  defineExpose({ add, remove, activeKey }); //定义可被父组件调用的组件
</script>
<template>
  <!-- 选中任务项 -->
  <div class="tabs">
    <Tabs v-model:activeKey="activeKey" :size="size" type="editable-card" @edit="onEdit" :hideAdd="true" @change="selectedTab">
      <tab-pane v-for="pane in panes" :key="pane.path + pane.Paras" :closable="pane.closable">
        <template #tab>
          <span>
            <i :class="pane.Icon"></i>
            {{ pane.title }}
          </span>
        </template>
      </tab-pane>
    </Tabs>
  </div>
</template>
<style lang="less" scoped>
  .tabs {
    :deep(.ant-tabs-nav-wrap) {
      margin-left: 20px;
      background-color: transparent !important;
    }

    :deep(.ant-tabs-content-holder) {
      display: none;
      /*隐藏标签页内容，标签页内容由<router-view>内容替代*/
    }
    :deep(.ant-tabs-nav-container) {
      height: 30px;
    }
    :deep(.ant-tabs-tab-btn) {
      height: 30px;
    }
    //选中任务项
    :deep(.ant-tabs-tab-active) {
      color: #fff !important;
      // background-color: #1952bd;
      background-color: (var(--system-bg-color));
      border-bottom-color: #fff !important;
    }
    :deep(.ant-tabs-tab) {
      margin-left: 5px !important;
      height: 30px;
      line-height: 30px;
    }
    :deep(.ant-tabs-nav) {
      margin: 10px 0 0 0;
    }
    //选中后字体颜色
    :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
      color: #fff !important;
    }
    :deep(.ant-tabs-tab-remove) {
      margin-left: 4px;
      margin-right: 0;
    }
    //选中后 x 颜色
    :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-remove) {
      color: #fff !important;
    }
  }
</style>
