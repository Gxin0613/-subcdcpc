<script lang="tsx">
  import { Button, Checkbox, Modal, Input, message } from 'ant-design-vue';
  import { computed, defineComponent, inject, reactive, ref, StyleValue } from 'vue';
  import { onMounted } from 'vue';
  import { Transform } from '@antv/x6-plugin-transform';
  import { Selection } from '@antv/x6-plugin-selection';
  import { Snapline } from '@antv/x6-plugin-snapline';
  import { MiniMap } from '@antv/x6-plugin-minimap';
  import { Clipboard } from '@antv/x6-plugin-clipboard';
  import { Graph } from '@antv/x6';
  import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
  import { flowEntityKeys } from '../utils/keys';

  const MIN_SCALE_RATE = 0.2; // 最小缩放倍率
  const MAX_SCALE_RATE = 10; // 最大缩放倍率

  const VisibleKey = 'featureOpened';

  export default defineComponent({
    name: 'Features',
    props: {
      graph: Graph,
    },
    setup(props, context) {
      const transformPlg = new Transform({
        resizing: true,
        rotating: true,
      });
      const selectionPlg = new Selection({
        rubberband: true,
        showNodeSelectionBox: true,
      });
      const snapPlg = new Snapline({
        tolerance: 10,
      });
      // 流程概览配置
      const miniMapPlg = new MiniMap({
        container: document.getElementById('mini-map-container')!,
        width: 220,
        height: 160,
        padding: 10,
        minScale: MIN_SCALE_RATE,
        maxScale: MAX_SCALE_RATE,
        scalable: true,
      });
      const clipboard = new Clipboard({
        enabled: true,
      });
      // 插件配置
      const pluginConfigs = reactive([
        {
          key: 'transform',
          label: '节点调整',
          value: true,
          instance: transformPlg,
        },
        {
          key: 'selection',
          label: '多选工具',
          value: true,
          instance: selectionPlg,
        },
        {
          key: 'snapline',
          label: '对齐工具',
          value: true,
          instance: snapPlg,
        },
      ]);

      // 显示/隐藏节点id
      const nodeIdVisible = ref(false);
      const renderNodeId = () => {
        const nodes = props.graph?.getNodes();
        nodes?.forEach((node) => {
          node.attr('id_display/text', nodeIdVisible.value ? `[ ${node.getData().NodeID} ]` : '');
        });
      };
      const changeNodeIdVisible = () => {
        nodeIdVisible.value = !nodeIdVisible.value;
        setStorage('nodeIdVisible', nodeIdVisible.value ? '1' : '0');
        renderNodeId();
      };
      // 默认启用
      const loadFormStorage = (key: string) => {
        const val = localStorage.getItem(key);
        if (!val) {
          localStorage.setItem(key, '1');
          return true;
        }
        return val === '1';
      };
      const setStorage = (key: string, val: string) => {
        localStorage.setItem(key, val);
      };
      const pluginChange = (plugin: Recordable) => {
        plugin.value = !plugin.value;
        setStorage(plugin.key, plugin.value ? '1' : '0');
        plugin.value ? props.graph?.enablePlugins(plugin.key) : props.graph?.disablePlugins(plugin.key);
      };

      const modalVisible = ref(false);

      const cssInfo = {
        padding: '30px',
      };

      const currentZoomRate = ref(1);
      const nodeKeyword = ref('');
      const getCurrentZoomRate = () => {
        currentZoomRate.value = parseFloat(props.graph!.zoom().toFixed(1));
      };

      const changeZoomRate = (rate: number) => {
        if (currentZoomRate.value + rate < MIN_SCALE_RATE) {
          message.error('最小可缩放到20%');
          currentZoomRate.value = MIN_SCALE_RATE;
          props.graph!.zoomTo(MIN_SCALE_RATE);
          return;
        }
        if (currentZoomRate.value + rate > MAX_SCALE_RATE) {
          message.error('最大可缩放到1000%');
          currentZoomRate.value = MAX_SCALE_RATE;
          props.graph!.zoomTo(MAX_SCALE_RATE);
          return;
        }
        props.graph?.zoom(rate);
        getCurrentZoomRate();
      };

      const setZoomRate = (val: string | number) => {
        const rate = Number(val);
        if (Number.isNaN(rate)) {
          message.error('请输入数字');
          return;
        }
        changeZoomRate(rate - currentZoomRate.value);
      };

      // 过滤节点
      const filterNode = (keyword: string) => {
        keyword = keyword.trim();
        let count = 0;
        const nodes = props.graph!.getNodes();
        if (!keyword) {
          nodes.forEach((node) => {
            node.attr('body/stroke', '#CACACA');
            node.attr('text/fill', node.id.endsWith('01') ? 'white' : '#262626');
            node.attr('id_display/fill', '#262626');
          });
          return;
        }
        nodes.forEach((node) => {
          const id = node.id;
          const name = node.getData().Name;
          if (id.includes(keyword) || name.includes(keyword)) {
            node.attr('body/stroke', 'orange');
            node.attr('text/fill', 'orange');
            node.attr('id_display/fill', 'orange');
            count++;
          } else {
            node.attr('body/stroke', '#CACACA');
            node.attr('text/fill', node.id.endsWith('01') ? 'white' : '#262626');
            node.attr('id_display/fill', '#262626');
          }
        });
        if (count === 1) {
          const node = nodes.find((node) => {
            const id = node.id;
            const name = node.getData().Name;
            return id.includes(keyword) || name.includes(keyword);
          });
          if (node) {
            props.graph!.centerCell(node);
          }
        }
      };

      onMounted(async () => {
        props.graph!.use(snapPlg).use(transformPlg).use(selectionPlg).use(miniMapPlg).use(clipboard);
        const pluginNames = pluginConfigs.map((config) => config.key);
        props.graph!.disablePlugins(pluginNames);
        const enablePluins: string[] = [];
        pluginConfigs.forEach((plugin) => {
          plugin.value = loadFormStorage(plugin.key);
          if (plugin.value) {
            enablePluins.push(plugin.key);
          }
        });
        props.graph?.enablePlugins(enablePluins);
        getCurrentZoomRate();
        props.graph?.on('scale', () => {
          getCurrentZoomRate();
        });
        // 读取id显示配置
        nodeIdVisible.value = loadFormStorage('nodeIdVisible');
        renderNodeId();
        if (!flowAtPara.value.map.has(VisibleKey)) {
          await updateFlowEntity(VisibleKey, 1, true);
          featureVisible.value = true;
          return;
        }
        featureVisible.value = flowAtPara.value.map.get(VisibleKey) == 1 || false;
      });

      context.expose({
        renderNodeId,
      });

      const featureVisible = ref(true);
      const { flowEntity, updateFlowEntity } = inject(flowEntityKeys)!;
      const flowAtPara = computed(() => {
        if (flowEntity.value?.atPara) {
          return flowEntity.value?.atPara;
        }
        return {};
      });
      const togglePanel = async () => {
        featureVisible.value = !featureVisible.value;
        await updateFlowEntity(VisibleKey, featureVisible.value ? 1 : 0, true);
      };

      return () => (
        <div
          class="feture-wrapper"
          style={
            {
              bottom: featureVisible.value ? '-100px' : '30px',
              transition: 'bottom 0.3s',
            } as StyleValue
          }
        >
          <Button
            class="toggle-panel"
            type="default"
            onClick={() => {
              togglePanel();
            }}
          >
            {featureVisible.value ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          </Button>
          <div class="node-utils">
            <span class="cate-name">节点&nbsp;&nbsp;</span>
            <Checkbox v-model:checked={nodeIdVisible.value} onClick={changeNodeIdVisible}>
              显示ID
            </Checkbox>
            <div class="divider"></div>
            <span class="cate-name" style="font-weight: 500; color: #333">
              查找节点&nbsp;&nbsp;
            </span>
            <div class="find-node">
              <Input allowClear placeholder={'请输入节点ID/节点名'} v-model:value={nodeKeyword.value} onChange={(e: any) => filterNode(e.target.value)}></Input>
            </div>
          </div>
          <div class="features">
            <span class="cate-name">插件&nbsp;&nbsp;</span>
            {pluginConfigs.map((plugin) => (
              <Checkbox v-model:checked={plugin.value} key={plugin.key} onClick={() => pluginChange(plugin)}>
                {plugin.label}
              </Checkbox>
            ))}
          </div>

          <div class="control">
            <div class="zoom">
              <span class="cate-name">缩放&nbsp;&nbsp;</span>
              <div class="main">
                <div class="oper" onClick={() => changeZoomRate(-0.2)}>
                  -
                </div>
                <input
                  v-model:value={currentZoomRate.value}
                  onChange={(e: Event) => {
                    const { value } = e.target as HTMLInputElement;
                    setZoomRate(value);
                  }}
                />
                <div class="oper" onClick={() => changeZoomRate(0.2)}>
                  +
                </div>
              </div>
              <div class="reset" onClick={() => changeZoomRate(1 - currentZoomRate.value)}>
                重置
              </div>
            </div>
            <div class="guide" onClick={() => (modalVisible.value = true)}>
              <i class="icon-support">&nbsp;</i>流程设计器操作说明
            </div>
          </div>

          <Modal
            v-model:open={modalVisible.value}
            v-slots={{
              footer: () => (
                <Button
                  type="primary"
                  style={{
                    borderRadius: '6px',
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
            <img src="/resource/NodeLink.png" width="350" height="200" alt="" />
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

<style lang="less" scoped>
  .feture-wrapper {
    position: fixed;
    transform: translateX(-50%);
    left: 50%;
    bottom: 500px;
    z-index: 999;
    width: 600px;
    z-index: 99;

    .toggle-panel {
      color: var(--system-bg-color);
      position: absolute;
      top: -35px;
      right: 0;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
    }

    .cate-name {
      font-size: 14px;
      color: #666666;
    }
    :deep(.ant-checkbox-inner) {
      //修改边框的颜色
      border: 1px solid #c9c9c9 !important;
    }
    :deep(.ant-checkbox-checked .ant-checkbox-inner) {
      //修改选中框的背景颜色
      background-color: #3d668c !important; /* 将背景颜色修改为白色 */
      //修改边框颜色
      border-color: #ffffff !important; /* 将边框颜色修改为黑色 */
    }
    :deep(.ant-checkbox-checked .ant-checkbox-inner::after) {
      //antd的checkbox组件的选中框里面的透明的钩子，是通过设置底部边框和右边框的颜色再旋转得到的钩子，
      // 所以设置底部边框和右边框的样式就可以修改钩子的样式
      border-bottom: 2px solid #fff;
      border-right: 2px solid #fff;
    }

    .control {
      display: flex;
      height: 30px;
      align-items: center;
      margin-top: 4px;
      user-select: none;
      justify-content: space-between;
      box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

      .zoom {
        background-color: white;
        width: 56%;
        display: flex;
        height: 30px;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        font-size: 14px;
        .main {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        input {
          width: 30px;
          text-align: center;
          border: none;
        }

        .reset {
          font-weight: normal;
          color: #3d668c;
          cursor: pointer;
        }
        .oper {
          color: #999999;
          text-align: center;
          font-weight: normal;
          cursor: pointer;
          width: 30px;
          font-size: 20px;
          line-height: 30px;
          &:hover {
            color: #3d668c;
          }
        }
      }
      .guide {
        width: 42%;
        background-color: white;
        font-size: 12px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
        &:hover {
          border: 1px solid #3d668c;
          color: #3d668c;
        }
      }
    }

    .features {
      display: flex;
      justify-content: flex-start;
      display: flex;
      align-items: center;
      height: 30px;
      font-size: 12px;
      background-color: white;
      margin-top: 4px;
      padding: 0 12px;
    }
    .node-utils {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 0 0 12px;
      height: 30px;
      background-color: white;

      .divider {
        height: 100%;
        width: 2px;
        background-color: #aaa;
        margin-left: 12px;
        margin-right: 12px;
      }

      .find-node {
        flex: 1;
        margin-left: 12px;
        font-weight: normal;
        color: #3d668c;
        cursor: pointer;
      }
    }
  }
</style>
