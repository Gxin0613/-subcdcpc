<script lang="tsx">
  import { computed, defineComponent, h, inject, ref, StyleValue, watch } from 'vue';
  import { flowEntityKeys } from '/@flow/utils/keys';
  import { ProvideFlowInfo } from '/@flow/FlowAttr';
  import { FlowDevModel } from '/@/WF/Admin/EnumLab';
  import { NDropdown, NIcon } from 'naive-ui';
  import { NodeType, userNodes } from '/@flow/config/x6Shapes';
  import { Spin } from 'ant-design-vue';
  import {
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    InfoCircleOutlined,
    LockOutlined,
    PartitionOutlined,
    UnorderedListOutlined,
    UserSwitchOutlined,
    CheckSquareOutlined,
    NodeIndexOutlined,
    ArrowRightOutlined,
    BranchesOutlined,
    FormOutlined,
  } from '@ant-design/icons-vue';
  import Events from '/@/utils/Events';
  import { Node } from '/@/WF/TSClass/Node';
  import { FrmNode } from '/@/WF/Admin/AttrNode/FrmSln/FrmNode';
  import BSEntity from '/@/utils/gener/BSEntity';
  import GloFrm from '/@/WF/Admin/FrmLogic/GloFrm';
  import { CSOptions, StatusDef, checkStatus } from '../config/x6Config';
  import { message } from 'ant-design-vue';
  import { Directions } from '../../Cond2020/Direction';
  import { FormSlnType } from '../../AttrNode/EnumLab';
  // import { CSOptions, StatusDef } from '/@flow/config/typeDef';
  // import { message } from 'ant-design-vue';

  export default defineComponent({
    name: 'X6Contextmenu',
    props: {
      x: Number,
      y: Number,
      visible: Boolean,
      id: String,
      name: String,
      type: Number,
      fwStatus: Number,
      mode: Number,
    },
    emits: ['click-outside', 'close', 'delete-node', 'update-node-mode', 'update-tag', 'update-fwc-status', 'copy-node'],
    setup(props, ctx) {
      const { flowEntity } = inject(flowEntityKeys) as ProvideFlowInfo;
      const nodeDFomVisible = computed(() => {
        const visibleStatus = [FlowDevModel.JiJian, FlowDevModel.RefOneFrmTree];
        return !visibleStatus.includes(flowEntity.value.FlowDevModel);
      });

      const loadingMenu = ref(true);
      const fwStatus = ref(props.fwStatus);
      const directions = new Directions();

      const options = ref<any>([]);
      watch(
        () => props.visible,
        async (visible) => {
          if (visible) {
            try {
              loadingMenu.value = true;
              options.value = await buildContextMenu(props.id!, props.name!, props.type!);
            } catch (e) {
              message.error('加载菜单失败，请联系管理员');
              options.value = [];
            }
          } else {
            options.value = [];
          }
        },
      );
      const checkItemVisible = computed(() => flowEntity.value.FlowDevModel === FlowDevModel.JiJian);
      const isBindMultiFormMode = computed(() => {
        return flowEntity.value.FlowDevModel === FlowDevModel.FrmTree;
      });
      const getCheckStatusById = (id: number) => {
        return checkStatus.find((cs) => cs.id === id)?.name || '未知';
      };
      const changeCheckStatus = async (statusObj: StatusDef) => {
        try {
          const { id = '', name } = props;
          const status = statusObj.id;
          const nodeEn = new BSEntity('BP.WF.Node', id);
          await nodeEn.Init();
          await nodeEn.Retrieve();
          console.log({ nodeEn });
          // 如果是开始节点
          /*if (id.endsWith('01')) {
            // nodeEn.FWCSta = CSOptions.Readonly; //只读
            nodeEn.FWCSta = status; //
            await nodeEn.Update();
            ctx.emit('update-fwc-status', id, status);
            message.info('更新成功: 审核组件 - ' + statusObj.name);
            //message.warn('开始节点审核组件状态必须为 只读 ,并且不能修改.');
            return;
          }*/
          if (status === CSOptions.BatchSet) {
            Events.emit('openDrawer', {
              type: 'DtlBatch',
              title: name + ' - 审核状态批量设置',
              props: {
                EnName: 'TS.WF.NodeBatch',
                FK_Flow: flowEntity?.value.PKVal,
              },
            });
            return;
          }
          if (status === CSOptions.Attribute) {
            Events.emit('openDrawer', {
              EnName: 'TS.WF.Template.NodeWorkCheck',
              PKVal: id,
              NodeID: id,
              title: name + ' - 组件属性',
              type: 'entity',
              expand: false,
              basicInfoVisible: true,
            });
            return;
          }
          if (status === CSOptions.Assist) {
            window.open('https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3982370&doc_id=31094');
            return;
          }

          nodeEn.FWCSta = status;
          await nodeEn.Update();
          ctx.emit('update-fwc-status', id, status);
          if (checkItemVisible.value) {
            const _pk = nodeEn.NodeFrmID + '_' + nodeEn.NodeID + '_' + nodeEn.FK_Flow;
            const frmNode = new BSEntity('BP.WF.Template.FrmNode', _pk);
            await frmNode.Init();
            //await frmNode.Retrieve();
            const res = await frmNode.RetrieveFromDBSources();
            if (res == 1) {
              frmNode.IsEnableFWC = status;
              await frmNode.Update();
            }
          }
          message.info('更新成功: 审核组件 - ' + statusObj.name);
        } catch (e: any) {
          message.error(e.toString());
        }
      };
      const handleDropdownSelect = async (_, item) => {
        await item.onClick();
        ctx.emit('close');
      };

      const getNodeType = (typeId: number) => {
        return userNodes.find((node) => node.attrs.typeInfo.mode == typeId)?.label + '节点' || '未知类型';
      };
      const loadStatus = async (nodeId: string, name: string, nodeType: NodeType) => {
        await directions.Retrieve('Node', nodeId);
        const node = new Node();
        node.setPKVal(nodeId);
        await node.RetrieveFromDBSources();
        if (node.FWCSta != props.fwStatus) {
          ctx.emit('update-fwc-status', nodeId, node.FWCSta);
        }
        fwStatus.value = node.FWCSta;
        // 更新方向条件菜单
        const dirMenu = options.value.find((item: any) => item.key === 'dir-condition');
        if (dirMenu) {
          dirMenu.children = [
            ...directions
              .filter((dir) => dir.NodeType == 0) // 过滤非普通节点
              .map((dir) => {
                return {
                  label: `${dir.ToNode}.${dir.ToNodeName}`,
                  icon: () => {
                    return h(NIcon, null, {
                      default: () => h(ArrowRightOutlined),
                    });
                  },
                  key: dir.MyPK,
                  onClick: () => {
                    const title = `${dir.Node} -> ${dir.ToNode} 方向条件设置`;
                    Events.emit('openDrawer', {
                      EnName: 'TS.WF.Cond',
                      PKVal: dir.MyPK,
                      NodeID: dir.MyPK,
                      title,
                      type: 'DtlSearch',
                      expand: false,
                      basicInfoVisible: true,
                    });
                  },
                };
              }),
            {
              label: '转向规则',
              icon: () => {
                return h(NIcon, null, {
                  default: () => h(BranchesOutlined),
                });
              },
              key: 'turn-rule',
              onClick: () => {
                Events.emit('openDrawer', {
                  EnName: 'GPE_CondModel',
                  PKVal: nodeId,
                  NodeID: nodeId,
                  title: props.name + ' - 转向规则',
                  type: 'GPE',
                  expand: true,
                  basicInfoVisible: false,
                });
              },
            },
            // {
            //   label: '优先级',
            //   icon: () => {
            //     return h(NIcon, null, {
            //       default: () => h(BranchesOutlined),
            //     });
            //   },
            //   key: 'turn-PRI',
            //   onClick: () => {
            //     Events.emit('openDrawer', {
            //       EnName: 'TS.WF.NodeDir',
            //       PKVal: nodeId,
            //       NodeID: nodeId,
            //       title: props.name + ' - 优先级',
            //       type: 'entity',
            //       expand: true,
            //       basicInfoVisible: false,
            //     });
            //   },
            // },
          ];
        }
        // 更新审核组件状态菜单
        const fwsMenu = options.value.find((item: any) => item.key === 'fw-status');
        if (fwsMenu) {
          fwsMenu.children = checkStatus.map((fws) => {
            return {
              label: fws.name,
              icon: () => {
                return h(NIcon, null, {
                  default: () => h(fws.icon),
                });
              },
              key: fws.id,
              onClick: () => {
                changeCheckStatus(fws);
              },
            };
          });
        }
        if (NodeType.Route === nodeType) {
          options.value = [
            ...directions.map((dir) => {
              return {
                label: `到达${dir.ToNode}.${dir.ToNodeName}条件`,
                icon: () => {
                  return h(NIcon, null, {
                    default: () => h(ArrowRightOutlined),
                  });
                },
                key: dir.MyPK,
                onClick: () => {
                  const title = `${dir.Node} -> ${dir.ToNode} 方向条件设置`;
                  Events.emit('openDrawer', {
                    EnName: 'TS.WF.Cond',
                    PKVal: dir.MyPK,
                    NodeID: dir.MyPK,
                    title,
                    type: 'DtlSearch',
                    expand: false,
                    basicInfoVisible: true,
                  });
                },
              };
            }),
            {
              label: '复制节点',
              icon() {
                return h(NIcon, null, {
                  default: () => h(CopyOutlined),
                });
              },
              key: 'copy-node',
              onClick: () => {
                ctx.emit('copy-node', nodeId);
              },
            },
            {
              label: '转向规则',
              icon: () => {
                return h(NIcon, null, {
                  default: () => h(BranchesOutlined),
                });
              },
              key: 'turn-rule',
              onClick: () => {
                Events.emit('openDrawer', {
                  EnName: 'GPE_CondModel',
                  PKVal: nodeId,
                  NodeID: nodeId,
                  title: name,
                  type: 'GPE',
                  expand: true,
                  basicInfoVisible: false,
                });
              },
            },
            {
              label: '优先级',
              icon: () => {
                return h(NIcon, null, {
                  default: () => h(BranchesOutlined),
                });
              },
              key: 'turn-PRI',
              onClick: () => {
                Events.emit('openDrawer', {
                  EnName: 'TS.WF.Template.NodeDir',
                  PKVal: nodeId,
                  NodeID: nodeId,
                  title: name,
                  type: 'entity',
                  expand: true,
                  basicInfoVisible: false,
                });
              },
            },
            {
              label: '删除节点',
              icon() {
                return h(NIcon, null, {
                  default: () => h(DeleteOutlined),
                });
              },
              key: 'del-node',
              onClick: () => {
                ctx.emit('delete-node', nodeId, nodeType);
              },
            },
          ];
        }
        loadingMenu.value = false;
      };
      const buildContextMenu = (id: string, name: string, nodeType: NodeType) => {
        loadStatus(id, name, nodeType);
        if (nodeType === NodeType.Normal) {
          const result: any = [
            {
              label: '节点属性',
              icon() {
                return h(NIcon, null, {
                  default: () => h(InfoCircleOutlined),
                });
              },
              key: 'node-info',
              onClick: () => {
                Events.emit('openDrawer', {
                  EnName: 'TS.WF.Template.NodeExt',
                  PKVal: id,
                  NodeID: id,
                  title: name + ' - 节点属性',
                  type: 'entity',
                  expand: false,
                  basicInfoVisible: true,
                });
              },
            },
          ];
          if (nodeDFomVisible.value) {
            result.push(
              {
                label: '表单方案',
                icon() {
                  return h(NIcon, null, {
                    default: () => h(FormOutlined),
                  });
                },
                key: 'form-case',
                onClick: () => {
                  Events.emit('openDrawer', {
                    EnName: 'GPE_FrmSln',
                    PKVal: id,
                    NodeID: id,
                    title: name + ' - 表单方案',
                    type: 'GPE',
                    expand: false,
                    basicInfoVisible: true,
                  });
                },
              },
              {
                label: '设计表单',
                icon() {
                  return h(NIcon, null, {
                    default: () => h(EditOutlined),
                  });
                },
                key: 'form-design',
                onClick: async () => {
                  const nodeId = props.id;
                  const nodeEn = new BSEntity('BP.WF.Node', nodeId);
                  await nodeEn.Init();
                  await nodeEn.Retrieve();
                  const frmID = 'ND' + nodeId;
                  await GloFrm.CheckForm(frmID);
                  const pathname = window.location.pathname;
                  Events.emit('openDrawer', {
                    type: 'iframe',
                    title: frmID + ',' + nodeEn.FlowName,
                    expand: false,
                    basicInfoVisible: true,
                    width: window.innerWidth * 0.9 + 'px',
                    url: pathname + `#/WF/Designer/Form?FrmID=${frmID}&FlowNo=${nodeEn.FK_Flow}&NodeID=${nodeEn.NodeID}&FK_MapData=ND${nodeEn.NodeID}`,
                  });
                },
              },
            );
          }

          if (isBindMultiFormMode.value) {
            result.push({
              label: '绑定多表单',
              icon() {
                return h(NIcon, null, {
                  default: () => h(UnorderedListOutlined),
                });
              },
              key: 'bind-multi-form',
              onClick: () => {
                Events.emit('openDrawer', {
                  EnName: 'TS.AttrNode.Sln5',
                  PKVal: id,
                  NodeID: id,
                  title: name + ' - 绑定多表单',
                  type: 'entity',
                  expand: false,
                  basicInfoVisible: true,
                });
              },
            });
          } else {
            result.push({
              label: '表单权限',
              icon() {
                return h(NIcon, null, {
                  default: () => h(LockOutlined),
                });
              },
              key: 'permission',
              onClick: async () => {
                const node = new Node();
                node.NodeID = parseInt(id as string);
                await node.Retrieve();
                if (node.FormType == FormSlnType.SelfForm || node.FormType == FormSlnType.SDKForm) {
                  let formMode = '';
                  switch (node.FormType) {
                    case FormSlnType.FoolForm:
                      formMode = '经典表单';
                      break;
                    case FormSlnType.SelfForm:
                      formMode = '嵌入式表单';
                      break;
                    case FormSlnType.SDKForm:
                      formMode = 'SDK表单';
                      break;
                    default:
                      break;
                  }
                  message.info('表单方案为' + formMode + ',不能设置表单权限');
                  return;
                }
                //表单节点关系.
                const fn = new FrmNode();
                if (!node.NodeFrmID) node.NodeFrmID = 'ND' + id;

                fn.MyPK = node.NodeFrmID + '_' + node.NodeID + '_' + node.FK_Flow;
                if (node.FormType == FormSlnType.EntityTS) fn.MyPK = node.FormUrl + '_' + node.NodeID + '_' + node.FK_Flow;
                const num = await fn.RetrieveFromDBSources();
                if (num == 0) {
                  fn.FK_Frm = node.NodeFrmID;
                  fn.FK_Node = node.NodeID;
                  fn.FK_Flow = node.FK_Flow;
                  await fn.Insert();
                }
                //打开.
                Events.emit('openDrawer', {
                  EnName: 'TS.AttrNode.FrmNode11',
                  PKVal: fn.MyPK,
                  NodeID: fn.MyPK,
                  title: name + ' - 表单权限',
                  type: 'entity',
                  expand: false,
                  basicInfoVisible: true,
                });
              },
            });
          }
          // 节点类型切换
          result.push({
            label: getNodeType(props.mode!) + ' : ' + props.id,
            icon: () => {
              return h(NIcon, null, {
                default: () => h(NodeIndexOutlined),
              });
            },
            key: 'change-node-mode',
            onClick: () => {},
            children: userNodes.map((userNode) => {
              return {
                label: userNode.label,
                icon: null,
                key: userNode.id,
                onClick: async () => {
                  try {
                    const mode = userNode.attrs.typeInfo.mode;
                    const nodeEntity = new BSEntity('BP.WF.Node', props.id!);
                    await nodeEntity.Init();
                    nodeEntity.RunModel = mode; //运行模式.
                    await nodeEntity.Update(); //执行更新.
                    message.info('节点模式更新成功.');
                    ctx.emit('update-node-mode', props.id, mode);
                  } catch (e: any) {
                    message.error(e.toString());
                  }
                },
              };
            }),
          });
          // 极简模式 - 审核组件状态
          if (checkItemVisible.value) {
            result.push({
              // label: '审核组件 - ' + getCheckStatusById(props.fwStatus!),
              label: () => <Spin spinning={loadingMenu.value}>{loadingMenu.value ? 'loading' : '审核 - ' + getCheckStatusById(fwStatus.value!)}</Spin>,
              icon: () => (
                <NIcon>
                  <CheckSquareOutlined />
                </NIcon>
              ),
              key: 'fw-status',
              onClick: () => void 0,
              children: [],
            });
          }
          result.push(
            {
              label: id.endsWith('01') ? '设置发起人' : '设置接收人',
              icon: () => {
                return h(NIcon, null, {
                  default: () => h(UserSwitchOutlined),
                });
              },
              key: 'set-starter',
              onClick: () => {
                // const title = name + ' - ' + id.endsWith('01') ? '设置发起人' : '设置接收人';
                Events.emit('openDrawer', {
                  type: 'GPE',
                  EnName: 'GPE_AccepterRole',
                  PKVal: id,
                  NodeID: id,
                  title: name + ' - ' + (id.endsWith('01') ? '设置发起人' : '设置接收人'),
                  expand: false,
                  basicInfoVisible: true,
                });
              },
            },
            {
              label: '节点事件',
              icon() {
                return h(NIcon, null, {
                  default: () => h(CopyOutlined),
                });
              },
              key: 'node-event',
              onClick: () => {
                Events.emit('openDrawer', {
                  EnName: 'GL_Event',
                  PKVal: id,
                  NodeID: id,
                  title: name + ' - 节点事件',
                  type: 'NodeEvent',
                  expand: false,
                  basicInfoVisible: true,
                });
              },
            },

            {
              label: () => <Spin spinning={loadingMenu.value}>{loadingMenu.value ? 'loading' : '方向条件'}</Spin>,
              icon: () => (
                <NIcon>
                  <PartitionOutlined />
                </NIcon>
              ),
              key: 'dir-condition',
              children: [],
              onClick: () => void 0,
            },
            {
              label: '复制节点',
              icon() {
                return h(NIcon, null, {
                  default: () => h(CopyOutlined),
                });
              },
              key: 'copy-node',
              onClick: () => {
                ctx.emit('copy-node', id);
              },
            },
            {
              label: '删除节点',
              icon() {
                return h(NIcon, null, {
                  default: () => h(DeleteOutlined),
                });
              },
              key: 'del-node',
              onClick: () => {
                if (id.endsWith('01')) {
                  message.error('开始节点不允许删除');
                  return;
                }
                ctx.emit('delete-node', id, nodeType);
              },
            },
          );
          return result;
        }
        if (nodeType === NodeType.Route) {
          return [
            {
              label: () => (
                <Spin spinning={loadingMenu.value}>
                  <div style={{ width: '120px' } as StyleValue}> loading </div>
                </Spin>
              ),
            },
          ];
        }
        const typeText = {
          [NodeType.Tag]: '编辑标签',
          [NodeType.Route]: '方向条件',
          [NodeType.CC]: '抄送属性',
          [NodeType.SubFlowNode]: '节点属性',
        };
        return [
          {
            label: typeText[nodeType] || '节点属性',
            icon() {
              return h(NIcon, null, {
                default: () => h(InfoCircleOutlined),
              });
            },
            key: 'node-info',
            onClick: () => {
              if (nodeType === NodeType.Tag) {
                ctx.emit('update-tag', id);
                return;
              }
              let enName = 'TS.WF.NodeDir';
              if (nodeType === NodeType.CC) {
                enName = 'TS.AttrNode.CCNode';
              }
              if (nodeType === NodeType.SubFlowNode) {
                enName = 'TS.WF.Template.FrmSubFlow';
              }
              Events.emit('openDrawer', {
                EnName: enName,
                PKVal: id,
                NodeID: id,
                title: name,
                type: 'entity',
                expand: true,
                basicInfoVisible: false,
              });
            },
          },
          {
            label: '复制节点',
            icon() {
              return h(NIcon, null, {
                default: () => h(CopyOutlined),
              });
            },
            key: 'copy-node',
            onClick: () => {
              ctx.emit('copy-node', id);
            },
          },
          {
            label: '删除节点',
            icon() {
              return h(NIcon, null, {
                default: () => h(DeleteOutlined),
              });
            },
            key: 'del-node',
            onClick: () => {
              ctx.emit('delete-node', id, nodeType);
            },
          },
        ];
      };
      return () => (
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
      );
    },
  });
</script>

<style scoped lang="less"></style>
