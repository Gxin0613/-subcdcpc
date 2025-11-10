<template>
  <BaseComponent ref="baseComponent">
    <div class="tool-btn-groups" style="text-align: left">
      <!-- <Button ghost type="primary" @click="openDrawer('向导', 'guide')"><QuestionOutlined />{{'向导'}}</Button> -->
      <!-- <Button ghost type="primary" @click="openDrawer('批量设置', 'batchUpdate')"><UnorderedListOutlined />{{'批量设置'}}</Button> -->
      <!-- <Button ghost type="primary" @click="openDrawer('批量设置', 'batchUpdate')"><UnorderedListOutlined />{{'批量设置'}}</Button> -->
      <!-- <Button ghost type="primary" @click="openDrawer('设计表单', 'DFrm')"><UnorderedListOutlined />{{'设计表单'}}</Button> -->
      <Button v-if="flowParams.hideEntry != '1'" ghost type="primary" @click="NewModel"><i class="icon-notebook"></i>{{ '新模式' }}</Button>
      <Button ghost type="primary" @click="DFrm"><i class="icon-notebook"></i>{{ '设计表单' }}</Button>

      <!-- <Button ghost type="primary" @click="saveFlow" :loading="loading"><save-outlined :style="iconStyle" />{{'保存'}}</Button> -->
      <!-- <Button ghost type="primary" @click="openDrawer('AI流程', 'AIFlow')"><i class="icon-magic-wand"></i>{{'AI流程'}}</Button> -->
      <Button ghost type="primary" @click="openDrawer('检查流程', 'checkFlow')"><CheckCircleOutlined />{{ '保存&检查' }}</Button>
      <Button ghost type="primary" @click="openDrawer('测试运行', 'TestFlow')" style="color: #1890f1; border-color: #1890f1"><i class="icon-plane"></i>{{ '测试运行' }}</Button>
      <Button ghost type="primary" @click="openDrawer('流程属性', 'entity')"><i class="icon-settings"></i>{{ '流程属性' }}</Button>
      <!-- <Button ghost type="primary" @click="openDrawer('流程二开', 'FlowRpt')"><i class="icon-puzzle"></i>{{ '流程二开' }}</Button> -->
      <Button v-if="!gloHideHelpDoc" ghost type="primary" @click="videoTutorial"><VideoCameraOutlined :style="iconStyle" />{{ '视频教程' }}</Button>

      <!-- <Button /> -->
      <div class="ant-divider" style="margin: 0 8px"></div>

      <!-- <Button ghost type="primary">
      <i class="icon-settings" size="18"></i>
      <NDropdown :options="libOptions" trigger="click" @select="openLib">
        <div class="box">
          <div class="expand">{{'系统管理'}}</div>
        </div>
      </NDropdown>
    </Button> -->

      <!-- <Button ghost type="primary" @click="openDrawer('设计报表', 'FlowDataSetting')"><i class="icon-notebook"></i>{{'设计报表'}}</Button> -->
    </div>
    <Drawer
      v-model:open="asyncComp.visible"
      :title="asyncComp.title"
      :body-style="{
        // @ts-ignore
        padding: 0,
      }"
      :width="asyncComp.width"
      @close="resetAsyncComp"
    >
      <component v-if="asyncComp.visible" :is="asyncComp.comp" :params="asyncComp.params" />
    </Drawer>
    <Drawer v-model:open="drawer.visible" :title="drawer.title" :header-style="drawer.headerStyle" :width="drawer.width" :bodyStyle="drawer.bodyStyle" @close="resetDrawer">
      <Guide v-if="drawer.current === 'guide'" />
      <En
        v-else-if="drawer.current === 'entity' || drawer.current === 'FlowDataSetting'"
        :EnName="entityParams.EnName"
        :PKVal="entityParams.PKVal"
        :default-expand="entityParams.expand"
        :basic-info-visible="entityParams.basicInfoVisible"
      />
      <CheckFlow v-else-if="drawer.current === 'checkFlow'" :params="entityParams" />
      <GroupPageNew v-else-if="drawer.current === 'GPN'" :params="entityParams" />
      <GroupPageEdit v-else-if="drawer.current === 'GPE'" :EnName="entityParams.EnName" :PKVal="entityParams.PKVal" />
      <DtlBatch v-else-if="drawer.current === 'DtlBatch'" :params="entityParams.props" />
      <DtlSearch v-else-if="drawer.current === 'DtlSearch'" :params="entityParams.props" />
      <GenerList v-else-if="drawer.current === 'TestFlow'" :params="entityParams" />
      <GenerList v-else-if="drawer.current === 'NodeEvent'" :params="entityParams" />
      <GroupPageNew v-else-if="drawer.current === 'AIFlow'" :params="GPN_AIFlowCheck" />
      <!--  -->
      <iframe v-else-if="drawer.current === 'iframe'" :src="drawer.url" style="width: 100%; height: 100%"></iframe>
      <div v-else>{{ '【未知组件】' }}</div>
    </Drawer>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { NIcon } from 'naive-ui';
  import { CheckCircleOutlined, VideoCameraOutlined } from '@ant-design/icons-vue';
  import { Button, Drawer, message } from 'ant-design-vue';

  import { LabelInfo, NodeInfo, ProvideFlowInfo } from '../FlowAttr';
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import Guide from './Guide.vue';
  import En from '/@/WF/Comm/En.vue';
  import CheckFlow from './CheckFlow.vue';
  import { computed, inject, onMounted, onUnmounted, reactive, ref, toRefs, h, markRaw, shallowRef } from 'vue';
  import Events from '/@/utils/Events';
  import GroupPageEdit from '/@/WF/Comm/UIEntity/GroupPageEdit.vue';
  import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
  import GenerList from '/@/WF/views/GenerList.vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import GloFrm from '../../FrmLogic/GloFrm';
  import { flowEntityKeys } from '../utils/keys';
  import { FlowDevModel } from '../../EnumLab';
  import DtlBatch from '/@/WF/Comm/Dtl/DtlBatch.vue';
  import DtlSearch from '/@/WF/Comm/Dtl/DtlSearch.vue';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import WebUser from '/@/bp/web/WebUser';
  import { MapData } from '../../FrmLogic/MapData';
  import { FlowRptSetting } from '../../AttrFlow/Rpt/FlowRptSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { GloComm } from '/@/WF/Comm/GloComm';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { getAppEnvConfig } from '/@/utils/env';

  const route = useRoute();
  const { t } = useI18n();
  const iconStyle = computed(() => {
    return {
      fontSize: '16px',
    };
  });
  const props = defineProps({
    nodeList: {
      type: Object as PropType<Array<NodeInfo>>,
      default: () => {
        return [];
      },
    },
    lineList: {
      type: Object as PropType<Array<Record<string, any>>>,
      default: () => {
        return [];
      },
    },
    labelList: {
      type: Object as PropType<Array<LabelInfo>>,
      default: () => {
        return [];
      },
    },
    flowParams: {
      type: Object,
      default: () => ({}),
    },
  });
  const flowNo = props.flowParams.FlowNo || (route.query.FlowNo as string);
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  const { nodeList, lineList, labelList } = toRefs(props);
  const { flowEntity } = inject(flowEntityKeys) as ProvideFlowInfo;
  const ToolbarDFormVisible = computed(() => {
    const visibleStatus = [FlowDevModel.JiJian, FlowDevModel.RefOneFrmTree];
    return visibleStatus.includes(flowEntity.value.GetValByKey('FlowDevModel'));
  });
  //下拉菜单添加icon
  const renderIcon = (icon: String) => {
    return () =>
      h(NIcon, {
        class: icon,
      });
  };
  const libOptions = reactive([
    {
      label: '数据源维护',
      key: 'dbSrc',
      icon: renderIcon('icon-disc'),
    },
    {
      label: '字典维护',
      key: 'fkLib',
      icon: renderIcon('icon-notebook'),
    },
    {
      label: '查询维护',
      key: 'sfSearch',
      icon: renderIcon('icon-grid'),
    },
    {
      label: '枚举维护',
      key: 'enumLib',
      icon: renderIcon('icon-list'),
    },
    {
      label: '过程维护',
      key: 'SFProc',
      icon: renderIcon('icon-energy'),
    },
  ]);
  const asyncComp = reactive<Recordable>({
    visible: false,
    comp: null,
    params: {},
    title: ' ',
    width: '70%',
  });
  const resetAsyncComp = () => {
    asyncComp.visible = false;
    asyncComp.comp = null;
    asyncComp.params = {};
    asyncComp.title = ' ';
    asyncComp.width = '70%';
  };
  const { loadComponent, getComponentParamsByUrl } = useComponentLoader();
  const openLib = (key: string) => {
    const userNo = WebUser.CCBPMRunModel === 2 ? WebUser.OrgNo + '_' + WebUser.No : WebUser.No;
    switch (key) {
      case 'fkLib': {
        const fkUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        asyncComp.comp = markRaw(loadComponent(fkUrl));
        asyncComp.params = getComponentParamsByUrl(fkUrl);
        asyncComp.title = '字典表维护';
        asyncComp.visible = true;
        break;
      }
      case 'dbSrc': {
        const fkUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        asyncComp.comp = markRaw(loadComponent(fkUrl));
        asyncComp.params = getComponentParamsByUrl(fkUrl);
        asyncComp.title = '数据源维护';
        asyncComp.visible = true;
        break;
      }
      case 'enumLib': {
        const enumUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        asyncComp.comp = markRaw(loadComponent(enumUrl));
        asyncComp.params = getComponentParamsByUrl(enumUrl);
        asyncComp.title = '枚举库维护';
        asyncComp.visible = true;
        break;
      }
      case 'sfSearch': {
        const enumUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        asyncComp.comp = markRaw(loadComponent(enumUrl));
        asyncComp.params = getComponentParamsByUrl(enumUrl);
        asyncComp.title = '查询维护';
        asyncComp.visible = true;
        break;
      }
      case 'SFProc': {
        const enumUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        asyncComp.comp = markRaw(loadComponent(enumUrl));
        asyncComp.params = getComponentParamsByUrl(enumUrl);
        asyncComp.title = '过程维护';
        asyncComp.visible = true;
        break;
      }
      default: {
        message.error('请配置正确的选项');
      }
    }
  };

  //帮助
  const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
  const gloHideHelpDoc = ref(VITE_GLOB_HIDE_HELP_DOCS);

  const videoTutorial = () => {
    // 如果工具栏显示，说明是极简模式
    if (ToolbarDFormVisible.value) {
      const url = 'http://ccflow.org/Ke.html';
      //  'https://ccbpm.cn/Ke/01.WorkFlow/001.%E5%9F%BA%E7%A1%80%E6%93%8D%E4%BD%9C.%E6%9E%81%E7%AE%80%E6%A8%A1%E5%BC%8F%E8%AF%B7%E5%81%87%E6%B5%81%E7%A8%8B%E8%AE%BE%E8%AE%A1.mp4',
      window.open(url, '_blank');
      //   'https://ccbpm.cn/Ke/01.WorkFlow/001.%E5%9F%BA%E7%A1%80%E6%93%8D%E4%BD%9C.%E6%9E%81%E7%AE%80%E6%A8%A1%E5%BC%8F%E8%AF%B7%E5%81%87%E6%B5%81%E7%A8%8B%E8%AE%BE%E8%AE%A1.mp4',
      //   '_blank',
      // );
    } else {
      window.open('http://ccflow.org/Ke.html', '_blank');
    }
  };
  const saveFlow = async () => {
    try {
      loading.value = true;
      message.success('该按钮将要取消,元素在您拖拽之后自动保存.');
      return;
      //const FlowNo = route.query.FlowNo as string;
      const nodesStr = nodeList.value
        .map((node) => {
          const { NodeID, X, Y, Name } = node;
          return `@${NodeID},${X},${Y},${Name}`;
        })
        .join('');
      const labelsStr = labelList.value
        .map((label) => {
          const { MyPK, X, Y } = label;
          return `@${MyPK},${X},${Y}`;
        })
        .join('');
      const dirsStr = lineList.value
        .map((line) => {
          const { MyPK, Node, ToNode } = line;
          return `@${MyPK},${flowNo},${Node},${ToNode}`;
        })
        .join('');

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner');
      handler.AddPara('Nodes', nodesStr);
      handler.AddPara('Dirs', dirsStr);
      handler.AddPara('Labs', labelsStr);
      handler.AddPara('FK_Flow', flowNo);
      const res = await handler.DoMethodReturnString('Designer_Save');
      message.success(res);
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const GPN_AIFlowCheck = reactive<Recordable>({
    EnName: 'GPN_AIFlowCheck',
    PKVal: flowNo,
    FlowNo: flowNo,
    expand: false,
    basicInfoVisible: true,
    props: {},
  });

  const entityParams = reactive<Recordable>({
    EnName: 'TS.WF.Template.FlowExt',
    PKVal: flowNo,
    FlowNo: flowNo,
    expand: false,
    basicInfoVisible: true,
    props: {},
  });

  const loading = ref(false);
  const drawer = reactive({
    visible: false,
    title: '',
    current: '',
    width: window.innerWidth * 0.7 + 'px',
    url: '',
    bodyStyle: {
      height: '100%',
      padding: '0',
      background: '#f0f2f5',
    },
    headerStyle: {
      padding: '10px 24px',
    },
  });

  const openDrawer = async (title: string, current: string) => {
    if (current === 'batchUpdate') {
      message.info('暂未实现' + current);
      return;
    }
    if (current === 'FlowDataSetting') {
      entityParams.EnName = 'TS.WF.Template.FlowDataSetting';
      entityParams.PKVal = flowNo as string;
    }
    // if (current === 'FlowRpt') {
    //   current = 'GPN';
    //   entityParams.EnName = 'GPN_FlowRptD';
    //   entityParams.PKVal = route.query.FlowNo as string;
    // }
    if (current === 'FlowRpt') {
      current = 'entity';
      //const flowNo = route.query.FlowNo as string;
      const pkval = 'FlowRpt' + flowNo;
      // const pkval = 'ND' + Number.parseInt(flowNo) + 'Rpt';

      const en = new FlowRptSetting();
      en.No = pkval;
      const i = await en.RetrieveFromDBSources();
      en.FlowNo = flowNo;
      if (i == 0) await en.Insert();
      else await en.Update();

      entityParams.EnName = 'TS.WF.FlowRptSetting';
      entityParams.PKVal = pkval;
      entityParams.FlowNo = pkval;
    }
    if (current === 'MyFlowRpt') {
      current = 'entity';
      entityParams.EnName = 'TS.TSClass.FlowOneSetting';
      entityParams.PKVal = flowNo;
      entityParams.FlowNo = flowNo;
    }

    if (current === 'TestFlow') {
      entityParams.EnName = 'GL_FlowTester';
      entityParams.FlowNo = flowNo;
    }

    drawer.title = title;
    drawer.current = current;
    drawer.title === '检查流程' ? (drawer.width = window.innerWidth * 0.6 + 'px') : (drawer.width = window.innerWidth * 0.7 + 'px');
    drawer.title === '二开' ? (drawer.width = window.innerWidth * 0.9 + 'px') : (drawer.width = window.innerWidth * 0.9 + 'px');
    drawer.visible = true;
  };

  // 重置抽屉
  const resetDrawer = () => {
    drawer.visible = false;
    drawer.title = '';
    drawer.current = '';
    entityParams.EnName = 'TS.WF.Template.FlowExt';
    entityParams.PKVal = flowNo;
    entityParams.expand = false;
    entityParams.basicInfoVisible = true;
    drawer.url = '';
  };

  // 设计表单.
  const NewModel = async () => {
    const flow = new Flow();
    await flow.Init();
    flow.No = flowNo;
    await flow.RetrieveFromDBSources();
    const url = `${location.pathname}#/WF/Comm/Entity?EnName=TS.WF.FD.FlowJiJian&PKVal=${flow.No}`;
    // const url = GloComm.UrlEn('TS.WF.FD.FlowJiJian', flow.No); //  md.UrlDesigner() + '&FlowNo=' + flow.No;
    baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url));
    return;
  };

  // 设计表单.
  const DFrm = async () => {
    try {
      const flow = new Flow();
      await flow.Init();

      flow.No = flowNo;
      await flow.RetrieveFromDBSources();

      if (flow.FlowDevModel === FlowDevModel.Prefessional) {
        message.info('当前流程为【专业模式】, 请在节点上点击右键，选择设计表单.');
        return;
      }

      //自由表单，经典表单.
      //经典表单设计器.
      let frmID = flow.FrmUrl;
      if (frmID == null || frmID == '') frmID = 'ND' + parseInt(flow.No + '01');
      // alert(frmID);
      // NodeFormType.RefNodeFrm
      await GloFrm.CheckForm(frmID);

      const md = new MapData(frmID);
      await md.RetrieveFromDBSources();
      const url = md.UrlDesigner() + '&FlowNo=' + flow.No;
      Events.emit('openDrawer', {
        type: 'iframe',
        title: frmID + ',' + flow.Name,
        expand: false,
        basicInfoVisible: true,
        width: window.innerWidth * 0.9 + 'px',
        url: url,
      });
      return;

      // if (flow.FlowDevModel ===FlowDevModel.JiJian ||  flow.FlowDevModel ===FlowDevModel.RefOneFrmTree)
      // {
      // 1. 独立表单 Frm_XXXX + 极简模式  ND101
      //   1. 工具栏显示：设计表单.
      //   2. 节点右键，不显示表单方案,  不显示设计表单， 显示表单权限.
      // 2. 专业模式下 + 表单树 + 自定义表单+SDK
      //   1.  工具栏上去掉设计表单的显示.
      //   2.   右键显示表单方案 + 设计表单 。
      // }

      // window.location.href = `/#/WF/TestingContainer/TestFlow?EnName=GL_FlowTester&FlowNo=${route.query.FlowNo}`;
    } catch (e: any) {
      message.error(e.toString());
    }
  };

  const listenKeyboard = () => {
    document.addEventListener('keydown', (e) => {
      // 兼容macos
      if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveFlow();
      }
    });
  };

  onMounted(async () => {
    Events.on('openDrawer', (params: Recordable): void => {
      if (entityParams.EnName) {
        entityParams.EnName = params.EnName;
        entityParams.PKVal = params.EnName?.includes('FlowExt') ? params.PKVal : params.NodeID;
      }
      if (params?.type === 'GPE') {
        entityParams.PKVal = params.PKVal;
      }
      if (params.type === 'DtlBatch' || params.type === 'GPN') {
        entityParams.props = params.props;
      }
      if (params.type === 'DtlSearch') {
        entityParams.props.RefPK = 'RefPKVal';
        entityParams.props.ButsTableTop = '检查正确性';
        entityParams.props.ShowAttrs = 'DataFromText,Note,';
        entityParams.props.IsMove = '1';
        entityParams.props.EnName = params.EnName;
        entityParams.props.RefPKVal = params.PKVal;
        // entityParams.props.Title = params.title;
      }

      if (params.type === 'NodeEvent') {
        entityParams.EnName = 'GL_Event';
        entityParams.PKVal = params.PKVal;
        entityParams.RefMainEnName = 'TS.WF.Template.NodeExt';
      }
      entityParams.basicInfoVisible = !!params.basicInfoVisible;
      entityParams.expand = !!params.expand;
      drawer.current = params.type;
      drawer.title = params.title || ' ';
      drawer.visible = true;
      drawer.width = params.width || '70%';
      drawer.url = params.url;
    });
    listenKeyboard();
  });

  onUnmounted(() => {
    Events.off('openDrawer');
    document.removeEventListener('keydown', () => {});
  });
</script>

<style lang="less" scoped>
  .tool-btn-groups {
    height: 100%;
    display: flex;
    align-items: center;
    /**justify-content: flex-end;*/
    box-sizing: border-box;
    padding-right: 22px;
    .ant-btn {
      margin-left: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      color: #696969;
      border-color: #696969;
      border-width: 1px;
      border-radius: 6px;
      i {
        margin-right: 6px;
      }

      &:hover {
        color: #1890ff;
        border-color: #1890ff;
      }
    }
  }

  .ant-drawer-header {
    background-color: red;
  }
</style>
