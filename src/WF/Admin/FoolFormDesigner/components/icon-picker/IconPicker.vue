<template>
  <div class="picker">
    <n-tabs type="line" :theme-overrides="TabsTheme">
      <n-tab-pane name="sli" tab="Simple-Line-Icons">
        <div class="icons-wrapper">
          <div class="normal icon-item" v-for="item in SimpleLineIcons" :key="item" @click="selectIcon(item)">
            <i :class="item"></i>
            <span class="item-name">{{ item }}</span>
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane name="fai" tab="Font-Awesome-Icons">
        <div class="icons-wrapper">
          <div class="normal icon-item" v-for="item in FontAwesomeIcons" :key="item" @click="selectIcon(item)">
            <i :class="item"></i>
            <span class="item-name">{{ item }}</span>
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane name="gi" tab="Glyph-Icons">
        <div class="icons-wrapper">
          <div class="large icon-item" v-for="item in GlyphIcons" :key="item" @click="selectIcon(item)">
            <i :class="item"></i>
            <span class="item-name">{{ item }}</span>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
  import SimpleLineIcons from '/@form/props/icons/SimpleLineIcons';
  import GlyphIcons from '/@form/props/icons/GlyphIcons';
  import FontAwesomeIcons from '/@form/props/icons/FontAwesomeIcons';
  // load theme
  import { TabsTheme } from '/@form/theme/index';
  import { NTabs, NTabPane } from 'naive-ui';
  const emit = defineEmits(['pickIcon']);

  const selectIcon = (item: string) => {
    emit('pickIcon', item);
  };
</script>

<style lang="less" scoped>
  .picker {
    width: 100%;
    height: 100%;
    background: white;
  }

  .icons-wrapper {
    height: 420px;
    overflow-y: scroll;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-wrap: wrap;

    .icon-item {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-between;
      padding-top: 20px;
      padding-bottom: 20px;
      cursor: pointer;
      border: 1px solid white;
      border-radius: 0;
      transition: all ease 0.4s;
      box-sizing: content-box;

      &:hover {
        color: #1890ff;
        border: 1px solid #1890ff;
        border-radius: 16px;
      }

      i {
        font-size: 26px;
        margin-bottom: 8px;
      }

      .item-name {
        font-size: 12px;
        text-align: center;
      }
    }

    .normal {
      width: 120px;
      height: 60px;
    }
    .large {
      width: 120px;
      height: 100px;
    }
  }
</style>
