<template>
  <aside class="components-bar" :style="componentsBarStyle">
    <n-scrollbar>
      <div class="wrapper">
        <div style="height: 12px"></div>
        <n-collapse :default-expanded-names="expandedKeys">
          <n-collapse-item v-for="group in FormComponents" :key="group.key" :title="group.title" :name="group.key">
            <template #header-extra v-if="group.key == 'input'">
              <img src="/resource/CompanyImgLogo/cc_logo_no_bg.png" alt="" class="input-img" />
            </template>
            <div class="form-group">
              <div class="sidebar-widgets" :id="`group_${group.key}`">
                <div
                  v-for="child in group.children.filter((child) => child.showInPanel !== false)"
                  :key="child.key"
                  class="form-item"
                  :data-category="child.category"
                  :data-type="child.key"
                  :data-drag-item="JSON.stringify(child)"
                >
                  <i :class="child.icon"></i>
                  <span>{{ child.title }}</span>
                </div>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
    </n-scrollbar>
  </aside>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, onUnmounted } from 'vue';
  import { NCollapse, NCollapseItem, NScrollbar } from 'naive-ui';
  import FormComponents, { FieldGroup } from '../../props/form/FormComponents';
  import useUUID from '/@form/hooks/useUUID';
  import { useDesignerStore } from '/@/store/modules/form';
  import useWidgetHelper from '/@form/hooks/useWidgetsHelper';
  import Sortable from 'sortablejs';

  export default defineComponent({
    name: 'ComponentsBar',
    components: {
      NCollapse,
      NCollapseItem,
      NScrollbar,
    },
    setup() {
      const designerStore = useDesignerStore();
      const helper = useWidgetHelper();
      const sortableInstList: Array<Sortable> = [];
      const initSortable = (groupList: Array<FieldGroup>) => {
        for (const group of groupList) {
          // init sortbalejs instance
          const instance = new Sortable(document.getElementById('group_' + group.key)!, {
            animation: 200,
            draggable: '.form-item',
            ghostClass: 'ghost',
            sort: false,
            group: {
              name: 'dragGroup',
              put: false,
              pull: 'clone',
            },
            forceFallback: true,
            onChoose: (ev) => {
              document.body.style.setProperty('--sort-choose-width', ev.item.getBoundingClientRect().width + 'px');
              document.body.style.setProperty('--sort-choose-height', ev.item.getBoundingClientRect().height + 'px');
              document.body.style.setProperty('--sort-choose-display', 'inline-display');
            },
            onClone: (ev) => {
              const newElem = JSON.parse(ev.clone.dataset.dragItem as string);
              newElem.groupKey = newElem.category;
              newElem.id = useUUID(newElem.key);
              designerStore.currentDragWidget = helper.mergeWidgetObject(newElem);
              designerStore.selectedWidget = null;
              // ev.item = undefined;
            },
          });
          sortableInstList.push(instance);
        }
      };
      onMounted(() => {
        FormComponents.forEach((component) => {
          component.children.forEach((child) => {
            child.groupKey = child.category;
          });
        });
        initSortable(FormComponents);
      });

      // batch remove sortable instance
      onUnmounted(async () => {
        let instance = sortableInstList.pop();
        while (!!instance) {
          instance.destroy();
          instance = sortableInstList.pop();
        }
      });

      const expandedKeys = computed(() => {
        return FormComponents.map((comp) => comp.key);
      });

      const componentsBarStyle = computed(() => {
        return {
          width: designerStore.componentsCollapse ? '0' : '240px',
        };
      });

      return {
        FormComponents,
        componentsBarStyle,
        expandedKeys,
        collapse: computed(() => !designerStore.componentsCollapse),
      };
    },
  });
</script>

<style lang="less" scoped>
  .components-bar {
    // position: absolute;
    // left: 0;
    // top: 0;
    width: 240px;
    height: 100vh;
    border-right: 1px solid #eeeeee;
    box-sizing: border-box;
    overflow: auto;
    flex-shrink: 0;
    background-color: white;
    transition: all ease 0.3s;
    position: relative;
    // z-index: 12;

    .wrapper {
      padding: 8px 14px;
    }

    .title {
      font-size: 18px;
      height: 40px;
      line-height: 40px;
      color: #1890ff;
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      span {
        margin-left: 8px;
      }
    }
    .input-img {
      width: 100px;
      height: auto;
    }

    .form-group {
      width: 100%;
      padding: 6px 0;

      div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;

        .form-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100px;
          flex-shrink: 0;
          height: 30px;
          background-color: #f1f2f3;
          margin: 4px 0;
          box-sizing: border-box;
          padding-left: 4px;
          padding-right: 4px;
          font-size: 12px;
          user-select: none;
          cursor: move;

          span {
            margin-left: 8px;
            white-space: nowrap;
          }

          &:hover {
            box-shadow: rgba(100, 100, 111, 0.2) -2px 0px 12px 0px;
            border: 1px solid #1890ff;
            color: #1890ff;
          }
        }
      }
    }
  }
</style>
