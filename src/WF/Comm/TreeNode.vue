<template>
  <div class="tree-node">
    <!-- 模块节点 -->
    <div class="module-info" v-if="props.renderHeader" @click="toggleCollapse">
      <div class="td-name">
        <div class="name-content" :style="moduleIndentStyle">
          <div
            class="indicator"
            v-if="hasChildren"
            :style="({
              transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
            } as StyleValue)"
          >
            <RightOutlined />
          </div>
          <div v-else class="indicator-placeholder"></div>
          <i :class="nodeData.Icon"></i>
          <span>{{ nodeData.Name }}</span>
        </div>
      </div>
      <div class="td-enable" v-if="nodeData.hasOwnProperty('IsEnable')" @click.stop>
        <Switch
          :checked-children="'启用'"
          :un-checked-children="'禁用'"
          :loading="nodeData.loading"
          size="small"
          :checked="parseInt(nodeData.IsEnable) === 1"
          @change="$emit('change-enable', $event, nodeData)"
        />
      </div>
      <div class="td-operate" @click.stop>
        <slot name="module-actions" :node="nodeData" :level="level"></slot>
      </div>
    </div>

    <!-- 子节点容器 -->
    <div class="child-node-container" v-show="!collapsed && hasChildren">
      <div class="child-modules-container sortable-container" :data-module-id="nodeData.No" ref="childModulesContainer">
        <!-- 递归渲染子模块 -->
        <TreeNode
          v-for="childModule in childModules"
          :key="childModule.No"
          :node-data="childModule"
          :level="level + 1"
          :list-model="props.listModel"
          :data-id="childModule.No"
          class="draggable-item"
          @change-enable="(value, node) => $emit('change-enable', value, node)"
          @get-entity-info="(menu) => $emit('get-entity-info', menu)"
          @handle-doc-click="(onClick, name) => $emit('handle-doc-click', onClick, name)"
          @node-moved="handleNodeMoved"
        >
          <template #module-actions="{ node, level: childLevel }">
            <slot name="module-actions" :node="node" :level="childLevel"></slot>
          </template>
          <template #menu-actions="{ menu, parent }">
            <slot name="menu-actions" :menu="menu" :parent="parent"></slot>
          </template>
        </TreeNode>
      </div>

      <!-- 叶子菜单容器 -->
      <div :class="{ 'menu-container': true, 'menu-container-root': !props.renderHeader }" v-if="childMenus.length > 0" :data-module-id="nodeData.No">
        <div
          :class="props.listModel === 'Table' || !props.listModel ? 'menu-item' : 'menu-icon-item'"
          v-for="menuItem in childMenus"
          :key="menuItem.No"
          :data-menu-id="menuItem.No"
        >
          <div class="td td-name" @click="menuItem.HisUAC?.IsUpdate ? $emit('get-entity-info', menuItem) : ''">
            <div class="menu-name-content" :style="menuIndentStyle">
              <i v-if="menuItem.Icon" :class="menuItem.Icon"></i>
              <i v-else>&nbsp;&nbsp;&nbsp;&nbsp;</i>
              <span>{{ menuItem.Name }}</span>
            </div>
          </div>
          <div class="td td-type" :data-model="menuItem.MenuModel">{{ menuItem.MenuModel }}</div>
          <div class="td td-content">
            <template v-if="Array.isArray(menuItem.Docs)">
              <div class="tiny-btn" v-for="btn of menuItem.Docs" :key="btn.title" @click="handleButtonClick(btn, menuItem)">
                {{ btn.title }}
              </div>
            </template>
          </div>
          <div class="td td-enable" v-if="menuItem.hasOwnProperty('IsEnable')" @click.stop>
            <Switch
              :checked-children="'启用'"
              :un-checked-children="'禁用'"
              size="small"
              :checked="parseInt(menuItem.IsEnable) === 1"
              :loading="menuItem.loading"
              @change="$emit('change-enable', $event, menuItem)"
            />
          </div>
          <div class="td td-operate" @click.stop>
            <slot name="menu-actions" :menu="menuItem" :parent="nodeData"></slot>
          </div>
        </div>
        <AntEmpty class="empty-tag" v-if="childMenus.length === 0" :image="simpleImage" style="align-self: center" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, defineEmits, defineProps, onMounted, onUnmounted, StyleValue } from 'vue';
  import { Switch, Empty as AntEmpty } from 'ant-design-vue';
  import { RightOutlined } from '@ant-design/icons-vue';
  import Sortable from 'sortablejs';

  interface Props {
    nodeData: any;
    level?: number;
    listModel?: string;
    renderHeader?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    level: 0,
    listModel: 'Table',
    renderHeader: true,
  });

  const emit = defineEmits(['change-enable', 'get-entity-info', 'handle-doc-click', 'node-moved']);

  const collapsed = ref(false);
  const simpleImage = ref(AntEmpty.PRESENTED_IMAGE_SIMPLE);
  const childModulesContainer = ref<HTMLElement>();
  let sortableInstance: Sortable | null = null;

  // 处理按钮点击
  const handleButtonClick = (btn: any, menuItem: any) => {
    if (btn.onClick && typeof btn.onClick === 'function') {
      emit('handle-doc-click', btn.onClick, menuItem.Name);
    } else {
      console.error('onClick is not a function or is missing!', btn);
    }
  };

  // 判断是否有子节点
  const hasChildren = computed(() => {
    return props.nodeData.children && props.nodeData.children.length > 0;
  });

  // 分离子模块和菜单
  const childModules = computed(() => {
    if (!props.nodeData.children) return [];
    return props.nodeData.children.filter((child: any) => child.IsModule || child.children);
  });

  const childMenus = computed(() => {
    if (!props.nodeData.children) return [];
    return props.nodeData.children.filter((child: any) => !child.IsModule && !child.children);
  });

  const toggleCollapse = () => {
    if (hasChildren.value) {
      collapsed.value = !collapsed.value;
    }
  };

  // 样式计算
  const moduleIndentStyle = computed(() => ({
    paddingLeft: props.level * 20 + 'px',
  }));

  const menuIndentStyle = computed(() => ({
    // 当不渲染模块头部（系统级菜单）时，为了与模块标题左边界对齐，补齐图标占位差值约32px
    paddingLeft: (props.renderHeader ? (props.level + 1) * 20 : 32) + 'px',
  }));

  // 处理节点移动事件
  const handleNodeMoved = (event: any) => {
    emit('node-moved', event);
  };

  // 初始化拖拽功能
  const initSortable = async () => {
    // await nextTick();
    // if (childModulesContainer.value && childModules.value.length > 0) {
    //   sortableInstance = new Sortable(childModulesContainer.value, {
    //     group: {
    //       name: 'tree-modules',
    //       pull: true,
    //       put: true,
    //     },
    //     animation: 150,
    //     handle: '.module-info',
    //     ghostClass: 'sortable-ghost',
    //     chosenClass: 'sortable-chosen',
    //     dragClass: 'sortable-drag',
    //     onEnd: (evt) => {
    //       const { oldIndex, newIndex } = evt;
    //       if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
    //         const moveEvent = {
    //           node: childModules.value[oldIndex],
    //           parent: props.nodeData,
    //           oldIndex,
    //           newIndex,
    //         };
    //         emit('node-moved', moveEvent);
    //       }
    //     },
    //   });
    // }
  };

  // 销毁拖拽功能
  const destroySortable = () => {
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }
  };

  onMounted(() => {
    if (!collapsed.value && hasChildren.value) {
      initSortable();
    }
  });

  onUnmounted(() => {
    destroySortable();
  });
</script>

<style scoped lang="less">
  .tree-node {
    .module-info {
      /* 扁平风：简化为轻边框、无阴影、浅色强调线 */
      padding: 12px 14px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      user-select: none;
      cursor: pointer;
      background: #ffffff;
      position: relative;
      z-index: 1;
      transition: border-color 0.15s ease, background 0.15s ease;
      border-radius: 8px;
      margin: 6px 0;
      border: 1px solid #e6efff;
      box-shadow: none;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        border-radius: 8px 0 0 8px;
        background: linear-gradient(180deg, #e6f0ff 0%, #dbeafe 100%);
        transition: background 0.15s ease;
      }

      &:hover {
        background: #ffffff;
        border-color: #dbeafe;
        box-shadow: none;
      }

      &:hover::before {
        background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%);
      }

      &:active {
        transform: translateY(0.5px);
      }

      .td-enable {
        width: 80px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .td-name {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex: 1;
        min-width: 0;
        padding-left: 0;

        .name-content {
          display: flex;
          align-items: center;

          .indicator {
            margin-right: 10px;
            font-size: 12px;
            transition: all 0.2s ease;
            color: #475569;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            flex-shrink: 0;
            background: transparent;
          }

          .indicator-placeholder {
            width: 16px;
            height: 16px;
            margin-right: 10px;
            flex-shrink: 0;
          }

          i {
            margin-right: 12px;
            font-size: 16px;
            color: #2563eb;
            width: 20px;
            text-align: center;
            transition: color 0.15s ease;
            flex-shrink: 0;

            &:hover {
              color: #1d4ed8;
            }
          }

          span {
            font-weight: 500;
            color: #111827;
            transition: color 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
          }
        }
      }

      .td-operate {
        width: 320px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        padding-right: 8px;

        /* 统一按钮为镂空描边风并确保可见性 */
        :deep(.ant-btn) {
          color: #2563eb;
          border-color: #bfdbfe;
          background: transparent;
          padding: 4px 8px;
        }
        :deep(.ant-btn:hover) {
          color: #1d4ed8;
          border-color: #93c5fd;
        }
        :deep(.ant-btn.ant-btn-dangerous) {
          color: #ef4444;
          border-color: #fecaca;
          background: transparent;
        }
        :deep(.ant-btn.ant-btn-dangerous:hover) {
          color: #dc2626;
          border-color: #fca5a5;
        }
        :deep(.ant-dropdown-button) {
          .ant-btn {
            color: #2563eb;
            border-color: #bfdbfe;
            background: transparent;
          }
          .ant-btn:hover {
            color: #1d4ed8;
            border-color: #93c5fd;
          }
        }

        /* 模块行需要突出“新建*”为主按钮，恢复 primary 实底样式 */
        :deep(.ant-btn-primary) {
          color: #fff;
          background: #1677ff;
          border-color: #1677ff;
        }
        :deep(.ant-btn-primary:hover) {
          color: #fff;
          background: #4096ff;
          border-color: #4096ff;
        }
      }
    }

    .child-node-container {
      .child-modules-container {
        position: relative;
        margin-left: 16px;
        padding-left: 12px;
        background: linear-gradient(90deg, rgba(227, 242, 253, 0.3) 0%, transparent 20%);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #1890ff, #40a9ff);
          border-radius: 2px;
        }
      }

      .menu-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin-left: 24px;
        margin-top: 6px;
        position: relative;
        padding-left: 16px;
        background: linear-gradient(90deg, rgba(240, 240, 240, 0.22) 0%, transparent 15%);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #f0f0f0, #e6f7ff);
          border-radius: 1px;
        }

        :deep(.ant-empty) {
          width: 100%;
        }
      }
      /* 轻微斑马纹，提升可读性 */
      .menu-container .menu-item:nth-child(odd) {
        background-color: rgba(246, 248, 255, 0.45);
      }

      /* 根级菜单容器（无模块头部）去除缩进与引导线 */
      .menu-container-root {
        margin-left: 0;
        padding-left: 0;
        background: none;
      }
      .menu-container-root::before {
        display: none;
      }
    }
  }

  // 复用原有菜单样式
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    box-sizing: border-box;
    font-size: 14px;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 2px;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      // transform: translateX(4px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      border-color: #d1d5db;
    }

    .td {
      box-sizing: border-box;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      &.td-name {
        width: 300px;
        flex-shrink: 0;
        min-width: 0;
      }

      &.td-type {
        width: 80px;
        height: 30px;
        flex-shrink: 0;
      }

      &.td-content {
        flex: 1;
        min-width: 150px;
      }

      &.td-enable {
        width: 80px;
        flex-shrink: 0;
      }

      &.td-operate {
        width: 300px;
        flex-shrink: 0;
        padding-right: 46px;
      }
    }

    .td-name {
      color: #1890ff;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      display: flex;
      align-items: center;

      &:hover {
        color: #0968db;
      }

      .menu-name-content {
        display: flex;
        align-items: center;

        i {
          margin-right: 8px;
          font-size: 14px;
          width: 16px;
          text-align: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
      }
    }

    /* 类型徽标（强制覆盖父级扁平样式，恢复渐变文字，不要圆角边框）*/
    .td-type {
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4px 8px;
      position: relative;
      border: 0 !important;
      border-radius: 0 !important;

      /* 默认蓝紫渐变文字 */
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 4px;
        background: #f2f5f7;
        z-index: -1;
      }

      &:hover {
        background-image: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        &::before {
          background: linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
        }
      }
    }

    .td-content {
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
      padding: 0 4px;

      .tiny-btn {
        border: 1px solid #1890ff;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        display: inline-flex;
        align-items: center;
        font-size: 12px;
        color: #1890ff;
        margin-right: 4px;
        height: 26px;
        line-height: 26px;
        text-align: center;
        cursor: pointer;
        min-width: 32px;
        padding: 0px 6px;
        border-radius: 0;
        transition: all 0.15s ease;
        font-weight: 500;
        white-space: nowrap;

        &:hover {
          background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
          color: #0968db;
          border-color: #0968db;
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    .td-enable {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .td-operate {
      width: 300px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      padding-right: 8px;

      // 按钮样式统一
      :deep(.ant-btn) {
        height: 26px;
        font-size: 12px;
        padding: 0 8px;
        border-radius: 4px;
        margin-left: 4px;
        /* 统一镂空描边风，保证常态可见 */
        color: #2563eb;
        border-color: #bfdbfe;
        background: transparent;
      }

      :deep(.ant-btn:hover) {
        color: #1d4ed8;
        border-color: #93c5fd;
      }

      :deep(.ant-btn.ant-btn-dangerous) {
        color: #ef4444;
        border-color: #fecaca;
        background: transparent;
      }
      :deep(.ant-btn.ant-btn-dangerous:hover) {
        color: #dc2626;
        border-color: #fca5a5;
      }

      :deep(.ant-dropdown-button) {
        height: 26px;
        font-size: 12px;

        .ant-btn {
          height: 26px;
          padding: 0 8px;
          color: #2563eb;
          border-color: #bfdbfe;
          background: transparent;
        }
        .ant-btn:hover {
          color: #1d4ed8;
          border-color: #93c5fd;
        }
      }

      :deep(.ant-popconfirm) {
        .ant-btn {
          height: 26px;
          width: 26px;
          padding: 0;
        }
      }
    }
  }

  .menu-icon-item {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 220px;
    display: inline-flex;
    border: 1px solid #eeeeee;
    border-radius: 12px;
    margin: 10px;
    background-color: #f7f7f7;
    flex-grow: 0;
    flex-shrink: 0;
    width: calc(20% - 20px);

    &:hover {
      background-color: #f2f5f7;
      cursor: move;
    }

    .td {
      margin-bottom: 8px;
    }

    .td-name {
      display: flex;
      align-items: center;
      flex-direction: column;

      i {
        font-size: 32px;
        margin-bottom: 12px;
      }
    }

    .td-type {
      font-size: 12px;
    }

    .td-content {
      display: none;
    }
  }

  // 拖拽样式
  .sortable-ghost {
    opacity: 0.4;
    background: #e3f2fd;
    transform: rotate(2deg);
  }

  .sortable-chosen {
    cursor: grabbing;
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .sortable-drag {
    transform: rotate(2deg);
    opacity: 0.8;
  }

  .draggable-item {
    cursor: grab;
    transition: all 0.2s ease;

    &:hover {
      // background: linear-gradient(135deg, #e8f4f8 0%, #dbeafe 100%);
      // transform: translateX(2px);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }
  }
</style>
