<template>
  <div>
    <Row gutter="24">
      <Col :span="16">
        <iframe :src="flowUrl" scrolling="auto" frameborder="no" style="width: 100%; height: 100vh"></iframe>
      </Col>
      <Col :span="8" style="background-color: white">
        <template v-if="treeData">
          <n-tree
            :show-irrelevant-nodes="true"
            :node-props="nodeProps"
            :default-expanded-keys="defaultExpandedKeys"
            style="margin-top: 12px; height: calc(100% - 50px); min-width: 200px"
            :filter="treeFilterAction"
            :pattern="treeFilterPattern"
            :virtual-scroll="true"
            :data="treeData"
            :selected-keys="treeSelectedKeys"
            block-line
          />
          <NDropdown
            trigger="manual"
            placement="bottom-start"
            :show="showDropdownRef"
            :options="optionsRef"
            :x="xRef"
            :y="yRef"
            @select="handleSelect"
            @clickoutside="handleClickOutside"
          />
        </template>
      </Col>
    </Row>
  </div>
</template>
<script lang="ts" setup>
  import { nextTick, onMounted, reactive, ref, h, shallowRef, unref, computed, onUnmounted } from 'vue';
  import { Row, Col } from 'ant-design-vue';
  import WebUser from '/@/bp/web/WebUser';
  import { debounce } from 'lodash-es';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRoute } from 'vue-router';
  import { Folder, FolderOpenOutline } from '@vicons/ionicons5';
  import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import {
    NTree,
    NInput,
    NDataTable,
    TreeOption,
    NSelect,
    NInputGroup,
    NConfigProvider,
    DataTableColumns,
    DataTableRowKey,
    DropdownOption,
    NDropdown,
    NIcon,
    NAvatar,
  } from 'naive-ui';
  import { message } from 'ant-design-vue';
  import {
    FolderOpenOutlined,
    FileOutlined,
    LeftOutlined,
    UploadOutlined,
    CloseCircleOutlined,
    FileSearchOutlined,
    ColumnHeightOutlined,
    MenuOutlined,
    DownloadOutlined,
    EyeOutlined,
  } from '@ant-design/icons-vue';
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
    // {
    //   label: '查看', // 标签
    //   key: 'create-same-level', // key - 要求唯一
    //   icon: renderIcon('icon-eye'), // 图标，选填
    // },
    {
      label: '下载',
      key: 'create-sub-level',
      icon: renderIcon('icon-arrow-down-circle'),
    },
  ]);
  const showDropdownRef = ref(false);
  const xRef = ref(0);
  const yRef = ref(0);
  // 处理右键菜单事件
  const handleSelect = async (evtName: string) => {
    switch (evtName) {
      case 'create-same-level': // 根据key处理菜单事件
        await enInst.value?.Node_CreateSameLevelNode(activeTreeNode.No, activeTreeNode);
        await enInst?.value?.Init();
        renderTree(enInst.value as PageBaseTreeEns);
        break;
      case 'create-sub-level': //下载
        const url = ref('');
        const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
        const apiPath = '/WF/Comm/ProcessRequest';
        url.value =
          prefix +
          apiPath +
          '?DoType=HttpHandler&DoMethod=AttachmentUpload_Down&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&WorkID=' +
          WorkID.value +
          '&MyPK=' +
          activeTreeNode.No +
          '&Token=';
        WebUser.Token;
        downloadByUrl({ url: url.value });
        break;
    }
    activeTreeNode = null;
    showDropdownRef.value = false;
  };
  const handleClickOutside = () => {
    showDropdownRef.value = false;
  };
  const loading = ref(false);
  const enInst = ref<PageBaseTreeEns>();

  const route = useRoute();
  const FK_Flow = ref();
  const pageView = ref();
  const WorkID = ref();
  const flowUrl = ref();
  const athUrl = ref();
  const InitPage = async () => {
    FK_Flow.value = route.query?.FK_Flow;
    pageView.value = route.query?.pageView;
    WorkID.value = route.query?.WorkID;
    const handler = new HttpHandler('bp.App.Handler.AppHandler');
    handler.AddPara('OID', WorkID.value);
    const data = await handler.DoMethodReturnJson('getAthTree');
    renderTree(data);
    flowUrl.value = '/index.html#/WF/MyView?FK_Flow=' + FK_Flow.value + '&WorkID=' + WorkID.value + '&IsReadonly=0';
    athUrl.value = '/index.html#/WF/MyView?FK_Flow=' + FK_Flow.value + '&WorkID=' + WorkID.value + '&IsReadonly=0';
  
  };
  InitPage();
  const treeFilterAction = (keyword: string, node: any) => {
    if (keyword.trim() === '') return true;
    return node.Name.includes(keyword);
  };
  const updatePrefix = (
    _keys: Array<string | number>,
    _option: Array<TreeOption | null>,
    meta: {
      node: TreeOption | null;
      action: 'expand' | 'collapse' | 'filter';
    },
  ) => {
    if (!meta.node) return;
    if (meta.node.Icon) {
      meta.node.prefix = () =>
        h(
          'i',
          {
            class: meta.node?.Icon,
          },
          '',
        );
      return;
    }
    switch (meta.action) {
      case 'expand':
        meta.node.prefix = () =>
          h(NIcon, null, {
            default: () => h(FolderOpenOutline),
          });
        break;
      case 'collapse':
        meta.node.prefix = () =>
          h(NIcon, null, {
            default: () => h(Folder),
          });
        break;
    }
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
        showDropdownRef.value = false;
        nextTick().then(() => {
          if (option.AthType === 'ment') showDropdownRef.value = false;
          else showDropdownRef.value = true;
          xRef.value = e.clientX;
          yRef.value = e.clientY;
        });
      },
    };
  };
  // 渲染树
  const renderTree = (TreeEns) => {
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
          // h(
          //   NIcon,
          //   {
          //     style: {
          //       width: '20px',
          //       opacity: activeTreeItemId == te.key ? '1' : '0',
          //     },
          //     onclick: (e) => {
          //       activeTreeNode = te;
          //       e.preventDefault();
          //       showDropdownRef.value = false;
          //       nextTick().then(() => {
          //         alert('查看');
          //         xRef.value = e.clientX;
          //         yRef.value = e.clientY;
          //       });
          //     },
          //   },
          //   { default: () => h(EyeOutlined) },
          // ),
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
                showDropdownRef.value = false;
                nextTick().then(() => {
                  xRef.value = e.clientX;
                  yRef.value = e.clientY;
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

    treeData.value = listToTree('001', treeEns || [], false);
    defaultExpandedKeys.value.push('001');
  };
</script>
<style lang="less" scoped></style>
