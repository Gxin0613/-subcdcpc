<script lang="tsx">
  import { debounce } from 'lodash-es';
  import { NTree, NEmpty, NInput, NDropdown, TreeOption } from 'naive-ui';
  import { defineComponent, ref } from 'vue';
  import { NodeEventType } from './typing';

  const props = {
    treeData: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
    isLazy: {
      type: Boolean,
      default: false,
    },
    treeSelectedKeys: {
      type: Array,
      default: () => [],
    },
    defaultExpandedKeys: {
      type: Array,
      default: () => [],
    },
    contextMenu: {
      type: Array,
      default: () => [],
    },
    enableContextMenu: {
      type: Boolean,
      default: false,
    },
  };

  type TreeEmitsType = {
    (event: 'load-tree-data', node: TreeOption): void;
    (
      event: 'update-node-prefix',
      _keys: Array<string | number>,
      _option: Array<TreeOption | null>,
      meta: {
        node: TreeOption | null;
        action: 'expand' | 'collapse' | 'filter';
      },
    ): void;
    (event: 'on-context-menu', node: TreeOption): void;
    (event: 'on-node-event', eventType: NodeEventType, option: TreeOption): void;
  };

  export default defineComponent({
    name: 'EntityTree',
    props,
    emits: ['update-node-prefix', 'update-node-prefix', 'on-context-menu', 'on-node-event'],
    setup(props, ctx) {
      const emit = ctx.emit as TreeEmitsType;
      const xRef = ref(0);
      const yRef = ref(0);
      const contextMenuVisible = ref(false);
      const renderContextMenu = () => {
        return (
          <NDropdown
            trigger="manual"
            placement="bottom-start"
            show={contextMenuVisible.value}
            options={props.contextMenu}
            x={xRef.value}
            y={yRef.value}
            onSelect={(_, item) => {
              emit('on-context-menu', item);
            }}
            onClickoutside={() => {
              contextMenuVisible.value = false;
            }}
          />
        );
      };

      const treeFilterPattern = ref('');
      const treeFilterAction = (keyword: string, node: any) => {
        if (keyword.trim() === '') return true;
        return node.Name.includes(keyword);
      };
      const renderTree = () => {
        const nodeProps = ({ option }: { option: TreeOption }) => {
          return {
            onClick: async () => {
              emit('on-node-event', 'click', option);
            },
            onmouseenter: debounce(() => {
              emit('on-node-event', 'mouseenter', option);
            }, 50),
            onmouseleave: () => {
              emit('on-node-event', 'mouseleave', option);
            },
            onContextmenu: async (e: MouseEvent) => {
              if (!props.enableContextMenu) {
                return;
              }
              e.preventDefault();
              contextMenuVisible.value = false;
              setTimeout(() => {
                contextMenuVisible.value = true;
                xRef.value = e.clientX;
                yRef.value = e.clientY;
              }, 16);
              emit('on-node-event', 'contextmenu', option);
            },
          };
        };

        return (
          <NTree
            showIrrelevantNodes={false}
            nodeProps={nodeProps}
            defaultExpandedKeys={props.defaultExpandedKeys}
            style="margin-top: 12px; height: calc(100% - 50px); min-width: 200px"
            filter={treeFilterAction}
            pattern={treeFilterPattern.value}
            virtualScroll={!props.isLazy}
            data={props.treeData}
            selectedKeys={props.treeSelectedKeys}
            onUpdate:expandedKeys={(
              _keys: Array<string | number>,
              _option: Array<TreeOption | null>,
              meta: {
                node: TreeOption | null;
                action: 'expand' | 'collapse' | 'filter';
              },
            ) => {
              emit('update-node-prefix', _keys, _option, meta);
            }}
            onLoad={
              props.isLazy
                ? (node: TreeOption) => {
                    emit('load-tree-data', node);
                  }
                : undefined
            }
            blockLine
          />
        );
      };
      const renderTreeHeader = () => {
        return (
          <div class="tree-header">
            <div class="page-title" style="font-size: 16px; font-weight: 500; flex-shrink: 0">
              {props.title}
            </div>
            <NInput modalValue={treeFilterPattern.value} placeholder={'关键字'} style="height: 30px; width: 100%" />
          </div>
        );
      };
      return () => (
        <div class="tree-panel">
          {renderTreeHeader()}
          {props.treeData.length > 0 ? renderTree() : <NEmpty />}
          {renderContextMenu()}
        </div>
      );
    },
  });
</script>

<style lang="less" scoped>
  .tree-panel {
    transition: all 0.4s ease;
    height: 100%;
    overflow-x: auto;
    overflow-y: auto;
    box-sizing: border-box;
    .tree-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .n-input {
        margin-left: 12px;
        height: 30px;
      }
    }
  }
</style>
