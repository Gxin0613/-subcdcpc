<template>
  <div class="actions">
    <Tooltip
      :title="action.Desc || action.Name"
      :class="`${props.prefixClsName}-action__item`"
      placement="bottom"
      :mouseEnterDelay="0.5"
      v-for="action in menuListDir"
      :key="action.Url"
      @click="goto(action)"
    >
      <i v-if="!['System', 'EntityDemo'].includes(action.No)" :class="action.Icon"></i>
      <Badge v-if="action.ShowBadge && action.No == 'GL_Msg'" :count="unreadItems.Todolist_Msg" :number-style="numberStyle" :overflow-count="99">
        <span style="padding-left: 5px; font-size: 14px">{{ action.Name }}</span>
      </Badge>
      <Badge v-else-if="action.ShowBadge && action.No == 'GL_Todolist'" :count="unreadItems.Todolist_EmpWorks" :number-style="numberStyle" :overflow-count="99">
        <span style="padding-left: 5px; font-size: 14px">{{ action.Name }}</span>
      </Badge>
      <Badge v-else-if="action.ShowBadge && action.No == 'GL_CC'" :count="unreadItems.CCList_Read + unreadItems.CCList_UnRead" :number-style="numberStyle" :overflow-count="99">
        <span style="padding-left: 5px; font-size: 14px">{{ action.Name }}</span>
      </Badge>
      <Badge v-else-if="action.ShowBadge && action.No == 'AskFrm'" :count="unreadItems.AskFrm_Running" :number-style="numberStyle" :overflow-count="99">
        <span style="padding-left: 5px; font-size: 14px">{{ action.Name }}</span>
      </Badge>
      <span v-else-if="action.No == 'System'" class="lowcode-gradient-text">
        <i :class="action.Icon"></i>
        <span style="padding-left: 5px; font-size: 14px">{{ action.Name }}</span>
      </span>
      <span v-else-if="action.No == 'EntityDemo'" class="gradient-text">
        <i :class="action.Icon"></i>
        <span style="padding-left: 5px; font-size: 14px">{{ action.Name }}</span>
      </span>
      <span v-else style="padding-left: 5px; font-size: 14px">{{ action.Name }}</span>
    </Tooltip>
    <!-- <span>
      <Dropdown v-if="flowActionMore.length > 0 && Array.isArray(flowActionMore)" placement="bottom">
        <div v-for="more in flowActionMore" :key="more.No" style="padding: 0 5px">
          <i :class="more.Icon"></i>
          <span style="padding-left: 5px; font-size: 14px"> {{ more.Name }}</span>
        </div>
        <template #overlay>
          <Menu v-for="more in flowActionMore" :key="more.No" @click="(info) => handleMenuClick(info)">
            <MenuItem v-for="actmore in more.ArrList" :key="actmore.No">
              <i :class="actmore.Icon"></i>
              <span style="padding-left: 5px; font-size: 14px"> {{ actmore.Name }}</span>
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>
    </span> -->
  </div>
</template>

<script lang="ts" setup>
  import { Tooltip, Badge } from 'ant-design-vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { computed, ref } from 'vue';
  // import menuListLeft from '/@/DataUser/config/ToolbarUser';

  const props = defineProps({
    prefixClsName: {
      type: String,
      default: '',
    },
    menuList: {
      type: Array as PropType<MenuList[]>,
      default: () => [],
    },
    menuMore: {
      type: Array as PropType<MenuMore[]>,
      default: () => [],
    },
    direction: {
      type: String,
      default: '',
    },
    unreadItems: {
      type: Object as PropType<Notification>,
      default: () => {
        return {
          MyStart_Complete: 0,
          Todolist_Msg: 0,
          Todolist_EmpWorks: 0,
          MyStart_Runing: 0,
          Todolist_Draft: 0,
          CCList_Read: 0,
          CCList_UnRead: 0,
          AskFrm_Running: 0,
        };
      },
    },
    filterList: {
      type: Array,
      default: () => [],
    },
  });
  const numberStyle = computed(() => ({
    top: '10px',
    width: '30px',
    height: '15px',
    lineHeight: '15px',
  }));
  const go = useGo();
  interface MenuList {
    Desc?: string;
    No: string;
    Name: string;
    Url: string;
    FileUrl: string;
    Path: string;
    Paras: string;
    Icon: string;
    Enable: number;
    ShowBadge: boolean;
  }
  interface MenuMore {
    No: string;
    Name: string;
    Icon: string;
    Enable: number;
    ShowBadge: boolean;
    ArrList: MenuList[];
  }

  const menuList = ref<MenuList[]>(props.menuList);
  //过滤出启用的头部按钮 Enable=1  默认启用
  const flowActions = menuList.value.filter((item: { Enable: number }) => item.Enable == 1);

  //配置启用
  const menuListDir = computed((): MenuList[] => {
    if (props.direction == 'left') {
      if (props.filterList.length === 0) {
        return flowActions;
      } else {
        menuList.value.forEach((item) => {
          item.Enable = props.filterList.includes(item.No) || item.No === 'Bill' ? 1 : 0;
        });
        return menuList.value.filter((item: { Enable: number }) => item.Enable == 1);
      }
    } else {
      return flowActions;
    }
  });
  const goto = (action: Recordable) => {
    go(action.Url);
  };

  type Notification = {
    MyStart_Complete: number;
    Todolist_Msg: number;
    Todolist_EmpWorks: number;
    MyStart_Runing: number;
    Todolist_Draft: number;
    CCList_Read: number;
    CCList_UnRead: number;
    AskFrm_Running: number;
  };
</script>

<style lang="less" scoped>
  .actions {
    width: 100%;
    display: flex;
    align-items: center;
  }
  :deep(.ant-badge .ant-scroll-number .ant-scroll-number-only) {
    line-height: 15px;
  }
  .lowcode-gradient-text {
    background: linear-gradient(135deg, #cc701f, #330692);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
  .gradient-text {
    background: linear-gradient(45deg, #e42942, #9b59b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
</style>
