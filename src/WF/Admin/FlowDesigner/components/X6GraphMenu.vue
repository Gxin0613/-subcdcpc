<script lang="tsx">
  import { NDropdown, NIcon } from 'naive-ui';
  import { defineComponent, h } from 'vue';
  import { ForkOutlined, MailOutlined, NodeExpandOutlined, TagOutlined, UserOutlined } from '@ant-design/icons-vue';
  import { ccNodes, routeNodes, userNodes, subFlowNodes, labelNodes } from '../config/x6Shapes';

  export default defineComponent({
    name: 'X6GraphMenu',
    props: {
      x: Number,
      y: Number,
      visible: Boolean,
    },
    emits: ['close', 'create-node'],
    setup(props, ctx) {
      const options = [
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
          label: '新建标签',
          icon() {
            return h(NIcon, null, {
              default: () => h(TagOutlined),
            });
          },
          key: 'new-tag-node',
          onClick: () => {
            ctx.emit('create-node', labelNodes[0], props.x, props.y);
          },
        },
      ];
      const handleDropdownSelect = async (_, item) => {
        await item.onClick();
        ctx.emit('close');
      };
      return () => (
        <NDropdown
          placement="bottom-start"
          trigger="manual"
          x={props.x}
          y={props.y}
          options={options}
          show={props.visible}
          onClickoutside={() => {
            ctx.emit('close');
          }}
          onSelect={handleDropdownSelect}
        />
      );
    },
  });
</script>
