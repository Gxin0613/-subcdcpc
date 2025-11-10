<template>
  <div class="list-layout">
    <div class="group" v-for="(group, groupIndex) in list" :key="group.No">
      <div class="group-header">
        <div class="group-icon" :style="({ backgroundColor: getGroupColor(group.No) } as StyleValue)">
          <component :is="defaultIconList[groupIndex % list.length]" />
        </div>
        <div class="group-title">{{ group.Name }}</div>
      </div>

      <div class="item-container">
        <div
          class="item"
          :class="{ 'item-active': activeKey === item.No }"
          v-for="item in group.children"
          :style="itemStyle(item)"
          :key="group.No + '_' + item.No"
          @click="$emit('select-mode', item.No)"
        >
          <div class="item-content">
            <div class="item-icon"> <IconItem /></div>
            <div class="item-name" :class="{ 'active-name': activeKey === item.No }">
              {{ item.Name }}
            </div>
          </div>
          <div v-if="activeKey === item.No" class="active-indicator"></div>
        </div>
      </div>

      <div class="group-divider" v-if="list.length > 1 && groupIndex < list.length - 1"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, StyleValue } from 'vue';
  import { BaseSelectListData, Item } from './typing';
  import { IconItem, defaultIconList } from './baseIcon';

  const props = defineProps({
    activeKey: {
      type: String,
      default: '',
    },
    list: {
      type: Array as PropType<BaseSelectListData[]>,
      default: () => [],
    },
  });

  // 丰富多彩的颜色数组 - 使用更鲜明的颜色
  const colorPalette = [
    '#2563EB', // 蓝色
    '#DC2626', // 红色
    '#059669', // 绿色
    '#D97706', // 橙色
    '#7C3AED', // 紫色
    '#DB2777', // 粉色
    '#0891B2', // 青色
    '#4F46E5', // 靛蓝
    '#65A30D', // 柠檬绿
    '#9333EA', // 紫罗兰
    '#F59E0B', // 琥珀色
    '#10B981', // 翡翠绿
    '#6366F1', // 亮蓝色
    '#EC4899', // 品红色
  ];

  // 获取组颜色
  const getGroupColor = (groupNo: string): string => {
    // 简单的字符串哈希函数，更可靠的版本
    let hash = 0;
    for (let i = 0; i < groupNo.length; i++) {
      hash = (hash << 5) - hash + groupNo.charCodeAt(i);
      hash |= 0; // 转换为32位整数
    }

    // 确保我们得到一个正数的索引
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  };
  const itemStyle = (item: Item) => {
    if (item.No == props.activeKey) {
      return {
        color: `white`,
        backgroundColor: `var(--system-bg-color)`,
      };
    }
    return {};
  };

  defineEmits(['select-mode']);
</script>

<style lang="less" scoped>
  .list-layout {
    box-sizing: border-box;
    width: 800px;
    max-height: calc(var(--viewport-height) - 100px);
    overflow-y: auto;
    padding: 10px;
    background-color: #f9fafb;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

    .group {
      margin-bottom: 14px;

      .group-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding: 6px 10px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        background-color: #e0e6ed;

        .group-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          margin-right: 8px;
          color: white;
        }

        .group-title {
          color: #333;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.2px;
        }
      }

      .item-container {
        display: grid;
        gap: 6px;
        grid-template-columns: repeat(2, 1fr);
        padding: 0 4px;

        .item {
          position: relative;
          padding: 8px 10px;
          border-radius: 4px;
          background-color: white;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 1px solid #e5e7eb;

          &:hover {
            background-color: #f8fafc;
            border-color: #d1d5db;
          }

          .item-content {
            display: flex;
            align-items: center;

            .item-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 22px;
              height: 22px;
              margin-right: 8px;
              border-radius: 3px;
              background-color: rgba(0, 0, 0, 0.03);
              flex-shrink: 0;
            }

            .item-name {
              color: #374151;
              font-size: 13px;
              line-height: 1.3;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              &.active-name {
                font-weight: 600;
                color: white;
              }
            }
          }

          .active-indicator {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            border-radius: 0 1px 1px 0;
            background-color: var(--system-bg-color);
          }
        }

        .item-active {
          background-color: #f9fafb;
          border-color: #d1d5db;
        }
      }

      .group-divider {
        height: 1px;
        background: #e5e7eb;
        margin: 12px 0;
      }
    }
  }

  // 响应式设计
  @media (max-width: 850px) {
    .list-layout {
      width: 100%;

      .item-container {
        grid-template-columns: 1fr;
      }
    }
  }

  // 暗色模式支持
  @media (prefers-color-scheme: dark) {
    .list-layout {
      background-color: #1a1a1a;

      .item {
        background-color: #2a2a2a;
        border-color: #3a3a3a;

        &:hover {
          background-color: #333333;
        }

        .item-name {
          color: #e0e0e0;
        }
      }

      .group-divider {
        background: #333333;
      }
    }
  }
</style>
