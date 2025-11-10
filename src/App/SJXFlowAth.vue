<template>
  <div>
    <Row gutter="24">
      <Col :span="2" style="background-color: white">
        <template v-if="SJXTreeData">
          <n-tree
            :show-irrelevant-nodes="true"
            :node-props="nodeProps"
            :default-expanded-keys="defaultExpandedKeys"
            :selected-keys="treeSelectedKeys"
            style="margin-top: 12px; height: calc(100% - 50px); min-width: 200px"
            :filter="treeFilterAction"
            :pattern="treeFilterPattern"
            :virtual-scroll="true"
            :data="SJXTreeData"
            block-line
            @update:selected-keys="handleSelected"
          />
        </template>
      </Col>
      <Col :span="22">
        <iframe :src="flowUrl" scrolling="auto" frameborder="no" style="width: 100%; height: 100vh"></iframe>
      </Col>
    </Row>
  </div>
</template>
<script lang="ts" setup>
  import { nextTick, ref, h } from 'vue';
  import { Row, Col } from 'ant-design-vue';
  import WebUser from '/@/bp/web/WebUser';
  import { debounce } from 'lodash-es';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRoute } from 'vue-router';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { NTree, TreeOption, DropdownOption, NIcon } from 'naive-ui';
  import { DownloadOutlined } from '@ant-design/icons-vue';
  import { downloadByUrl } from '/@/utils/file/download';

  // 获取左侧树结构
  const { listToTree } = useTreeConvert();

  //默认展开的节点
  const defaultExpandedKeys = ref<string[]>([]);
  const expandedRowKeys = ref<string[]>([]);
  // 树查询变量
  const treeFilterPattern = ref('');
  const treeData = ref<TreeOption[]>();
  const treeSelectedKeys = ref<string[]>([]);
  //左边树查询变量
  const SJXTreeData = ref<TreeOption[]>();

  // 树节点事件
  const currentActiveKey = ref('');
  //SAAS模式组织编号
  const currentActiveOrgNo = ref('');
  // 处理右键菜单事件
  let activeTreeNode: any = null;
  let activeTreeItemId: any = null;
  let inSearchMode = false;
  // 表格数据源
  const dataSource = ref<Recordable[]>([]);
  // 原始数据源，处理节点内搜索
  const originDataSource = ref<Recordable[]>([]);
  //过滤admin数组
  const ensData = ref();
  //从表分组
  const dtlEnsGroupFields = ref<string[]>([]); //分组集合
  const defaultGroupField = ref('');
  // 树右键菜单
  //下拉菜单添加icon
  const renderIcon = (icon: String) => {
    return () =>
      h(NIcon, {
        class: icon,
      });
  };
  // 菜单
  let optionsRef = ref<DropdownOption[]>([
    {
      label: '下载',
      key: 'create-sub-level',
      icon: renderIcon('icon-arrow-down-circle'),
    },
  ]);
  //点击节点时
  const handleSelected = (keys, option, meta, action) => {
    console.log('Node Expanded', keys);
    console.log('Node Expanded', option);
    console.log('Node Expanded', meta);
    console.log('Node Expanded', action);
    if (meta.action.includes('select')) {
      const row = meta.node;
      flowUrl.value = '/index.html#/WF/FlowAth?pageView=MyView&FK_Flow=' + row.FlowNo + '&WorkID=' + row.OID + '&IsReadonly=1';
    }
  };
  const loading = ref(false);
  const route = useRoute();
  const FK_Flow = ref();
  const pageView = ref();
  const WorkID = ref();
  const flowUrl = ref();
  const SJX = ref();
  const InitPage = async () => {
    FK_Flow.value = route.query?.FK_Flow;
    pageView.value = route.query?.pageView;
    WorkID.value = route.query?.WorkID;
    SJX.value = route.query?.SJX;
    const handler = new HttpHandler('bp.App.Handler.DJXXHandler');
    handler.AddPara('SJX', SJX.value);
    const data = await handler.DoMethodReturnJson('getDJTree');
    renderSJXTree(data);
  };
  InitPage();
  const treeFilterAction = (keyword: string, node: any) => {
    if (keyword.trim() === '') return true;
    return node.Name.includes(keyword);
  };

  const nodeProps = ({ option }: { option: TreeOption }) => {
    return {
      onClick: async () => {
        currentActiveOrgNo.value = option.OrgNo as string;
        currentActiveKey.value = option.key as string;
        treeSelectedKeys.value = [option.key as string];
        inSearchMode = false; // 关闭查找模式
        expandedRowKeys.value = [];
      },
      onmouseenter: debounce(() => {
        activeTreeItemId = option.key;
      }, 50),
      onmouseleave: () => {
        activeTreeItemId = null;
      },
      onContextmenu(e: MouseEvent): void {
        activeTreeNode = option;
        e.preventDefault();
      },
    };
  };

  // 渲染左侧单据树
  const renderSJXTree = (TreeEns) => {
    const treeEns = TreeEns?.map((item): Recordable => {
      const row = item;
      return {
        ...row,
        key: item.No,
        label: item.Name,
        isLeaf: false,
        children: [],
      };
    });

    treeEns?.forEach((tEns) => {
      if (!!tEns.Icon) {
        tEns.prefix = () =>
          h(
            'i',
            {
              class: tEns.Icon,
            },
            '',
          );
      } else {
        tEns.prefix = () =>
          h(NIcon, null, {
            default: () =>
              h('i', {
                class: tEns.AthType == 'ment' ? 'icon-folder-alt' : 'icon-doc',
                style: tEns.AthType == 'ment' ? 'color: #faad14' : '',
              }),
          });
      }
    });

    treeEns?.forEach((te) => {
      if (te.AthType === 'mentdb') {
        te.suffix = () => [
          h(
            NIcon,
            {
              style: {
                width: '20px',
                opacity: activeTreeItemId == te.key ? '1' : '0',
              },
              onclick: (e) => {
                activeTreeNode = te;
                e.preventDefault();
                nextTick().then(() => {
                  const url = ref('');
                  const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
                  const apiPath = '/WF/Comm/ProcessRequest';
                  url.value =
                    prefix +
                    apiPath +
                    '?DoType=HttpHandler&DoMethod=AttachmentUpload_Down&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&WorkID=' +
                    WorkID.value +
                    '&MyPK=' +
                    te.key +
                    '&Token=' +
                    WebUser.Token;
                  downloadByUrl({ url: url.value });
                });
              },
            },
            { default: () => h(DownloadOutlined) },
          ),
        ];
      }
    });

    SJXTreeData.value = listToTree('0', treeEns || [], false);
    defaultExpandedKeys.value.push('SJX');
  };
</script>
<style lang="less" scoped></style>
