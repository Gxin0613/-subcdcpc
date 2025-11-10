<script lang="tsx">
  import { NDropdown, NIcon } from 'naive-ui';
  import { defineComponent, h, ref, watch } from 'vue';
  import { ForkOutlined, MailOutlined, NodeExpandOutlined, UserOutlined, PlusCircleOutlined } from '@ant-design/icons-vue';
  import { ccNodes, routeNodes, userNodes, subFlowNodes, NodeType } from '../config/x6Shapes';
  import { Button, Modal } from 'ant-design-vue';

  export default defineComponent({
    name: 'X6NodeSelectMenu',
    props: {
      x: Number,
      y: Number,
      visible: Boolean,
      id: [Number, String],
      uuid: String,
      type: Number,
    },
    emits: ['close', 'create-node'],
    setup(props, ctx) {
      const options = ref<
        Array<{
          label: string;
          icon: () => void;
          key: string;
          onClick: () => void;
        }>
      >([]);
      const modalVisible = ref(false);
      const cssInfo = {
        padding: '30px',
      };
      watch(
        () => props.visible,
        () => {
          options.value = buildMenu();
        },
      );
      const buildMenu = () => {
        if (props.type === NodeType.CC) return [];
        const baseOptions = [
          {
            label: '新建节点',
            icon() {
              return h(NIcon, null, {
                default: () => h(UserOutlined),
              });
            },
            key: 'new-user-node',
            onClick: () => {
              ctx.emit('create-node', userNodes[0], props.x, props.y);
            },
          },
          {
            label: '新建路由节点',
            icon() {
              return h(NIcon, null, {
                default: () => h(ForkOutlined),
              });
            },
            key: 'new-route-node',
            onClick: () => {
              ctx.emit('create-node', routeNodes[0], props.x, props.y);
            },
          },
        ];
        if (props.type === NodeType.Normal) {
          baseOptions.push(
            {
              label: '新建抄送节点',
              icon() {
                return h(NIcon, null, {
                  default: () => h(MailOutlined),
                });
              },
              key: 'new-cc-node',
              onClick: () => {
                ctx.emit('create-node', ccNodes[0], props.x, props.y);
              },
            },
            {
              label: '新建子流程节点',
              icon() {
                return h(NIcon, null, {
                  default: () => h(NodeExpandOutlined),
                });
              },
              key: 'new-subflow-node',
              onClick: () => {
                ctx.emit('create-node', subFlowNodes[0], props.x, props.y);
              },
            },
            {
              label: '(点右键)更多...',
              icon() {
                return h(NIcon, null, {
                  default: () => h(PlusCircleOutlined),
                });
              },
              key: 'open-docs',
              onClick: () => {
                modalVisible.value = true;
              },
            },
          );
        }
        return baseOptions;
      };

      const handleDropdownSelect = async (_, item) => {
        await item.onClick();
        ctx.emit('close');
      };
      return () => (
        <div>
          <NDropdown
            placement="bottom-start"
            trigger="manual"
            x={props.x}
            y={props.y}
            options={options.value}
            show={props.visible}
            onClickoutside={() => {
              ctx.emit('close');
            }}
            onSelect={handleDropdownSelect}
          />
          <Modal
            v-model:open={modalVisible.value}
            v-slots={{
              footer: () => (
                <Button
                  type="primary"
                  style={{
                    borderRadius: '6px',
                    margin: '10px',
                  }}
                  onClick={() => (modalVisible.value = false)}
                >
                  知道了
                </Button>
              ),
            }}
            title={'流程设计器操作说明'}
            centered
            closable={false}
            bodyStyle={cssInfo}
          >
            <p>1. Ctrl + 鼠标滚轮 可整体缩放画布 </p>
            <p>2. Alt 或 Shift + 鼠标左键按住画布空白处 可拖动画布</p>
            <p>3. 鼠标移动到节点上 可显示当前可用连接点</p>
            <p>4. 鼠标左键点击节点 可以触发以下功能：</p>
            <p>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;1 显示大小/方向调整工具</p>
            <p>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;2 显示快捷创建下一节点菜单</p>
            <p>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;3 显示右侧快捷编辑菜单（可点击锁图标阻止）</p>
            <p>5. 鼠标左键双击节点 可以快捷修改节点名</p>
            <p>6. 鼠标左键点击连接线 可以调整位置 / 右键连接线可显示编辑框</p>
            <p>7. 画布空白处右键可以快捷创建节点</p>
            <p>8. 左侧节点面板也可实现快速创建</p>
            <p>9. 鼠标右键点击节点 可以触发当前节点功能</p>
            <img src="/resource/ContextMenu.png" width="350" height="200" alt="" />
          </Modal>
        </div>
      );
    },
  });
</script>
