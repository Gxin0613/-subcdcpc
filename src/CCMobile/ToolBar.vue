<template>
  <div class="toolbar-wrapper">
    <Tabbar v-if="!IsShowMsg" class="tabbar">
      <TabbarItem
        v-for="(btn, index) in btnList"
        :style="{
          'background-color': index === 0 ? '#ff7346' : '#fff',
          color: index === 0 ? '#fff !important' : '#666 !important',
          flex: index === 0 ? 4 : 1,
        }"
        :key="btn.No"
        :name="btn.No"
        class="btn-type"
        @click="ClickBtn(btn)"
      >
        <template v-if="btn.No === 'More'">
          <Popover placement="top-end" v-model:show="showPopover" trigger="click" :actions="popverBtnList" @select="onSelect">
            <template #reference>
              <div :disabled="btnDisabled" style="border: none">{{ btn.text }}</div>
            </template>
          </Popover>
        </template>
        <template v-if="btn.No != 'More'">
          <template v-if="btn.No == 'Send'">
            <Button
              :loading="btnLoading"
              :disabled="sendDisabled"
              style="padding: 0; margin: 0; border: 0; background-color: transparent; width: 100%"
              :style="{ color: index === 0 ? '#fff !important' : '#666 !important' }"
              >{{ btn.Name }}</Button
            >
          </template>
          <template v-else-if="btn.No == 'Track'">
            <Popover placement="top-end" v-model:show="showTrackTimePopover" trigger="click" :actions="actions" @select="onTrackSelect">
              <template #reference>
                <div :disabled="btnDisabled" style="border: none">{{ btn.Name }}</div>
              </template>
            </Popover>
          </template>
          <template v-else>
            <div :disabled="btnDisabled" style="width: 100%; text-align: center">{{ btn.Name }}</div></template
          >
        </template>
      </TabbarItem>
    </Tabbar>
    <Popup v-model:show="toNodePop" position="bottom">
      <Picker
        show-toolbar
        :columns="toNodes"
        title="选择到达的节点"
        :columns-field-names="customFieldName"
        confirm-button-text="发送"
        @click-option="ChangeToNodeAndSend"
        @confirm="ChangeToNodeAndSend"
        @cancel="toNodePop = false"
      />
    </Popup>
    <Popup v-model:show="deptStaPop" position="bottom">
      <Picker show-toolbar :columns="deptStas" title="选择提交身份" confirm-button-text="确定" @click-option="ChangeSelect" @confirm="ChangeSelect" @cancel="deptStaPop = false" />
    </Popup>
    <!--pop弹窗-->
    <Popup
      v-model:show="popModal.visible"
      position="bottom"
      round
      closeable
      :close-icon="CloseIcon"
      :style="{ width: '100%', height: '85%', backgroundColor: '#fafafd' }"
      @close="closePopupShow"
    >
      <div v-if="popAnimReady">
        <div class="pop-title">{{ popModal.modalTitle }}</div>
        <Track v-if="popModal.modalType == 'Track'" :params="query" />
        <div v-else-if="popModal.modalType === 'DelayedSend'" style="width: 100%; height: 100%; margin-top: 60px">
          <div style="display: flex; align-items: center; background-color: white">
            <Form layout="vertical" style="width: 70%; margin: 0 auto">
              <Field v-model="TimeValue.days" readonly clickable name="picker" :is-link="true" label="天" placeholder="点击选择天" @click="onSelectClickPop(0)" />
              <Field v-model="TimeValue.hours" readonly clickable name="picker" :is-link="true" label="小时" placeholder="点击选择小时" @click="onSelectClickPop(1)" />
              <Field v-model="TimeValue.mins" readonly clickable name="picker" :is-link="true" label="分钟" placeholder="点击选择分钟" @click="onSelectClickPop(2)" />
              <div>
                <div style="margin: 5px 85px 5px 5px" class="refund">
                  <Button type="primary" @click="DelayedSend()" style="margin-right: 1em">延期发送</Button>
                  <Button type="primary" @click="popModal.visible = false">关闭</Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
        <div v-else-if="IsShowMsg === false && popModal.modalType.includes('Packup')" style="width: 100%; height: 100%">
          <div v-if="IsHtmlPage" style="width: 100%; height: 100%">
            <iframe :src="URL" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
          </div>
          <div v-if="IsPdfPage" style="width: 100%; height: 100%">
            <Card style="width: 100%; height: 100%">
              <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
              <ul>
                <li>在线打印与预览</li>
                <li>系统把整个表单生成了一个pdf或htm文件.</li>
                <li>点击这里 <a :href="URL" target="_blank" download=".htm">进行下载或在线预览</a></li>
              </ul>
              <Button type="primary" @click="popModal.visible = false">关闭窗口</Button>
            </Card>
          </div>
          <div v-if="IsZipPage" style="width: 100%; height: 100%">
            <Card style="width: 100%; height: 100%">
              <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
              <ul>
                <li>zip在线打印与预览</li>
                <li>系统把整个表单生成了一个zip文件,这个文件里包括了,表单的附件，二维码等信息.</li>
                <li>点击这里 <a :href="URL" target="_blank">进行打包下载</a></li>
              </ul>
              <Button type="primary" @click="popModal.visible = false">关闭窗口</Button>
            </Card>
          </div>
        </div>
        <div v-else-if="IsShowMsg === false && popModal.modalType === 'PrintDoc'" style="width: 100%; height: 100%">
          <Card style="width: 100%; height: 100%">
            <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
            <ul>
              <li>单据打印</li>
              <li>点击这里 <a :href="URL" download>进行单据下载</a></li>
            </ul>
            <Button type="primary" @click="popModal.visible">关闭窗口</Button>
          </Card>
        </div>
        <div v-else-if="popModal.modalType === 'PreplaceWokerEnable'">
          <template v-for="(item, idx) in dataSource" :key="idx">
            <div class="vant-address-item">
              <div class="vant-cell vant-cell--borderless">
                <div class="vant-cell__value vant-cell__value--alone">
                  <template v-for="column in columnsTable" :key="column.key">
                    <div v-if="column.key !== 'EmpNames'" class="vant-gl-link-text">
                      <Field v-model="item[column.key]" center :label="column.title" readonly input-align="right" class="vant-popModal" />
                    </div>
                    <div v-else-if="column.key === 'EmpNames'">
                      <Field :is-link="true" v-model="item[column.key]" center :label="column.title" input-align="right" @click="onClickPop(item)" class="vant-popModal" />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
        <iframe v-else-if="IsShowMsg === false && popModal.modalType === 'MyView'" :src="URL" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
        <BaseModal v-else :modalType="popModal.modalType" :key="timer" :params="query" @UnSend="UnSend" @handleCancel="handleCancel" :WGFlow="entityRef" />
      </div>
    </Popup>
    <Popup v-model:show="selectPop.visible" position="bottom">
      <Picker show-toolbar :columns="selectPop.ddl" @confirm="onConfirmSelect" @cancel="selectPop.visible = false" />
    </Popup>
    <!--消息弹窗-->
    <div v-if="IsShowMsg" style="width: 100%; top: 46px; left: 0; z-index: 99; background-color: #fff">
      <template v-if="msgType === 'msg'">
        <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 15px; height: calc(var(--viewport-height) - 46px)">
          <!-- <img :src="SendComplete" alt="" /> -->
          <p v-for="(item, index) in msg" :key="index" v-html="item"></p>
          <div style="text-align: center; display: flex; flex-direction: column">
            <Button v-if="isTask" type="primary" @click="ToAllotTask" style="margin-bottom: 15px; background: #fff; color: #000; border-color: #eeeeee; width: calc(100vw - 30px)"
              >指定特定的处理人处理</Button
            >
            <Button v-if="isHaveUnSend" type="primary" @click="UnSend" style="margin-bottom: 15px; background: #fff; color: #000; border-color: #eeeeee; width: calc(100vw - 30px)"
              >撤销本次发送</Button
            >
            <Button type="primary" @click="handleCancel" style="background: #2279d6; border-color: #2279d6; width: calc(100vw - 30px)">关闭</Button>
          </div>
        </div>
      </template>
      <template v-if="msgType === 'AllotTask'">
        <AllotTask :params="props.params" @handleCancel="handleCancel" />
      </template>
    </div>
    <!-- 发送后页面添加遮罩层 -->
    <div v-if="IsShowMask" class="mask-layer"></div>
    <!-- 预置处理人人员选择 -->
    <Popup v-model:show="popSelectModal.visible" position="bottom" :style="{ width: '100%', height: '100%' }">
      <NavBar :title="popSelectModal.title" :fixed="true" left-arrow @click-left="PopSelectModalOK" />
      <div style="padding-top: 46px; height: calc(var(--viewport-height) - 46px)">
        <PopTreeEns
          v-if="popMapExt.ExtType === 'PopTreeEns'"
          ref="treeEns"
          :listSql="popMapExt.Tag3 || undefined"
          :treeSql="popMapExt.Tag1 || undefined"
          :parentNo="popMapExt.Tag5 || undefined"
          :search-sql="popMapExt.Tag4 || ''"
          :is-have-upper-level="popMapExt.Tag6 === '0' ? false : true"
          :is-multi-select="popMapExt.IsMultipleChoice"
          :is-show-search="'1'"
          :isLazily="true"
          :selected-items="popSelectModal.selectNo"
          :selected-item-names="popSelectModal.selectName"
          :key="preplaceKey"
        />
        <PopGroupList
          v-if="popMapExt.ExtType === 'PopGroupList'"
          ref="groupList"
          :listSql="popMapExt.Tag2 || undefined"
          :groupListSql="popMapExt.Tag1 || undefined"
          :is-multi-select="popMapExt.IsMultipleChoice"
          :is-show-search="'0'"
          :selected-items="popSelectModal.selectNo"
          :selected-item-names="popSelectModal.selectName"
          :key="preplaceKey"
        />
      </div>
      <Tabbar class="tool-bar" v-model="active">
        <TabbarItem class="pop-btn-type" @click="PopSelectModalOK" style="width: 90%; height: 80%">
          <Button type="primary" class="btnPosition">
            <CarryOutOutlined style="margin-right: 5px" />
            确认
          </Button>
        </TabbarItem>
      </Tabbar>
    </Popup>
  </div>
</template>
<script lang="ts" setup>
  // setup 在vue实例创建之前    
  import { Tabbar, TabbarItem, Popover, Popup, Picker, Form, Field, Button, showToast, showFailToast, showSuccessToast, showConfirmDialog, NavBar } from 'vant';
  import { message, Card } from 'ant-design-vue';
  import { reactive, ref, inject, shallowRef, Ref } from 'vue';
  import { Node } from '/@/WF/TSClass/Node';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRoute, useRouter } from 'vue-router';
  import BSEntity from '/@/utils/gener/BSEntity';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';
  import { NodeFormType } from '/@/WF/Admin/EnumLab';
  import BaseModal from './WorkOpt/BaseModal.vue';
  import Track from '/@/WF/WorkOpt/OneWork/Track.vue';
  import AllotTask from '/@/WF/WorkOpt/AllotTask.vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import Event from '/@/utils/Events';
  import { SystemConfig } from '/@/bp/difference/SystemConfig';
  import { getAppEnvConfig } from '../utils/env';
  import CloseIcon from '/@/assets/icons/closeIcon.png';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
  import { usePostMessage } from '../hooks/message/usePostMessage';
  import { BtnLab } from '../WF/Admin/AttrNode/BtnLab';
  import PopTreeEns from '/@/CCMobile/CCForm/Pop/PopTreeEns.vue';
  import PopGroupList from '/@/CCMobile/CCForm/Pop/PopGroupList.vue';
  import { AtPara } from '../bp/da/AtPara';
  import { GloWF } from '../WF/Admin/GloWF';
  import WebUser from '../bp/web/WebUser';
  import { CarryOutOutlined } from '@ant-design/icons-vue';
  import { windowOpen } from '/@/utils/windowOpen';
  import { MyFlowNodeToolBar } from '/@/DataUser/OverrideFiles/MyFlowNodeToolBar';
  import { WaiGuaBaseFlow } from '/@/bp/UIEntity/WaiGuaBaseFlow';
  import { ClassFactoryOfWaiGuaFlow } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaFlow';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DBAccess from '../utils/gener/DBAccess';
  const VSTO_FORM_TYPE = [6, 61];
  const { t } = useI18n();
  interface ToNode {
    DeliveryParas: string;
    IsSelectEmps: string;
    IsSelected: string;
    No: string;
    value: string;
  }

  interface Btn {
    No: string; //编号
    text: string; //名称
    Name: string; //名称
    Oper: string; //操作
    Role: string; //启用规则
    Icon: string;
  }

  // start 预置处理人数据
  const dataSource = ref();
  const columnsTable: Array<Recordable> = [
    {
      title: '节点编号',
      key: 'NodeID',
      width: 100,
    },
    {
      title: '节点名称',
      key: 'Name',
      width: 150,
    },
    {
      title: '处理人',
      key: 'EmpNames',
    },
  ];
  // end

  //获取到父流程的参数
  const props = defineProps({
    pageType: {
      type: String,
      default: 'MyFlow',
      required: true,
    },
    frmType: {
      type: Number,
      default: 0,
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    nodeInfo: {
      type: Object,
    },
  });
  const router = useRouter();
  const timer = ref(0);
  const route = useRoute();
  const flowInfo = inject('flowInfo') as Ref<Recordable>;
  let query = {
    ...route.query,
    ...props.params,
  };
  if (flowInfo?.value) {
    query = {
      ...query,
      ...props.params,
      ...flowInfo.value,
    };
  }
  //操作按钮集合
  const btnList = ref<Array<Btn>>([]);
  const popverBtnList = ref<Array<Btn>>([]);
  const btnDisabled = ref(false);
  const btnLoading = ref(false);
  const sendDisabled = ref(false);
  //更多按钮显示
  const showPopover = ref(false);
  const showTrackTimePopover = ref(false);
  //下拉框的节点
  const toNodePop = ref(false);
  const customFieldName = { text: 'Name', value: 'No' };
  //到达的节点集合
  const toNodes = ref<Array<ToNode>>([]);
  //节点属性
  const nodeExt = ref<Node>({});
  const toNodeID = ref('0');

  //打印
  const IsHtmlPage = ref(false);
  const IsPdfPage = ref(false);
  const IsZipPage = ref(false);
  const PrintDocData = ref('');
  //打印单据
  // const PrintDocData = ref();
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;
  const URL = ref();

  //弹窗显示
  const popModal = reactive({
    visible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
  });
  //预置处理人pop弹窗人员选择
  //start
  const popSelectModal = reactive({
    visible: false,
    title: '',
    selectNo: '',
    selectName: '',
  });
  //设置弹窗参数
  const popMapExt = reactive({
    ExtModel: 'Pop',
    ExtType: 'PopTreeEns',
    AtPara: new AtPara(),
    Tag1: GloWF.srcDeptLazily,
    Tag3: GloWF.srcEmpLazily,
    Tag4: GloWF.srcEmpSearchKey,
    Tag2: '',
    Tag5: '0',
    Tag6: '1',
    IsMultipleChoice:false,
  });
  //end

  //切换部门岗位
  const deptStas = ref<any[]>([]);
  const deptStaPop = ref(false);
  //节点消息
  const IsShowMsg = ref(false);
  const msg = ref<string[]>([]);
  const isHaveUnSend = ref(false);
  const isTask = ref(false);
  const msgType = ref('msg');
  const emit = defineEmits(['ChangeLoading', 'call-iframe-method', 'SaveData', 'VerifyFormData', 'GetMainData', 'UpdateData']);

  //选择器弹窗
  const selectPop = reactive({
    visible: false,
    ddl: [] as any[],
    mode: 0,
  });
  const onSelectClickPop = (type) => {
    selectPop.visible = true;
    selectPop.mode = type;
    selectPop.ddl = [];
    if (type === 0) {
      OptionsDays.forEach((item) => {
        selectPop.ddl.push({
          value: item.value,
          text: item.value,
        });
      });
    }
    if (type === 1) {
      OptionsHours.forEach((item) => {
        selectPop.ddl.push({
          value: item.value,
          text: item.value,
        });
      });
    }
    if (type === 2) {
      selectPop.ddl.push({
        value: 0,
        text: 0,
      });
      selectPop.ddl.push({
        value: 15,
        text: 15,
      });
      selectPop.ddl.push({
        value: 30,
        text: 30,
      });
      selectPop.ddl.push({
        value: 45,
        text: 45,
      });
    }
  };

  /**
   * select弹窗选择后确定操作
   * @param value
   */
  const onConfirmSelect = async ({ selectedOptions }) => {
    const value = selectedOptions[0].value;
    if (selectPop.mode == 0) TimeValue.days = value;
    if (selectPop.mode == 1) TimeValue.hours = value;
    if (selectPop.mode == 2) TimeValue.mins = value;
    selectPop.visible = false;
  };
  const entityRef = ref<WaiGuaBaseFlow>(null);
  /**
   * 初始化操作栏按钮
   * @constructor
   */
  //预置处理问题
  const preplaceWokerRole = ref(0);
  const isHaveClickPreplaceWoker = ref(false);
  const InitPage = async () => {
    try {
      const enName = 'WGFlow_' + (props.params.FK_Flow || props.params.FlowNo);
      const entity = await ClassFactoryOfWaiGuaFlow.GetEn(enName as string);
      if (entity != null) {
        entity.WorkID = props.params.WorkID;
        entity.NodeID = props.params.FK_Node || props.params.NodeID;
        entityRef.value = entity;
        entityRef.value.params = props.params;
      }

      emit('ChangeLoading', true, null);
      let handlerName = 'BP.WF.HttpHandler.WF_MyFlow';
      if (props.pageType === 'MyView' || props.pageType === 'MyFrm') handlerName = 'BP.WF.HttpHandler.WF_MyView';
      if (props.pageType === 'MyCC') handlerName = 'BP.WF.HttpHandler.WF_MyCC';
      const handler = new HttpHandler(handlerName);
      handler.AddJson(query);
      handler.AddPara('PageFrom', 'Vue3');
      const data = await handler.DoMethodReturnString('InitToolBar');
      if (typeof data == 'string' && data.includes('err@') == true) {
        showFailToast(data.replace('err@', ''));
        return;
      }
      let toolbars = data['ToolBar'] || data;
      const preplaceWokerBtn = toolbars.find((item) => item.No === 'PreplaceWoker');
      if (preplaceWokerBtn != null) preplaceWokerRole.value = parseInt(preplaceWokerBtn.Oper || '2');
      if (preplaceWokerRole.value === 2) toolbars = toolbars.filter((item) => !(item.No === 'PreplaceWoker' && item.Oper == '2'));

      toolbars.forEach((btn) => {
        let name = btn.Name;
        if (name === '下载公文正文(word)') name = '下载公文正文Word';
        if (name === '下载公文正文(pdf)') name = '下载公文正文PDF';
        if (name === '加签（主持人模式）') name = '加签主持人';

        if (name === '确定/完成') name = '确定完成';
        btn.Name = t('flowandfrm.api.' + name);
      });
      if (SystemConfig.CustomNo === 'TianYu') {
        toolbars = toolbars.filter((item) => ['PackUp_zip', 'PackUp_html', 'PackUp_pdf', 'PrintDoc'].includes(item.No) == false);
      }
      if (toolbars.length <= 4) btnList.value = toolbars;
      else {
        btnList.value = toolbars.slice(0, 3);
        btnList.value.push({
          No: 'More',
          text: '更多',
          Name: '更多',
          Oper: '',
          Role: '1',
          Icon: '',
        });
        toolbars.slice(3).forEach((toolbar) => {
          if (toolbar.No === 'Track') {
            toolbar.No = 'TrackBase';
            popverBtnList.value.push({
              No: 'TimeBase',
              text: '时间轴',
              Name: '时间轴',
              Oper: '',
              Role: '',
              Icon: '',
            });
          }
          popverBtnList.value.push({
            No: toolbar.No,
            text: toolbar.Name,
            Name: toolbar.Name,
            Oper: toolbar.Oper,
            Role: toolbar.Role,
            Icon: toolbar.Icon,
          });
        });
      }
      toNodes.value = data['ToNodes'] || [];

      const deptSta = data['DeptStaion'] || [];
      const dept = data['Depts'] || [];
      if (deptSta.length != 0) {
        deptStas.value = deptSta.map((item) => {
          return {
            value: item.DeptNo + '/' + item.StationNo,
            text: item.DeptName + '/' + item.StationName,
            DeptNo: item.DeptNo,
            StationNo: item.StationNo,
            DeptName: item.DeptName,
            StationName: item.StationName,
          };
        });
      }
      if (dept.length != 0) {
        deptStas.value = dept.map((item) => {
          return {
            value: item.DeptNo,
            text: item.DeptName,
            DeptNo: item.DeptNo,
            DeptName: item.DeptName,
          };
        });
      }

      if (toNodes.value.length > 0) {
        const nodes = toNodes.value.filter((item) => item.IsSelected);
        if (nodes.length > 0) toNodeID.value = nodes[0].No;
        else toNodeID.value = toNodes.value[0].No;
      }
      if (props.nodeInfo) {
        nodeExt.value = props.nodeInfo as unknown as Node;
        if (data['WF_Node']) nodeExt.value.IsBackTrack = data['WF_Node'][0]['IsBackTrack'];
      }
      // if (data['WF_Node']) nodeExt.value = data['WF_Node'][0] as Node;
      else {
        const en = new Node();
        await en.Init();
        const nodeID = query.FK_Node as string;
        en.NodeID = parseInt(nodeID || 0);
        await en.RetrieveFromDBSources();
        nodeExt.value = en;
        if (data['WF_Node']) nodeExt.value.IsBackTrack = data['WF_Node'][0]['IsBackTrack'];
      }
    } catch (e) {
      emit('ChangeLoading', true, {
        hasError: true,
        tips: e as string,
      });
    } finally {
      emit('ChangeLoading', false, null);
    }
  };
  const ChangeSelect = async (deptSta) => {
    const options = deptSta.selectedOptions;
    if (options.length == 0) {
      showToast('没有选择人员身份');
      return;
    }
    try {
      //存储改变的值
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      handler.AddJson(options[0]);
      await handler.DoMethodReturnString('Save_DeptSta');
      showSuccessToast('人员身份设置成功');
    } catch (e) {
      showFailToast(e as string);
    } finally {
      deptStaPop.value = false;
    }

    return;
  };

  //弹窗关闭事件
  //预置处理人确定
  let preplaceWokerMsg = '';
  const closePopupShow = async () => {
    if (popModal.modalType === 'PreplaceWokerEnable') {
      isHaveClickPreplaceWoker.value = true;
      preplaceWokerMsg = '';
      for (let data of dataSource.value) {
        if ((data.EmpNames == '' || data.EmpNames == null || data.EmpNames == undefined) && (data.DeliveryWay === 710 || data.DeliveryWay === 711)) {
          message.warn(data.NodeID + '轨迹');
          preplaceWokerMsg += '撤销流程' + data.Name + '您确定要撤销当前流程吗?';
        }
      }
    }
    popModal.visible = false;
    IsShowMask.value = false;
    sendDisabled.value = false;
    if (preplaceWokerMsg === '' && preplaceWokerRole.value > 1) await Send();
  };
  InitPage();

  const { beforeSave, beforeSend, afterSend, beforeDelete } = userMyFlowSelfLoader(query);
  const onSelect = async (btn: Btn) => {
    await ClickBtn(btn);
  };
  const actions = [{ text: '轨迹' }, { text: '时间轴' }];
  const onTrackSelect = async (btn) => {
    query.NodeName = nodeExt.value.Name;
    query.WorkID = query.WorkID;
    query.FK_Flow = query.FK_Flow;
    query.FID = query.FID;
    // modalShow('TimeBase', '轨迹');
    if (btn.text === '删除流程') modalShow('Track', '轨迹');
    else modalShow('TimeBase', '时间轴');
  };
  const isDelayedSend = ref<boolean>(false);
  //发送后显示遮罩层
  const IsShowMask = ref<boolean>(false);

  const frmID = ref('');
  const rowDataRef = ref<Record<string, any>>(null);

  const handleBtnBefore = () => {
    if (nodeExt.value.FormType != NodeFormType.SelfForm && nodeExt.value.FormType != NodeFormType.SDKForm) {
      emit('GetMainData', (val, _frmID) => {
        rowDataRef.value = val;
        frmID.value = _frmID;
      });
    }
    if (entityRef.value != null) {
      entityRef.value.FrmID = frmID.value;
      if (!!rowDataRef.value) {
        entityRef.value.OID = rowDataRef.value?.OID;
        entityRef.value.FrmBodyJson = rowDataRef.value;
      }
    }
  };

  /**
   * 按钮点击操作
   * @param btn
   * @constructor
   */
  const handleBtn = async (btn: Btn) => {
    const oper = ref(btn.Oper);
    oper.value = oper.value || '';
    handleBtnBefore();
    //需要弹出窗的操作
    switch (btn.No) {
      case 'More':
        showPopover.value = true;
        break;
      case 'Save': //保存
        const resultData = await beforeSave(rowDataRef.value, frmID.value, nodeExt.value.FK_Flow, nodeExt.value.NodeID, props.params.WorkID);
        if (typeof resultData === 'boolean') {
          if (resultData === true) emit('SaveData', 0);
        }
        if (typeof resultData === 'object') {
          emit('UpdateData', resultData);
          emit('SaveData', 0);
        }
        break;
      case 'Send': //发送
        isDelayedSend.value = false;
        if (toNodes.value.length > 1) {
          toNodePop.value = true;
          break;
        }
        if (toNodes.value.length === 1) {
          toNodeID.value = toNodes.value[0].No;
        }
        //预置处理人
        if ((preplaceWokerMsg != '' || isHaveClickPreplaceWoker.value == false) && preplaceWokerRole.value === 1) {
          //判断流程是否只有当前节点启用了该功能
          const dt = await DBAccess.RunSQLReturnTable(`SELECT COUNT(*) as num From WF_Node WHERE FK_Flow=${nodeExt.value.FK_Flow} AND PreplaceWokerEnable!=0`);
          if (parseInt(dt[0]['num']) == 1) {
            showFailToast(preplaceWokerMsg + '您确定要删除当前流程吗?');
            break;
          }
          if (parseInt(dt[0]['num']) > 1) {
            showFailToast(preplaceWokerMsg + '作废流程');
          }
        }
        if (preplaceWokerRole.value > 1) {
          await InitPreset();
          if (Array.isArray(dataSource.value) && dataSource.value.length > 0) {
            //调用接口传递JSON 获取数据 MyPK FK_Node WorkID FK_Emp EmpName DeptName
            modalShow('PreplaceWokerEnable', '您确定要作废当前流程吗?');
          } else {
            await Send();
          }
        } else {
          await Send();
        }
        break;
      case 'DelayedSend':
        isDelayedSend.value = true;
        query['isDelayedSend'] = true;
        Send();
        break;
      case 'SubmitSF': //人员身份
        deptStaPop.value = true;
        break;
      case 'UnSend': //撤销发送
        showConfirmDialog({
          title: '结束流程',
          message: '您确定要结束当前流程吗?',
        }).then(async () => {
          try {
            await UnSend();
          } catch (err: any) {
            message.error(err);
          }
        });

        break;
      case 'Delete': //删除流程
        showConfirmDialog({
          title: '预置处理人',
          message: '回滚',
        }).then(async () => {
          try {
            if (entityRef.value != null) {
              if ((await new WaiGuaFlow(entityRef.value).BeforeFlowDel()) == false) return;
            } else {
              if ((await beforeDelete()) == false) return;
            }
            await DeleteFlow();
          } catch (err: any) {
            showFailToast(err);
          }
        });

        break;
      case 'CanCelFlow': //作废流程
        showConfirmDialog({
          title: '退回',
          message: '退回',
        }).then(async () => {
          try {
            await CanCelFlow();
          } catch (err: any) {
            showFailToast(err);
          }
        });

        break;
      case 'EndFlow': //结束流程
        showConfirmDialog({
          title: '流转自定义',
          message: '挂起',
        }).then(async () => {
          try {
            const handlerEnd = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
            handlerEnd.AddPara('FK_Flow', query.FlowNo);
            handlerEnd.AddPara('WorkID', query.WorkID);
            const dataEnd = await handlerEnd.DoMethodReturnString('MyFlow_StopFlow');
            if (typeof dataEnd === 'string' && dataEnd.includes('err@')) {
              showFailToast(dataEnd);
              return;
            }
            showToast(dataEnd.replace(/@/g, ''));
            handleCancel();
          } catch (err: any) {
            showFailToast(err);
          }
        });

        break;
      case 'Press':
        Press();
        break;
      case 'PreplaceWoker':
        //只能在开始节点启用预置处理人
        const btnLab = new BtnLab(nodeExt?.value?.NodeID);
        await btnLab.RetrieveFromDBSources();
        if (btnLab.PreplaceWokerEnable > 0) {
          await InitPreset();
          if (Array.isArray(dataSource.value) && dataSource.value.length > 0) {
            //调用接口传递JSON 获取数据 MyPK FK_Node WorkID FK_Emp EmpName DeptName
            modalShow('PreplaceWokerEnable', '子线程');
          }
        }
        break;
      case 'Rollback':
        modalShow('Rollback', '移交');
        break;
      case 'Return':
        query['Title'] = btn.Name || '轨迹';
        modalShow('ReturnWork', btn.Name || '时间轴');
        break;
      case 'TransferCustom':
        modalShow('TransferCustom', '先会签再发送');
        break;
      case 'Hungup':
        modalShow('Hungup', '加主持人');
        break;
      case 'Thread':
        modalShow('ThreadDtl', '抄送');
        break;
      case 'Shift':
        modalShow('Shift', '抄送/分享');
        break;
      case 'Btn_WorkCheck':
        break;
      case 'Askfor':
        break;
      case 'Track':
        showTrackTimePopover.value = true;
        break;
      case 'TrackBase':
        query.NodeName = nodeExt.value.Name;
        query.WorkID = route.query.WorkID;
        query.FK_Flow = route.query.FK_Flow;
        query.FID = route.query.FID;
        // modalShow('TimeBase', '轨迹');
        modalShow('Track', '重要性');
        break;
      case 'TimeBase':
        query.NodeName = nodeExt.value.Name;
        query.WorkID = route.query.WorkID;
        query.FK_Flow = route.query.FK_Flow;
        query.FID = route.query.FID;
        // modalShow('TimeBase', '轨迹');
        modalShow('TimeBase', '确认');
        break;
      case 'HuiQian':
        query['HuiQianType'] = 'HuiQian';
        modalShow('HuiQian', '取消确认');
        break;
      case 'AddLeader':
        query['HuiQianType'] = 'AddLeader';
        modalShow('HuiQian', '未确认');
        break;
      case 'CC':
        modalShow('CC', '取消确认');
        break;
      case 'CCORShare':
        modalShow('CCORShare', '确认');
        break;
      case 'PR':
        modalShow('PRI', '未找到zip文件, 原始数据为:');
        break;
      case 'Confirm': // @llj.
        const gwf = new GenerWorkFlowExt();
        gwf.setPKVal(query.WorkID);
        await gwf.RetrieveFromDBSources();
        const val2 = gwf.GetParaString('C_' + WebUser.No, '0');
        if (val2 == '0') {
          //设置按钮text.  '已确认'
          gwf.SetPara('C_' + WebUser.No, '1');
          if (btn.Name === '打印') btn.Name = '打印';
          await gwf.Update();
        } else {
          //设置按钮text.  '取消确认'
          gwf.SetPara('C_' + WebUser.No, '0');
          if (btn.Name === '打印' || btn.Name === '打印单据') btn.Name = '其他类型还未解析';
          await gwf.Update();
        }
        break;
      case 'PackUp_zip':
      case 'PackUp_html':
      case 'PackUp_pdf':
        // query['PrintType'] = btn.No.replace('PackUp_', '');
        // modalShow('Packup', '打印');
        query['PrintType'] = btn.No.replace('PackUp_', '');
        console.log(query);
        const handlers = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handlers.AddPara('FileType', query.PrintType);
        handlers.AddPara('FK_Node', query.FK_Node);
        handlers.AddPara('FID', query.FID);
        handlers.AddPara('WorkID', query.WorkID);
        handlers.AddPara('FK_Flow', query.FlowNo || query.FK_Flow);
        handlers.AddPara('BasePath', basePath);
        const dataPackup: any = await handlers.DoMethodReturnString('Packup_Init');
        if (query['PrintType'] == 'html') {
          query['PrintType'] = 'htm';
        }
        if (Array.isArray(dataPackup) && dataPackup.length > 0) {
          let url = dataPackup.find((item) => item.No === query['PrintType'])?.Name;
          const startIndex = url.indexOf('/DataUser/');
          const relativePath = url.substring(startIndex);
          url = basePath + relativePath;
          if (!!url) {
            window.open(url);
          } else {
            showFailToast('选择下一个节点及下一个节点接受人' + JSON.stringify(dataPackup));
          }
          return;
        }
        dataPackup.forEach((item) => {
          item.Name = item.Name.replace(basePath + '/', '');
          const startIndex = item.Name.indexOf('/DataUser/');
          const relativePath = item.Name.substring(startIndex);
          if (query['PrintType'] == item.No && item.No == 'htm') {
            IsPdfPage.value = true;
            URL.value = basePath + '/' + relativePath;
            window.open(basePath + '/' + relativePath);
            modalShow('Packup', '关注');
            return;
          } else if (query['PrintType'] == item.No && item.No == 'pdf') {
            IsPdfPage.value = true;
            URL.value = basePath + '/' + relativePath;
            window.open(basePath + '/' + relativePath);
            modalShow('Packup', '取消关注');
            return;
          } else if (query['PrintType'] == item.No && item.No == 'zip') {
            IsZipPage.value = true;
            if (item.Name.includes(basePath)) {
              URL.value = item.Name;
            } else {
              URL.value = basePath + '/' + relativePath;
            }
            window.location.href = URL.value;
            modalShow('Packup', '关注');
            return;
          }
        });
        break;
      case 'PrintDoc':
        try {
          query['PrintType'] = btn.No.replace('Print', '');
          emit('GetMainData', (val, _frmID) => {
            rowData.value = val;
            frmID.value = _frmID;
          });
          const handlerDoc = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
          handlerDoc.AddPara('FileType', query.PrintType);
          handlerDoc.AddPara('FK_Node', query.FK_Node);
          handlerDoc.AddPara('FID', query.FID);
          handlerDoc.AddPara('WorkID', query.WorkID);
          handlerDoc.AddPara('NodeID', query.NodeID);
          handlerDoc.AddPara('FK_Flow', query.FlowNo || query.FK_Flow);
          handlerDoc.AddPara('CCFormID', frmID);
          const dataPrintDoc: any = await handlerDoc.DoMethodReturnJson('PrintDoc_Init');
          PrintDocData.value = dataPrintDoc;
          //如果是一个url.
          if (PrintDocData.value.indexOf('file@') == 0 || PrintDocData.value.indexOf('url@') == 0) {
            PrintDocData.value = PrintDocData.value.replace('file@', '');
            PrintDocData.value = PrintDocData.value.replace('url@', '');
            if (PrintDocData.value.indexOf('rtf@') != -1 || PrintDocData.value.indexOf('pdf@') != -1) {
              //直接执行打印
              PrintDocData.value = PrintDocData.value.replace('rtf@', '').replace('pdf@', '');
              URL.value = basePath + PrintDocData.value;
              window.location.href = URL.value;
              modalShow('PrintDoc', '关注');
            } else {
              showToast('取消关注');
            }
            return;
          }
        } catch (err: any) {
          showFailToast(err);
        }
        break;
      case 'SelectAccepter':
        modalShow('Accepter', '关注');
        break;
      case 'DBTemplate':
        break;
      case 'Focus': //关注
        if (btn.Name === '没有配置超链接的URL路径') btn.Name = '调用三方表单方法错误';
        else btn.Name = '没有找到对应的流程按钮 - ';
        if (btn.text === '请输入要传达的信息,可以为空') btn.text = '确定';
        else btn.text = '取消';
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
        handler.AddPara('WorkID', query.WorkID);
        await handler.DoMethodReturnString('Focus');
        break;
      case 'ParentForm': // 查看父流程
        const pWorkID = props.params.PWorkID;
        let pFlowNo = props.params.PFlowNo;
        if (!pFlowNo) {
          //取得父流程FK_Flow
          const gwf = new GenerWorkFlowExt();
          gwf.setPKVal(pWorkID);
          await gwf.RetrieveFromDBSources();
          pFlowNo = gwf.PFlowNo;
        }
        URL.value = '/CCMobile/MyView?WorkID=' + pWorkID + '&FlowNo=' + pFlowNo + '&FK_Flow=' + pFlowNo;
        router.push(URL.value);
        break;
      case 'NodeToolBar':
        const atPara = new AtPara(btn.AtPara);
        const excType = atPara.GetValIntByKey('ExcType');
        emit('GetMainData', (val, _frmID) => {
          rowData.value = val;
          frmID.value = _frmID;
        });
        if (excType === 0) {
          //超连接
          let url = btn.Oper;
          if (!url) {
            message.error(btn.Name + '该节点启用了流程流转自定义，但是没有设置流程流转的方向，请点击流转自定义按钮进行设置');
            break;
          }
          url = DealExp(url, query);
          if (url.includes('@')) url = DealExp(url, rowData);
          windowOpen(url);
          break;
        }
        if (excType === 1) {
          //函数
          MyFlowNodeToolBar.btnClick(query.WorkID, query.FK_Node || query.NodeID, query, rowData);
        }
        break;
      default:
        if (oper.value != '') {
          eval(oper.value);
        }
        break;
    }
  };

  const ClickBtn = async (btn: Btn) => {
    if (nodeExt.value.WaitIframeMsg) {
      //需要弹出窗的操作
      emit('call-iframe-method', btn.No, 'onFlowBtnClick', (checked) => {
        if (checked) handleBtn(btn);
      });
      return;
    }
    handleBtn(btn);
  };
  // 处理iframe回调
  const onReceiveMsg = (ev) => {
    const { msgType, action, result } = ev.data;
    console.log('vue receive msg', ev.data);
    if (msgType !== 'onFlowBtnClick') return;
    if (!result) {
      console.warn('节点[');
      return;
    }
    const btn = btnList.value.find((btn) => btn.No === action);
    if (!btn) {
      message.error('没有设置接收人。' + action);
      return;
    }
    handleBtn(btn);
  };
  usePostMessage(onReceiveMsg);
  // end
  /**
   * 发送到的节点按钮显示时的操作
   * @param nodeID
   * @constructor
   */
  const ChangeToNodeAndSend = (toNode) => {
    toNodeID.value = toNode.selectedValues[0];
    toNodePop.value = false;
    Send();
  };
  const SendDeal = (msg, gwf, isHuiQian) => {
    showConfirmDialog({
      title: '请选择到达的节点',
      message: `
            <textarea id="dialogText" rows="2" class="van-field__control" aria-labelledby="van-field-21-label" style="height: 48px;">${msg}</textarea>
           `,
      showCancelButton: true,
      confirmButtonText: '请选择到达的节点',
      cancelButtonText: '请选择到达的节点',
      allowHtml: true,
      beforeClose: (action) => {
        const value = document.getElementById('dialogText').value;
        dialogText.value = value;
        return true;
      },
    })
      .then(async () => {
        if (!!dialogText.value) {
          gwf.setPara('ScripNodeID', query.FK_Node);
          gwf.setPara('ScripMsg', dialogText.value);
          await gwf.Update();
        }
        await SendNext(isHuiQian);
      })
      .catch(async () => {
        await SendNext(isHuiQian);
      });
  };
  /**
   * 发送处理
   * @constructor
   */
  const Send = async (isHuiQian = false) => {
    try {
      emit('ChangeLoading', true, null);
      //是否启用小纸条功能
      if (nodeExt.value.ScripRole == 2) {
        const gwf = new BSEntity('BP.WF.GenerWorkFlow');
        gwf.setPK(query.WorkID as string);
        await gwf.RetrieveFromDBSources();
        const ScripNodeID = GetPara(gwf.AtPara, 'ScripNodeID') || '';
        let msg = GetPara(gwf.AtPara, 'ScripMsg') || '';
        if (ScripNodeID != query.FK_Node) msg = '';
        await SendDeal(msg, gwf, isHuiQian); //prompt('请输入要传达的信息,可以为空.', msg);
        return;
      }
      await SendNext(isHuiQian);
      emit('ChangeLoading', false, null);
    } catch (e) {
      emit('ChangeLoading', null, {
        hasError: true,
        tips: e as string,
      });
    }
  };
  const SendNext = async (isHuiQian) => {
    //判断是不是启用了流程流转自定义，判断是否存在游离态节点
    const buttons = btnList.value.filter((btn) => btn.No === 'TransferCustom');
    if (buttons.length > 0) {
      const ens = new BSEntities('BP.WF.TransferCustoms');
      await ens.Retrieve('WorkID', query.WorkID, 'IsEnable', 1);
      const data = ens.getData();
      if (data.length == 0) {
        emit('ChangeLoading', false, null);
        showFailToast('请选择到达的节点');
        return false;
      }
      const msg = ref('');
      data.forEach((en) => {
        if (en.Worker == null || en.Worker == '') msg.value += '设置延期发送' + en.NodeName + '],';
      });
      if (msg.value != '') {
        msg.value += '设置延期发送';
        showFailToast(msg.value);
        emit('ChangeLoading', false, null);
        return false;
      }
    }
    //发送前事件
    //发送前先执行保存前的操作
    let resultMsg: string | boolean | null;
    if (entityRef.value != null) {
      //发送前的事件
      resultMsg = await new WaiGuaFlow(entityRef.value).SendWhen();
      if (typeof resultMsg === 'boolean' && resultMsg == false) return false;
      if (typeof resultMsg === 'string') showFailToast(resultMsg?.replace('@preview', ''));
    } else {
      const resultB = await beforeSave(rowDataRef.value, frmID.value, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
      if (typeof resultB === 'boolean') {
        if (resultB === false) return false;
      }
      if (typeof resultB === 'object') {
        emit('UpdateData', resultB);
        rowDataRef.value = resultB;
      }
      const resultS = await beforeSend(rowDataRef.value, frmID.value, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
      if (resultS == false) return false;
    }
    let isNeedSave = false;
    //树形表单，保存树形表单
    if (nodeExt.value.FormType === NodeFormType.SheetTree) {
      await FromTreeSend(1, false);
      return;
    }
    //如果是嵌入表单
    if (nodeExt.value.FormType === NodeFormType.SelfForm) {
      await SendSelfFrom(1, false);
      return;
      //await SendSelfFrom(1, isHuiQian);
      //return;
    }
    //如果是自定义表单
    if (nodeExt.value.FormType === NodeFormType.SDKForm && SDKSend(1) == false) {
      emit('ChangeLoading', false, null);
      return false;
    }
    if (nodeExt.value.FormType === NodeFormType.EntityTS) {
      emit('SaveData', 1, (val) => {
        if (val === true) {
          nodeSend(false, false, null);
          return true;
        }
        return false;
      });
      return;
    }
    let rowData = null;
    if (
      nodeExt.value.FormType === NodeFormType.FoolForm ||
      nodeExt.value.FormType === NodeFormType.FoolTruck ||
      nodeExt.value.FormType === NodeFormType.RefOneFrmTree ||
      nodeExt.value.FormType === NodeFormType.Develop ||
      nodeExt.value.FormType === NodeFormType.RefNodeFrm ||
      nodeExt.value.FormType === NodeFormType.ChapterFrm
    ) {
      //表单的验证
      emit('VerifyFormData', (val) => {
        if (!!val) {
          IsShowMask.value = true;
        } else {
          IsShowMask.value = false;
        }
        rowData = val;
        if (rowData == null) {
          emit('ChangeLoading', false, null);
          return false;
        }
        isNeedSave = true;
        nodeSend(isNeedSave, isHuiQian, rowData);
      });
    } else {
      nodeSend(false, isHuiQian, rowData);
    }
    //手工选择到达的节点和接收人
    if (nodeExt.value.CondModel == 1 && nodeExt.value.IsBackTrack == 0) {
      const isShowToNode = ref(true);
      //排除协作模式的情况
      if (nodeExt.value.TodolistModel == 1) {
        const gwf = new BSEntity('BP.WF.GenerWorkFlow');
        gwf.setPK(query.WorkID as string);
        await gwf.RetrieveFromDBSources();
        const todoEmps = gwf.TodoEmps.split(';');
        if (todoEmps.length > 1) isShowToNode.value = false;
      }
      if (isShowToNode.value == true) {
        if (isNeedSave) {
          const isSaveSuccess = ref(false);
          emit('SaveData', 1, (val) => {
            isSaveSuccess.value = val;
            if (isSaveSuccess.value == false) return false;
            modalShow('ToNodes', '请选择下一个节点的接收人');
          });
        } else {
          modalShow('ToNodes', '先会签后发送');
        }
        return false;
      }
    }
  };
  const nodeSend = async (isNeedSave: boolean, isHuiQian: boolean, rowData) => {
    try {
      emit('ChangeLoading', true, null);
      //手工选择到达的节点和接收人
      if (nodeExt.value.CondModel == 1 && nodeExt.value.IsBackTrack == 0) {
        const isShowToNode = ref(true);
        //排除协作模式的情况
        if (nodeExt.value.TodolistModel == 1) {
          const gwf = new BSEntity('BP.WF.GenerWorkFlow');
          gwf.setPK(query.WorkID as string);
          await gwf.RetrieveFromDBSources();
          const todoEmps = gwf.TodoEmps.split(';');
          if (todoEmps.length > 1) isShowToNode.value = false;
        }
        if (isShowToNode.value == true) {
          if (isNeedSave) {
            const isSaveSuccess = ref(false);
            emit('SaveData', 1, (val) => {
              isSaveSuccess.value = val;
              if (isSaveSuccess.value == false) return false;
              modalShow('ToNodes', '选择接受人');
            });
          } else {
            modalShow('ToNodes', '先会签后发送');
          }
          return false;
        }
      }
      //含有发送节点 且接收
      if (toNodes.value.length > 0 && nodeExt.value.IsBackTrack == 0) {
        const gwf = new BSEntity('BP.WF.GenerWorkFlow');
        gwf.setPK(query.WorkID as string);
        await gwf.RetrieveFromDBSources();

        const isLastHuiQian = true;
        //待办人数
        const todoEmps = gwf.TodoEmps || '';
        if (todoEmps != '') {
          const huiqianSta = gwf.GetPara('HuiQianTaskSta') == 1 ? true : false;
          if (nodeExt.value.TodolistModel == 1 && huiqianSta == true && todoEmps.split(';').length > 1) isLastHuiQian.value = false;
        }
        const selectToNode = toNodes.value.filter((toNode) => toNode.No === toNodeID.value)[0];
        //需要弹窗选择接收人
        if (
          (selectToNode.IsSelectEmps == '1' && isLastHuiQian == true) ||
          selectToNode.IsSelectEmps == '2' ||
          selectToNode.IsSelectEmps == '3' ||
          selectToNode.IsSelectEmps == '4' ||
          selectToNode.IsSelectEmps == '6' ||
          isHuiQian == true
        ) {
          if (selectToNode.IsSelectEmps == '6') query['PrjNo'] = query['PrjNo'] || gwf.getData().PrjNo;
          //跳到选择接收人窗口
          query['ToNode'] = toNodeID.value;
          DealToNodesHaveSend(isNeedSave, selectToNode, isLastHuiQian, isHuiQian);
          return false;
        }
      }
      if (isDelayedSend.value == true) {
        if (isNeedSave == true) {
          const isSaveSuccess = ref(false);
          emit('SaveData', 1, (val) => {
            isSaveSuccess.value = val;
            if (isSaveSuccess.value == false) return false;
            modalShow('DelayedSend', '选择接受人');
          });
        }
        if (isNeedSave == false) {
          modalShow('DelayedSend', '先会签后发送');
        }
        return true;
      }
      //执行发送事件
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      if (isNeedSave == true) {
        for (const key in rowData) {
          handler.AddPara(key, encodeURIComponent(rowData[key]));
        }
      }
      if (nodeExt.value.IsBackTrack == 1) {
        toNodeID.value = '0';
      }
      handler.AddPara('ToNode', toNodeID.value);
      let data = await handler.DoMethodReturnString('Send');

      // @zhoupeng / @yln导致无法显示消息
      if (entityRef.value != null) await new WaiGuaFlow(entityRef.value).SendSuccess();
      await afterSend(rowData, frmID.value, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);

      if (typeof data == 'string' && data.includes('err@') == true) {
        showFailToast(data.replace('err@', ''));
        return;
      }
      //页面跳转
      if (typeof data == 'object' && typeof data['PageName'] == 'string' && data['PageName'] != '') {
        query['ToNode'] = data['ToNode'];
        query['PrjNo'] = data['PrjNo'];
        modalShow(data['PageName'], '选择接受人');
        return;
      }
      //发送后的消息弹窗
      if (data.includes('@IsCanUnSend=1') == true) {
        isHaveUnSend.value = true;
        data = data.replace('@IsCanUnSend=1', '');
        //移除该操作
        //const str = data.split('撤销本次发送');
        //data = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
      }
      if (data.includes('@IsCanTask=1') == true) {
        isTask.value = true;
        data = data.replace('@IsCanTask=1', '');
      }
      msg.value = splitAtString(data);
      //发送后返回消息，添加标签、字体样式
      msg.value.forEach((item, idx, arr) => {
        arr[idx] = `<span style="font-size:17px">${item}</span>`;
      });
      msgType.value = 'msg';
      IsShowMsg.value = true;
      IsShowMask.value = false;
      Event.emit('IsShowMsg', true);
    } catch (e) {
      //发送错误
      if (entityRef.value != null) await new WaiGuaFlow(entityRef.value).SendError();
      emit('ChangeLoading', null, {
        hasError: true,
        tips: e as string,
      });
    } finally {
      setTimeout(() => {
        emit('ChangeLoading', false, null);
        IsShowMask.value = false;
      }, 1000);
    }
  };

  const DealToNodesHaveSend = (isNeedSave, selectToNode: ToNode, isLastHuiQian, isHuiQian) => {
    if (isNeedSave === false || VSTO_FORM_TYPE.includes(props.frmType)) return SendBySelect(selectToNode, isLastHuiQian, isHuiQian);
    const isSaveSuccess = ref(false);
    emit('SaveData', 1, (val) => {
      isSaveSuccess.value = val;
      if (val == false) return false;
      if (selectToNode.IsSelectEmps == '1' && isLastHuiQian == true) {
        //跳到选择接收人窗口
        if (isHuiQian == true) {
          modalShow('HuiQian', '先会签后发送');
        } else {
          modalShow('Accepter', '选择接受人');
        }
        return false;
      }
      if (selectToNode.IsSelectEmps == '2') {
        if (isHuiQian == true) {
          modalShow('HuiQian', '先会签后发送');
        } else {
          const url = selectToNode.DeliveryParas;
          modalShow(url, '删除流程');
          return false;
        }
      }
      if (selectToNode.IsSelectEmps == '3') {
        if (isHuiQian == true) {
          modalShow('HuiQian', '请输入删除流程的原因');
        } else {
          modalShow('AccepterOfOrg', '确定');
        }
        return false;
      }

      if (selectToNode.IsSelectEmps == '4') {
        if (isHuiQian == true) {
          modalShow('HuiQian', '取消');
        } else {
          modalShow('AccepterOfDept', '请输入删除流程的原因');
        }
        return false;
      }
      if (isHuiQian == true) {
        modalShow('HuiQian', '请输入作废流程的原因');
        return false;
      }
    });
  };
  /**
   * 删除流程
   * @constructor
   */
  const DeleteFlow = async () => {
    //按照用户设置的方式删除
    if (nodeExt.value.DelEnable == 4) {
      modalShow('DeleteFlowInstance', '确定');
      return;
    }
    //彻底删除
    if (nodeExt.value.DelEnable == 3) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('DeleteFlow');
      //删除后事件
      if (entityRef.value != null) await new WaiGuaFlow(entityRef.value).AfterFlowDel();
      if (typeof data == 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
        return;
      }
      showToast(data);
      handleCancel();
      return;
    }
    //逻辑删除/写入日志方式的删除
    //如果不是开始节点就输入删除原因
    if (!nodeExt.value.NodeID.toString().endsWith('01')) {
      showConfirmDialog({
        title: '取消',
        message: `
            <textarea id="dialogText" rows="2" class="van-field__control" aria-labelledby="van-field-21-label" style="height: 48px;"></textarea>
           `,
        showCancelButton: true,
        confirmButtonText: '请输入作废流程的原因',
        cancelButtonText: '作废成功',
        allowHtml: true,
        beforeClose: (action) => {
          const value = document.getElementById('dialogText').value;
          dialogText.value = value;
          if (action === 'confirm' && !value) {
            showToast('请输入内容');
            return false;
          }
          return true;
        },
      })
        .then(async () => {
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
          handler.AddJson(query);
          handler.AddPara('Msg', dialogText.value);
          handler.AddPara('DelEnable', nodeExt.value.DelEnable);
          const data = await handler.DoMethodReturnString('DeleteFlow');
          //删除后事件
          if (entityRef.value != null) await new WaiGuaFlow(entityRef.value).AfterFlowDel();
          if (typeof data == 'string' && data.includes('err@')) {
            showFailToast(data.replace('err@', ''));
            return;
          }
          showToast(data);
          handleCancel();
        })
        .catch(() => {});
    } else {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      handler.AddPara('Msg', dialogText.value);
      handler.AddPara('DelEnable', nodeExt.value.DelEnable);
      const data = await handler.DoMethodReturnString('DeleteFlow');
      //删除后事件
      if (entityRef.value != null) await new WaiGuaFlow(entityRef.value).AfterFlowDel();
      if (typeof data == 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
        return;
      }
      showToast(data);
      handleCancel();
    }
  };

  /**
   * 作废流程
   * @constructor
   */
  const CanCelFlow = async () => {
    try {
      showConfirmDialog({
        title: `
            <textarea id="dialogText" rows="2" class="van-field__control" placeholder="该工作因为xxx原因，需要您优先处理" aria-labelledby="van-field-21-label" style="height: 48px;"></textarea>
           `,
        message: `
            <textarea id="dialogText" rows="2" class="van-field__control" aria-labelledby="van-field-21-label" style="height: 48px;"></textarea>
           `,
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        allowHtml: true,
        beforeClose: (action) => {
          const value = document.getElementById('dialogText').value;
          dialogText.value = value;
          if (action === 'confirm' && !value) {
            showToast('请输入催办原因');
            return false;
          }
          return true;
        },
      })
        .then(async () => {
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
          handler.AddJson(query);
          handler.AddPara('Msg', dialogText.value);
          handler.AddPara('DelEnable', 1);
          const data = await handler.DoMethodReturnString('DeleteFlow');
          if (typeof data == 'string' && data.includes('err@')) {
            showFailToast(data.replace('err@', ''));
            return;
          }
          showSuccessToast('嵌入式表单返回值格式不正确');
          handleCancel(false);
        })
        .catch(() => {});
    } catch (e) {
      showFailToast(e as string);
      return;
    }
  };
  const dialogText = ref('');
  /**
   * 催办
   * @constructor
   */
  const Press = () => {
    showConfirmDialog({
      title: '请设置延期发送的时间',
      message: '先会签后发送',
      showCancelButton: true,
      confirmButtonText: '选择接受人(到达节点:',
      cancelButtonText: '先会签后发送',
      allowHtml: true,
      beforeClose: (action) => {
        const value = document.getElementById('dialogText').value;
        dialogText.value = value;
        if (action === 'confirm' && !value) {
          showToast('选择接受人(到达节点:');
          return false;
        }
        return true;
      },
    })
      .then(async () => {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF');
        handler.AddJson(query);
        handler.AddPara('Msg', dialogText.value);
        const data = await handler.DoMethodReturnString('Runing_Press');
        if (typeof data == 'string' && data.includes('err@')) {
          showFailToast(data.replace('err@', ''));
          return;
        }
        showToast(data);
      })
      .catch(() => {});
  };
  /**
   * 撤销发送
   * @constructor
   */
  const UnSend = async () => {
    //撤销发送前
    if (entityRef.value != null && (await new WaiGuaFlow(entityRef.value).UndoneBefore()) === false) return;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
    handler.AddJson(query);
    handler.AddPara('UnSendToNode',query.FK_Node||query.NodeID);
    const data = await handler.DoMethodReturnString('MyView_UnSend');
    if (entityRef.value != null) await new WaiGuaFlow(entityRef.value).UndoneBefore();
    if (typeof data == 'string' && data.includes('err@')) {
      showFailToast(data.replace('err@', ''));
      return;
    }
    showToast(data);
    if (props.pageType === 'MyFlow') {
      handleCancel(true);
      await InitPage();
      return;
    }
    const url = `${location.pathname}#/CCMobile/MyView?FK_Flow=${query.FK_Flow}&FK_Node=${query.CurrNode}&WorkID=${query.WorkID}&FID=${query.FID}`;
    window.location.replace(url);
  };

  /**
   * 任务分配
   * @constructor
   */
  const ToAllotTask = () => {
    IsShowMsg.value = true;
    IsShowMask.value = false;
    msgType.value = 'AllotTask';
  };
  /**
   * 按钮弹窗操作
   * @param type
   * @param title
   */
  const popAnimReady = ref(false);
  const modalShow = (type: string, title: string) => {
    popModal.visible = true;
    popModal.modalType = type;
    popModal.modalTitle = title;
    timer.value = new Date().getTime();
    setTimeout(() => {
      popAnimReady.value = true;
    }, 300);
  };
  const handleCancel = (isOnlyClose = false) => {
    if ('quick' in window) {
      // 如果是包含三方js bridge
      window.quick.navigateBack({
        delta: 1,
      });
      return;
    }
//    debugger;
    IsShowMsg.value = false;
    popModal.visible = false;
    if (isOnlyClose === true) return;

    //发送关闭后跳转MyView页面
    if (nodeExt.value?.TurnToDeal == 5) {
      const url = `${location.pathname}#/CCMobile/MyView?FK_Flow=${query.FK_Flow}&FK_Node=${nodeExt?.value?.NodeID}&WorkID=${query.WorkID}&FID=${query.FID}&IsReadonly=1`;
      // window.location.href = url;
      window.location.replace(url);
      return;
    }
    // 如果不是顶层iframe
    const topWindow = (window.top === window ? window : window.top)!;
    const hashUrl = topWindow.location.hash;
    if (hashUrl.includes('/WF/TestingContainer/Default')) {
      const flowNo = query.FK_Flow || query.FlowNo;
      let workID = (query.FID as string) || '0';
      if (workID === '0') workID = query.WorkID as string;
      topWindow.location.replace(
        '/#/WF/TestingContainer/Default?FlowNo=' + flowNo + '&WorkID=' + workID + '&TesterNo=' + query.TesterNo + '&CurrPage=FlowInstance&t=' + Math.random(),
      );
      return;
    }
    history.back();
    Event.emit('IsShowMsg', false);
    //判断当前页面所属的Iframe页面
    const iframe = window.frameElement;
    if (!!iframe) {
      const src = window.frameElement?.src;
      if (!!src && src.toString().includes('PageFrom=SubFlow')) {
        //iframe?.contentWindow.postMessage('close-outer');
        const topWin = window.top;
        topWin?.postMessage('close-outer');
        return;
      }
    }
  };

  /**
   * 树形结构表单的保存
   * @constructor
   */
  const FromTreeSend = (type: number, isHuiQian) => {
    //表单的验证
    emit('SaveData', 1, (val) => {
      if (val == false) {
        emit('ChangeLoading', false, null);
        return false;
      }
      nodeSend(false, isHuiQian, null);
      return true;
    });

    /*let isCanSend = false;
    emit('SaveData', type, (val) => {
      isCanSend = val;
    });
    return isCanSend;*/
  };
  /**
   * 嵌入式表单
   * @param type
   * @constructor
   */
  const SendSelfFrom = (type: number, isHuiQian) => {
    let isCanSend = false;
    //保存按钮禁用的时候，不需要执行保存方法
    const isHaveSaveBtn = btnList.value.filter((btn) => btn.No === 'Save').length > 0 ? true : false;
    if (isHaveSaveBtn === false) {
      //需要保存审核意见
      emit(
        'SaveData',
        type,
        true,
        (val) => {
          if (val === true) {
            nodeSend(false, isHuiQian, null);
            return true;
          }
          return false;
        },
        false,
      );
      return;
    }
    emit(
      'SaveData',
      type,
      false,
      (val) => {
        console.log('isCanSendaaa', isCanSend);
        if (val == null) return;
        let str = '';
        if (typeof val === 'boolean') {
          isCanSend = val;
          console.log('isCanSend', isCanSend);
        } else if (typeof val === 'string') {
          str = val;
        } else if (typeof val === 'object') {
          //转换成字符串
          for (const key of val) {
            str += '@' + key + '=' + val[key];
          }
        } else {
          message.error('先会签后发送');
          return;
        }
        if (isCanSend === true) {
          //保存嵌入式表单的信息到WF_GenerWorkFlow的AtPara字段中
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
          handler.AddPara('WorkID', query.WorkID);
          handler.AddPara('Paras', str);
          handler.DoMethodReturnString('SaveParas');
          isCanSend = true;
          if (isCanSend === true) {
            nodeSend(false, isHuiQian, null);
          }
        }
      },
      false,
    );
    return isCanSend;
  };
  /**
   * SDK表单
   * @param type
   * @constructor
   */
  const SDKSend = (type: number) => {
    let isCanSend = false;
    emit('SaveData', type, (val) => {
      isCanSend = val;
    });
    return isCanSend;
  };
  interface TimeValue {
    days: number;
    hours: number;
    mins: number;
  }
  const TimeValue = reactive<TimeValue>({
    days: 0,
    hours: 0,
    mins: 0,
  });
  const OptionsDays = [...Array(31)].map((_, i) => ({ value: i }));
  const OptionsHours = [...Array(25)].map((_, i) => ({ value: i }));
  const DelayedSend = async () => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddUrlData();
      if (TimeValue.days == 0 && TimeValue.hours === 0 && TimeValue.mins === 0) {
        showToast('选择接受人');
        return false;
      }
      handler.AddJson(query);
      handler.AddPara('ToNode', toNodeID.value);
      handler.AddPara('TB_Day', TimeValue.days);
      handler.AddPara('TB_Hour', TimeValue.hours);
      handler.AddPara('DDL_Minute', TimeValue.mins);
      const data = await handler.DoMethodReturnString('DelayedSend');
      showToast(data);
      handleCancel(false);
    } catch (e) {
      showFailToast(e as string);
    }
  };

  /**
   * 预置处理人数据获取
   * @constructor
   */
  const InitPreset = async () => {
    const handlers = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handlers.AddPara('FlowNo', query.FlowNo || query.FK_Flow);
    handlers.AddPara('WorkID', query.WorkID);
    handlers.AddPara('NodeID', nodeExt?.value?.NodeID);
    const list: any = await handlers.DoMethodReturnJson('GetPreplaceWokerFreeNodes');
    dataSource.value = JSON.parse(JSON.stringify(list));
    console.log(dataSource.value);
  };
  //end

  const SendBySelect = (selectToNode: ToNode, isLastHuiQian, isHuiQian) => {
    if (selectToNode.IsSelectEmps == '1') {
      //跳到选择接收人窗口
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        modalShow('Accepter', '选择接受人' + selectToNode?.Name + ')');
      }
      return false;
    }
    if (selectToNode.IsSelectEmps == '6') {
      //跳到选择接收人窗口
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        modalShow('AccepterByTeam', '选择接受人' + selectToNode?.Name + ')');
      }
      return false;
    }
    if (selectToNode.IsSelectEmps == '2') {
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        const url = selectToNode.DeliveryParas;
        modalShow(url, '预置处理人');
        return false;
      }
    }
    if (selectToNode.IsSelectEmps == '3') {
      if (isHuiQian == true) {
        modalShow('HuiQian', translateText('ccmobile.toolbar._key108'));
      } else {
        modalShow('AccepterOfOrg', translateText('ccmobile.toolbar._key109'));
      }
      return false;
    }

    if (selectToNode.IsSelectEmps == '4') {
      if (isHuiQian == true) {
        modalShow('HuiQian', translateText('ccmobile.toolbar._key110'));
      } else {
        modalShow('AccepterOfDept', translateText('ccmobile.toolbar._key111'));
      }
      return false;
    }
    if (isHuiQian == true) {
      modalShow('HuiQian', translateText('ccmobile.toolbar._key112'));
      return false;
    }
  };

  /**
   * 预置处理人弹窗选择人员
   */
  //start
  const preplaceRowData = ref();
  const preplaceKey = ref();
  const active = ref('');
  const rowData = ref();
  const onClickPop = async(data) => {
    
    popSelectModal.selectNo = data.EmpNos;
    popSelectModal.selectName = data.EmpNames;
    if(data.DeliveryWay === 710){
      popMapExt.Tag1 = GloWF.srcDeptLazily;
      popMapExt.Tag3 = GloWF.srcEmpLazily;
      popMapExt.Tag4 = GloWF.srcEmpSearchKey; // 搜索数据源
      popMapExt.Tag5 = GloWF.srcDeptRoot;
      popMapExt.AtPara.SetVal('IsShowSearch', '1');
      popMapExt.AtPara.SetVal('IsLazily', '1');
    }
    if(data.DeliveryWay === 711){
       const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('ToNode',data.NodeID);
      handler.AddPara('WorkID',query.WorkID);
      const result = await handler.DoMethodReturnString('Accepter_Init');
      popMapExt.ExtType = 'PopGroupList';
      popMapExt.Tag1 = JSON.stringify(result['Depts']);
      popMapExt.Tag2 = JSON.stringify(result['Emps']);
    }
    //单选还是多选.
    popMapExt.IsMultipleChoice =  data['IsSimpleSelector'] === 0? true:false;
    popSelectModal.visible = true;
    popSelectModal.title = '选择预置处理人';
    preplaceRowData.value = data;
    preplaceKey.value++;
    console.log('rowdata', data);
  };

  /**
   * popSelectModal关闭
   */
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const groupList = shallowRef<InstanceType<typeof PopGroupList>>();
  const checkedList: any = ref([]);
  const checkedNames: any = ref([]);
  const PopSelectModalOK = async () => {
    try {
      if(popMapExt.ExtType ==='PopTreeEns'){
        checkedList.value = treeEns.value?.allCheckList || [];
        checkedNames.value = treeEns.value?.checkedNames || [];
      }
     if(popMapExt.ExtType ==='PopGroupList'){
        checkedList.value = groupList.value?.checkedList || [];
        checkedNames.value = groupList.value?.checkedNames || [];
      }
      //人员名称
      // const toEmpsName = checkedNames.value.filter((item) => item != '').join(',');
      //人员编号
      const toEmpsNo = checkedList.value.filter((item) => item != '').join(',');
      //保存
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('toEmps', toEmpsNo);
      handler.AddPara('NodeID', preplaceRowData?.value?.NodeID);
      handler.AddPara('WorkID', route?.query?.WorkID || query.WorkID);
      await handler.DoMethodReturnJson('Node_AddNextStepAccepters');
      await InitPreset();
      popSelectModal.visible = false;
    } catch (e: any) {
      showFailToast(e);
      // console.trace(e);
    }
  };
  //end
</script>

<style lang="less" scoped>
  .tabbar {
    box-shadow: #f2f5f7 0px -8px 24px;
    height: 40px;
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 1000;
  }
  .toolbar-wrapper {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .custom-icon-style {
    margin-right: 8px;
  }

  .messageStyle {
    margin-left: auto;
    margin-top: 40px;
    background-color: #e5e7eb;
    padding: 20px;
    border: 1px solid #cccc;
    margin-right: auto;
    width: 70%;
  }
  :deep(.van-icon__image) {
    width: 14px;
    height: 14px;
  }
  .pop-title {
    width: 100%;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    font-size: 18px;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
  :deep(.van-tabbar-item__text) {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .mask-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90; /* 确保遮罩层在顶层 */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  //pop弹窗以及弹窗按钮样式
  .vant-address-item {
    padding: 10px;
    box-shadow: 0px 0px 4px 0px #cccccc57;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 10px;
  }
  .vant-gl-link-text {
    display: flex;
    align-items: center;
    margin-bottom: var(--van-padding-xs);
    font-size: var(--van-font-size-mg);
    line-height: var(--van-line-height-lg);
    font-weight: bold;
  }
  .tool-bar {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pop-btn-type {
    flex: none;
    height: 100%;
  }
  .pop-btn-type:hover {
    color: #fff;
    height: 100%;
  }
  .btnPosition {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .van-tabbar-item--active {
    color: #fff;
    height: 100%;
  }
</style>
