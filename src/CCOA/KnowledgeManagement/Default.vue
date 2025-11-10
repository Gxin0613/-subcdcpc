<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航 -->
    <LayoutHeader class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">知识库管理</h1>
          </div>
          <Button type="primary" class="btn_newadd" @click="createKnowledg">
            <i class="icon-plus mr-2"></i>
            创建知识库
          </Button>
        </div>
      </div>
    </LayoutHeader>

    <main class="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 知识库列表 -->
      <Row :gutter="[{ xs: 6, sm: 12, md: 18, lg: 24 }, 24]">
        <template v-if="knowledgeBases.length > 0">
          <Col :xs="24" :md="12" :lg="6" v-for="kb in knowledgeBases" :key="kb.No">
            <Card :hoverable="true" class="overflow-hidden transition-shadow hover:shadow-lg">
              <div class="relative h-40">
                <img :src="kb.ImgUrl" :alt="kb.name" class="w-full h-full object-cover" />
                <Tag :color="getVisibilityBadgeClass(kb.KnowledgeSta)" class="absolute top-3 right-3">
                  {{ getVisibilityText(kb.KnowledgeSta) }}
                </Tag>
              </div>

              <div class="p-5">
                <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {{ kb.Title }}
                </h3>

                <p class="text-sm text-gray-500 mb-4 line-clamp-2">
                  {{ kb.Docs || '无描述' }}
                </p>

                <div class="flex items-center text-xs text-gray-500 mb-4">
                  <span>创建于 {{ kb?.RDT }}</span>
                </div>

                <div class="flex justify-between">
                  <Button type="primary" ghost @click="ViewKnowledg(kb)">
                    <i class="icon-eye mr-2"></i>
                    查看
                  </Button>
                  <Button type="primary" danger ghost @click="EditKnowledg(kb)">
                    <Icon type="plus" class="mr-2" />
                    <i class="icon-note mr-2"></i>
                    编辑
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </template>

        <template v-else>
          <Col :span="24">
            <Card class="text-center p-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Icon type="book" size="large" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-1"> 暂无知识库 </h3>
              <p class="text-gray-500 max-w-md mx-auto mb-6"> 创建您的第一个知识库，开始组织和管理您的文档和资料 </p>
              <Button type="primary" @click="createKnowledg">
                <Icon type="plus" class="mr-2" />
                创建知识库
              </Button>
            </Card>
          </Col>
        </template>
      </Row>
    </main>
    <Modal
      v-model:open="modal.modalVisible"
      centered
      :closable="modal.closable"
      :title="modal.modalTitle"
      :width="modal.modalWidth"
      :body-style="modal.modalHeight"
      :footer="null"
      destroy-on-close
      @cancel="modalClose"
    >
      <KnowledgeBaseCreate v-if="modal.modalType === 'KnowledgeBaseCreate'" @close-modal="modalClose" :edit-params="modal.params" />
    </Modal>
    <!--右侧滑出-->
    <Drawer
      :visible="drawerVisible"
      :title="modal.modalTitle"
      :width="modal.modalWidth"
      @close="drawerClose"
      :body-style="{
        padding: '0 12px',
      }"
    >
      <KnowledgeDisplay v-if="modal.modalType === 'KnowledgeBaseDisplay'" :view-params="modal.params" />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { LayoutHeader, Card, Row, Col, message, Modal, Button, Tag, Drawer } from 'ant-design-vue';
  import KnowledgeBaseCreate from '/@/CCOA/KnowledgeManagement/KnowledgeBaseCreate.vue';
  import KnowledgeDisplay from '/@/CCOA/KnowledgeManagement/KnowledgeDisplay.vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import WebUser from '/@/bp/web/WebUser';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {},
    },
  });

  const pageID = props?.params?.PageID || '';

  const knowledgeBases = ref<Record<any, any>>([]);
  const loading = ref(true);

  const EmpsRaw = ref<string>('');
  const EmpsData = ref<Array<Recordable>>([]); //参与人
  const defaultChecks = ref<Array<any>>([]); //默认选择人员
  const powerKnow = ref<Array<Recordable>>([]);

  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
    content: '',
    params: {},
  });

  const drawerVisible = ref(false);

  // 获取可见性标签样式
  const getVisibilityBadgeClass = (visibility: number) => {
    switch (visibility) {
      case 0:
        return 'green';
      case 1:
        return 'blue';
      case 2:
        return 'orange';
      default:
        return 'gray';
    }
  };

  // 获取可见性文本
  const getVisibilityText = (visibility: number) => {
    switch (visibility) {
      case 0:
        return '公开';
      case 1:
        return '私有';
      case 2:
        return '工作空间';
      default:
        return visibility;
    }
  };

  //关闭弹窗
  const modalClose = () => {
    Init();
    modal.modalVisible = false;
  };
  //关闭抽屉
  const drawerClose = () => {
    Init();
    drawerVisible.value = false;
  };

  //创建知识库
  const createKnowledg = () => {
    modalShow('KnowledgeBaseCreate', '创建知识库', props?.params);
  };

  const ViewKnowledg = (kb) => {
    drawerShow('KnowledgeBaseDisplay', '查看', kb);
  };

  const EditKnowledg = (kb) => {
//    debugger;
    console.log('kb', kb);
    const params = { ...kb, isShowDel: true, ...props?.params };
    modalShow('KnowledgeBaseCreate', '编辑知识库', params);
    // drawerShow('KnowledgeBaseEdit', '编辑', kb);
  };
  /**
   * 按钮弹窗操作
   * @param type
   * @param title
   * @param width
   * @param height
   */
  const modalShow = (type: string, title: string, params: object = {}, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.params = params;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
      overflow: 'hidden auto',
      borderRadius: '8px',
    };
  };

  const drawerShow = (type: string, title: string, params: object = {}, width: number = window.innerWidth * 0.7) => {
    drawerVisible.value = true;
    modal.modalType = type;
    modal.params = params;
    modal.modalTitle = title;
    modal.modalWidth = width;
  };

  // 加载知识库列表
  const Init = async () => {
    try {
      await Refresh();
      EmpsData.value = [];
      EmpsRaw.value = WebUser.No + ';';
      EmpsData.value.push({ no: WebUser.No, name: WebUser.Name });
      defaultChecks.value.push(WebUser.No);
    } catch (error) {
      message.error('加载知识库失败');
      console.error('加载知识库失败:', error);
    }
  };

  const Refresh = async () => {
    try {
      loading.value = true;
      //数据获取
      const ens = new BSEntities('BP.CCOA.KnowledgeManagement.Knowledges');

      await ens.Init();
      await ens.Retrieve('KnowledgeNo', pageID);
      console.log('ens', ens);
    //  debugger;
      const resourceData = ens.getData();
      let Empsstr = WebUser.No + '@' + WebUser.Name + ';';
      //权限控制
      powerKnow.value = [];
      for (let j = 0; j < resourceData.length; j++) {
        let en = resourceData[j];
        let EmpsData = en.Emps;
        if (en.KnowledgeSta == 2 || en.KnowledgeSta == 1) {
          if (EmpsData.indexOf(Empsstr) != -1) {
            powerKnow.value.push(en);
          }
        } else if (en.KnowledgeSta == 0) {
          powerKnow.value.push(en);
        }
      }

      knowledgeBases.value = [];
      knowledgeBases.value = powerKnow.value;
    } catch (e) {
      console.error(e);
      message.error(e.toString());
    }
  };
  Init();
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .btn_newadd {
    background-color: #67c23a !important;
    border-color: #67c23a !important;
    color: #fff !important;
  }
</style>
