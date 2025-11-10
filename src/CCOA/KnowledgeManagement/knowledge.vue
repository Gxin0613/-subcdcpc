<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <div>
      <div class="know-all-cont">
        <!-- 左侧目录树结构 -->
        <div class="know-side">
          <div class="know-side-nav">
            <!-- 标题/返回键 -->
            <div><i class="icon-home"></i>{{ cateinfoData?.Title }}</div>
            <!-- <i class="icon-action-undo" @click="goback"></i> -->
          </div>
          <div class="know-side-menu">
            <div class="menu-system sideHover">
              <div>
                <i class="icon-layers">目录</i>
              </div>
              <Dropdown :trigger="['click']">
                <i class="icon-plus" @click="cateShow = true"></i>
                <template #overlay>
                  <Menu>
                    <MenuItem v-for="sysItem in systemNodeItems" :key="sysItem.id" @click="handleMenuClick(sysItem)">
                      <div v-html="sysItem?.title"></div>
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </div>
            <!-- 树渲染 -->
            <div class="menu-list">
              <n-tree
                :show-irrelevant-nodes="true"
                :node-props="nodeProps"
                style="margin-top: 12px; height: calc(100% - 50px); min-width: 200px"
                :filter="treeFilterAction"
                :pattern="treeFilterPattern"
                :virtual-scroll="true"
                :data="TreeData"
                :selected-keys="treeSelectedKeys"
                block-line
              />

              <div class="ath-info" @click="openAth">
                <span><i class="icon-docs"></i> 附件</span>
              </div>
              <!-- <div>
                <span> <DeleteOutlined /> 最近删除</span>
              </div> -->
            </div>
          </div>
        </div>
        <!-- 右侧文档内容 -->
        <div class="know-page-main">
          <!-- 目录 -->
          <div v-if="flieType == 1">
            <div class="nav">
              <div class="nav-left">
                <div> {{ treeSelectedInfo.Name }}</div>
                <!-- <div class="gray">管理员 创建于{{ 'xxxxxx' }}</div> -->
              </div>
              <div class="nav-right" style="color: red" @click.stop="handleDeleteClick(treeSelectedInfo)"> <DeleteOutlined />删除 </div>
            </div>
            <div class="cate-info">
              <FolderOpenOutline style="width: 25px" /> <span>{{ treeSelectedInfo.Name }}</span></div
            >
            <div class="cate-info-cont">
              <Tabs v-model:activeKey="activeKey">
                <TabPane key="1" tab="全部文档">
                  <List bordered :data-source="treeSelectedInfo?.children">
                    <template #renderItem="{ item }">
                      <ListItem>
                        <div class="list-item" @click="selectFileInfo(item)">
                          <span><FileOutlined />{{ item.Name }}</span>
                          <span>创建于{{ item.RDT }} </span>
                        </div>
                      </ListItem>
                    </template>
                  </List>
                </TabPane>
                <!-- <TabPane key="2" tab="我关注的">Content of Tab Pane 2</TabPane> -->
              </Tabs>
            </div>
          </div>
          <!-- 文件 -->
          <div v-if="flieType == 2">
            <div class="nav">
              <div class="nav-left">
                <div> {{ treeSelectedInfo.Name }}</div>
                <div class="gray">管理员 创建于{{ treeSelectedInfo.RDT }}</div>
              </div>
              <div class="nav-right">
                <span class="cate-btn" @click="openTinymce(treeSelectedInfo)"><EditOutlined />编辑</span>
                <span class="delete-btn" @click="handleDeleteClick(treeSelectedInfo)"><DeleteOutlined />删除</span>
              </div>
            </div>
            <div class="cate-info"> {{ treeSelectedInfo.Name }}</div>
            <div class="cate-info-cont">
              <div v-html="treeSelectedInfo?.Doc || treeSelectedInfo?.Docs" class="html-field"></div>
            </div>
          </div>
          <template v-if="AthShow">
            <Card style="width: 100%" :tab-list="tabListNoTitle" :active-tab-key="noTitleKey">
              <template v-for="db in athList" :key="db.MyPK">
                <div class="db-list">
                  <Tooltip :title="db.FileName">
                    <p class="db-file">{{ db.FileName }}</p>
                  </Tooltip>
                  <div class="db-file-info">
                    <span>文件大小：{{ db.FileSize }}KB</span>
                    <span class="db-info-fun">
                      <span @click="dbDownload(db)">下载</span>
                      <span style="color: red" @click="dbDel(db)">删除</span>
                    </span>
                  </div>
                </div>
              </template>
            </Card>
          </template>
        </div>
      </div>
      <Modal v-model:open="modalInfo.visible" :title="modalInfo.title" :width="modalInfo.width" :body-style="modalInfo.body" @ok="handleOk">
        <div v-if="modalInfo.type == 'Ath'" style="padding: 10px">
          <!-- @change="handleChange" -->
          <Upload v-model:file-list="dbList" :action="actionURL" :customRequest="customRequest" :multiple="true">
            <Button>
              <UploadOutlined />
              上传
            </Button>
          </Upload>
        </div>
        <Input v-if="modalInfo.type == 'editName'" v-model:value="editNameShow" />
        <template v-if="modalInfo.type == 'editFWB'">
          <div style="display: flex; align-items: center; padding: 0 10px 15px">文件名: <Input v-model:value="treeSelectedInfo.Name" style="width: 80%; margin-left: 10px" /></div>
          <Tinymce v-model="treeSelectedInfo.Docs" width="100%" />
        </template>
      </Modal>
    </div>
  </BaseComponent>
</template>
<script setup lang="ts">
  import { Menu, MenuItem, Dropdown, Modal, Input, message, Tabs, TabPane, List, ListItem, Card, Upload, Button, UploadProps, Tooltip } from 'ant-design-vue';
  import { h, reactive, ref, shallowRef } from 'vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { NIcon, NTree, TreeOption } from 'naive-ui';
  import { FolderOpenOutline } from '@vicons/ionicons5';
  import { EditOutlined, FileOutlined, CloseCircleOutlined, PlusCircleOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue';
  import { Tinymce } from '/@/components/Tinymce/index';
  import { getAppEnvConfig } from '/@/utils/env';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  // import WebUser from '/@/bp/web/WebUser';
  import { debounce } from 'lodash';
  import { changeBlob, downloadByBase64, downloadByUrl, isImageFile } from '/@/utils/file/download';

  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();

  const TreeData = ref<TreeOption[]>();

  const cateTreeShow = ref(false);
  const DTreeTitle = ref();
  const TreeParentNo = ref();
  const TreeType = ref(1);
  const AddEdit = ref(1);
  const KnowTreetitle = ref();

  const treeFilterPattern = ref('');
  const treeSelectedKeys = ref<string[]>([]);
  const expandedRowKeys = ref<string[]>([]);

  const treeSelectedInfo = ref();

  const flieType = ref();

  const activeKey = ref('1');

  const dbList = ref<UploadProps['fileList']>();

  const AthShow = ref(false);

  const athIsDel = ref(false);
  const athList = ref();

  const actionURL = ref('');

  const tabListNoTitle = [
    {
      key: 'AthList',
      tab: '附件',
    },
  ];
  const noTitleKey = ref('AthList');

  const { VITE_GLOB_PLATFORM, VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  const prefix = import.meta.env.MODE === 'development' ? '/api/' : basePath;
  const apiPath = VITE_GLOB_PLATFORM === 'CCFLOW' ? 'WF/Comm/ProcessRequest' : 'WF/Ath/AttachmentUploadS.do';

  // 树查询变量
  type ModalArgs = {
    visible: boolean;
    params: Recordable;
    athInfo: Recordable;
    type: String;
    title: String;
    width: number;
    body: Recordable;
  };
  // 模态框，主要处理附件
  const modalInfo = reactive<ModalArgs>({
    visible: false,
    params: {},
    athInfo: {},
    type: '',
    title: '',
    body: {},
    width: 800,
  });

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const KnNo = ref(props.params?.No);
  //
  const cateShow = ref(false);

  // 处理右键菜单事件
  let activeTreeNodeinfo: any = null;
  let activeTreeItemId: any = null;

  const editNameShow = ref('');

  const currentNodeInfo = ref();
  /**
   * 目录右侧添加按钮菜单
   */
  const systemNodeItems = ref([
    {
      title: '<i class="iconfont icon-wenjian" ></i> 新建文档',
      id: 'NewPage',
      name: '新建文档',
      type: '2',
    },
    {
      title: '<i class="iconfont icon-wenjian" ></i> 上传附件',
      id: 'NewAth',
      name: '上传附件',
      type: '3',
    },
    {
      title: '<i class="iconfont icon-wenjianjia1"></i> 新建文件夹',
      id: 'NewFile',
      name: '新建文件夹',
      type: '1',
    },
  ]);

  // const goback = () => {
  //   const url = `src/CCOA/KnowledgeManagement/Default.vue`;
  //   wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.Replace, url));
  // };

  const handleMenuClick = async (e) => {
    console.log('e', e);
    switch (e.id) {
      case 'NewFile':
        //新建文件夹
        cateTreeShow.value = false;
        DTreeTitle.value = e.title;
        TreeParentNo.value = KnNo.value;
        TreeType.value = 1;
        AddEdit.value = e.type;
        KnowTreetitle.value = e.name;

        const enFile = new BSEntity('BP.CCOA.KnowledgeManagement.KMTree');
        await enFile.Init();
        const val = window.prompt('请输入目录名称:', '');

        if (TreeType.value == 1) {
          enFile.setVal('ParentNo', KnNo.value);
        } else {
          enFile.setVal('RefTreeNo', KnNo.value);
        }
        enFile.setVal('Name', val);
        enFile.setVal('RefTreeNo', KnNo.value);
        enFile.setVal('KnowledgeNo', KnNo.value);
        enFile.setVal('ParentNo', KnNo.value);
        await enFile.Insert();

        InitPage();
        break;
      case 'NewPage':
        //新建文档
        console.log(' KnNo.value', KnNo.value);
        const enPage = new BSEntity('BP.CCOA.KnowledgeManagement.KMDtl');
        await enPage.Init();
      //  debugger;
        enPage.setVal('Name', '新建');
        enPage.setVal('RefTreeNo', KnNo.value);
        enPage.setVal('KnowledgeNo', KnNo.value);
        enPage.setVal('Docs', '新建文档');
        await enPage.Insert();

        cateTreeShow.value = false;
        DTreeTitle.value = e.title;
        TreeParentNo.value = KnNo.value;
        TreeType.value = 1;
        AddEdit.value = e.type;
        KnowTreetitle.value = e.name;
        InitPage();
        break;
      case 'NewAth':
        modalInfo.visible = true;
        modalInfo.type = 'Ath';
        modalInfo.params = { PKVal: KnNo.value, knowledgeAth: 1 };
        modalInfo.title = '上传附件';
        dbList.value = [];
        break;
    }
  };

  const nodeProps = ({ option }: { option: TreeOption }) => {
    return {
      onClick: async () => {
        treeSelectedKeys.value = [option.key as string];
        expandedRowKeys.value = [];
        console.log('option', option);

        flieType.value = option?.FileType || 2;
        treeSelectedInfo.value = option;
        AthShow.value = false;
      },
      onmouseenter: debounce(() => {
        activeTreeItemId = option.key;
      }, 50),
      onmouseleave: () => {
        activeTreeItemId = null;
      },
    };
  };

  const treeFilterAction = (keyword: string, node: any) => {
    if (keyword.trim() === '') return true;
    return node.Name.includes(keyword);
  };

  const cateinfoData = ref();
  const ImgUrl = ref('');

  /**
   * 转换树形结构的函数
   * */
  const buildTree = (treeEns) => {
    // 1. 创建节点映射表
    const nodeMap = new Map();
    // 2. 首先处理所有节点，创建基本结构
    treeEns.forEach((item) => {
      nodeMap.set(item.No, {
        key: item.No,
        label: item.Name,
        ...item,
        children: [],
        isDirectory: item.FileType === 1, // 标记是否为目录
      });
    });
    // 3. 构建树形结构
    const tree = [];
    treeEns.forEach((item) => {
      const currentNode: any = nodeMap.get(item.No);
      const parentNo = item.RefTreeNo || item.ParentNo;

      if (parentNo) {
        // 尝试找到父节点
        const parentNode = nodeMap.get(parentNo);
        if (parentNode) {
          parentNode.children.push(currentNode);
        } else {
          // 没有找到父节点，作为根节点
          tree.push(currentNode);
        }
      } else {
        // 没有父节点引用，作为根节点
        tree.push(currentNode);
      }
    });

    // 4. 返回树形结构
    return tree;
  };

  const renderTree = async (ensData, ensDtlData) => {
    const treeEns = [...ensData, ...ensDtlData];
    treeEns?.forEach((tEns) => {
      // if (treeEns.filter((t) => t.RefTreeNo == tEns.No).length > 0) {
      if (!!tEns?.FileType) {
        tEns.prefix = () =>
          h(NIcon, null, {
            default: () => h(FolderOpenOutline),
          });
      } else {
        tEns.prefix = () =>
          h(NIcon, null, {
            default: () => h(FileOutlined),
          });
      }
    });

    treeEns?.forEach((te) => {
      if (!!te?.FileType) {
        te.suffix = () => [
          h(
            NIcon,
            {
              style: {
                marginRight: '10px',
                opacity: activeTreeItemId === te.No ? '1' : '0',
              },
              onClick: (e) => {
                e.stopPropagation();
                editNameShow.value = te?.Name || '';
                modalInfo.visible = true;
                modalInfo.type = 'editName';
                modalInfo.title = '重命名';
                modalInfo.body = { padding: '0 20px 15px' };

                TreeParentNo.value = KnNo.value;
                TreeType.value = 1;

                currentNodeInfo.value = te;
              },
            },
            { default: () => h(EditOutlined) }, // 重命名
          ),
          h(
            NIcon,
            {
              style: {
                marginRight: '10px',
                opacity: activeTreeItemId === te.No ? '1' : '0',
              },
              onClick: (e) => {
                e.stopPropagation();
                handleNewAddClick(te);
              },
            },
            { default: () => h(PlusCircleOutlined) }, // 新增
          ),
          h(
            NIcon,
            {
              style: {
                opacity: activeTreeItemId === te.No ? '1' : '0',
              },
              onClick: (e) => {
                e.stopPropagation();
                handleDeleteClick(te);
              },
            },
            { default: () => h(CloseCircleOutlined) }, //删除
          ),
        ];
      }
    });

    TreeData.value = await buildTree(treeEns);
  };

  // 第一个图标点击处理函数
  const handleEditNameClick = async (node) => {
    try {
      let en;
      // let treeno = '';
      if (TreeType.value == 1) {
        en = new BSEntity('BP.CCOA.KnowledgeManagement.KMTree', node.No);
        await en.Init();
        // treeno = TreeParentNo.value;
      } else {
        en = new BSEntity('BP.CCOA.KnowledgeManagement.KMDtl', node.No);
        await en.Init();
        // treeno = node.RefTreeNo;
      }
      await en.Retrieve();
      en.setVal('Name', editNameShow.value);
      await en.Update();
      modalInfo.visible = false;
      InitPage();
    } catch (e: any) {
      message.error(e.toString());
    }
  };

  // 第二个图标点击处理函数
  const handleNewAddClick = async (node) => {
    console.log('新增', node);
    // 这里添加第二个按钮的业务逻辑
    const enPage = new BSEntity('BP.CCOA.KnowledgeManagement.KMDtl');
 //   debugger;
    await enPage.Init();
    enPage.setVal('Name', '新建');
    enPage.setVal('RefTreeNo', node.No);
    enPage.setVal('KnowledgeNo', node.KnowledgeNo);
    enPage.setVal('Docs', '新建文档');
    await enPage.Insert();
    InitPage();
  };

  const handleDeleteClick = async (node) => {
    console.log('删除', node);
  //  debugger;
    if (confirm('您确定想删除该文档吗?')) {
      if (flieType.value == 1) {
        //判断是否有文件？
        const ens = new BSEntities('BP.CCOA.KnowledgeManagement.KMDtls');
        await ens.Init();
        await ens.Retrieve('RefTreeNo', node.No);
        if (ens.getData().length != 0) {
          message.info('该目录或最近删除下存在文档，请您清理文档后再删除');
          return;
        }
        const knDel = new BSEntity('BP.CCOA.KnowledgeManagement.KMTree', node.No);
        await knDel.Delete();
      } else {
        const knDel = new BSEntity('BP.CCOA.KnowledgeManagement.KMDtl', node.No);
        knDel.setVal('IsDel', 1);
        await knDel.Update();
      }
      InitPage();
    }
  };

  const handleEditFWBClick = async (node) => {
    console.log('编辑富文本', node);
    const en = new BSEntity('BP.CCOA.KnowledgeManagement.KMDtl', node.No);
    await en.Init();
    await en.Retrieve();
    en.setVal('Name', node?.Name);
    en.setVal('Docs', node?.Doc || node?.Docs);
    await en.Update();
    modalInfo.visible = false;
    InitPage();
  };

  const handleOk = () => {
    if (modalInfo.type == 'editName') {
      handleEditNameClick(currentNodeInfo.value);
    }
    if (modalInfo.type == 'editFWB') {
      handleEditFWBClick(currentNodeInfo.value);
    }
    if (modalInfo.type == 'Ath') {
      AthList();
      modalInfo.visible = false;
    }
  };

  const selectFileInfo = (item) => {
    flieType.value = item?.FileType || 2;
    treeSelectedInfo.value = item;
  };

  /**
   * 打开编辑文本
   */
  const openTinymce = (item) => {
    modalInfo.visible = true;
    modalInfo.type = 'editFWB';
    modalInfo.title = '编辑';
    modalInfo.body = { padding: '0 20px 15px', height: innerHeight * 0.6 + 'px' };
    modalInfo.width = innerWidth * 0.5;
    currentNodeInfo.value = item;
  };

  /**
   * 是否关注
   */
  // const StarType = async (item) => {
  //   const en = new BSEntity('BP.CCOA.KnowledgeManagement.Knowledge', item.No);
  //   await en.Init();
  //   await en.Retrieve();
  //   let Foucs = en?.Foucs || '';
  //   debugger;
  //   if (status) {
  //     Foucs = Foucs?.replace(WebUser.Name + ';', '');
  //     knowList.value[index].gz = 0;
  //   } else {
  //     Foucs += WebUser.Name + ';';
  //     knowList.value[index].gz = 1;
  //   }
  //   en.setVal('Foucs', Foucs);
  //   en.setVal('KnowledgeSta', knowList.value[index].gz);
  //   await en.Update();
  //   await Refresh();
  // };

  /**
   * 附件上传
   */

  const customRequest = async ({ file, onSuccess }) => {
    const handler = new HttpHandler('BP.CCOA.HttpHandler.CCOA_Knowledge');
    handler.AddPara('RefPKVal', KnNo.value);
    handler.AddFile(file);
    const db: any = await handler.DoMethodReturnJson('Knowledge_UploadFile_MinAth');
    // actionURL.value = db.FileFullName;
    //上传请求的URL
    onSuccess(
      {
        status: 'success',
        name: file.name,
        url: db.url,
      },
      file,
    );
    console.log('file', file);
    console.log('db', db);
  };

  // const handleChange = ({ file, fileList: newFileList }) => {
  //   if (file.status === 'done') {
  //     message.success(`${file.name} 上传成功`);
  //   }
  //   fileList.value = newFileList;
  // };

  const AthList = async () => {
    const ens = new BSEntities('BP.Sys.FrmAttachmentDBs');
    await ens.Retrieve('RefPKVal', KnNo.value, 'Sort', 'Knowledge_MinAth');
    //判断是否可以删除附件
    console.log('ens', ens?.getData());
    // if (ens?.getData().length > 0) {
    //   athIsDel.value = WebUser.No === ens[0].Rec;
    // }
    athList.value = ens?.getData();
  };

  const openAth = () => {
    flieType.value = 0;
    AthShow.value = true;
  };

  const dbDownload = (db) => {
    const url = basePath + db.FileFullName;
    const fileName = db.FileName;
    if (isImageFile(fileName)) {
      changeBlob(url, fileName);
    } else {
      downloadByUrl({ url: url });
    }
  };

  const dbDel = async (db) => {
    const en = new BSEntity('BP.Sys.FrmAttachmentDB', db.MyPK);
    await en.Delete();
    await AthList();
  };

  const InitPage = async () => {
    //树信息
    const kncateInfo = new BSEntity('BP.CCOA.KnowledgeManagement.Knowledge', KnNo.value);
    await kncateInfo.Init();
    await kncateInfo.Retrieve();
    cateinfoData.value = kncateInfo;
    ImgUrl.value = kncateInfo.ImgUrl;

    //目录
    const ens = new BSEntities('BP.CCOA.KnowledgeManagement.KMTrees');
    await ens.Retrieve('ParentNo', KnNo.value);
    const ensData = ens.getData();

    //文档
    const enDtl = new BSEntities('BP.CCOA.KnowledgeManagement.KMDtls');
    await enDtl.Retrieve('KnowledgeNo', KnNo.value, 'IsDel', 0);
    const enDtlData = enDtl.getData();
    //树结构组装
    await renderTree(ensData, enDtlData);

    await AthList();

    // actionURL.value = 'https://www.mocky.io/v2/5cc8019d300000980a055e76';
  };

  InitPage();
</script>
<style lang="less" scoped>
  .know-all-cont {
    padding: 20px;
    display: flex;
  }
  .know-side {
    width: 300px;
    height: calc(100% - 50px);
    background: #fff;
    border: 1px solid #e6e6e6;
    float: left;
    margin-right: 20px;
    box-sizing: border-box;
    padding: 20px 15px;
    height: 800px;
    .know-side-nav {
      display: flex;
      justify-content: space-between;
    }
    .know-side-menu {
      margin-top: 15px;
      .menu-system {
        display: flex;
        justify-content: space-between;
      }
    }
  }
  .know-main {
    background: #fff;
    border: 1px solid #e6e6e6;
    width: calc(100% - 325px);
    height: calc(100% - 50px);
    box-sizing: border-box;
    padding: 10px 15px;
    height: 800px;
  }

  .know-side .know-side-menu .menu-list .tree-box .tree-box-info {
    padding: 0px 15px;
    line-height: 36px;
  }

  .know-side .know-side-menu .menu-list .tree-box .tree-box-info .tree-box-list {
    width: calc(100% - 60px);
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 26px !important;
  }

  .know-side .know-side-menu .menu-list .tree-box .tree-box-info .tree-right-icon {
    opacity: 0;
    cursor: pointer;
  }

  .know-side .know-side-menu .menu-list .in {
    padding-left: 10px;
  }

  .know-side .know-side-menu .menu-list .tree-box .tree-box-info:hover .tree-right-icon {
    opacity: 1;
  }

  .know-side .know-side-menu .menu-list .tree-box .tree-right-icon i {
    padding: 0px 0px 0px 10px;
  }
  .know-page-main {
    width: 100%;
    background-color: #fff;
    padding: 15px;
    .nav {
      display: flex;
      justify-content: space-between;
      height: 46px;
      line-height: 46px;
      .nav-left {
        display: flex;
        font-size: 14px;
        .gray {
          padding-left: 20px;
          color: #8b8b8b;
        }
      }
      .nav-right {
        .cate-btn {
          padding: 0 10px 0 0;
          color: #1677ff;
        }
        .delete-btn {
          color: red;
        }
      }
    }
  }

  .cate-info {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-weight: 600;
  }
  .cate-info-cont {
    .list-item {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  }
  .db-list {
    display: flex;
    // align-items: center;
    justify-content: space-between;
    color: #8b8b8b;
    .db-file {
      width: 45%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .db-file-info {
      display: flex;
      justify-content: space-between;
      width: 35%;
      .db-info-fun {
        display: flex;
        justify-content: space-between;
        width: 35%;
        color: #1677ff;
      }
    }
  }
  .ath-info {
    margin: 5px 0 0 10px;
  }
  .html-field {
    :deep(img) {
      max-width: 100%;
    }
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    // background-color: rgba(0, 0, 0, 0.04);
    padding: 4px;
  }
  :deep(.ant-card-body) {
    height: calc(100vh - 220px);
    overflow-y: auto;
  }
</style>
