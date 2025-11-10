<template>
  <base-component ref="baseComponent">
    <div class="toolbar-wrapper" ref="createModal" :style="twStyle">
      <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <!--循环显示按钮-->
        <template v-for="btn in btnList" :key="btn.No">
          <FormItem v-if="btn.No === 'SubmitSF'" :label="btn.Name" :labelCol="{ span: 8 }">
            <Select
              v-model:value="selectDeptSta"
              style="width: 100%"
              @select="ChangeSelect"
              :options="deptStas"
              :getPopupContainer="
                (triggerNode) => {
                  return triggerNode.parentNode || document.body;
                }
              "
            />
          </FormItem>

          <FormItem v-else-if="btn.No === 'Save' && (nodeExt.FormType === NodeFormType.SelfForm || frmType === FrmType.VSTOForExcel || frmType === FrmType.VSTOForWord)" />
          <FormItem v-else-if="!(btn.No == 'PR' || (btn.No === 'PreplaceWoker' && preplaceWokerRole == 2))">
            <template v-if="btn.No === 'Delete' && nodeExt.DelEnable == 3">
              <Popconfirm :title="'删除后流程实例不可恢复,你确定要彻底删除流程吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="DeleteFlow()">
                <Button class="flow-btn">
                  <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                  <span> {{ btn.Name }}</span>
                </Button>
              </Popconfirm>
            </template>
            <template v-else-if="btn.No === 'UnSend'">
              <Popconfirm :title="'您确定要撤销本次发送吗？'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="UnSend()">
                <Button class="flow-btn unSend-btn">
                  <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                  <template v-if="btn.Name === '撤销'">
                    <span> {{ btn.Name }}发送</span>
                  </template>
                  <template v-else
                    ><span> {{ btn.Name }} </span></template
                  >
                </Button>
              </Popconfirm>
            </template>

            <template v-else-if="btn.No === 'FixFlow'">
              <Popconfirm :title="'您确定要冻结流程吗？'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="FixFlow()">
                <Button class="flow-btn">
                  <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                  <span> {{ btn.Name }} </span>
                </Button>
              </Popconfirm>
            </template>

            <template v-else-if="btn.No === 'FixFlowUn'">
              <Popconfirm :title="'您确定要解除冻结流程吗？'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="FixFlowUn()">
                <Button class="flow-btn">
                  <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                  <span> {{ btn.Name }} </span>
                </Button>
              </Popconfirm>
            </template>

            <template v-else-if="btn.No === 'EndFlow'">
              <Popconfirm :title="'您确定要结束当前流程吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="EndFlow()">
                <Button class="flow-btn">
                  <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                  <span> {{ btn.Name }} </span>
                </Button>
              </Popconfirm>
            </template>
            <template v-else-if="btn.No === 'CanCelFlow'">
              <Popconfirm :title="'您确定要作废当前流程吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="CanCelFlow()">
                <Button class="flow-btn">
                  <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                  <span> {{ btn.Name }} </span>
                </Button>
              </Popconfirm>
            </template>

            <template v-else-if="btn.No === 'Send'">
              <Button class="flow-btn send-btn" @click="ClickBtn(btn)">
                <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                <span> {{ btn.Name }} </span>
              </Button>
            </template>
            <template v-else-if="btn.No === 'NodeToolBar'">
              <Button class="flow-btn" @click="ClickBtn(btn)">
                <i :class="!btn.Icon ? GloComm.MyWorkToolbarICON(btn.No) : btn.Icon" class="custom-icon-style"></i>
                <span> {{ btn.Name }} </span>
              </Button>
            </template>
            <template v-else-if="btn.No === 'Track' && pageType === 'MyCC'">
              <Button class="flow-btn track-btn" @click="ClickBtn(btn)">
                <i :class="!btn.Icon ? GloComm.MyWorkToolbarICON(btn.No) : btn.Icon" class="custom-icon-style"></i>
                <span> {{ btn.Name }} </span>
              </Button>
            </template>
            <template v-else>
              <Button class="flow-btn" @click="ClickBtn(btn)">
                <i :class="GloComm.MyWorkToolbarICON(btn.No)" class="custom-icon-style"></i>
                <span> {{ btn.Name }} </span>
              </Button>
            </template>
          </FormItem>
          <template v-if="nodeExt != null && toNodes.length > 0 && nodeExt.IsBackTrack === 0 && btn.No === 'Send'">
            <!-- 增加按钮旁的下拉框 -->
            <FormItem>
              <Select v-model:value="toNodeID" v-if="nodeExt.CondModel != 3" :style="{ width: getMaxOptionWidth() + 'px' }">
                <SelectOption v-for="option in toNodes" :key="option.No" :value="option.No">{{ option.Name }} </SelectOption>
              </Select>
              <template v-if="nodeExt.CondModel == 3">
                <template v-for="item in toNodes" :key="item.No">
                  <Button @click="ChangeToNodeAndSend(item.No)">
                    {{ item.Name }}
                  </Button>
                </template>
              </template>
            </FormItem>
          </template>
        </template>
      </Form>
      <!-- 显示流程状态 -->
      <ToolbarFlow :params="query" />
      <!-- 表单风格切换 -->
      <ToolbarStyle
        v-if="!!frmId && frmType !== FrmType.Develop && nodeExt.FormType != NodeFormType.SelfForm && frmType !== FrmType.VSTOForExcel && frmType !== FrmType.VSTOForWord"
        :frmID="props.frmId"
      />
      <!--居中弹窗-->
      <Modal
        v-model:open="modal.modalVisible"
        centered
        :closable="modal.closable"
        :title="modal.modalTitle"
        :width="modal.modalWidth"
        :body-style="modal.modalHeight"
        :footer="null"
        :maskClosable="IsShowMsg ? false : true"
        destroy-on-close
        :get-container="getContainer"
        @cancel="modalClose"
      >
        <div v-if="modal.modalVisible" style="height: 100%; overflow: hidden scroll">
          <!-- ; background-color: #f2f5f7 -->
          <!--发送后的消息显示-->
          <div v-if="IsShowMsg" style="overflow-y: auto; height: 90%; margin: 20px; background: #fff; margin: 20px; box-shadow: 0px 0px 4px 2px #cccccc57">
            <div style="padding: 10px">
              <p v-for="(item, index) in msg" :key="index" v-html="item"></p>
              <div style="text-align: center">
                <Button v-if="isTask" type="primary" @click="ToAllotTask" style="margin-right: 8px; background: #eeeeee; color: #000; border-color: #eeeeee"
                  ><i class="icon-people"></i>{{ '指定特定的处理人处理' }}</Button
                >
                <Button
                  v-if="isHaveUnSend"
                  type="primary"
                  :disabled="unSendBtnDisabled"
                  @click="UnSend"
                  style="margin-right: 8px; background: #eeeeee; color: #000; border-color: #eeeeee"
                  ><i class="icon-action-undo"></i>{{ '撤销本次发送' }}</Button
                >
                <Button v-if="IsShowCloseBtn" type="primary" @click="handleCancel"><i class="icon-close" style="vertical-align: -1px"></i>{{ '关闭' }}</Button>
                <Button v-if="!IsShowCloseBtn" type="primary" @click="handleCancel"><i class="icon-close" style="vertical-align: -1px"></i>{{ '关闭' }}</Button>
              </div>
            </div>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'ChangeOrg'">
            <template v-if="WebUser.CCBPMRunModel == 2">
              <div v-for="(group, key) in groups" :key="key">
                <span>{{ key }}</span
                ><br />
                <RadioGroup v-model:value="selectVal" @change="ChangeDept()">
                  <Radio :key="index" v-for="(item, index) in group" :value="item.No" :style="radioStyle">
                    <span v-if="item.No === WebUser.DeptNo">{{ item.Name }}(当前部门)</span>
                    <span v-else>{{ item.Name }}</span>
                  </Radio>
                </RadioGroup>
              </div>
            </template>
            <RadioGroup v-else v-model:value="selectVal" @change="ChangeDept()">
              <Radio :key="index" v-for="(item, index) in depts" :value="item.No" :style="radioStyle">
                <span v-if="item.No === WebUser.DeptNo">{{ item.Name }}(当前部门)</span>
                <span v-else>{{ item.Name }}</span>
              </Radio>
            </RadioGroup>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType.includes('Packup')" style="width: 100%; height: 100%">
            <div v-if="IsHtmlPage" style="width: 100%; height: 100%">
              <iframe :src="URL" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
            </div>
            <div v-if="IsPdfPage" style="width: 100%; height: 100%">
              <Card style="width: 100%; height: 100%">
                <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
                <ul>
                  <li>{{ '在线打印与预览' }}</li>
                  <li>系统把整个表单生成了一个pdf或htm文件.</li>
                  <li
                    >{{ '点击这里' }}<a :href="URL" target="_blank" download=".htm">{{ '进行下载或在线预览' }}</a></li
                  >
                </ul>
                <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
              </Card>
            </div>
            <div v-if="IsZipPage" style="width: 100%; height: 100%">
              <Card style="width: 100%; height: 100%">
                <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
                <ul>
                  <li>{{ 'zip在线打印与预览' }}</li>
                  <li>系统把整个表单生成了一个zip文件,这个文件里包括了,表单的附件，二维码等信息.</li>
                  <li
                    >{{ '点击这里' }}<a :href="URL" target="_blank">{{ '进行打包下载' }}</a></li
                  >
                </ul>
                <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
              </Card>
            </div>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'PrintDoc'" style="width: 100%; height: 100%">
            <Card style="width: 100%; height: 100%">
              <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
              <ul>
                <li>{{ '单据打印' }}</li>
                <li
                  >{{ '点击这里' }}<a :href="URL" target="_blank" download>{{ '进行单据下载' }}</a></li
                >
              </ul>
              <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
            </Card>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'HelpAlert'" style="width: 100%; height: 100%">
            <div v-html="modal.content"></div>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'DelayedSend'" style="width: 100%; height: 100%">
            <div style="display: flex; align-items: center; background-color: white">
              <Form layout="vertical" style="width: 70%; margin: 0 auto">
                <FormItem style="margin-bottom: 10px !important">
                  <Select v-model:value="TimeValue.days" style="width: 150px" :options="OptionsDays" />
                  <span class="set_time set_time_margin">{{ '天' }}</span>
                </FormItem>
                <FormItem style="margin-bottom: 10px !important">
                  <Select v-model:value="TimeValue.hours" style="width: 150px" :options="OptionsHours" />
                  <span class="set_time set_time_margin">{{ '小时' }}</span>
                </FormItem>
                <FormItem style="margin-bottom: 10px !important">
                  <Select ref="select" v-model:value="TimeValue.mins" style="width: 150px">
                    <SelectOption :value="0">0</SelectOption>
                    <SelectOption :value="15">15</SelectOption>
                    <SelectOption :value="30">30</SelectOption>
                    <SelectOption :value="45">45</SelectOption> </Select
                  ><span class="set_time">{{ '分钟' }}</span>
                </FormItem>
                <FormItem>
                  <div style="margin: 5px 85px 5px 5px" class="refund">
                    <Button type="primary" @click="DelayedSend()" style="margin-right: 1em">{{ '延期发送' }}</Button>
                    <Button type="primary" @click="modal.modalVisible = false">{{ '关闭' }}</Button>
                  </div>
                </FormItem>
              </Form>
            </div>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'PreplaceWokerEnable'">
            <Table :columns="columnsTable" :data-source="dataSource" bordered :pagination="false" size="middle" :key="preplaceWokerKey">
              <template #bodyCell="{ column, index, record }">
                <template v-if="column.dataIndex === 'EmpNames'">
                  <InputGroup compact :disabled="true" style="position: relative">
                    <div class="pop_intput_div" style="padding-left: 5px">
                      <template v-if="!!record.EmpNames[0]">
                        <template v-for="(ele, idx) in record.EmpNames.split(',')" :key="ele">
                          <!-- closable @close="DeleteDB(record, ele, idx)" -->
                          <Tag color="#0960bd" closable @close="DeleteDB(record, ele, idx, index)">
                            {{ ele }}
                          </Tag>
                        </template>
                      </template>
                    </div>
                    <Button @click="PopModalShow(record)" style="position: absolute; height: 100%">
                      <SettingOutlined />
                    </Button>
                  </InputGroup>
                </template>
              </template>
            </Table>
            <div class="resetControls">
              <Button type="primary" @click="handlerOk" class="btnStyle">{{ '确定' }}</Button>
            </div>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'HuiQian'">
            <GenerList :params="query" @modalIsShow="handleCancel" />
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'Rollback'">
            <GenerList :params="query" @modalIsShow="handleCancel" />
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'Note'">
            <GenerList :params="query" @modalIsShow="modalIsShow" />
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'DocWord'">
            <GenerList :params="query" @modalIsShow="modalIsShow" />
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'AllotTask'">
            <AllotTask :params="query" @handleCancel="handleCancel" />
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'FrmDBVer'">
            <FrmDBVer :params="frmDBVerParams" @handleCancel="handleCancel" />
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'MyView'" style="height: 100%">
            <iframe :src="URL" scrolling="auto" frameborder="no" style="width: 100%; height: 98%"></iframe>
          </div>
          <div v-else-if="IsShowMsg === false && modal.modalType === 'MyFrm'" style="height: 100%">
            <iframe :src="URL" scrolling="auto" frameborder="no" style="width: 100%; height: 98%"></iframe>
          </div>
          <BaseModal
            v-else
            :modalType="modal.modalType"
            :params="query"
            :isDelayedSend="isDelayedSend"
            :mainData="_rowData"
            @handleCancel="handleCancel"
            @UnSend="UnSend"
            :key="new Date().getTime()"
            :WGFlow="entityRef"
            class="sendBack"
          />
        </div>
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
        <div v-if="drawerVisible">
          <TransferCustom v-if="modal.modalType === 'TransferCustom'" :params="query" />
          <TZWorker v-else-if="modal.modalType === 'TZWorkerEnable'" :params="query" />
          <GenerCode v-else-if="modal.modalType == 'QRCode'" :params="query" />
          <FrmBBS v-else-if="modal.modalType == 'FlowBBS'" :params="query" />
          <CH v-else-if="modal.modalType === 'CH'" :params="query" />
          <GenerList
            v-else-if="modal.modalType === 'GL_OfficeTrack'"
            :params="{ EnName: 'GL_OfficeTrack', FlowNo: query.FlowNo || query.FK_Flow, WorkID: query.WorkID, NodeID: query.FK_Node }"
          />
          <GenerList v-else-if="modal.modalType === 'Rollback'" :params="query" />
          <GroupPageNew v-else-if="modal.modalType === 'GPN_StartDocFlow'" :params="query" @close-self="drawerVisible = false" />
          <En v-else-if="modal.modalType === 'FlowRpt'" :params="query" />
          <BaseModal v-else :modalType="modal.modalType" :params="query" :key="new Date().getTime()" :WGFlow="entityRef" @handleCancel="handleCancel" @UnSend="UnSend" />
        </div>
      </Drawer>
      <Modal v-model:open="popModal.visible" :title="'预置处理人'" @ok="handleEnsure" width="980px" :zIndex="1001">
        <Pop
          v-if="popModal.visible === true"
          :popHeight="popModal.height"
          :selectVal="popModal.selectNo"
          :selectNameVal="popModal.selectName"
          :mapExt="(popModal.mapExt as EnMapExt)"
          :key="popModal.componetKey"
          ref="refPop"
        />
      </Modal>
      <Modal v-model:open="previewInfo.visible" :footer="null">
        <v-md-preview :text="appTitleHelper(previewInfo.text)" preview-class="vuepress-markdown-body" />
      </Modal>

      <!-- 多人表单提交投票 -->
      <Modal v-model:open="voteModalVisible" :mask-closable="false" @cancel="denySubmit" :closable="false" width="600px">
        <VotePanel />
        <template #footer>
          <div class="modal-footer">
            <Button key="back" @click="denySubmit">{{ '拒绝' }}</Button>
            <Button key="submit" type="primary" @click="agreeSubmit">{{ '同意' }}</Button>
          </div>
        </template>
      </Modal>
    </div>
  </base-component>
</template>
<script lang="tsx" setup>
  // setup 在vue实例创建之前
  import { Button, Drawer, Form, FormItem, message, Modal, Popconfirm, Select, SelectOption, RadioGroup, Radio, Card, Table, InputGroup, Tag } from 'ant-design-vue';
  import { SettingOutlined } from '@ant-design/icons-vue';
  import { computed, h, inject, onMounted, onUnmounted, reactive, Ref, ref, shallowRef, watch } from 'vue';
  import { Node } from '/@/WF/TSClass/Node';
  import BaseModal from './WorkOpt/BaseModal.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRoute } from 'vue-router';
  import BSEntity from '/@/utils/gener/BSEntity';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';
  import { GloComm } from './Comm/GloComm';
  import { ConfigOptions } from 'ant-design-vue/lib/message';
  import { NodeFormType } from '/@/WF/Admin/EnumLab';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import WebUser from '/@/bp/web/WebUser';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
  import TransferCustom from './WorkOpt/TransferCustom.vue';
  import GenerCode from '/@/WF/WorkOpt/QRCode/GenerCode.vue';
  import TZWorker from './WorkOpt/TZWorker.vue';
  import CH from './WorkOpt/CH.vue';
  import { BtnLab } from './Admin/AttrNode/BtnLab';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import { GloWF } from './Admin/GloWF';
  import { AtPara } from '../bp/da/AtPara';
  import { TableColumnType } from 'ant-design-vue/es/components';
  import { GenerWorkFlowExt } from './TSClass/FlowData/GenerWorkFlowExt';
  import GenerList from '/@/WF/views/GenerList.vue';
  import FrmBBS from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS.vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import { onlineEdit, installWpsAddin } from '/@/components/wps/index.cjs';
  import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
  import { downloadByUrl } from '../utils/file/download';
  import { CommonConfig } from '../DataUser/OverrideFiles/CommonConfig';
  import AllotTask from '/@/WF/WorkOpt/AllotTask.vue';
  import { DealExp, GetPara, setBase64 } from '/@/utils/gener/StringUtils';
  import ToolbarStyle from '/@/WF/CCForm/ToolbarStyle.vue';
  import ToolbarFlow from '/@/WF/CCForm/ToolbarFlow.vue';
  import { getVstoHost } from '/@/utils/VstoUtils';
  import { FrmType } from './Admin/EnumLab';
  import Events from '../utils/Events';
  import { MapData } from './Admin/FrmLogic/MapData';
  import { usePostMessage } from '../hooks/message/usePostMessage';
  import { MyFlowNodeToolBar } from '/@/DataUser/OverrideFiles/MyFlowNodeToolBar';
  import { windowOpen } from '/@/utils/windowOpen';
  import { ClassFactoryOfWaiGuaFlow } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaFlow';
  import { WaiGuaBaseFlow } from '/@/bp/UIEntity/WaiGuaBaseFlow';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { RoomVoteStatus, useSharedFormStore } from '../store/modules/sharedForm';
  import VotePanel from './WorkOpt/VotePanel.vue';
  import { router } from '../router';
  import DBAccess from '/@/utils/gener/DBAccess';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import En from '/@/WF/Comm/En.vue';
  import { appTitleHelper } from '/@/utils/helper/appTitleHelper';
  import Event from '/@/utils/Events';
  import { decodeResponseParams, getAllRequestParams } from '/@/utils/request/decode';
  import { EnMapExt, ExtModel } from '/@/bp/en/Map/EnMapExt';
  import { SelectAccper } from './TSClass/FlowData/SelectAccper';
  import FrmDBVer from './WorkOpt/FrmDBVer.vue';
  import cloneDeep from 'lodash-es/cloneDeep';
  import { useMessage } from '/@/hooks/web/useMessage';

  const VSTO_FORM_TYPE = [6, 61];
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const { t } = useI18n();
  interface ToNode {
    DeliveryParas: string;
    IsSelectEmps: string;
    IsSelected: string;
    Name: string;
    No: string;
  }

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
    frmId: {
      type: String,
      default: '',
    },
    frmData: {
      //表单属性集合
      type: Object,
      default: () => {},
    },
    params: {
      //表单属性集合
      type: Object,
      default: () => {},
    },
  });
  const route = useRoute();
  const flowInfo = inject('flowInfo') as Ref<Recordable>;
  let query = {
    pageType: props.pageType,
    ...route.query,
    ...props.params,
  };
  if (flowInfo?.value) {
    //  debugger;
    query = {
      pageType: props.pageType,
      ...query,
      ...flowInfo.value,
    };
  }
  const endFlow = ref();
  //打印
  const IsHtmlPage = ref(false);
  const IsPdfPage = ref(false);
  const IsZipPage = ref(false);
  //打印单据
  const PrintDocData = ref();
  const { VITE_GLOB_API_URL, VITE_GLOB_WS_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;

  const URL = ref();
  //操作按钮集合
  const btnList = ref<Array<Btn>>([]);

  //修改Modal样式
  const createModal = shallowRef();
  const getContainer = () => {
    return createModal.value as HTMLElement; // 显式断言为 HTMLElement
  };
  const frmDBVerParams = ref(cloneDeep(query));
  const twStyle = computed(() => {
    const el = getContainer();
    const rect = el?.getBoundingClientRect();
    let left = rect?.left;
    return {
      width: `calc(100% - ${left ?? 0}px)` || '200px',
    };
  });
  const previewInfo = reactive({
    visible: false,
    text: '',
  });

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
  //延期
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

  //侧滑显示
  const drawerVisible = ref<boolean>(false);

  //到达的节点集合
  const toNodes = ref<Array<ToNode>>([]);
  //节点属性
  const nodeExt = ref<Node>({});
  const toNodeID = ref('0');

  //节点消息
  const IsShowMsg = ref(false);
  const IsShowCloseBtn = ref(false);
  const msg = ref<string[]>([]);
  const isHaveUnSend = ref(false);
  const isTask = ref(false);
  const unSendBtnDisabled = ref(false);

  //切换部门
  const depts = ref<any[]>([]);
  //切换部门岗位
  const deptStas = ref<any[]>([]);
  const selectDeptSta = ref('');
  const groups = ref({});
  const selectVal = ref(WebUser.DeptNo);

  //保存弹窗显示
  const isShowSaveMsg = ref(true);

  const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
    paddingLeft: '10px',
  });
  const _rowData = ref();
  const emit = defineEmits(['ChangeLoading', 'call-iframe-method', 'Save', 'VerifyFormData', 'GetMainData', 'UpdateData']);
  //自定义的方法
  const { beforeSave, beforeSend, afterSend, beforeDelete, WindCloseBySelf } = userMyFlowSelfLoader(query);

  interface Btn {
    Icon: string;
    Name: string;
    No: string;
    Oper: string;
    Role: string;
    BtnType: string;
  }
  const preset = reactive<Btn>({
    Icon: '',
    Name: '',
    No: '',
    Oper: '',
    Role: '',
    BtnType: '',
  });
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: new EnMapExt(),
    enableSelect: false,
    selectNo: '',
    selectName: '',
    componetKey: 0,
  });
  const dataSource = ref();
  const columnsTable: TableColumnType[] = [
    {
      title: '节点编号',
      dataIndex: 'NodeID',
      width: 100,
    },
    {
      title: '节点名称',
      dataIndex: 'Name',
      width: 150,
    },
    {
      title: '处理人',
      dataIndex: 'EmpNames',
    },
  ];
  /**
   * 初始化操作栏按钮
   * @constructor
   */
  const entityRef = ref<WaiGuaBaseFlow>(null);
  //预置处理问题
  const preplaceWokerRole = ref(0);
  const isHaveClickPreplaceWoker = ref(false);
  const InitPage = async () => {
    try {
      const enName = 'WGFlow_' + (props?.params?.FK_Flow || props?.params?.FlowNo);
      const entity = await ClassFactoryOfWaiGuaFlow.GetEn(enName as string);
      if (entity != null) {
        entity.WorkID = props.params.WorkID;
        entity.NodeID = props.params.FK_Node || props.params.NodeID;
        entityRef.value = entity;
        entityRef.value.params = props.params;
        if (typeof entity.Init == 'function') entity.Init();
      }

      const config: ConfigOptions = {};
      config.top = '100px';
      message.config(config);
      emit('ChangeLoading', true, null);
      let handlerName = 'BP.WF.HttpHandler.WF_MyFlow';
      if (props.pageType === 'MyView' || props.pageType === 'MyFrm') handlerName = 'BP.WF.HttpHandler.WF_MyView';
      if (props.pageType === 'MyCC') handlerName = 'BP.WF.HttpHandler.WF_MyCC';
      const handler = new HttpHandler(handlerName);
      handler.AddJson(query);
      handler.AddPara('PageFrom', 'Vue3');
      const data = await handler.DoMethodReturnString('InitToolBar');
      if (typeof data == 'string' && data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        return;
      }
      btnList.value = data['ToolBar'] || data;
      const preplaceWokerBtn = btnList.value.find((item) => item.No === 'PreplaceWoker');
      if (preplaceWokerBtn != null) preplaceWokerRole.value = parseInt(preplaceWokerBtn.Oper || '2');
      btnList.value.forEach((btn) => {
        let name = btn.Name;
        if (name === '下载公文正文(word)') name = '下载公文正文Word';
        if (name === '下载公文正文(pdf)') name = '下载公文正文PDF';
        if (name === '加签（主持人模式）') name = '加签主持人';

        if (name === '确定/完成') name = '确定完成';
        btn.Name = t('flowandfrm.api.' + name);
        btn.BtnType = '0';
      });
      //增加外挂的工具栏
      if (entity != null) {
        let btns = entity.ToolbarMyFlow;
        if (props.pageType === 'MyView' || props.pageType === 'MyFrm') btns = entity.ToolbarMyView;
        if (props.pageType === 'MyCC') btns = entity.ToolbarMyCC;
        if (!!btns) {
          btns.split(',').forEach((item) => {
            btnList.value.push({
              Icon: '',
              Name: item,
              No: item,
              Oper: '',
              Role: '',
              BtnType: '1',
            });
          });
        }
      }
      console.log('btnList.value', btnList.value);
      toNodes.value = data['ToNodes'] || [];
      const deptSta = data['DeptStaion'] || [];
      const dept = data['Depts'] || [];
      if (deptSta.length != 0) {
        deptStas.value = deptSta.map((item) => {
          return {
            value: item.DeptNo + '/' + item.StationNo,
            label: item.DeptName + '/' + item.StationName,
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
            label: item.DeptName,
            DeptNo: item.DeptNo,
            DeptName: item.DeptName,
          };
        });
      }
      if (deptStas.value.length != 0) {
        selectDeptSta.value = deptStas.value[0].value;
        await ChangeSelect(selectDeptSta.value, deptStas.value[0]);
      }
      const en = new Node();
      await en.Init();
      const nodeID = query.FK_Node as string;
      en.NodeID = parseInt(nodeID || 0);
      await en.RetrieveFromDBSources();
      nodeExt.value = en;
      if (data['WF_Node']) nodeExt.value.IsBackTrack = data['WF_Node'][0]['IsBackTrack'];
      if (toNodes.value.length > 0 && nodeExt.value.IsBackTrack == 0) {
        const nodes = toNodes.value.filter((item) => item.IsSelected);
        if (nodes.length > 0) toNodeID.value = nodes[0].No;
        else toNodeID.value = toNodes.value[0].No;
      }
      const mapData = new MapData(nodeExt.value.NodeFrmID);
      await mapData.RetrieveFromDBSources();
      currentFrmType = props.frmType;
      await HelpAlter();
    } catch (e) {
      emit('ChangeLoading', true, {
        hasError: true,
        tips: e as string,
      });
    } finally {
      emit('ChangeLoading', false, null);
    }
  };

  const ChangeSelect = async (value, option) => {
    //存储改变的值
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handler.AddJson(query);
    handler.AddJson(option);
    const result = await handler.DoMethodReturnString('Save_DeptSta');
    if (typeof result === 'string' && result.includes('err@')) message.error(result);
  };

  InitPage();
  onMounted(() => {
    if (props.frmType == FrmType.Develop) {
      Events.on('devFormSave', async ({ frmID, rowData, type }) => {
        const resultB = await beforeSave(rowData, frmID, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
        if (typeof resultB === 'boolean') {
          if (resultB === false) return;
        }
        if (typeof resultB === 'object') {
          emit('UpdateData', resultB);
          rowData = resultB;
        }
        _rowData.value = rowData;
        const resultS = await beforeSend(rowData, frmID, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
        if (resultS == true) await SendDevForm(false, rowData, type);
      });
    }
  });
  onUnmounted(() => {
    Events.off('devFormSave');
  });

  const isDelayedSend = ref<boolean>(false);
  /**
   * 按钮点击操作
   * @param btn
   * @constructor
   */
  let currentFrmType = FrmType.FoolForm;

  const frmID = ref('');
  const rowDataRef = ref<Record<string, any>>(null);
  const frmNos = ref('');
  const handleBtnBefore = () => {
    if (currentFrmType != FrmType.Develop && nodeExt.value.FormType != NodeFormType.SelfForm && nodeExt.value.FormType != NodeFormType.SDKForm) {
      emit('GetMainData', (val, _frmID, _frmIDs = '') => {
        rowDataRef.value = val;
        frmID.value = _frmID;
        frmNos.value = _frmIDs;
      });
    }
    if (entityRef.value != null) {
      entityRef.value.FrmID = frmID.value;
      entityRef.value.OID = rowDataRef.value != null ? rowDataRef.value.OID : props.params.WorkID;
      entityRef.value.FrmBodyJson = rowDataRef.value;
    }
  };
  // 处理多人表单提交逻辑
  const sformStore = useSharedFormStore();
  // 投票窗口
  const voteModalVisible = ref(false);
  watch(
    () => sformStore.voteStatus,
    (val) => {
      console.log({ val });
      voteModalVisible.value = val == RoomVoteStatus.InProgress;
    },
  );
  watch(
    () => sformStore.msg,
    (val) => {
      if (val) {
        message.info(val);
      }
      sformStore.msg = '';
    },
  );
  watch(
    () => sformStore.voteSuccess,
    async (val) => {
      if (val) {
        const btn = btnList.value.find((item) => item.No == 'Send');
        const starterId = sformStore.onlineUsers.find((u) => u.IsVoteStarter)?.UserId;
        if (starterId == WebUser.No) {
          await handleBtn(btn);
        }
        voteModalVisible.value = false;
        sformStore.closeWebSocket();
        if (route.fullPath.includes('Middle/')) {
          router.replace('/Middle/GenerList?EnName=GL_Todolist');
        } else {
          router.replace('/');
        }
      }
    },
  );
  // 同意提交
  const agreeSubmit = () => {
    sformStore.agreeSubmit();
  };
  // 拒绝提交
  const denySubmit = () => {
    sformStore.denySubmit();
  };
  const SaveExt = async () => {
    if (currentFrmType == FrmType.Develop) {
      Events.emit('getDevFormData', { type: 'Save' });
      return;
    }
    let resultMsg;
    if (entityRef.value != null) {
      resultMsg = await new WaiGuaFlow(entityRef.value).SaveBefore();
      if (typeof resultMsg === 'boolean' && resultMsg === false) return false;
      if (typeof resultMsg === 'string' && resultMsg.startsWith('@preview')) {
        previewInfo.visible = true;
        previewInfo.text = resultMsg.replace('@preview', '');
      }
      if (typeof resultMsg === 'object') {
        emit('UpdateData', resultMsg);
      }
      let isSaveSuccess = await asyncEmitSave();

      if (isSaveSuccess == true) {
        resultMsg = await new WaiGuaFlow(entityRef.value).SaveAfter();
        if (typeof resultMsg === 'boolean' && resultMsg === false) return false;
        if (typeof resultMsg === 'string' && resultMsg.startsWith('@preview')) {
          previewInfo.visible = true;
          previewInfo.text = resultMsg.replace('@preview', '');
          return true;
        }
        if (typeof resultMsg === 'object') {
          emit('UpdateData', resultMsg);
        }
      }

      return;
    }
    const resultData = await beforeSave(rowDataRef.value, frmID.value, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
    if (typeof resultData === 'boolean') {
      await asyncEmitSave();
    }
    if (typeof resultData === 'object') {
      emit('UpdateData', resultData);
      await asyncEmitSave();
    }
  };
  /**
   * 异步改成同步
   */
  const asyncEmitSave = () => {
    const type = isShowSaveMsg.value == true ? 0 : 1;
    return new Promise<boolean>((resolve) => {
      emit('Save', type, (val) => {
        resolve(val); // 父组件调用后 resolve
      });
    });
  };
  const preplaceWokerKey = ref(0);
  const rowData = ref();
  // end
  const handleBtn = async (btn) => {
    if (btn.BtnType === '1') {
      if (entityRef.value != null) {
        const resultMsg = entityRef.value.BtnClick(props.pageType, btn.No, '');
        if (!!resultMsg && resultMsg?.hasOwnProperty?.('ReturnType')) {
          baseComponent.value?.handleGPNCallback(resultMsg, btn.No);
          return;
        }
        if (typeof resultMsg === 'string' && resultMsg.startsWith('@preview')) {
          previewInfo.visible = true;
          previewInfo.text = resultMsg.replace('@preview', '');
          return;
        }
        if (!!resultMsg && typeof resultMsg === 'string') {
          message.info(resultMsg);
        }
      }
      return;
    }
    const oper = ref(btn.Oper);
    oper.value = oper.value || '';
    handleBtnBefore();
    isShowSaveMsg.value = true;
    switch (btn.No) {
      case 'Save': //保存
        // 开发者表单
        //const md=new MapData()
        await SaveExt();
        break;
      case 'Send': //发送
        let resultMsg: string | boolean | null;
        isDelayedSend.value = false;
        // 如果是多人共同编辑的表单，一个人提交的时候需要提示其他人
        if (sformStore.isOnline && nodeExt.value.AllowMultipleEditors == '1' && sformStore.onlineUsers.length > 1 && !sformStore.voteSuccess) {
          sformStore.startVote();
          return;
        }
        //预置处理人
        if ((preplaceWokerMsg != '' || isHaveClickPreplaceWoker.value == false) && preplaceWokerRole.value === 1) {
          //判断流程是否只有当前节点启用了该功能
          const dt = await DBAccess.RunSQLReturnTable(`SELECT COUNT(*) as num From WF_Node WHERE FK_Flow=${nodeExt.value.FK_Flow} AND PreplaceWokerEnable!=0`);
          if (parseInt(dt[0]['num']) == 1) {
            message.error(preplaceWokerMsg + '请为节点设置预置处理人');
            break;
          }
          if (parseInt(dt[0]['num']) > 1) {
            message.warn(preplaceWokerMsg + '当前节点还需要为那些节点设置预置处理人');
          }
        }
        // 开发者表单
        if (currentFrmType == FrmType.Develop) {
          Events.emit('getDevFormData', { type: 'send' });
          break;
        }
        if (entityRef.value != null) {
          //发送前的事件
          await SaveExt(); //前端验证时需要保存，可能影响效率，如果没有前端验证，可以不保存
          resultMsg = await new WaiGuaFlow(entityRef.value).SendWhen();
          if (typeof resultMsg === 'boolean' && resultMsg === false) return;
          if (typeof resultMsg === 'string' && resultMsg.startsWith('@preview')) {
            previewInfo.visible = true;
            previewInfo.text = resultMsg.replace('@preview', '');
            return;
          }
          if (resultMsg) {
            if (preplaceWokerRole.value > 1) {
              await InitPreset();
              getRowData.value = preplaceRowData.value;
              if (Array.isArray(dataSource.value) && dataSource.value.length > 0) {
                //调用接口传递JSON 获取数据 MyPK FK_Node WorkID FK_Emp EmpName DeptName
                await SaveExt();
                preplaceWokerKey.value++;
                modalShow('PreplaceWokerEnable', '预置处理人');
              } else {
                await Send(frmID.value);
              }
            } else {
              await Send(frmID.value);
            }
          }
        } else {
          const resultB = await beforeSave(rowDataRef.value, frmID.value, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
          if (typeof resultB === 'boolean') {
            if (resultB === false) break;
          }
          if (typeof resultB === 'object') {
            emit('UpdateData', resultB);
            rowData.value = resultB;
          }
          _rowData.value = rowData.value;
          const resultS = await beforeSend(rowDataRef.value, frmID.value, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
          if (resultS == true) {
            if (preplaceWokerRole.value > 1) {
              await InitPreset();
              getRowData.value = rowData.value;
              if (Array.isArray(dataSource.value) && dataSource.value.length > 0) {
                //调用接口传递JSON 获取数据 MyPK FK_Node WorkID FK_Emp EmpName DeptName
                await SaveExt();
                preplaceWokerKey.value++;
                modalShow('PreplaceWokerEnable', '预置处理人');
              } else {
                await Send(frmID.value);
              }
            } else {
              await Send(frmID.value);
            }
          }
        }
        break;
      case 'AiCheck':
        await SaveExt();
        Modal.info({
          title: () => h('span', 'AI辅助审批'),
          content: () =>
            h('textarea', {
              id: 'TB_textarea',
              rows: 4,
              cols: 50,
              placeholder: '请输入内容...',
              style: { width: '100%', height: '180px' },
            }),
          centered: true,
          okText: '确定',
          width: '50%',
          bodyStyle: {
            padding: '10px',
            height: '300px',
          },
          closable: true,
          onOk: async () => {
            const val = document.getElementById('TB_textarea')?.value;
            if (!val) {
              message.error('请输入辅助审批的信息');
              return new Promise<false>();
            }
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
            handler.AddJson(props.params);
            handler.AddPara('Note', val);
            const note = await handler.DoMethodReturnString('Check_AI');
            Event.emit('InitWorkCheck', { note: note });
          },
        });
        break;
      case 'Delete':
        if (entityRef.value != null) {
          const resultMsg = await new WaiGuaFlow(entityRef.value).BeforeFlowDel();
          if (typeof resultMsg === 'boolean' && resultMsg === false) return;
          if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
            previewInfo.visible = true;
            previewInfo.text = resultMsg?.replace('@preview', '');
          }
        } else {
          if ((await beforeDelete()) == false) return;
        }

        DeleteFlow();
        break;
      case 'CanCelFlow':
        CanCelFlow();
        break;
      case 'Press':
        Press();
        break;
      case 'FixFlow': //冻结
        FixFlow();
        break;
      case 'FixFlowUn': //解冻
        FixFlowUn();
        break;
      case 'PreplaceWoker':
        //只能在开始节点启用预置处理人
        const btnLab = new BtnLab(nodeExt?.value?.NodeID);
        await btnLab.RetrieveFromDBSources();
        if (btnLab.PreplaceWokerEnable > 0) {
          await InitPreset();
          getRowData.value = rowData.value;
          if (Array.isArray(dataSource.value) && dataSource.value.length > 0) {
            //调用接口传递JSON 获取数据 MyPK FK_Node WorkID FK_Emp EmpName DeptName
            preplaceWokerKey.value++;
            modalShow('PreplaceWokerEnable', '预置处理人');
          }
        }
        break;
      case 'Return':
        isShowSaveMsg.value = false; // 不弹出保存提示
        await SaveExt();
        query['Title'] = btn.Name || '退回';
        modalShow('ReturnWork', btn.Name || '退回', window.innerWidth * 0.5, 400);
        break;
      case 'Rollback': //回滚
        query['EnName'] = 'GL_AdminReback';
        query['FlowNo'] = query.FK_Flow;
        query['FK_Flow'] = query.FK_Flow;
        query['WorkID'] = query.WorkID;
        query['PKVal'] = query.WorkID;
        drawerShow('Rollback', '回滚', window.innerWidth * 0.8);
        //modalShow('Rollback', '回滚', window.innerWidth * 0.5, 500);
        break;
      case 'TransferCustom':
        // modalShow('TransferCustom', '流转自定义');
        drawerShow('TransferCustom', '流转自定义', window.innerWidth * 0.8);
        break;
      case 'TZWorkerEnable':
        drawerShow('TZWorkerEnable', '调整未来处理人', window.innerWidth * 0.8);
        break;
      case 'Hungup':
        modalShow('Hungup', '挂起');
        break;
      case 'Thread':
        isShowSaveMsg.value = false; // 不弹出保存提示
        await SaveExt();
        if (props.pageType === 'MyView' || props.pageType === 'MyFrm') query['IsReadonly'] = 1;
        modalShow('ThreadDtl', '子线程', window.innerWidth * 0.7);
        break;
      case 'Shift':
        modalShow('Shift', '移交', window.innerWidth * 0.5, 400);
        break;
      case 'Btn_WorkCheck':
        break;
      case 'Askfor':
        alert('开发中...');
        break;
      case 'Track':
        query.NodeName = nodeExt.value.Name;
        drawerShow('OneWork', '轨迹', window.innerWidth * 0.8);
        break;
      case 'CH':
        drawerShow('CH', '节点时限', window.innerWidth * 0.8);
        break;
      case 'HuiQian':
        await SaveExt();
        query['HuiQianType'] = 'HuiQian';
        query['EnName'] = 'GL_HuiQian';
        modalShow('HuiQian', '先加签再发送');
        break;
      case 'AddLeader':
        query['HuiQianType'] = 'AddLeader';
        modalShow('HuiQian', '加主持人');
        break;
      case 'CC':
        modalShow('CC', '抄送');
        break;
      case 'CCORShare':
        modalShow('CCORShare', '抄送/分享');
        break;
      case 'PR':
        modalShow('PRI', '重要性');
        break;
      case 'QRCode':
        drawerShow('QRCode', '二维码扫描');
        break;
      case 'FlowBBS':
        emit('GetMainData', (val, _frmID) => {
          rowData.value = val;
          frmID.value = _frmID;
        });
        query['FrmID'] = frmID.value;
        drawerShow('FlowBBS', '评论');
        break;
      case 'Note': //备注. @llj. 传入FlowNo, WorkID.  打开 GL_WorkOptNote.
        query['EnName'] = 'GL_WorkOptNote';
        query['FlowNo'] = query.FK_Flow;
        query['WorkID'] = query.WorkID;
        query['PKVal'] = query.WorkID;
        modalShow('Note', '备注');
        break;
      case 'DownGovEnable': //下载公文正文
        const basePath1 = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
        const downloadFileUrlForDownGov =
          basePath1 + 'WF/VSTO/GenerGongWenByteWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
        downloadByUrl({ url: downloadFileUrlForDownGov });
        break;
      case 'DocWordForWord': //打开公文
        if (!(await GetGongWenTemplateNode(btn?.AtPara, btn.No))) {
          let onLineeditUrl =
            'wordform://-fromccflow,AppID=DocFile' +
            ',WorkID=' +
            query.WorkID +
            ',FK_Node=' +
            query.FK_Node +
            ',officeBtnEnable=' +
            parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable') +
            ',Token=' +
            WebUser.Token?.replace(',,', '') +
            ',WSUrl=' +
            getVstoHost();
          window.open(onLineeditUrl);
        }
        return;
      case 'DocWordForWPS':
        if (!(await GetGongWenTemplateNode(btn?.AtPara, btn.No))) {
          let officeEnable = parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable');
          if (officeEnable == 0 || officeEnable == 2) {
            officeEnable = 3;
          }
          if (officeEnable == 1) {
            officeEnable = -1;
          }
          const downloadFileUrl =
            VITE_GLOB_API_URL + 'WF/VSTO/GenerGongWenByteWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
          const uploadFileUrl = VITE_GLOB_API_URL + 'WF/VSTO/SaveGongWenWordWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
          //安装wps插件后执行回调函数
          installWpsAddin(onlineEdit, [officeEnable, WebUser.Name, downloadFileUrl, uploadFileUrl]);
        }
        return;
      case 'DocWord': //打开公文
        if (!(await GetGongWenTemplateNode(btn?.AtPara, btn.No))) {
          // OfficeFileType 0-word 1-wps  OfficeBtnEnable 0-不可用 1-可编辑 2-不可编辑
          if (parseStringToObjectGetByKey(btn?.AtPara, 'OfficeFileType') == 0) {
            let officeEnable = parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable');
            let isReadonly = false;
            if (officeEnable == 0 || officeEnable == 2) {
              isReadonly = true;
            }
            let onLineeditUrl =
              'wordform://-fromccflow,AppID=DocFile' +
              ',WorkID=' +
              query.WorkID +
              ',FK_Node=' +
              query.FK_Node +
              ',IsReadonly=' +
              isReadonly +
              ',officeBtnEnable=' +
              parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable') +
              ',Token=' +
              WebUser.Token?.replace(',,', '') +
              ',WSUrl=' +
              getVstoHost();
            window.location.href = onLineeditUrl;
            return;
          }
          if (parseStringToObjectGetByKey(btn?.AtPara, 'OfficeFileType') == 1) {
            let officeEnable = parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable');
            if (officeEnable == 0 || officeEnable == 2) {
              officeEnable = 3;
            }
            if (officeEnable == 1) {
              officeEnable = -1;
            }
            const basePath1 = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
            const downloadFileUrl = basePath1 + 'WF/VSTO/GenerGongWenByteWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
            const uploadFileUrl = basePath1 + 'WF/VSTO/SaveGongWenWordWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
            //安装wps插件后执行回调函数
            installWpsAddin(onlineEdit, [officeEnable, WebUser.Name, downloadFileUrl, uploadFileUrl]);
            return;
          }
          if (parseStringToObjectGetByKey(btn?.AtPara, 'OfficeFileType') == 3) {
            window.open('/#/WF/FrmOnlyOffice?WorkID=' + query.WorkID + '&NodeID=' + (query?.NodeID || query.FK_Node) + '&gongWenTemplateFile=', '_blank');
          }
          return;
        }
        return;
      case 'OfficeTrackEnalbe': //公文版本
        drawerShow('GL_OfficeTrack', '公文版本', window.innerWidth * 0.8);
        return;
      case 'KKViewEnable': //kkfile公文在线预览
        const handler2 = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler2.AddPara('workID', query.WorkID);
        handler2.AddPara('nodeID', query?.NodeID || query.FK_Node);
        let result: any = await handler2.DoMethodReturnJson('IsGongWenByteExist');
        if (result == '公文文件不存在') {
          message.info(result);
        } else {
          AthView();
        }

        break;
      case 'DownVSTOEnable':
        window.open('https://docs.qq.com/doc/DRFNGZGJwYVZsaE1T');
        break;
      case 'Confirm': // @llj.
        const gwf = new GenerWorkFlowExt();
        gwf.setPKVal(query.WorkID);
        await gwf.RetrieveFromDBSources();
        const val2 = gwf.GetParaString('C_' + WebUser.No, '0');
        if (val2 == '0') {
          //设置按钮text.  '已确认'
          gwf.SetPara('C_' + WebUser.No, '1');
          if (btn.Name === '确认') btn.Name = '取消确认';
          await gwf.Update();
        } else {
          //设置按钮text.  '取消确认'
          gwf.SetPara('C_' + WebUser.No, '0');
          if (btn.Name === '未确认' || btn.Name === '取消确认') btn.Name = '确认';
          await gwf.Update();
        }
        break;
      case 'PackUp_zip':
      case 'PackUp_html':
      case 'PackUp_pdf':
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
            message.error('未找到zip文件, 原始数据为:' + JSON.stringify(dataPackup));
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
            modalShow('Packup', '打印');
            return;
          } else if (query['PrintType'] == item.No && item.No == 'pdf') {
            IsPdfPage.value = true;
            URL.value = basePath + '/' + relativePath;
            window.open(basePath + '/' + relativePath);
            modalShow('Packup', '打印');
            return;
          } else if (query['PrintType'] == item.No && item.No == 'zip') {
            IsZipPage.value = true;
            if (item.Name.includes(basePath)) {
              URL.value = item.Name;
            } else {
              URL.value = basePath + '/' + relativePath;
            }
            window.open(URL.value);
            modalShow('Packup', '打印');
            return;
          }
        });
        break;
      case 'PrintDoc':
        try {
          query['PrintType'] = btn.No.replace('Print', '');
          emit('GetMainData', (val, _frmID, _frmIDs = '') => {
            rowData.value = val;
            frmID.value = _frmID;
            frmNos.value = _frmIDs;
          });
          let paras = '';
          for (const key in query) {
            paras += '&' + key + '=' + query[key];
          }
          paras += '&FrmID=' + frmID.value + '&FrmIDs=' + frmNos.value;
          baseComponent.value?.openDrawerByUrl('打印', GloComm.UrlGenerList('GL_Printer', paras), '80%');
          return;

          const handlerDoc = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
          handlerDoc.AddJson(query);
          handlerDoc.AddPara('CCFormID', frmID.value);
          const dataPrintDoc: any = await handlerDoc.DoMethodReturnJson('PrintDoc_Init');
          if (Array.isArray(dataPrintDoc)) {
          }
          PrintDocData.value = dataPrintDoc;
          //如果是一个url.
          if (PrintDocData.value.indexOf('file@') == 0 || PrintDocData.value.indexOf('url@') == 0) {
            PrintDocData.value = PrintDocData.value.replace('file@', '');
            PrintDocData.value = PrintDocData.value.replace('url@', '');
            if (PrintDocData.value.indexOf('rtf@') != -1 || PrintDocData.value.indexOf('pdf@') != -1) {
              //直接执行打印
              PrintDocData.value = PrintDocData.value.replace('rtf@', '').replace('pdf@', '');
              URL.value = basePath + '/' + PrintDocData.value;
              window.open(URL.value);
              modalShow('PrintDoc', '打印单据');
            } else {
              message.info('其他类型还未解析');
            }
            return;
          }
        } catch (err: any) {
          message.error(err);
        }
        break;
      case 'EndFlow':
        try {
          const handlerEnd = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
          handlerEnd.AddPara('FK_Flow', query.FlowNo);
          handlerEnd.AddPara('WorkID', query.WorkID);
          const dataEnd: any = await handlerEnd.DoMethodReturnString('MyFlow_StopFlow');
          if (typeof dataEnd === 'string' && dataEnd.includes('err@')) {
            message.error(dataEnd);
            return;
          }
          endFlow.value = dataEnd.replace(/@/g, '');
          message.info(endFlow.value);
          handleCancel(false);
        } catch (err: any) {
          message.error(err);
        }
        break;
      case 'SelectAccepter':
        modalShow('Accepter', '选择下一个节点及下一个节点接受人');
        break;
      case 'FrmDBVer':
        let isReadonly = false;
        if (props.pageType === 'MyView' || props.pageType === 'MyFrm' || props.pageType === 'NyCC') isReadonly = true;
        else if (props.params.fieldIsReadonly != undefined && query.fieldIsReadonly) isReadonly = true;
        frmDBVerParams.value['IsReadonly'] = isReadonly;
        if (isReadonly === false) {
          await SaveExt();
          //并且保存当前版本数据
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
          handler.AddJson(query);
          try {
            await handler.DoMethodReturnString('SaveCurrentFrmDB');
            modalShow('FrmDBVer', '表单数据版本对比查看器', window.innerWidth * 1, window.innerHeight * 1);
          } catch (error) {
            message.error(error);
          }
          break;
        }
        modalShow('FrmDBVer', '表单数据版本对比查看器', window.innerWidth * 1, window.innerHeight * 1);
        break;
      case 'DBTemplate':
        break;
      case 'DelayedSend':
        isDelayedSend.value = true;
        query['isDelayedSend'] = true;
        //发送前先执行保存前的操作
        if (nodeExt.value.FormType != NodeFormType.SelfForm && nodeExt.value.FormType != NodeFormType.SDKForm) {
          emit('GetMainData', (val, _frmID) => {
            rowData.value = val;
            frmID.value = _frmID;
          });
        }
        const resultD = await beforeSend(rowData, nodeExt.value.NodeFrmID, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
        if (resultD == true) await Send();
        break;
      case 'Focus': //关注
        if (btn.Name === '关注') btn.Name = '取消关注';
        else btn.Name = '关注';
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
        handler.AddPara('WorkID', query.WorkID);
        await handler.DoMethodReturnString('Focus');
        break;
      case 'ChangeOrg': //切换部门
        //获取所有的部门
        const Myhandler = new HttpHandler('BP.WF.HttpHandler.WF_Setting');
        const data = await Myhandler.DoMethodReturnString('ChangeDept_Init');
        if (typeof data === 'string' && data.includes('err@')) {
          message.error(data);
          return;
        }
        if (data.length === 0) {
          message.info('您只有一个部门[' + data[0].Name + '],不需要切换部门');
          return;
        }
        depts.value = JSON.parse(JSON.stringify(data)) || [];
        if (parseInt(WebUser.CCBPMRunModel || '0') === CCBPMRunModel.SAAS) {
          const newObj = {};
          depts.value.forEach(function (obj) {
            const array = newObj[obj['OrgName']] || [];
            array.push(obj);
            newObj[obj['OrgName']] = array;
          });
          groups.value = newObj;
        }
        modalShow('ChangeOrg', '切换部门');
        break;
      case 'Help': //帮助提示
        await HelpAlter();
        break;
      case 'ParentForm': // 查看父流程
        const pWorkID = query.PWorkID;
        let pFlowNo = query.PFlowNo;
        if (!pFlowNo) {
          //取得父流程FK_Flow
          const gwf = new GenerWorkFlowExt();
          gwf.setPKVal(pWorkID);
          await gwf.RetrieveFromDBSources();
          pFlowNo = gwf.PFlowNo;
        }
        URL.value = location.pathname + '#/WF/MyView?WorkID=' + pWorkID + '&FlowNo=' + pFlowNo;
        modalShow('MyView', '父流程表单', window.innerWidth * 0.8);
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
            message.error(btn.Name + '没有配置超链接的URL路径');
            break;
          }
          url = DealExp(url, query);
          if (url.includes('@')) url = DealExp(url, rowData);
          windowOpen(url);
          break;
        }
        if (excType === 1) {
          //函数
          MyFlowNodeToolBar.btnClick(query.WorkID, query.FK_Node || query.NodeID, query, rowData, baseComponent as any);
        }
        break;
      case 'OpenFrm':
        let workID = query.WorkID;
        if (workID == 0) workID = query.FID;
        URL.value = location.pathname + '#/WF/MyFrm?WorkID=' + workID + '&FlowNo=' + query.FK_Flow + '&NodeID=' + query.FK_Node + '&FK_Node=' + query.FK_Node;
        modalShow('MyFrm', '查看表单', window.innerWidth * 0.7);
        break;
      case 'Scrip':
        const en = new BSEntity('BP.WF.GenerWorkFlow');
        en.setPK(query.WorkID as string);
        await en.RetrieveFromDBSources();
        const ScripNodeID = GetPara(en.AtPara, 'ScripNodeID');
        let msg = GetPara(en.AtPara, 'ScripMsg');
        if (ScripNodeID != query.FK_Node) msg = '';
        msg = msg || '';
        const val = prompt('请输入要传达的信息,可以为空.', msg);
        if (val != null && val != '') {
          en.setPara('ScripNodeID', query.FK_Node);
          en.setPara('ScripMsg', val);
          await en.Update();
        }
        break;
      case 'FlowRpt':
        // 流程干预
        query['EnName'] = 'TS.FlowData.GenerWorkFlowView';
        query['FlowNo'] = query.FK_Flow;
        query['FK_Flow'] = query.FK_Flow;
        query['WorkID'] = query.WorkID;
        query['PKVal'] = query.WorkID;
        query['IsReadonly'] = 1;
        drawerShow(btn.No, btn.Name, window.innerWidth * 0.8);
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
    if (msgType !== 'onFlowBtnClick') return;
    if (!result) {
      console.warn('调用三方表单方法错误');
      return;
    }
    const btn = btnList.value.find((btn) => btn.No === action);
    if (!btn) {
      message.error('没有找到对应的流程按钮 - ' + action);
      return;
    }
    handleBtn(btn);
  };
  usePostMessage(onReceiveMsg);
  // end
  const userStore = useUserStoreWithOut();
  const ChangeDept = async () => {
    if (selectVal.value != WebUser.DeptNo) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Setting');
      handler.AddPara('DeptNo', selectVal.value);
      const data = await handler.DoMethodReturnString('ChangeDept_Submit');
      if (data.indexOf('err@') == 0) {
        message.error(data);
        return;
      }
      //重新获取WebUser信息
      setTimeout(async () => {
        userStore.token = WebUser.Token;
        await userStore.getUserInfoAction();
        //刷新
        window.location.reload();
      }, 50);
      modal.modalVisible = false;
    }
  };
  const HelpAlter = async () => {
    //判断该节点是否启用了帮助提示 0 禁用 1 启用 2 强制提示 3 选择性提示
    if (nodeExt.value.HelpRole != 0) {
      let count = 0;
      const mypk = WebUser.No + '_ND' + nodeExt.value.NodeID + '_HelpAlert';
      if (nodeExt.value.HelpRole == 3) {
        var userRegedit = new BSEntity('BP.Sys.UserRegedit');
        userRegedit.setPK(mypk);
        count = await userRegedit.RetrieveFromDBSources();
      }

      if (nodeExt.value.HelpRole == 2 || (count === 0 && nodeExt.value.HelpRole == 3)) {
        const str = '帮助指引'; //帮助提示内容信息
        if (!!str && str != undefined) {
          IsShowMsg.value = false;
          modal.modalVisible = true;
          modal.modalType = 'HelpAlert';
          modal.modalTitle = '帮助指引';
          modal.modalWidth = 600;
          modal.modalHeight = {
            height: '400px',
          };
          modal.content = str;
        }
      }
    }
  };
  /**
   * 发送到的节点按钮显示时的操作
   * @param nodeID
   * @constructor
   */
  const ChangeToNodeAndSend = (nodeID: string) => {
    toNodeID.value = nodeID;
    Send();
  };

  /**
   * 判断当前节点是否是开始节点且已存在公文
   */
  const GetGongWenTemplateNode = async (btnPara: string, btnNo: string) => {
    const nodeID = query.FK_Node as string;
    const workID = query.WorkID as string;
    if (nodeID.endsWith('01')) {
      //判断当前流程是否存在存在公文
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('workID', workID);
      handler.AddPara('nodeID', nodeID);
      const result: any = await handler.DoMethodReturnJson('IsGongWenByteExist');
      if (result == '公文文件不存在') {
        query['EnName'] = 'GPN_StartDocFlow';
        query['btnPara'] = btnPara;
        query['btnNo'] = btnNo;
        drawerShow('GPN_StartDocFlow', '公文模版');
        return true;
      }
    }
    return false;
  };

  /**
   * 发送处理
   * @constructor
   */
  const getRowData = ref();
  // 处理工作流发送操作
  const Send = async (mapDataNo = '') => {
    try {
      const formType = nodeExt.value.FormType;
      if (formType !== NodeFormType.SelfForm) {
        emit('ChangeLoading', true, null);
      }
      // 1. 检查流程状态
      if (await isFlowOver()) {
        const resultMsg = await new WaiGuaFlow(entityRef.value).FlowOverAfter();
        if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
          previewInfo.visible = true;
          previewInfo.text = resultMsg?.replace('@preview', '');
        }
        return false;
      }

      // 2. 处理小纸条功能
      if (nodeExt.value.ScripRole === 2) {
        if (!(await handleScripNote())) {
          return false;
        }
      }

      // 3. 检查自定义流转
      if (!(await validateTransferCustom())) {
        return false;
      }

      // 4. 根据表单类型处理不同发送逻辑
      return await handleSendByFormType(mapDataNo);
    } catch (error) {
      return await handleSendError(error);
    }
  };

  // 检查流程是否已经结束
  const isFlowOver = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handler.AddJson(query);
    const result = await handler.DoMethodReturnString('Send_CheckFlowOver');

    if (typeof result === 'string' && result.includes('err@')) {
      emit('ChangeLoading', false, null);
      msg.value = splitAtString(result.replace('err@', ''));
      IsShowMsg.value = true;
      modal.closable = false;
      IsShowCloseBtn.value = false;
      modalShow('', '消息');
      return true;
    }

    if (result === '1') {
      message.info('流程已经结束', 3, () => {
        emit('ChangeLoading', false, null);
        handleCancel(false);
      });
      return true;
    }

    return false;
  };

  // 处理小纸条功能
  const handleScripNote = async () => {
    const gwf = new BSEntity('BP.WF.GenerWorkFlow');
    gwf.setPK(query.WorkID);
    await gwf.RetrieveFromDBSources();

    const ScripNodeID = GetPara(gwf.AtPara, 'ScripNodeID');
    let msg = GetPara(gwf.AtPara, 'ScripMsg');

    if (ScripNodeID !== query.FK_Node) {
      msg = '';
    }

    msg = msg || '';
    const val = prompt('请输入要传达的信息,可以为空.', msg);

    if (val !== null && val !== '') {
      gwf.setPara('ScripNodeID', query.FK_Node);
      gwf.setPara('ScripMsg', val);
      await gwf.Update();
    }

    return true;
  };

  // 验证自定义流转设置
  const validateTransferCustom = async () => {
    const buttons = btnList.value.filter((btn) => btn.No === 'TransferCustom');

    if (buttons.length === 0) {
      return true;
    }

    const ens = new BSEntities('BP.WF.TransferCustoms');
    await ens.Retrieve('WorkID', query.WorkID, 'IsEnable', 1);
    const data = ens.getData();

    if (data.length === 0) {
      emit('ChangeLoading', false, null);
      message.error('该节点启用了流程流转自定义，但是没有设置流程流转的方向，请点击流转自定义按钮进行设置');
      return false;
    }

    const nodesWithoutWorker = data.filter((en) => !en.Worker).map((en) => en.NodeName);

    if (nodesWithoutWorker.length > 0) {
      const errorMsg = `节点[${nodesWithoutWorker.join('], [')}]没有设置接收人。`;
      emit('ChangeLoading', false, null);
      message.error(errorMsg);
      return false;
    }

    return true;
  };

  // 根据表单类型处理发送逻辑
  const handleSendByFormType = async (mapDataNo) => {
    const formType = nodeExt.value.FormType;

    // 树形表单
    if (formType === NodeFormType.SheetTree) {
      return await FromTreeSend(1, false);
    }

    // 嵌入表单
    if (formType === NodeFormType.SelfForm) {
      return await SendSelfFrom(1, false);
    }

    // SDK表单
    if (formType === NodeFormType.SDKForm) {
      const result = SDKSend(1);
      if (result === false) {
        emit('ChangeLoading', false, null);
        return false;
      }
      return true;
    }

    // 实体表单
    if (formType === NodeFormType.EntityTS) {
      return new Promise((resolve) => {
        emit('Save', 1, (val) => {
          if (val === true) {
            nodeSend(false, false, null);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    }

    // 其他表单类型需要验证
    if (isFormRequiringValidation(formType)) {
      return new Promise((resolve) => {
        emit('VerifyFormData', async (rowData) => {
          if (!VSTO_FORM_TYPE.includes(props.frmType) && rowData == null) {
            emit('ChangeLoading', false, null);
            resolve(false);
            return;
          }

          const isNeedSave = true;
          nodeSend(isNeedSave, false, rowData, mapDataNo);
          resolve(true);
        });
      });
    }

    // 默认处理
    nodeSend(false, false, null, mapDataNo);
    return true;
  };

  /**
   * 判断表单是否需要验证
   * @param {number} formType - 表单类型
   * @returns {boolean} - 是否需要验证
   */
  const isFormRequiringValidation = (formType) => {
    return [NodeFormType.FoolForm, NodeFormType.FoolTruck, NodeFormType.RefOneFrmTree, NodeFormType.Develop, NodeFormType.RefNodeFrm, NodeFormType.ChapterFrm].includes(formType);
  };

  // 处理发送错误
  const handleSendError = async (error) => {
    if (entityRef.value) {
      const resultMsg = await new WaiGuaFlow(entityRef.value).SendError();

      if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
        previewInfo.visible = true;
        previewInfo.text = resultMsg?.replace('@preview', '');
      }
    }

    emit('ChangeLoading', null, {
      hasError: true,
      tips: error.toString(),
    });

    return false;
  };
  const isCanOnlyClose = ref(false);
  const nodeSend = async (isNeedSave: boolean, isHuiQian: boolean, rowData, mapDataNo = '') => {
    try {
      //发送后手工选择到达的节点和接收人
      debugger;
      if (nodeExt.value.CondModel == 1 && nodeExt.value.IsBackTrack == 0) {
        let isShowToNode = true;
        //排除协作模式的情况
        if (nodeExt.value.TodolistModel == 1) {
          const gwf = new BSEntity('BP.WF.GenerWorkFlow');
          gwf.setPK(query.WorkID as string);
          await gwf.RetrieveFromDBSources();
          const todoEmps = gwf.TodoEmps.split(';');
          if (todoEmps.length > 1) isShowToNode = false;
        }
        if (isShowToNode == true) {
          if (isNeedSave) {
            const isSaveSuccess = ref(false);
            emit('Save', 1, (val) => {
              isSaveSuccess.value = val;
              if (isSaveSuccess.value == false) return false;
              modalShow('ToNodes', '请选择到达的节点', window.innerWidth * 0.5, 275);
            });
          } else {
            modalShow('ToNodes', '请选择到达的节点');
          }
          return false;
        }
      }
      //含有发送节点 且接收
      if (toNodes.value.length > 0 && nodeExt.value.IsBackTrack == 0) {
        const gwf = new BSEntity('BP.WF.GenerWorkFlow');
        gwf.setPK(query.WorkID as string);
        await gwf.RetrieveFromDBSources();

        const isLastHuiQian = ref(true);
        //待办人数
        const todoEmps = gwf.TodoEmps || '';
        if (todoEmps != '') {
          const huiqianSta = gwf.GetPara('HuiQianTaskSta') == 1 ? true : false;
          if (nodeExt.value.TodolistModel == 1 && huiqianSta == true && todoEmps.split(';').length > 1) isLastHuiQian.value = false;
        }
        const selectToNode = toNodes.value.filter((toNode) => toNode.No === toNodeID.value)[0];
        //需要弹窗选择接收人
        if (
          (selectToNode.IsSelectEmps == '1' && isLastHuiQian.value == true) ||
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
          emit('Save', 1, (val) => {
            isSaveSuccess.value = val;
            if (isSaveSuccess.value == false) return false;
            modalShow('DelayedSend', '设置延期发送', window.innerWidth * 0.5, 300);
          });
        }
        if (isNeedSave == false) {
          modalShow('DelayedSend', '设置延期发送', window.innerWidth * 0.5, 300);
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
      handler.AddPara('ToNode', toNodeID.value);
      let data = await handler.DoMethodReturnString('Send');
      if (typeof data == undefined || typeof data == 'undefined') {
        return;
      }
      if (typeof data == 'string' && data.includes('err@') == true) {
        await afterSend(rowData, mapDataNo, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
        msg.value = splitAtString(data.replace('err@', ''));
        IsShowMsg.value = true;
        modal.closable = false;
        IsShowCloseBtn.value = true;
        if (data.includes('没有处理权限')) isCanOnlyClose.value = false;
        else isCanOnlyClose.value = true;
        modalShow('', '消息');
        return;
      }
      if (typeof data == 'string' && data.includes('SelectNodeUrl@') === true) {
        const result = decodeResponseParams(data.replace('SelectNodeUrl@', 'url@'));
        query['ToNode'] = result['ToNode'];
        query['PrjNo'] = result['PrjNo'];
        modalShow('ToNodes', '请选择到达的下一个节点', window.innerWidth * 0.5, 500);
        return;
      }
      //页面跳转
      if (typeof data == 'object' && typeof data['PageName'] == 'string' && data['PageName'] != '') {
        query['ToNode'] = data['ToNode'];
        query['PrjNo'] = data['PrjNo'];
        modalShow(data['PageName'], '请选择下一个节点的接收人', window.innerWidth * 0.5, 500);
        return;
      }
      if (!mapDataNo) mapDataNo = nodeExt.value.NodeFrmID;
      if (entityRef.value != null) await new WaiGuaFlow(entityRef.value).SendSuccess();

      const resultMsg = await afterSend(rowData, props.frmId, nodeExt.value.FK_Flow, nodeExt.value.NodeID, query.WorkID);
      if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
        previewInfo.visible = true;
        previewInfo.text = resultMsg?.replace('@preview', '');
      }
      if (typeof data !== undefined) {
        //发送后的消息弹窗
        if (data.includes('@IsCanUnSend=1') == true) {
          isHaveUnSend.value = true;
          //移除该操作
          //const str = data.split('撤销本次发送');
          //data = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
          data = data.replace('@IsCanUnSend=1', '');
        }
        if (data.includes('@IsCanTask=1') == true) {
          isTask.value = true;
          //移除该操作
          //const str = data.split('指定特定的处理人处理');
          //data = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
          data = data.replace('@IsCanTask=1', '');
        }
        msg.value = splitAtString(data);
        IsShowMsg.value = true;
        modal.closable = false;
        modalShow('', '消息');
      }
    } catch (e) {
      //发送错误
      if (entityRef.value != null) {
        const resultMsg = await new WaiGuaFlow(entityRef.value).SendError();
        if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
          previewInfo.visible = true;
          previewInfo.text = resultMsg?.replace('@preview', '');
        }
      }
      emit('ChangeLoading', false, null);
      if (e.includes('@') == false && e.length < 50) {
        message.error(e);
        return;
      }

      msg.value = splitAtString(e);
      IsShowMsg.value = true;
      modal.closable = false;
      IsShowCloseBtn.value = false;
      if (e.includes('没有处理权限')) isCanOnlyClose.value = false;
      else isCanOnlyClose.value = true;
      modalShow('', '消息');
    } finally {
      emit('ChangeLoading', false, null);
      Events.emit('update-notifications');
    }
  };

  const DelayedSend = async () => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddUrlData();
      if (TimeValue.days == 0 && TimeValue.hours === 0 && TimeValue.mins === 0) {
        message.error('请设置延期发送的时间');
        return false;
      }
      handler.AddJson(query);
      handler.AddPara('ToNode', toNodeID.value);
      handler.AddPara('TB_Day', TimeValue.days);
      handler.AddPara('TB_Hour', TimeValue.hours);
      handler.AddPara('DDL_Minute', TimeValue.mins);
      const data = await handler.DoMethodReturnString('DelayedSend');
      msg.value = splitAtString(data);
      IsShowMsg.value = true;
      modal.closable = false;
      modalShow('', '消息');
    } catch (e) {
      emit('ChangeLoading', null, {
        hasError: true,
        tips: e as string,
      });
    } finally {
      emit('ChangeLoading', false, null);
    }
  };
  /**
   * 通用选择器的页面跳转
   * @param selectToNode
   * @param isLastHuiQian
   * @param isHuiQian
   * @constructor
   */
  const DealToNodesHaveSend = (isNeedSave, selectToNode: ToNode, isLastHuiQian, isHuiQian) => {
    if (isNeedSave === false || VSTO_FORM_TYPE.includes(props.frmType)) return SendBySelect(selectToNode, isLastHuiQian, isHuiQian);
    const isSaveSuccess = ref(false);
    emit('Save', 1, async (val) => {
      isSaveSuccess.value = val;
      if (val == false) return false;
      return SendBySelect(selectToNode, isLastHuiQian, isHuiQian);
    });
  };

  const preplaceRowData = ref();
  const PopModalShow = async (rowdata) => {
    popModal.selectNo = rowdata['EmpNos'];
    popModal.selectName = rowdata['EmpNames'];
    const mapExt = new EnMapExt();
    if (rowdata.DeliveryWay === 710) {
      mapExt.ExtModel = ExtModel.Pop;
      mapExt.ExtType = 'PopTreeEns';
      mapExt.AtPara = new AtPara();
      mapExt.Tag1 = GloWF.srcDeptLazily;
      mapExt.Tag3 = GloWF.srcEmpLazily;
      mapExt.Tag4 = GloWF.srcEmpSearchKey; // 搜索数据源
      mapExt.Tag5 = GloWF.srcDeptRoot;
      mapExt.AtPara.SetVal('IsShowSearch', '1');
      mapExt.AtPara.SetVal('IsLazily', '1');
    }
    if (rowdata.DeliveryWay === 711) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('ToNode', rowdata.NodeID);
      handler.AddPara('WorkID', query.WorkID);
      const data = await handler.DoMethodReturnString('Accepter_Init');
      mapExt.ExtModel = ExtModel.Pop;
      mapExt.ExtType = 'PopGroupList';
      mapExt.AtPara = new AtPara();
      mapExt.Tag1 = JSON.stringify(data['Depts']);
      mapExt.Tag2 = JSON.stringify(data['Emps']);
    }

    //单选还是多选.
    mapExt.AtPara.SetVal('IsMultipleChoice', rowdata['IsSimpleSelector'] === 0 ? '1' : '0');
    mapExt.W = '800px';
    mapExt.H = '400px';
    popModal.mapExt = mapExt;
    preplaceRowData.value = rowdata;
    popModal.visible = true;
    popModal.componetKey++;
  };
  // 弹窗ok事件
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const checkedList: any = ref([]);
  const checkedNames: any = ref([]);
  //预置处理人弹窗
  const handleEnsure = async (e: MouseEvent) => {
    try {
      popModal.visible = false;
      const checkedInfo = refPop.value!.handlerPopOK();
      console.log('checkedInfo', checkedInfo);
      checkedList.value = checkedInfo?.[0] || [];
      checkedNames.value = checkedInfo?.[1] || [];

      popModal.selectNo = checkedList.value.join(',');
      popModal.selectName = checkedNames.value.join(',');
      //人员名称
      // const toEmpsName = checkedNames.value.filter((item) => item != '').join(',');
      //人员编号
      const toEmpsNo = checkedList.value.filter((item) => item != '').join(',');
      //保存
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('toEmps', toEmpsNo);
      handler.AddPara('NodeID', preplaceRowData?.value?.NodeID);
      handler.AddPara('WorkID', query.WorkID || route?.query?.WorkID);
      const data: string = await handler.DoMethodReturnJson('Node_AddNextStepAccepters');
      await InitPreset();
      console.log(data);
    } catch (e: any) {
      message.error(e);
    }
  };
  //预置处理人确定
  let preplaceWokerMsg = '';
  const handlerOk = async () => {
    isHaveClickPreplaceWoker.value = true;
    preplaceWokerMsg = '';
    for (let data of dataSource.value) {
      if ((data.EmpNames == '' || data.EmpNames == null || data.EmpNames == undefined) && (data.DeliveryWay === 710 || data.DeliveryWay === 711)) {
        message.warn(data.NodeID + ',节点未设置人员.');
        preplaceWokerMsg += '节点[' + data.Name + ']未预设置处理人;';
      }
    }
    modal.modalVisible = false;
    if (preplaceWokerMsg === '' && preplaceWokerRole.value > 1) await Send(frmID.value);
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

  /**
   * 预置处理人删除
   */
  const DeleteDB = async (row, ele, idx, index) => {
    const empNo = row.EmpNos.split(',')[idx];
    const accper = new SelectAccper(row?.NodeID + '_' + query?.WorkID + '_' + empNo);
    await accper.Init();
    await accper.Delete();
    const empNos = row.EmpNos.split(',');
    const empNames = row.EmpNames.split(',');
    empNames.splice(idx, 1);
    empNos.splice(idx, 1);
    dataSource.value[index]['EmpNames'] = empNames.join(',');
    dataSource.value[index]['EmpNos'] = empNos.join(',');

    preplaceWokerKey.value++;
  };

  const SendBySelect = (selectToNode: ToNode, isLastHuiQian, isHuiQian) => {
    if (selectToNode.IsSelectEmps == '1') {
      //跳到选择接收人窗口
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        modalShow('Accepter', '选择接受人(到达节点:' + selectToNode.Name + ')', window.innerWidth * 0.6);
      }
      return false;
    }
    if (selectToNode.IsSelectEmps == '6') {
      //跳到选择接收人窗口
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        modalShow('AccepterByTeam', '选择接受人(到达节点:' + selectToNode.Name + ')', window.innerWidth * 0.6);
      }
      return false;
    }
    if (selectToNode.IsSelectEmps == '2') {
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        const url = selectToNode.DeliveryParas;
        modalShow(url, '选择接受人');
        return false;
      }
    }
    if (selectToNode.IsSelectEmps == '3') {
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        modalShow('AccepterOfOrg', '选择接受人');
      }
      return false;
    }

    if (selectToNode.IsSelectEmps == '4') {
      if (isHuiQian == true) {
        modalShow('HuiQian', '先会签后发送');
      } else {
        modalShow('AccepterOfDept', '选择接受人');
      }
      return false;
    }
    if (isHuiQian == true) {
      modalShow('HuiQian', '先会签后发送');
      return false;
    }
  };
  /**
   * 删除流程
   * @constructor
   */
  const DeleteFlow = async () => {
    //按照用户设置的方式删除
    if (nodeExt.value.DelEnable == 4) {
      modalShow('DeleteFlowInstance', '删除流程');
      return;
    }
    try {
      //彻底删除
      const { createConfirm } = useMessage();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', '您确定要删除吗？'),
        onOk: async () => {
          if (nodeExt.value.DelEnable == 3) {
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
            handler.AddJson(query);
            handler.AddPara('DelEnable', nodeExt.value.DelEnable);
            const data = await handler.DoMethodReturnString('DeleteFlow');
            if (typeof data == 'string' && data.includes('err@')) {
              message.error(data.replace('err@', ''));
              return;
            }
            message.success(data);
            //删除后事件
            if (entityRef.value != null) {
              const resultMsg = await new WaiGuaFlow(entityRef.value).AfterFlowDel();
              if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
                previewInfo.visible = true;
                previewInfo.text = resultMsg?.replace('@preview', '');
              }
            }
            handleCancel(false);
            return;
          }
          //逻辑删除/写入日志方式的删除
          let val: any = '';
          if (!nodeExt.value.NodeID.toString().endsWith('01')) {
            val = prompt('请输入删除流程的原因.', '');
          } else {
            val = '无';
          }
          if (val != null && val != '') {
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
            handler.AddJson(query);
            handler.AddPara('Msg', val);
            handler.AddPara('DelEnable', nodeExt.value.DelEnable);
            const data = await handler.DoMethodReturnString('DeleteFlow');
            if (typeof data == 'string' && data.includes('err@')) {
              message.error(data.replace('err@', ''));
              return;
            }
            message.success(data);
            //删除后事件
            if (entityRef.value != null) {
              const resultMsg = await new WaiGuaFlow(entityRef.value).AfterFlowDel();
              if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
                previewInfo.visible = true;
                previewInfo.text = resultMsg?.replace('@preview', '');
              }
            }
            handleCancel(false);
          }
        },
      });
    } catch (e) {
      message.error(e as string);
      return;
    }
  };

  /**
   * 作废流程
   * @constructor
   */
  const CanCelFlow = async () => {
    try {
      //作废流程
      const val = prompt('请输入作废流程的原因.', '');
      if (val != null && val != '') {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
        handler.AddJson(query);
        handler.AddPara('Msg', val);
        handler.AddPara('DelEnable', 1);
        const data = await handler.DoMethodReturnString('DeleteFlow');
        if (typeof data == 'string' && data.includes('err@')) {
          message.error(data.replace('err@', ''));
          return;
        }
        message.success('作废成功');
        handleCancel(false);
      }
    } catch (e) {
      message.error(e as string);
      return;
    }
  };
  /**
   * 催办
   * @constructor
   */
  const Press = async () => {
    const val = prompt('请输入催办信息', '该工作因为xxx原因，需要您优先处理.');
    if (val != null && val != '') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF');
      handler.AddJson(query);
      handler.AddPara('Msg', val);
      const data = await handler.DoMethodReturnString('Runing_Press');
      if (typeof data == 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      message.success(data);
    }
  };
  const FixFlow = async () => {
    try {
      const val = prompt('请输入冻结原因', '该工作因为xxx原因，需要冻结.');
      if (val != null && val != '') {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddJson(query);
        handler.AddPara('Msg', val);
        const data = await handler.DoMethodReturnString('Flow_DoFix');
        if (typeof data == 'string' && data.includes('err@')) {
          message.error(data.replace('err@', ''));
          return;
        }
        message.success(data);
        await InitPage();
      }
    } catch (e) {
      message.error(e as string);
    }
  };
  const FixFlowUn = async () => {
    const val = prompt('请输入解除冻结原因', '该工作因为xxx原因，需要解除冻结.');
    if (val != null && val != '') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(query);
      handler.AddPara('Msg', val);
      const data = await handler.DoMethodReturnString('Flow_DoUnFix');
      if (typeof data == 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      message.success(data);
    }
    await InitPage();
  };

  /**
   * 撤销发送
   * @constructor
   */
  const UnSend = async () => {
    unSendBtnDisabled.value = true;
    try {
      //撤销发送前
      if (entityRef.value != null) {
        const resultMsg = await new WaiGuaFlow(entityRef.value).UndoneBefore();
        if (typeof resultMsg === 'boolean' && resultMsg == false) return;
        if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
          previewInfo.visible = true;
          previewInfo.text = resultMsg?.replace('@preview', '');
        }
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
      handler.AddJson(query);
      handler.AddPara('UnSendToNode', query.FK_Node || query.NodeID);
      const data = await handler.DoMethodReturnString('MyView_UnSend');
      if (typeof data == 'string' && (data.includes('err@') || data.includes('info@'))) {
        message.error(data.replace('err@', ''));
        return;
      }
      if (entityRef.value != null) {
        const resultMsg = await new WaiGuaFlow(entityRef.value).UndoneBefore();
        if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
          previewInfo.visible = true;
          previewInfo.text = resultMsg?.replace('@preview', '');
        }
      }
      message.success(data);
      if (props.pageType === 'MyFlow') {
        handleCancel(true);
        await InitPage();
        return;
      }

      if (props.pageType === 'MyView') {
        handleCancel(true);
        Event.emit('InitMyView', '页面刷新');
        //await InitPage();
        return;
      }

      const toNodeID = query.CurrNode;
      // 如果不是顶层iframe
      const topWindow = (window.top === window ? window : window.top)!;
      let hashUrl = topWindow.location.hash;
      if (hashUrl.includes('/WF/TestingContainer/Default')) {
        const flowNo = query.FK_Flow || query.FlowNo;
        let workID = (query.FID as string) || '0';
        if (workID === '0') workID = query.WorkID as string;
        topWindow.location.replace(
          '/#/WF/TestingContainer/Default?FlowNo=' + flowNo + '&WorkID=' + workID + '&TesterNo=' + query.TesterNo + '&CurrPage=FlowInstance&t=' + Math.random(),
        );
      } else {
        try {
          hashUrl = hashUrl.replace('FK_Node%253D' + query.FK_Node, 'FK_Node%253D' + toNodeID);
          hashUrl = hashUrl.replace('NodeID%253D' + query.FK_Node, 'NodeID%253D' + toNodeID);

          window.parent.postMessage({ type: MessageTypeEnum.ChangeFrameSrc, url: '/' + getAllRequestParams(hashUrl)['url'] }, '*');
        } catch (e) {
          const pre = hashUrl.includes('?') ? '&1=1' : '?1=1';
          topWindow.location.replace('/' + hashUrl + pre);
        }
      }
    } catch (e) {
      message.error(e as string);
    } finally {
      unSendBtnDisabled.value = false;
    }
  };
  const ToAllotTask = () => {
    IsShowMsg.value = false;
    modal.modalVisible = true;
    modal.modalType = 'AllotTask';
    modal.modalTitle = '任务分配';
    modal.modalWidth = 600;
    modal.modalHeight = {
      height: '400px',
    };
  };
  const EndFlow = async () => {
    try {
      const handlerEnd = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handlerEnd.AddPara('FK_Flow', query.FlowNo);
      handlerEnd.AddPara('WorkID', query.WorkID);
      const dataEnd: any = await handlerEnd.DoMethodReturnString('MyFlow_StopFlow');
      if (typeof dataEnd === 'string' && dataEnd.includes('err@')) {
        message.error(dataEnd);
        return;
      }
      message.success(dataEnd, 10);
      const resultMsg = await new WaiGuaFlow(entityRef.value).FlowOverAfter();
      if (typeof resultMsg === 'string' && resultMsg?.startsWith('@preview')) {
        previewInfo.visible = true;
        previewInfo.text = resultMsg?.replace('@preview', '');
      }
      handleCancel(false);
    } catch (err: any) {
      message.error(err);
    }
  };
  /**
   * 通过文本长度计算下拉框宽度
   */
  const getMaxOptionWidth = () => {
    let maxWidth = 0;
    toNodes.value.forEach((option) => {
      const optionWidth = getTextWidth(option.Name);
      if (optionWidth > maxWidth) {
        maxWidth = optionWidth;
      }
    });
    return maxWidth + 45; // 假设额外空间为35px
  };

  const getTextWidth = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '16px Arial'; // 设置字体样式
    const width = context.measureText(text).width; // 计算文本宽度
    return width;
  };

  /**
   * 按钮弹窗操作
   * @param type
   * @param title
   * @param width
   * @param height
   */
  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
    };
  };
  // 测试容器额外处理
  const inTestContainer = () => location.href.includes('/TestingContainer/');
  const isPort = () => location.href.includes('&win=true');
  const handleCancel = (isOnlyClose = false) => {
    modal.modalVisible = false;
    if (isOnlyClose === true) return;
    if (isCanOnlyClose.value == true) {
      isCanOnlyClose.value = false;
      return;
    }
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if ((flowOpenModel === 3 && !inTestContainer()) || isPort()) {
      //FlowOpenModel==3 新网页打开,流程关闭后，刷新opener窗口
      let data = {
        type: 'loadPage',
        value: true,
      };
      if (window.opener) {
        window.opener.postMessage(data, '*');
      }
      window.close();
    }
    //自定义关闭页面
    WindCloseBySelf();
    //判断当前页面所属的Iframe页面
    const iframe = window.frameElement;
    if (!!iframe) {
      const src = window.frameElement?.src;
      if (!!src && src.toString().includes('GenerList')) {
        window.location.replace(src);
        return;
      }
      if (!!src && src.toString().includes('PageFrom=SubFlow')) {
        //iframe?.contentWindow.postMessage('close-outer');
        const topWin = window.top;
        topWin?.postMessage('close-outer');
        return;
      }
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
    } else {
      try {
        const topWin = window.top;
        const parentWin = window.parent;
        // 向top窗口发送消息
        if (topWin && topWin !== window) {
          topWin.postMessage({ type: MessageTypeEnum.ReloadPage, url: '/' + hashUrl }, '*');
        }
        // 向parent窗口发送消息
        if (parentWin && parentWin !== window) {
          parentWin.postMessage({ type: MessageTypeEnum.ReloadPage, url: '/' + hashUrl }, '*');
        }
        // window.parent.postMessage({ type: MessageTypeEnum.ReloadPage, url: '/' + hashUrl }, '*');
      } catch (e) {
        const pre = hashUrl.includes('?') ? '&1=1' : '?1=1';
        topWindow.location.replace('/' + hashUrl + pre);
      }
    }
    //发送关闭后跳转MyView页面
    if (nodeExt.value?.TurnToDeal == 5) {
      const url = `${location.pathname}#/WF/MyView?FK_Flow=${query.FK_Flow}&FK_Node=${nodeExt?.value?.NodeID}&WorkID=${query.WorkID}&FID=${query.FID}&IsReadonly=1`;
      topWindow.location.href = url;
      return;
      // window.location.replace('/#/CCMobile/MyView?FK_Flow=' + query.FK_Flow + '&FK_Node=' + nodeExt?.value?.NodeID + '&WorkID=' + query.WorkID + '&FID=' + query.FID);
    }
    const topWin = window.top;
    topWin?.postMessage('close-outer');

    if (window == window.top && hashUrl.includes('#/WF/MyFlow')) window.close();

    //处理port页面单流程问题
    if (window !== window.top) {
      window.parent.postMessage({ type: 'close-page', msg: true }, '*');
      return;
    }
    // 尝试关闭浏览器标签页
    if (!hashUrl.includes('/WF/TestingContainer/Default') && window.history.length <= 1) {
      // 否则尝试关闭窗口
      window.close();
    }
  };
  const modalClose = async () => {
    modal.modalVisible = false;
    IsHtmlPage.value = false;
    IsPdfPage.value = false;
    IsZipPage.value = false;
    if (modal.modalType === 'HelpAlert') {
      //保存用户的帮助指引信息操作
      const mypk = WebUser.No + '_ND' + nodeExt.value.NodeID + '_HelpAlert';
      const userRegedit = new BSEntity('BP.Sys.UserRegedit');
      userRegedit.setPK(mypk);
      const count = await userRegedit.RetrieveFromDBSources();
      if (count === 0) {
        //保存数据
        userRegedit.FK_Emp = WebUser.No;
        userRegedit.FK_MapData = 'ND' + nodeExt.value.NodeID;
        await userRegedit.Insert();
      }
    }
  };
  const drawerShow = (type: string, title: string, width: number = window.innerWidth * 0.5) => {
    drawerVisible.value = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
  };
  const drawerClose = () => {
    drawerVisible.value = false;
    if (modal.modalType === 'TZWorkerEnable') {
      window.location.reload();
    }
  };

  /**
   * 树形结构表单的保存
   * @constructor
   */
  const FromTreeSend = (type: number, isHuiQian) => {
    //表单的验证
    emit('Save', 1, (val) => {
      if (val == false) {
        emit('ChangeLoading', false, null);
        return false;
      }
      nodeSend(false, isHuiQian, null);
      return true;
    });
  };

  const SendDevForm = async (isHuiQian: boolean, formData: Recordable, type: string) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handler.AddJson(props.params);
    const keys = Object.keys(formData);
    for (const key of keys) {
      handler.AddPara(key, encodeURIComponent(formData[key]));
    }
    /*let workID = route?.query?.WorkID || query.WorkID;
if (typeof workID === 'string' && workID.includes('@')) {
workID = workID.split('@')[0];
}
handler.AddPara('WorkID', workID);*/
    await handler.DoMethodReturnString('Save');
    if (type === 'Save') {
      message.success('保存成功');
      return;
    }
    nodeSend(false, isHuiQian, null);
  };

  /**
   * 嵌入式表单
   * @param type
   * @constructor
   */
  const SendSelfFrom = async (type: number, isHuiQian) => {
    let isCanSend = false;
    //保存按钮禁用的时候，不需要执行保存方法
    const isHaveSaveBtn = btnList.value.filter((btn) => btn.No === 'Save').length > 0 ? true : false;
    if (isHaveSaveBtn === false) {
      //需要保存审核意见
      emit('Save', type, true, (val) => {
        if (val === true) {
          nodeSend(false, isHuiQian, null);
          return true;
        }
        return false;
      });
      return;
    }
    emit('Save', type, false, (val) => {
      if (val == null) return;
      let str = '';
      if (typeof val === 'boolean') {
        isCanSend = val;
      } else if (typeof val === 'string') {
        str = val;
      } else if (typeof val === 'object') {
        //转换成字符串
        for (const key of val) {
          str += '@' + key + '=' + val[key];
        }
      } else {
        message.error('嵌入式表单返回值格式不正确');
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
    });
    let selfFormRoot = nodeExt?.value?.GetParaInt('SelfFormEnRoot', 0);
    if (selfFormRoot == 5 && (nodeExt.value.FormUrl.startsWith('/@/') || nodeExt.value.FormUrl.startsWith('/src/'))) {
      isCanSend = true;
    }
    if (isCanSend === false) {
      message.warning('嵌入式表单未能正确保存，请检查嵌入式的页面中是否存在Save函数。');
      return false;
    }
    return isCanSend;
  };
  /**
   * SDK表单
   * @param type
   * @constructor
   */
  const SDKSend = (type: number) => {
    let isCanSend = false;
    emit('Save', type, (val) => {
      isCanSend = val;
    });
    return isCanSend;
  };

  //文件预览
  const AthView = () => {
    if (typeof CommonConfig.IsOnlinePreviewOfAth == 'undefined') CommonConfig.IsOnlinePreviewOfAth = true;
    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      //配置的在线预览的方式，待处理.
      //预览文件服务器.
      var fileServerHost = CommonConfig.PreviewPathOfAth;
      const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
      const downloadFileUrl = basePath + 'WF/VSTO/GenerGongWenByteWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
      //同文件名字使用以生成过的在线预览文件kkfile逻辑使用guid每次得生成在线预览文件
      const docName = crypto.randomUUID() + '.docx';
      var previewUrl = downloadFileUrl + '&fullfilename=' + docName;
      var onlinePreviewUrl = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + encodeURIComponent(setBase64(previewUrl));
      window.open(onlinePreviewUrl);
    }
    return;
  };

  const parseStringToObjectGetByKey = (str, keyPara) => {
    const parts = str.split('@');
    const obj = {};

    parts.forEach((part) => {
      const [key, value] = part.split('=');
      obj[key] = value;
    });
    if (obj[keyPara] == 'undefined') {
      obj[keyPara] = null;
    }
    return obj[keyPara];
  };
  defineExpose({ handleCancel });
</script>

<style lang="less" scoped>
  .toolbar-wrapper {
    box-sizing: border-box;
    display: flex;
    //align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: auto;
    //background-color: #4877fb;
    padding: 13px 2.2rem;
    justify-content: space-between;

    align-items: center;
    flex-wrap: wrap;

    // .frmBtnScroll {
    //   width: 88%;
    //   flex-wrap: nowrap;
    //   overflow-x: auto;

    //   &::-webkit-scrollbar {
    //     height: 4px;
    //   }

    //   &::-webkit-scrollbar-thumb {
    //     border-radius: 5px;
    //     -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    //     background-color: #99a9bf;
    //   }

    //   &::-webkit-scrollbar-track {
    //     -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    //     border-radius: 5px;
    //     background-color: #d3dce6;
    //   }
    // }
    .flow-btn {
      //padding: 4px 16px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      // background-color: #1890ff;
      //color: white;
      cursor: pointer;
    }

    .send-btn {
      background-color: #007af5;
      color: #fff;
    }
    .track-btn {
      background-color: #f56c6c !important;
      border-color: #f56c6c !important;
      color: #fff !important;
    }

    .unSend-btn {
      background-color: #f56c6c;
      color: #fff;
    }
  }

  // 退回
  .sendBack {
    // margin: 20px 35px;
    background: #fff;
    // box-shadow: 0px 0px 5px 2px #acacac;
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

  //表单风格
  .select-group-label {
    color: #1890ff;
    border-bottom: 1px solid #1890ff;
    font-size: 14px;
    padding-bottom: 12px;
    font-weight: 600;
  }

  .pop_intput_div {
    line-height: 32px;
    min-height: 32px;
    /*height: auto;*/
    width: calc(100% - 46px);
    border: 1px solid #ccc;
  }

  .resetControls {
    display: flex;
    justify-content: flex-end;

    & .btnStyle {
      margin: 10px 20px 0 0;
    }
  }

  :deep(.ant-modal-header) {
    padding: 12px 8px;
    border-bottom: 1px solid #eaedf6;
  }

  .modal-footer {
    display: flex;
    justify-content: center;
    padding: 10px 16px;
    border-top: 1px solid #eaedf6;
  }

  :deep(.ant-modal-content) {
    padding: 0 !important;
  }
</style>
