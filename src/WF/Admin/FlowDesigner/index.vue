<script lang="tsx">
  import { computed, defineComponent, onMounted, onUnmounted, reactive, ref, shallowRef, unref } from 'vue';
  import { useDataLoader } from './hooks/useDataLoader';
  import { useX6Node } from './hooks/useX6Node';
  import { useRoute } from 'vue-router';
  import { Button, Col, Input, message, Modal, Row, Spin } from 'ant-design-vue';
  import { getNodeTemplateByType, NodeType } from './config/x6Shapes';
  import FlowToolbar from './components/FlowToolbar.vue';
  import { useProvider } from './hooks/useProvider';
  import QuickEditPanel from '/@flow/components/QuickEditPanel.vue';
  import X6NodeContextMenu from '/@flow/components/X6NodeContextMenu.vue';
  import { debounce } from 'lodash-es';
  import { useX6Edge } from '/@flow/hooks/useX6Edge';
  import Features from '/@flow/components/Features.vue';
  import { useX6Graph } from '/@flow/hooks/useX6Graph';
  // import { notification } from 'ant-design-vue';
  import Events from '/@/utils/Events';
  import { useX6Tag } from './hooks/useX6Tag';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { Direction, Directions } from '../Cond2020/Direction';
  import X6GraphMenu from './components/X6GraphMenu.vue';
  import X6NodeSelectMenu from './components/X6NodeSelectMenu.vue';
  import { connectConfig } from './config/x6Config';
  import { calcDrawSize, calcOffSet } from './utils/CalcUtils';
  import { Node } from '@antv/x6';
  import { MapData } from '../FrmLogic/MapData';

  export default defineComponent({
    name: 'FlowChartBuilder',
    components: { Input, Modal, Button },
    props: {
      params: {
        type: Object,
        default: () => ({}),
      },
    },
    setup(props) {
      const route = useRoute();
      const flowBuilder = shallowRef<HTMLElement>();
      const edgeTooltip = shallowRef<HTMLElement | null>(null);
      const flowNo = props.params.FlowNo || (route.query.FlowNo as string);
      const loading = ref(false);
      // 数据处理
      const { nodeList, lineList, labelList, loadNodes, getDirections, getLabels } = useDataLoader(flowNo);
      // 连线操作
      const { edgeInfo, resetModal, setCondition, batchSetCondition, insertDir, deleteDir, deleteDirByIds, modifyDirLabel, modifyDirVertices } = useX6Edge();
      const { syncPasteNodeInfo, createNode, updateNodePosType, changeNodePosition, changeNodeAngle, changeNodeSize, deleteElement } = useX6Node(
        nodeList,
        loading,
        loadNodes,
        flowNo,
        lineList,
        deleteDirByIds,
      );
      const { changeTagPosition, modifyTagVal, deleteTag, addTag } = useX6Tag(labelList, flowNo);
      // 提供区域内组件共享数据能力
      const { flowEntity, selectNode, selectedNodeId } = useProvider(flowNo, nodeList, loading, null);
      let connectAfterCreate = false;
      // 流程图功能引用
      const graphFeatures = shallowRef<InstanceType<typeof Features>>();
      const nodeContextMenu = reactive<Recordable>({
        x: 0,
        y: 0,
        visible: false,
        id: null,
        name: null,
        type: null,
        uuid: '',
        fwStatus: -1,
      });
      const nodeSelectMenu = reactive<Recordable>({
        x: 0,
        y: 0,
        visible: false,
        id: null,
        name: null,
        type: null,
        uuid: '',
      });
      const graphContextMenu = reactive<Recordable>({
        x: 0,
        y: 0,
        visible: false,
      });

      const modifyTag = async (id: string) => {
        const tag = graph.value?.getNodes().find((node) => (node.getData()?.MyPK as unknown as string) === id);
        if (!tag) {
          message.error('节点已不存在，请刷新页面');
          return;
        }
        const str = window.prompt('请输入标签内容', tag.getData()?.Name || '');
        if (!str) {
          return;
        }
        await modifyTagVal(id, str);
        tag.setData({
          Name: str,
        });
      };
      const removeNode = async (id: string, type: NodeType) => {
        try {
          if (type === NodeType.Tag) {
            await deleteTag(id);
            graph.value
              ?.getNodes()
              .find((node) => (node.getData()?.MyPK as unknown as string) === id)
              ?.remove();
            return;
          }
          await deleteElement(id);
          graph.value
            ?.getNodes()
            .find((node) => (node.attrs?.id as unknown as string) == id)
            ?.remove();
        } catch (_) {}
      };

      const updateFWCStatus = async (id: string, status: number) => {
        graph.value
          ?.getNodes()
          .find((node) => (node.getData()?.NodeID as unknown as string) === id)
          ?.setData({
            FWCSta: status,
          });
      };

      // 切换节点类型
      type RuntimeNode = (Node & { points: string }) | undefined;
      const updateNodeMode = async (nodeId: string, mode) => {
        const node = graph.value?.getNodes().find((node) => node.getData()?.NodeID == nodeId) as unknown as RuntimeNode;
        if (!node) {
          message.error('更新节点失败，请刷新页面');
          return;
        }
        const templateInfo = getNodeTemplateByType(node.data.NodeType, mode);
        if (!templateInfo) {
          message.error('更新节点失败，请刷新页面');
          return;
        }
        node.data.RunModel = mode;
        for (const node of nodeList.value) {
          if (node.NodeID == nodeId) {
            node.RunModel = mode;
            break;
          }
        }
        node.points = templateInfo.points;
      };
      // end

      const modalBodyStyle = computed(() => {
        return {
          padding: '24px',
        };
      });
      const { graph, initGraph, convertData } = useX6Graph();
      const getIdAndType = (cellId: string) => {
        const targetNode = graph.value?.getNodes().find((node) => node.id === cellId);
        if (!targetNode) {
          return null;
        }
        return {
          id: targetNode.attrs?.id as unknown as string,
          name: (targetNode as any).label || '未知到达节点名',
          type: targetNode.attrs?.typeInfo.nodeType as unknown as NodeType,
        };
      };
      let offsetX = 0;
      let offsetY = 0;
      const initDesigner = async () => {
        try {
          //检查管理员用户，不是就转入登录窗口.
          // if (WebUser.IsAdmin == false) {
          // alert('当前用户是[' + WebUser.Name + ']非管理员用户,不能设计流程.');
          // return;
          // }
          loading.value = true;
          await flowEntity.value.Init();
          await Promise.all([flowEntity.value.Retrieve(), getLabels(), loadNodes(), getDirections()]);
          const width = window.innerWidth;
          const height = window.innerHeight;
          initGraph(flowBuilder.value!, width, height);
          const data = convertData(unref(nodeList), unref(lineList) as Directions, unref(labelList));
          if (!graph.value) {
            message.error('初始化设计器失败');
            return;
          }
          const offset = calcOffSet(unref(graph)!);
          offsetX = offset.x;
          offsetY = offset.y;
          for (const node of data.nodes!) {
            const { x, y } = graph.value.clientToLocal(node.x!, node.y!);
            node.x = x;
            node.y = y;
            // node.attrs!.id_display.text = '';
            if ((node.id + '').endsWith('01')) {
              node.attrs!.body.fill = '###0000CD';
              node.attrs!.text.fill = 'white';
            }
          }

          for (const edge of data.edges!) {
            if (Array.isArray(edge.vertices)) {
              const np: typeof edge.vertices = [];
              for (const point of edge.vertices) {
                const localPoint = graph.value.pageToLocal(point.x, point.y);
                np.push({ x: localPoint.x, y: localPoint.y });
              }
              edge.vertices = np;
            }
          }
          graph.value.fromJSON(data); // 实现流程节点的渲染
          // graph.value.centerContent();
          graph.value.centerContent();

          const { drawWidth, drawHeight } = calcDrawSize(data);
          if (drawWidth > width || drawHeight > height) {
            graph.value.zoomToFit();
          }

          const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
            for (let i = 0, len = ports.length; i < len; i += 1) {
              ports[i].style.visibility = show ? 'visible' : 'hidden';
            }
          };
          graph.value.on('node:mouseenter', ({ node }) => {
            if (node.shape === 'graph-tag') return;
            const container = flowBuilder.value!;
            // const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
            const ports = container.querySelectorAll(`g[data-cell-id='${node.id}'] .x6-port-body`) as NodeListOf<SVGElement>;
            showPorts(ports, true);
          });
          graph.value.on('node:mouseleave', () => {
            const container = flowBuilder.value!;
            const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
            showPorts(ports, false);
          });

          graph.value.on('node:port:mouseenter', () => {
            const container = flowBuilder.value!;
            const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
            showPorts(ports, true);
          });
          graph.value.on('node:added', async ({ node }) => {
            // 获取坐标
            const { x, y } = node.position();

            // 处理标签
            if (node.shape === 'graph-tag') {
              const tag = await addTag(parseInt(x), parseInt(y));
              node.setData({
                ...tag,
              });
              return;
            }
            // 乐观UI， 假设成功
            const { nodeType, mode = '0' } = node.attrs?.typeInfo as Recordable;
            const template = getNodeTemplateByType(nodeType, mode);
            if (!template) {
              message.error('当前节点类型不存在，请检查');
              node.remove();
              return;
            }
            const data = await createNode(x, y, template);
            const { NodeID, Name } = data!;
            const ports = node.getPorts();
            ports.forEach(({ id }) => node.removePort(id!));
            // template.ports.items = template.ports.items.map((item) => ({ group: item.group, id: NodeID + '-' + item.group }));
            node.addPort({ group: 'top', id: NodeID + '-' + 'top' });
            node.addPort({ group: 'left', id: NodeID + '-' + 'left' });
            node.addPort({ group: 'bottom', id: NodeID + '-' + 'bottom' });
            node.addPort({ group: 'right', id: NodeID + '-' + 'right' });
            node.attr('text/text', Name);
            node.attr('id', NodeID);
            // node.attr('label', Name);
            node.addTools([
              {
                name: 'node-editor',
              },
            ]);
            node.setData(data);
            // node.portProp()
            if (connectAfterCreate) {
              graph.value?.addEdge({
                source: nodeSelectMenu.uuid,
                target: node.id,
                ...connectConfig,
              });
              updateNodePosType(nodeSelectMenu.id);
              connectAfterCreate = false;
            }
            // @ts-ignore
            graphFeatures.value?.renderNodeId();
          });
          graph.value.on('node:moved', async ({ node }) => {
            const { x, y } = node.position();
            const actualX = Math.round(x - offsetX);
            const actualY = Math.round(y - offsetY);
            if (node.shape === 'graph-tag') {
              await changeTagPosition(actualX, actualY, node.getData().MyPK as string);
              return;
            }
            await changeNodePosition(node.attrs?.id as unknown as string, actualX, actualY);
          });
          graph.value.on('node:contextmenu', async ({ e, node }) => {
            const { clientX, clientY } = e;
            // 处理菜单在角落显示
            let display_y = 0;
            const nodeTYpe = node.attrs?.typeInfo.nodeType;
            const safeHeight = nodeTYpe === NodeType.Normal ? 300 : 130;
            if (clientY + safeHeight > window.innerHeight) {
              display_y = window.innerHeight - safeHeight;
            } else {
              display_y = clientY;
            }

            let display_x = 0;
            const safeWidth = 180;
            if (clientX + safeWidth > window.innerWidth) {
              display_x = window.innerWidth - safeWidth;
            } else {
              display_x = clientX;
            }
            // end
            nodeContextMenu.x = display_x;
            nodeContextMenu.y = display_y;
            nodeContextMenu.id = node.getData().MyPK || node.getData().NodeID + ''; // tag存放在data中
            nodeContextMenu.name = node.attrs?.text?.text;
            nodeContextMenu.type = node.attrs?.typeInfo.nodeType;
            nodeContextMenu.fwStatus = node.getData().FWCSta;
            nodeContextMenu.uuid = node.id;
            nodeContextMenu.mode = node.getData().RunModel;
            nodeContextMenu.visible = true;
          });

          graph.value.on('node:click', ({ e, node }) => {
            // selectNode(node.attrs?.id as unknown as string);
            // graph.value?.trigger('node:mouseleave');
            // 如果不是路由和普通节点，不生效
            const type = node.attrs?.typeInfo.nodeType as NodeType;
            if (![NodeType.Normal, NodeType.Route, NodeType.CC].includes(type)) {
              return;
            }
            const { clientX, clientY } = e;
            nodeSelectMenu.x = clientX;
            nodeSelectMenu.y = clientY;
            nodeSelectMenu.id = node.attrs?.id || node.getData()?.MyPK; // tag存放在data中
            nodeSelectMenu.name = node.attrs?.label;
            nodeSelectMenu.type = type;
            nodeSelectMenu.uuid = node.id;
            nodeSelectMenu.visible = true;

            selectNode(nodeSelectMenu.id);
          });

          graph.value.on('node:dblclick', ({ node }) => {
            selectNode(node.attrs?.id as unknown as string);
            // graph.value?.trigger('node:mouseleave');
            nodeSelectMenu.visible = false;
          });
          graph.value.on(
            'node:change:size',
            debounce(({ current, node }) => {
              console.log(current, node);
              const { width, height } = current;
              changeNodeSize(node.attrs?.id as unknown as string, width, height);
            }, 100),
          );
          graph.value.on(
            'node:change:angle',
            debounce(({ current, node }) => {
              changeNodeAngle(node.attrs?.id as unknown as string, current);
            }, 100),
          );

          graph.value.on('edge:contextmenu', ({ edge }) => {
            const entity = edge.attrs?.dataSource as Direction;
            edgeInfo.inputVal = entity.GetValByKey('Des');
            edgeInfo.instance = edge;
            edgeInfo.title = '编辑条件';
            // edgeInfo.inputVal = (entity?.Des as string) || '';
            edgeInfo.visible = true;
          });

          graph.value.on(
            'edge:change:vertices',
            debounce(({ edge }) => {
              edgeInfo.instance = edge;
              const vertices = JSON.parse(JSON.stringify(edge.vertices));
              for (let i = 0; i < vertices.length; i++) {
                const x = (vertices[i].x - offsetX).toFixed(2);
                const y = (vertices[i].y - offsetY).toFixed(2);
                // const { x, y } = graph.value!.pageToLocal(vertices[i].x, vertices[i].y);
                vertices[i] = { x, y };
              }
              modifyDirVertices(vertices);
              const sourceNode = graph.value?.getNodes().find((node) => parseInt(node.attrs?.id as unknown as string) == edge.source.cell);
              const targetNode = graph.value?.getNodes().find((node) => parseInt(node.attrs?.id as unknown as string) == edge.target.cell);
              console.log({
                sourceNode,
                targetNode,
              });
            }, 100),
          );

          graph.value.on('edge:click', ({ edge }) => {
            edge.addTools([
              {
                name: 'vertices',
                args: {
                  attrs: {
                    fill: '#1296db',
                  },
                },
              },
            ]);
          });
          // 鼠标移入连线：显示提示
          graph.value.on('edge:mouseenter', ({ edge, e }) => {
            // 1. 先移除已存在的提示（避免重复）
            if (edgeTooltip.value) {
              document.body.removeChild(edgeTooltip.value);
              edgeTooltip.value = null;
            }
            // 2. 创建提示DOM元素
            const tooltipEl = document.createElement('div');
            tooltipEl.style.cssText = `
              position: absolute;
              padding: 4px 8px;
              background: red;
              color: #fff;
              font-size: 12px;
              border-radius: 4px;
              pointer-events: none;
              z-index: 1000;
              white-space: nowrap; 
            `;
            tooltipEl.textContent = '点击右键,可设置方向条件.'; // 提示文本
            edgeTooltip.value = tooltipEl;
            document.body.appendChild(tooltipEl);

            // 3. 定位提示：在鼠标位置偏移10px（避免遮挡鼠标）
            const { clientX, clientY } = e;
            tooltipEl.style.left = `${clientX + 10}px`;
            tooltipEl.style.top = `${clientY - 20}px`;
          });

          // 鼠标离开连线：移除提示 + 保留原有工具移除逻辑
          graph.value.on('edge:mouseleave', ({ edge }) => {
            // 移除连线的顶点工具（原有逻辑保留）
            edge.removeTools();
            // 移除提示元素
            if (edgeTooltip.value) {
              document.body.removeChild(edgeTooltip.value);
              edgeTooltip.value = null;
            }
          });
          graph.value.on('edge:added', async ({ edge }) => {
            if (!connectAfterCreate) return;
            const { source, target } = edge;
            const fromNode = getIdAndType(source['cell']);
            const toNode = getIdAndType(target['cell']);
            if (!fromNode?.id || !toNode?.id) {
              message.error('未找到原始id，连线失败');
              return;
            }
            const dir = await insertDir(flowNo, fromNode.id, toNode.id, toNode.type, toNode.name);
            edge.attr('dataSource', dir);
            await getDirections();
          });

          // graph.value.on('port:change:*', (...args) => {
          //   console.log('port: changes: events: ', args);
          // });

          graph.value.on('node:change:ports', (...args) => {
            console.log('port: changes: events: ', args);
          });

          graph.value.on('edge:connected', async ({ isNew, edge }) => {
            if (!isNew) {
              // 对新创建的边进行插入数据库等持久化操作
              return;
            }
            const { source, target } = edge;
            console.log({ source, target });
            const fromNode = getIdAndType(source['cell']);
            const toNode = getIdAndType(target['cell']);
            if (!fromNode?.id || !toNode?.id) {
              message.error('未找到原始id，连线失败');
              return;
            }
            if (fromNode.type === NodeType.CC || toNode.type === NodeType.CC) {
              //   debugger;
              // 不允许从抄送节点连接出来
              // 如果被连接的是抄送节点, 则必须 来源节点是普通节点，并且这个抄送节点没有被连接
              let enabled = false;
              if (toNode.type === NodeType.CC) {
                enabled = fromNode.type === NodeType.Normal;
              }
              if (!enabled) {
                message.error('抄送节点只能被普通节点连接，不允许连接其他节点');
                edge.remove();
                return;
              }
            }
            // 子流程节点
            if (fromNode.type === NodeType.SubFlowNode || toNode.type === NodeType.SubFlowNode) {
              // 不允许从抄送节点连接出来
              // 如果被连接的是抄送节点, 则必须 来源节点是普通节点，并且这个抄送节点没有被连接
              let enabled = false;
              if (toNode.type === NodeType.SubFlowNode) {
                enabled = fromNode.type === NodeType.Normal;
              }
              if (!enabled) {
                message.error('子流程只能被普通节点连接，不允许连接其他节点');
                edge.remove();
                return;
              }
            }
            const dir = await insertDir(flowNo, fromNode.id, toNode.id, toNode.type, toNode.name, source['port'], target['port']);
            edge.attr('dataSource', dir);
          });
          graph.value.on(
            'cell:change:attrs',
            debounce(async ({ current, previous, cell }) => {
              if (!current?.text) return;
              const id = cell?.attrs?.id;
              if (!id) return;
              const currText = current?.text.text as string;
              const prevText = previous?.text.text as string;
              // 相同不更新
              if (currText === prevText) {
                return;
              }
              const nodeBSEn = new BSEntity('BP.WF.Node', id as unknown as string);
              await nodeBSEn.Retrieve();
              nodeBSEn.setVal('Name', currText);
              await nodeBSEn.Update();
              // 更新方向条件的节点名称
              const relatedEdges = new Directions();
              await relatedEdges.Retrieve('ToNode', id);
              console.log(relatedEdges);
              if (relatedEdges.length > 0) {
                const queue = relatedEdges.map((edge) => {
                  edge.SetValByKey('ToNodeName', currText);
                  return edge.Update();
                });
                await Promise.all(queue);
              }
              // 更新节点表单名称(Sys_MapData)
              const mapDataPKVal = 'ND' + id;
              const mapData = new MapData(mapDataPKVal);
              const i = await mapData.RetrieveFromDBSources();
              if (i > 0) {
                mapData.SetValByKey('Name', currText);
                await mapData.Update();
              }

              selectNode(id as unknown as string);
            }, 100),
          );

          graph.value.on('blank:contextmenu', ({ e }) => {
            const { clientX, clientY } = e;
            graphContextMenu.x = clientX;
            graphContextMenu.y = clientY;
            graphContextMenu.visible = true;
          });

          Events.on('updateLabel', (label: string) => {
            const targetNode = graph.value?.getNodes().find((node) => parseInt(node.attrs?.id as unknown as string) === parseInt(selectedNodeId.value));
            if (!targetNode) return;
            targetNode.attr('text/text', label);
          });
        } catch (e: any) {
          console.error(e.toString());
          message.error('设计器初始化失败');
        } finally {
          loading.value = false;
        }
      };

      const createNodeByMenu = (template, x, y, connect = false) => {
        if (connect) {
          connectAfterCreate = true;
        }
        const newTemp = JSON.parse(JSON.stringify(template));
        delete newTemp.id;
        const graphPoint = graph.value!.clientToLocal(x, y);
        newTemp.x = graphPoint.x;
        newTemp.y = graphPoint.y;
        graph.value?.addNode(newTemp);
      };

      const copyNode = (nodeId) => {
        const nodes = graph.value?.getCells();
        if (!nodes) return;
        let targetNode = nodes.find((nd) => nd.getData().NodeID == nodeId);
        graph.value?.copy([targetNode as any]);
        const distNode = graph.value?.paste({ offset: 32 });
        graph.value?.cleanClipboard();
        setTimeout(() => {
          syncPasteNodeInfo(nodeId, distNode?.[0]?.getData().NodeID);
        }, 500);
      };
      const removeEdge = async () => {
        lineList.value = lineList.value.filter((line) => line.MyPK !== edgeInfo.instance?.attrs?.dataSource?.MyPK) as Directions;
        await deleteDir();
      };
      onMounted(() => {
        initDesigner();
      });
      onUnmounted(() => {
        Events.off('updateLabel');
      });
      return () => (
        <Spin spinning={loading.value}>
          <div class="flow-chart-builder">
            <div class="header">
              <Row style={{ height: '100%' }}>
                <Col span={12}>
                  <div class="flow-title">
                    <img src="/resource/CompanyImgLogo/FlowD.png" height="45px" alt="" />
                    {flowEntity.value.Icon ? <i style="margin-left:12px;margin-right:12px" class={flowEntity.value.Icon}></i> : null}
                    <span>{flowEntity.value.Name}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <FlowToolbar node-list={nodeList} line-list={lineList} label-list={labelList} flow-params={props.params} />
                </Col>
              </Row>
            </div>
            <div class="builder-content">
              {/** <div class="stencil" ref={stencilRef}></div> */}
              {graph.value ? <Features ref={graphFeatures} graph={graph.value} /> : null}
              {/* {graph.value ? <X6Stencil graph={graph.value} /> : null} */}
              <div class="flow-container" ref={flowBuilder}></div>
              {graph.value ? <QuickEditPanel /> : null}
            </div>
            <div class="mini-map" id="mini-map-container"></div>
          </div>
          <Modal
            v-model:open={edgeInfo.visible}
            title={edgeInfo.title}
            onClose={resetModal}
            bodyStyle={modalBodyStyle.value}
            v-slots={{
              footer: () => (
                <div class="footer-buttons">
                  <div class="align-left">
                    <Button style="background: #1890ff; color: white" onClick={setCondition}>
                      方向条件
                    </Button>
                    <Button style="background: #1890ff; color: white" onClick={() => batchSetCondition(edgeInfo.instance as any, flowNo)}>
                      复制条件到其他连接线
                    </Button>
                  </div>
                  <div class="align-right">
                    <Button style="background: #cc5555; color: white" onClick={removeEdge} loading={edgeInfo.delLoading}>
                      删除
                    </Button>
                    <Button onClick={modifyDirLabel} type="primary" loading={edgeInfo.modifyLoading}>
                      保存
                    </Button>
                  </div>
                </div>
              ),
            }}
          >
            <Input v-model:value={edgeInfo.inputVal} placeholder={'提示：此处可以输入连线标签'} />
          </Modal>
          {/** 节点选中菜单 */}
          <X6NodeSelectMenu
            x={nodeSelectMenu.x}
            y={nodeSelectMenu.y}
            visible={nodeSelectMenu.visible}
            onClose={() => {
              nodeSelectMenu.visible = false;
            }}
            onCreateNode={(template, x, y) => createNodeByMenu(template, x, y, true)}
            id={nodeSelectMenu.id}
            name={nodeSelectMenu.name}
            type={nodeSelectMenu.type}
          />
          {/** 节点右键菜单 */}
          <X6NodeContextMenu
            x={nodeContextMenu.x}
            y={nodeContextMenu.y}
            visible={nodeContextMenu.visible}
            onClose={() => {
              nodeContextMenu.visible = false;
            }}
            onDeleteNode={removeNode}
            onUpdateTag={modifyTag}
            onUpdateFwcStatus={updateFWCStatus}
            onUpdateNodeMode={updateNodeMode}
            onCopyNode={copyNode}
            id={nodeContextMenu.id}
            name={nodeContextMenu.name}
            type={nodeContextMenu.type}
            fwStatus={nodeContextMenu.fwStatus}
            mode={nodeContextMenu.mode}
          />
          {/** 画布右键菜单 */}
          <X6GraphMenu
            x={graphContextMenu.x}
            y={graphContextMenu.y}
            visible={graphContextMenu.visible}
            onClose={() => {
              graphContextMenu.visible = false;
            }}
            onCreateNode={(template, x, y) => createNodeByMenu(template, x, y, false)}
          />
        </Spin>
      );
    },
  });
</script>

<style lang="less" scoped>
  .flow-chart-builder {
    width: 100vw;
    height: 100vh;

    .header {
      padding-left: 10px;
      box-sizing: border-box;
      height: 50px;
      line-height: 50px;
      z-index: 3;
      border-bottom: 1px solid #dadce0;
    }

    .builder-content {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
      width: 100%;
      height: calc(100% - 50px);

      .flow-container {
        flex: 1;
        height: 100%;
      }
    }
  }
  :deep(.graph-tag) {
    color: #4e7cba;
    text-align: center;
    background-color: transparent;
    white-space: nowrap;
    font-size: 12px;
  }
  .footer-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  :deep(.x6-edge:hover path:nth-child(2)) {
    stroke: #1890ff;
    stroke-width: 3px;
  }

  :deep(.x6-widget-transform > div) {
    border: 1px solid #239edd;
  }
  :deep(.x6-widget-transform > div:hover) {
    background-color: #3dafe4;
  }
  :deep(.x6-widget-transform-active-handle) {
    background-color: #3dafe4;
  }
  :deep(.x6-widget-transform-resize) {
    border-radius: 0;
  }
  :deep(.x6-widget-transform) {
    margin: -1px 0 0 -1px;
    padding: 0px;
    border: 1px solid #239edd;
  }

  :deep(.x6-widget-selection-box) {
    opacity: 0;
  }

  :deep(.x6-edge-selected path:nth-child(2)) {
    stroke: #1890ff;
    stroke-width: 3px !important;
  }

  .mini-map {
    width: 200px;
    height: 160px;
    position: fixed;
    z-index: 600;
    bottom: 40px;
    right: 60px;
    background-color: white;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

    :deep(.x6-widget-minimap-viewport) {
      border-color: #459dff !important;
    }
  }
  // 确保连线提示不被图表容器遮挡（如需调整层级可修改z-index）
  :deep(.flow-container) {
    position: relative;
    z-index: 1;
  }
</style>
