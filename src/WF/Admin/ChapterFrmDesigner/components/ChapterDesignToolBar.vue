<!-- 参考FoolFormDesigner的ToolBar -->
<template>
  <BaseComponent ref="baseComponent" style="width: unset; height: unset">
    <div class="tool-group">
      <div class="left">
        <div class="collapse" @click="toggleCollapse('left')">
          <menu-unfold-outlined v-if="componentsCollapse" class="trigger" />
          <menu-fold-outlined v-else class="trigger" />
          <span>{{ componentsCollapse ? '' : '' }}</span>
        </div>
        <template v-if="formConfigData.EntityType === 1">
          <div class="btn" @click="entitySetting1">
            <i class="icon-settings" size="18" style="color: #1890ff"></i>
            <span style="color: #1890ff">{{ '单据设计' }}</span>
          </div>
          <div class="btn" @click="entityRunner1">
            <i class="icon-plane" size="18" style="color: #1890ff"></i>
            <span style="color: #1890ff">{{ '运行' }}</span>
          </div>
        </template>
        <template v-if="formConfigData.EntityType === 2">
          <div class="btn" @click="entitySetting2">
            <i class="icon-settings" size="18" style="color: #1890ff"></i>
            <span style="color: #1890ff">{{ '实体设计' }}</span>
          </div>
          <div class="btn" @click="entityRunner2">
            <i class="icon-plane" size="18" style="color: #1890ff"></i>
            <span style="color: #1890ff">{{ '运行' }}</span>
          </div>
        </template>
        <template v-if="formConfigData.FrmType === 6">
          <div class="btn" @click="entityVstoExcel">
            <i class="icon-paper-plane" size="18" style="color: #1890ff"></i>
            <span style="color: #1890ff">{{ 'VSTO设计器Excel' }}</span>
          </div>
        </template>
        <template v-if="formConfigData.FrmType === 61">
          <div class="btn" @click="entityVstoWord">
            <i class="icon-paper-plane" size="18" style="color: #1890ff"></i>
            <span style="color: #1890ff">{{ 'VSTO设计器Word' }}</span>
          </div>
        </template>
      </div>
      <div class="right">
        <div class="btn" @click="reloadDesigner" :title="'刷新表单'" @mouseenter="handleAnim(true)" @mouseleave="handleAnim(false)">
          <i class="icon-refresh" style="font-size: 18px; color: #1890ff" :class="{ 'reload-hover': reloadHover && anim, 'reload-hover-leave': !reloadHover && anim }"></i>
          <span style="color: #1890ff">{{ '刷新' }}</span>
        </div>
        <div
          class="btn"
          @click="
            () => {
              store.globalFormConfig.showChapterIndex = !store.globalFormConfig.showChapterIndex;
            }
          "
        >
          <i class="icon-menu" style="font-size: 18px; color: #1890ff"></i>
          <span style="color: #1890ff" v-if="store.globalFormConfig.showChapterIndex">{{ '关闭索引' }}</span>
          <span style="color: #1890ff" v-if="!store.globalFormConfig.showChapterIndex">{{ '显示索引' }}</span>
        </div>
        <div class="btn" @click="formSetting">
          <n-icon :component="IosPaper" size="18" color="#1890ff" />
          <span style="color: #1890ff">{{ '属性' }}</span>
        </div>
        <div class="btn" @click="exportAndImport">
          <n-icon :component="DocumentImport" size="18" color="#1890ff" />
          <span style="color: #1890ff">{{ '导入导出' }}</span>
        </div>
        <div class="btn">
          <n-dropdown :options="previewOpts" trigger="click" @select="previewForm">
            <div class="box">
              <n-icon :component="IosTabletPortrait" size="18" color="#1890ff" />
              <div style="color: #1890ff" class="expand">{{ '预览' }}</div>
              <div style="color: #1890ff" class="shrink">{{ '预览' }}</div>
            </div>
          </n-dropdown>
        </div>
        <!-- <div class="btn" @click="checkFrm">
        <n-icon :component="IosCheckboxOutline" size="18" color="#1890ff" />
        <span style="color: #1890ff">{{'检查表单'}}</span>
      </div> -->
        <!-- <div class="btn" @click="batchHandle">
        <n-icon :component="IosHand" size="18" color="#1890ff" />
        <span style="color: #1890ff">{{'枚举库'}}</span>
      </div> -->

        <!-- <div class="btn" @click="modifyTheme">
        <n-icon :component="IosColorPalette" size="18" color="#1890ff"></n-icon>
        <span style="color: #1890ff">{{'配色'}}</span>
      </div> -->
        <div class="btn">
          <n-dropdown :options="formOptions" trigger="click" @select="handleDesignerSwitch">
            <div class="box">
              <i class="icon-shuffle" size="18" style="color: #1890ff; font-size: 16px"></i>
              <div style="color: #1890ff" class="expand">{{ '切换' }}</div>
              <div style="color: #1890ff" class="shrink">{{ '切换' }}</div>
            </div>
          </n-dropdown>
        </div>
        <div class="collapse" style="margin-left: 22px" @click="toggleCollapse('right')">
          <menu-fold-outlined v-if="settingCollapse" class="trigger" />
          <menu-unfold-outlined v-else class="trigger" />
          <span>{{ settingCollapse ? '' : '' }}</span>
        </div>
      </div>
    </div>

    <Drawer v-model:open="gpnVisible" :title="gpnTitle" :body-style="drawerStyle" width="70%">
      <GroupPageNew v-if="gpnVisible" :params="gpnParams" />
    </Drawer>
    <Drawer v-model:open="previewDrawer.visible" :title="previewDrawer.title" :body-style="drawerStyle" :width="previewDrawer.width">
      <MobilePreview v-if="previewDrawer.visible && previewDrawer.type === PreviewType.Mobile" :url="previewDrawer.iframeUrl" />
      <div class="pc-wrapper" v-else-if="previewDrawer.visible && previewDrawer.type === PreviewType.PC">
        <Frm :frmID="previewDrawer.frmID" />
      </div>
    </Drawer>
    <Drawer v-model:open="checkFrmVisible" :title="'检查表单'" :body-style="drawerStyle" width="70%">
      <CheckFrm
        v-if="checkFrmVisible"
        :params="{
          FrmID: route.query.FrmID,
        }"
      />
    </Drawer>

    <Drawer v-model:open="asyncComp.visible" :title="asyncComp.title" :body-style="drawerStyle" :width="asyncComp.width" @close="resetAsyncComp">
      <component v-if="asyncComp.visible" :is="asyncComp.comp" :params="asyncComp.params" />
    </Drawer>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { useDesignerStore } from '/@/store/modules/form';
  import { NIcon, NDropdown } from 'naive-ui';
  import { Drawer, message, Modal } from 'ant-design-vue';
  import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
  import { IosPaper, IosTabletPortrait } from '@vicons/ionicons4';
  import { DocumentImport } from '@vicons/carbon';
  import { onMounted, onUnmounted, ref, computed, ComputedRef, reactive, h, unref, shallowRef } from 'vue';
  import { useRoute } from 'vue-router';
  import { getIframeAddress } from '/@form/utils/RelativePathUtils';
  import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
  import Entity from '/@form/dto/Entity';
  import Events from '/@/utils/Events';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import CheckFrm from '/@form/components/design/CheckFrm.vue';
  // import FrmGener from '/@/CCMobile/CCForm/FrmGener.vue';
  import MobilePreview from '/@form/components/design/MobilePreview.vue';
  import Frm from '/@/WF/CCForm/Frm.vue';
  import WebUser from '/@/bp/web/WebUser';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import BSEntity from '/@/utils/gener/BSEntity';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { getAppEnvConfig, getBrowserName } from '/@/utils/env';
  import { getVstoHost } from '/@/utils/VstoUtils';
  import { FrmType } from '/@/WF/Admin/EnumLab';
  const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();

  const store = useDesignerStore();
  const route = useRoute();
  const gpnTitle = ref<string>('');
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  enum PreviewType {
    Mobile = 'mobile',
    PC = 'pc',
  }

  // 实体设置
  const entitySetting1 = async () => {
    const formID = route.query.FrmID as string;
    const url = GloComm.UrlEn('TS.CCBill.FrmBill', formID);

    const md = new BSEntity('BP.Sys.MapData');
    md.No = formID;
    md.setPK(formID);
    // md.proxyInst.No = formID;
    // await md.RetrieveFromDBSources();
    await md.DoMethodReturnString('ClearCache');
    baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url + '&FrmID=' + formID, '单据设计'));
  };
  // 实体设置
  const entitySetting2 = async () => {
    const formID = route.query.FrmID as string;
    const url = GloComm.UrlEn('TS.CCBill.FrmDict', formID);

    const md = new BSEntity('BP.Sys.MapData');
    md.No = formID;
    md.setPK(formID);
    // md.proxyInst.No = formID;
    // await md.RetrieveFromDBSources();
    await md.DoMethodReturnString('ClearCache');
    baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url + '&FrmID=' + formID, '实体设计'));
  };

  // Vsto设计
  const entityVstoWord = async () => {
    const confirmResult = await showVstoConfirmDialog('Word设计器');
    if (!confirmResult) return;

    const frmID = route.query.FrmID as string;
    const url = buildVstoUrl('wordform', frmID);
    console.log(url);
    window.location.href = url;
  };

  const entityVstoExcel = async () => {
    const confirmResult = await showVstoConfirmDialog('Excel设计器');
    if (!confirmResult) return;

    const frmID = route.query.FrmID as string;
    const url = buildVstoUrl('excelform', frmID);
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('Header', 'excelform');
      const result: any = await handler.DoMethodReturnString('IsInstallVSTO');
      // 执行自定义逻辑，例如记录日志
    } catch (e) {
      message.error(e as string);
      return;
    }
    console.log(url);
    window.location.href = url;
  };

  const showVstoConfirmDialog = (designerType) => {
    return new Promise((resolve) => {
      Modal.confirm({
        title: '提示',
        content: h('div', [
          h('p', [h('strong', `请确认您的电脑是否安装了${VITE_GLOB_SX_TITLE}VSTO插件，该插件是使用${designerType}功能的必要组件`)]),
          h('p', { style: { margin: '12px 0', color: '#666' } }, [
            '当前现象说明：',
            h('br'),
            '▸ 如果点击「继续」后没有反应 → 确认未安装插件',
            h('br'),
            '▸ 如果已安装仍无反应 → 请检查是否安装了OFFICE办公软件（Word、Excel）',
          ]),
          h('div', { style: { display: 'flex', gap: '12px', marginTop: '16px' } }, [
            h(
              'a',
              {
                href: 'http://eyer.ccbpm.cn/DownLoad/vstoinstall.exe',
                target: '_blank',
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#0960bd',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                },
              },
              '下载VSTO插件',
            ),
            h(
              'span',
              {
                style: {
                  color: '#999',
                  borderLeft: '1px solid #eee',
                  padding: '8px 0 8px 16px',
                },
              },
              [
                '遇到问题？',
                h(
                  'a',
                  {
                    href: 'mailto:zhoupeng@ccflow.org',
                    style: { color: '#0960bd' },
                  },
                  '联系技术支持',
                ),
              ],
            ),
          ]),
        ]),
        okText: '打开设计',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  const buildVstoUrl = (protocol, frmID) => {
    const baseParams = [
      `AppID=TemplateDesinger`,
      `FrmID=${frmID}`,
      `UserNo=${WebUser.No}`,
      `WorkID=0`,
      `Token=${WebUser.Token}`,
      `EnName=${frmID}`,
      `WebHostUrl=${window.location.origin}`,
      `WSUrl=${getVstoHost()}`,
    ];
    if (protocol === 'wordform') {
      baseParams.push(`browserName=${getBrowserName()}`, `backUrl=${window.location.href}`);
    }
    return `${protocol}://-fromccflow,${baseParams.join(',')}`;
  };

  // 单据
  const entityRunner1 = async () => {
    const formID = route.query.FrmID as string;
    //  const url = `/src/CCFast/CCBill/SearchBill.vue?FrmID=${formID}`;
    const url = GloComm.UrlEn('TS.CCBill.BillSettingOne', formID);
    const md = new BSEntity('BP.Sys.MapData');
    //await md.Init();
    md.No = formID;
    md.setPK(formID);
    await md.RetrieveFromDBSources();
    await md.DoMethodReturnString('ClearCache');

    baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, md.getData().Name));
  };

  // 实体
  const entityRunner2 = async () => {
    const formID = route.query.FrmID as string;
    // const url = `/src/CCFast/CCBill/SearchDict.vue?FrmID=${formID}`;
    const url = GloComm.UrlEn('TS.CCBill.DictSettingOne', formID);

    const md = new BSEntity('BP.Sys.MapData');
    //await md.Init();
    md.No = formID;
    md.setPK(formID);
    await md.RetrieveFromDBSources();
    await md.DoMethodReturnString('ClearCache');
    baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, md.getData().Name));
  };
  const componentsCollapse: ComputedRef = computed(() => store.componentsCollapse);
  const settingCollapse: ComputedRef = computed(() => store.settingsCollapse);
  const toggleCollapse = (type: string) => {
    if (type === 'left') {
      store.componentsCollapse = !store.componentsCollapse;
    } else {
      store.settingsCollapse = !store.settingsCollapse;
    }
  };

  const drawerStyle = computed(() => {
    return {
      padding: 0,
    };
  });
  //下拉菜单添加icon
  const renderIcon = (icon: String) => {
    return () =>
      h(NIcon, {
        class: icon,
      });
  };

  const reloadHover = ref(false);
  const anim = ref(false);

  const gpnParams = ref<Record<string, any>>();

  const previewOpts = reactive([
    {
      label: '手机端预览',
      key: PreviewType.Mobile,
      icon: renderIcon('icon-screen-smartphone'),
    },
    {
      label: 'PC端预览',
      key: PreviewType.PC,
      icon: renderIcon('icon-screen-desktop'),
    },
  ]);

  const formOptions = ref([
    // {
    //   label: '开发者表单',
    //   key: 'devForm',
    //   icon: renderIcon('icon-speech'),
    // },
    {
      label: '经典表单',
      key: 'devFoolForm',
      icon: renderIcon('icon-speech'),
    },
    {
      label: 'VSTO表单Excel',
      key: 'devVSTOExcel',
      icon: renderIcon('icon-docs'),
    },
    {
      label: 'VSTO表单Word',
      key: 'devVSTOWord',
      icon: renderIcon('icon-docs'),
    },
    {
      label: '安装VSTO表单设计器',
      key: 'devVSTO_Install',
      icon: renderIcon('icon-book-open'),
    },
  ]);

  const handleDesignerSwitch = (key: string | number) => {
    //    debugger;
    if (key === 'devForm') {
      Events.emit('__CHANGE_FORM_TYPE', FrmType.Develop);
      Events.emit('reloadForm');
      return;
    }

    if (key === 'devFoolForm') {
      Events.emit('__CHANGE_FORM_TYPE', FrmType.FoolForm);
      Events.emit('reloadForm');
      return;
    }

    if (key === 'devVSTOExcel') {
      Events.emit('__CHANGE_FORM_TYPE', FrmType.VSTOForExcel);
      entityVstoExcel(); //打开excel.
      return;
    }
    if (key === 'devVSTOWord') {
      Events.emit('__CHANGE_FORM_TYPE', FrmType.VSTOForWord);
      entityVstoWord(); //打开word.
      return;
    }
    if (key === 'devVSTO_Install') {
      window.open('http://eyer.ccbpm.cn/DownLoad/vstoinstall.exe');
      return;
    }

    alert('暂不开放.' + key);
  };
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
  const openLib = (key: string) => {
    const userNo = WebUser.CCBPMRunModel === 2 ? WebUser.OrgNo + '_' + WebUser.No : WebUser.No;
    switch (key) {
      case 'fkLib': {
        const fkUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, fkUrl, '字典表维护'));
        break;
      }
      case 'dbSrc': {
        const fkUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, fkUrl, '数据源维护'));
        break;
      }
      case 'enumLib': {
        const enumUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, enumUrl, '枚举库维护'));
        break;
      }
      case 'sfSearch': {
        const enumUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, enumUrl, '查询维护'));
        break;
      }
      case 'SFProc': {
        const enumUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
        baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, enumUrl, '过程维护'));
        break;
      }
      default: {
        message.error('请配置正确的选项');
      }
    }
  };

  const gpnVisible = ref(false);
  const triggerRefresh = ref(false);

  // 预览表单, 不需要重载
  const previewDrawer = reactive({
    visible: false,
    iframeUrl: '',
    title: '表单预览',
    type: PreviewType.Mobile,
    frmID: '',
    width: '30%',
  });
  const previewForm = (key: PreviewType) => {
    // debugger;
    if (key === PreviewType.Mobile) {
      // const url = `/src/CCMobile/CCForm/Frm.vue?FrmID=${route.query.FrmID}&EnsName=${route.query.FrmID}&skipPlatformCheck=1&EnName=${route.query.FrmID}&WorkID=0&DoType=FunList&FK_Flow=${route.query.FK_Flow}&FK_Node=${route.query.nodeID}`;
      //   alert(url);
      previewDrawer.title = '手机端表单预览';
      previewDrawer.iframeUrl = `index.html#/CCMobile/CCForm/Frm?FrmID=${route.query.FrmID}&skipPlatformCheck=1&EnName=${route.query.FrmID}&WorkID=0&DoType=FunList&FK_Flow=${route.query.FK_Flow}&FK_Node=${route.query.nodeID}`;
      previewDrawer.type = PreviewType.Mobile;
      previewDrawer.width = '30%';
      previewDrawer.visible = true;
      Events.emit('reloadForm');
      // baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer30, url, '手机端表单预览'));
      return;
    }
    if (key === PreviewType.PC) {
      // previewDrawer.title = 'PC端表单预览';
      // previewDrawer.type = PreviewType.PC;
      // previewDrawer.frmID = route.query.FrmID as string;
      // previewDrawer.width = '75%';
      // previewDrawer.visible = true;
      const url = `/src/WF/CCForm/Frm.vue?FrmID=${route.query.FrmID}`;
      // alert(url);
      baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, 'PC端表单预览'));
      Events.emit('reloadForm');
      return;
    }
  };
  const checkFrmVisible = ref(false);
  // const checkFrm = () => {
  //   checkFrmVisible.value = true;
  // };

  const formConfig = ref<Entity>();
  const formConfigData = ref<Recordable>({});
  // 表单设置，不需要重载，但需要触发事件
  const formSetting = async () => {
    // gpnTitle.value = '表单属性';
    const formId = route.query.FrmID + '';
    // const formConfig = new Entity('BP.Sys.MapData', formId);
    // await formConfig.Init();
    store.professionSettingTitle = '属性';
    if (unref(formConfig)!.getData().FrmType == 9) {
      store.professionSettingUrl = `../../Comm/RefFunc/En.htm?EnName=TS.WF.Template.Frm.MapFrmWps&PKVal=${formId}`;
    } else {
      store.professionSettingUrl = `../../Comm/RefFunc/En.htm?EnName=TS.Frm.MapFrmFool&PKVal=${formId}`;
    }
    store.professionSettingType = 'EN';
    store.professionSettingVisible = true;
  };

  // 导入导出, 需要刷新
  const exportAndImport = () => {
    gpnTitle.value = '导入导出';
    const url = `./ImpExp/Imp/Default.htm?FrmID=${route.query.FrmID}&EnName=GPN_FrmExpImp&DoType=FunList&FK_Flow=${route.query.FK_Flow}&FK_Node=${route.query.nodeID}`;
    gpnParams.value = getAllRequestParams(url);
    gpnVisible.value = true;
    triggerRefresh.value = true;
  };

  const reloadDesigner = () => {
    // initDesigner();
    Events.emit('reloadForm', undefined);
  };

  const handleAnim = (state: boolean) => {
    if (state) {
      anim.value = true;
      reloadHover.value = true;
      setTimeout(() => {
        anim.value = false;
      }, 300);
    } else {
      anim.value = true;
      reloadHover.value = false;
      setTimeout(() => {
        anim.value = false;
      }, 300);
    }
  };
  onMounted(async () => {
    Events.on('openIframe', ({ title, url }) => {
      gpnTitle.value = title;
      gpnParams.value = getAllRequestParams(getIframeAddress(url));
      gpnVisible.value = true;
      triggerRefresh.value = true;
    });
    const formId = route.query.FrmID + '';
    formConfig.value = new Entity('BP.Sys.MapData', formId);
    await formConfig.value.Init();
    formConfigData.value = unref(formConfig)?.getData() || {};
  });

  onUnmounted(() => {
    Events.off('openIframe');
  });
</script>

<style lang="less" scoped>
  @media screen and (max-width: 1200px) {
    .tool-group .btn span {
      display: none;
    }

    .collapse span {
      display: none;
    }

    .tool-group .btn .box .shrink {
      display: block;
    }

    .tool-group .btn .box .expand {
      display: none;
    }
  }

  .tool-group {
    width: 100%;
    height: 50px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding-left: 20px;
    padding-right: 20px;
    border-bottom: 1px solid #eeeeee;

    .btn {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      justify-content: center;
      cursor: pointer;
      margin-left: 10px;

      span {
        margin-left: 4px;
        font-size: 14px;
      }
    }

    .box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;

      .shrink {
        display: none;
        margin-left: 4px;
      }

      .expand {
        display: block;
        margin-left: 4px;
      }
    }

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .right {
      flex: 3;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .auto-generate-btn {
        margin-right: 40px;
      }
    }

    .collapse {
      .trigger {
        margin-right: 3px;
        // margin-top: -3px;
      }

      flex-shrink: 0;
      display: flex;
      align-items: center;
      color: #1890ff;
    }
  }

  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes rotate-enter {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(180deg);
    }
  }

  @keyframes rotate-leave {
    from {
      transform: rotate(180deg);
    }

    to {
      transform: rotate(0);
    }
  }

  .reload-hover {
    animation: rotate-enter linear 0.3s;
  }

  .reload-hover-leave {
    animation: rotate-leave linear 0.3s;
  }

  .pc-wrapper {
    border: none;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .iframe {
    border: none;
    width: 100%;
    height: 800px;
    margin: 0 auto;
  }
</style>
