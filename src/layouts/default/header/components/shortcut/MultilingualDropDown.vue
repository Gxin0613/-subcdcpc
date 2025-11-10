<template>
  <Tooltip :title="'多语言'" placement="bottom" :mouseEnterDelay="0.5">
    <Dropdown :trigger="['click']">
      <a class="ant-dropdown-link" @click.prevent>
        <i class="icon-globe"></i>
      </a>
      <template #overlay>
        <Menu @click="onClick">
          <MenuItem key="CH">{{'中文'}}</MenuItem>
          <MenuItem key="FT">{{'繁体'}}</MenuItem>
          <MenuItem key="En">{{'英文'}}</MenuItem>
          <MenuItem key="JP">{{'日文'}}</MenuItem>
        </Menu>
      </template>
    </Dropdown>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip, Dropdown, Menu, MenuItem } from 'ant-design-vue';
  import WebUser, { User } from '/@/bp/web/WebUser';
  import { VNodeChild } from 'vue';
  import { getAuthCache, setAuthCache } from '/@/utils/auth';
  import { WEB_USER_INFO_KEY } from '/@/enums/cacheEnum';
  interface MenuInfo {
    key: string;
    keyPath: string[];
    item: VNodeChild;
    domEvent: MouseEvent;
  }
  //获取语言key值
  const onClick = ({ key }: MenuInfo) => {
    const user = getAuthCache<User>(WEB_USER_INFO_KEY);
    user.SysLang = key;
    setAuthCache(WEB_USER_INFO_KEY, user);

    WebUser.userInfo = user;
    console.log(getAuthCache(WEB_USER_INFO_KEY));
  };
</script>
