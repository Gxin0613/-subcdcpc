<template>
  <div class="en-sidebar" :style="sideMenuStyle">
    <div class="panel" :style="menuStyle">
      <!-- <Card class="custom-card" @click="$emit('back-to-main-page')">{{'回到首页'}}</Card> -->
      <!-- 回到首页按钮 - 顶层设计，明显区别于下面的分组 -->
      <div class="home-button" @click="$emit('back-to-main-page')">
        <div class="icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </div>
        <div class="text">{{'回到首页'}}</div>
      </div>
      <Collapse v-model:active-key="expands">
        <CollapsePanel v-for="group in list" :header="group.Name" :key="group.No">
          <Row :gutter="[0, 0]">
            <Col :span="24" v-for="node in group.children" :key="node.No" class="distance">
              <Card class="custom-card" @click="$emit('pick-node', group.No, node.No)" :class="{ 'active-card': activeMode[0] === node.No }">
                <i v-if="node.Icon" :class="node.Icon" style="margin-left: 6px"></i>
                <NodeIndexOutlined v-else />
                <span style="margin-left: 6px"> {{ node.Name }}</span>
              </Card>
            </Col>
          </Row>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Collapse, CollapsePanel, Row, Col, Card } from 'ant-design-vue';
  import { NodeIndexOutlined } from '@ant-design/icons-vue';
  import { BaseListData } from './typing';
  import { computed, onMounted, ref, StyleValue } from 'vue';
  import { SIDEBAR_WIDTH } from './constants';
  const props = defineProps({
    visible: {
      type: Boolean,
      default: true,
    },
    menuStyle: {
      type: Object as PropType<StyleValue>,
      default: () => ({}),
    },
    list: {
      type: Array as PropType<BaseListData[]>,
      default: () => [],
    },
    activeMode: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  });
  defineEmits(['pick-node', 'back-to-main-page']);
  const sideMenuStyle = computed(() => {
    return {
      width: props.visible ? SIDEBAR_WIDTH : '0',
    };
  });
  const expands = ref<Array<any>>(['']);
  onMounted(() => {
    expands.value = props.list.map((g) => g.No + '');
  });
</script>

<style lang="less" scoped>
  .en-sidebar {
    transition: width 0.2s ease;
    overflow-x: hidden;
    height: 100%;
    border-right: 1px solid #eeeeee;

    .home-button {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      background: linear-gradient(90deg, var(--system-bg-color), var(--system-hover-bg-color));
      cursor: pointer;
      transition: all 0.3s ease;
      &:hover {
        background-color: var(--system-bg-color);
      }
      .icon {
        color: white;
        margin-right: 10px;
        display: flex;
        align-items: center;
      }

      .text {
        color: white;
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
    }

    //小标题移入，点击，聚焦效果
    :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
      padding: 12px 16px 12px 10px;
      color: #000;
      background: #eeeeee;

      &:hover {
        color: var(--system-hover-bg-color);
      }

      &:active {
        color: var(--system-hover-bg-color);
      }

      &:focus {
        color: var(--system-hover-bg-color);
      }
    }

    .custom-card {
      border: none;
      border-radius: 0;
      line-height: 30px;

      :deep(.ant-card-body) {
        padding: 6px 14px;
      }
    }
    //解决内边距问题
    .distance {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    //去除border
    :deep(.ant-collapse) {
      margin: 0 !important;
      border: 0;
      background-color: #fff;

      & .ant-collapse-item {
        border: none;
      }
    }

    :deep(.ant-collapse-content) {
      border: 0;
    }

    //流程新建表单左侧菜单
    :deep(.ant-collapse-content > .ant-collapse-content-box) {
      padding: 0;
    }

    .custom-card {
      &:hover {
        background-color: var(--system-hover-bg-color);
        color: #fff;
        cursor: pointer;
      }

      :deep(.ant-card-body) {
        padding: 6px 0 6px 28px !important;
      }
    }

    :deep(.active-card) {
      background-color: var(--system-bg-color);
      color: #fff;
    }
  }
</style>
