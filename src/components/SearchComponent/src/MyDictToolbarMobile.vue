<template>
  <div class="toolbar-wrapper">
    <Tabbar v-model="active" v-if="Array.isArray(buttonList) && buttonList.length > 0">
      <TabbarItem v-for="btn in btnList" :key="btn.key" :name="btn.key" class="btn-type" @click="btn.onClick">
        <template v-if="btn.key === 'More'">
          <Popover placement="top-end" v-model:show="showPopover" trigger="click" :actions="popverBtnList" @select="onSelect">
            <template #reference>
              <div :disabled="btnDisabled" style="border: none">{{ btn.name }}</div>
            </template>
          </Popover>
        </template>
        <template v-if="btn.key !== 'More'">
          <div :disabled="btnDisabled">{{ btn.name }}</div>
        </template>
      </TabbarItem>
    </Tabbar>
  </div>
</template>

<script lang="ts" setup>
  import { Tabbar, TabbarItem, Popover, showToast } from 'vant';
  import type { ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import { ref } from 'vue';
  const props = defineProps({
    buttonList: {
      type: Array as PropType<ToolbarButtonDef[]>,
      default: () => [],
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  interface Btn extends ToolbarButtonDef {
    No: string; //编号
    text: string; //名称
    Name: string; //名称
  }
  const popverBtnList = ref<Btn[]>([]);
  const btnList = ref<ToolbarButtonDef[]>([]);
  const active = ref('');
  const btnDisabled = ref(false);
  //更多按钮显示
  const showPopover = ref(false);
  const InitPage = () => {
    if (props.buttonList.length <= 4) {
      btnList.value = props.buttonList;
      return;
    }
    if (props.buttonList.length > 4) {
      btnList.value = props.buttonList.slice(0, 3);
      btnList.value.push({
        type: 'default',
        key: 'More',
        name: '更多',
        shape: 'default',
        isDanger: false,
      });
      props.buttonList.slice(4).forEach((toolbar) => {
        popverBtnList.value.push({
          No: toolbar.key,
          text: toolbar.name,
          Name: toolbar.name,
          ...toolbar,
        });
      });
    }
  };
  const onSelect = async (btn: Btn) => {
    if (typeof btn.onClick === 'function') btn.onClick();
    else showToast('未解析');
  };
  InitPage();
</script>

<style lang="less" scoped>
  .toolbar-wrapper {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 0.25rem;
    height: 100%;
  }

  .custom-icon-style {
    margin-right: 8px;
  }

  .messageStyle {
    margin-left: auto;
    margin-top: 40px;
    background-color: #e5e7eb;
    padding: 20px;
    border: 1px solid #cccc;
    margin-right: auto;
    width: 70%;
  }
  .btn-type:hover {
    background-color: #4356ff;
    color: #fff;
  }
  .van-tabbar-item--active {
    background-color: #4356ff;
    color: #fff;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
</style>
