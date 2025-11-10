<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <div v-if="isShowMsg == false">
          <Form layout="vertical" style="width: 70%; margin: 0 auto">
            <FormItem :label="'要退回到的审核人:'">
              <template v-if="IsMobile()">
                <DropdownMenu v-if="returnDatato.length > 0" direction="down">
                  <DropdownItem v-model="returnToNode" :options="returnDatato" />
                </DropdownMenu>
              </template>
              <template v-else>
                <Select v-model:value="returnToNode">
                  <SelectOption v-for="option in returnData" :key="option.No" :value="option.No"><i class="icon-user"></i> {{ option.Name }} </SelectOption>
                </Select>
              </template>
            </FormItem>
            <FormItem>
              <template #label>
                <span style="width: 110px">{{ ReturnTitle }}原因:</span>
                <Select v-model:value="returnDefaultWork" @change="handleChange" style="width: 425px">
                  <SelectOption v-for="option in returnUseWorks" :key="option?.No"> {{ option?.Name }} </SelectOption>
                </Select>
                <div class="edit-cont"><i class="icon-plus" @click="OpenUseExpresFlow"></i></div>
              </template>
              <Textarea v-model:value="returnMsg" :placeholder="'退回原因'" style="width: 100%; border: 1px solid #d9d9d9; border-radius: 2px; height: 100px" />
            </FormItem>
          </Form>
          <div class="btn-groups" style="margin-left: 16%">
            <div style="margin: 5px 85px 5px 5px" class="refund">
              <Button type="primary" @click="ReturnWork" style="margin-right: 1em">{{ '退回' }}</Button>
              <Button type="primary" @click="Close(0)">{{ '关闭' }}</Button>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-html="msg" style="padding: 10px 20px"> </div>
          <div style="display: flex; justify-content: flex-end; margin-right: 100px">
            <Button type="primary" @click="Close(1)">{{ '关闭' }}</Button>
          </div>
        </div>
      </div>
      <Modal v-model:open="modal.ModalVisible" centered :title="modal.modalTitle" :footer="null" :width="modal.modalWidth" :body-style="modal.modalHeight" @cancel="handleOk">
        <GenerList :params="{ EnName: 'GL_ReturnWorks', FlowNo: query.FlowNo, WorkID: query.WorkID }" />
      </Modal>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'ReturnWork',
  };
</script>
<script lang="ts" setup>
  import { message, Spin, Form, FormItem, Button, Select, SelectOption, Textarea, Modal } from 'ant-design-vue';
  import { DropdownMenu, DropdownItem } from 'vant';
  import { reactive, ref, shallowRef } from 'vue';
  import { IsMobile } from '/@/utils/gener/StringUtils';
  import UsefulExpresFlow from '/@/WF/WorkOpt/UsefulExpresFlow.vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import GenerList from '/@/WF/views/GenerList.vue';
  import { GenerWorkers } from '/@/CCFast/CCBill/GenerWorker';
  import Dev2InterfaceCCBill from '/@/CCFast/Dev2InterfaceCCBill';
import { MessageTypeEnum } from '/@/enums/messageTypeEnum';

  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  interface ReturnItem {
    No: string;
    Name: string;
  }
  interface state {
    tags: Array<any>;
    inputVisible: Boolean;
    inputValue: Object;
  }

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const ReturnTitle = ref(props.params?.Title || '退回');
  const query = ref(props.params);
  const loading = ref(false);
  //退回后显示的信息
  const isShowMsg = ref(false);
  const msg = ref('');

  const returnData = ref<ReturnItem[]>([]);
  const returnDatato = ref<any[]>([]);
  const returnToNode = ref('');
  const returnMsg = ref<string>('');

  //退回常用短语集合
  const state: state = reactive({
    tags: [],
    inputVisible: false,
    inputValue: {},
  });
  //常用短语默认值
  const returnDefaultWork = ref('');
  const returnUseWorks = ref<any[]>([]);
  //弹窗显示
  const modal = reactive({
    ModalVisible: false,
    modalTitle: '',
    modalType: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const InitPage = async () => {
    try {
      loading.value = true;
      const tks = new GenerWorkers();
      await tks.Retrieve('WorkID', props.params.WorkID, 'FrmID', props.params.FrmID, 'PassSta', 2, 'Idx');
      if (tks.length == 0) {
        message.error('没有可以退回到的审核人,请检查信息是否丢失');
        return;
      }
      if (IsMobile()) {
        tks.forEach((tk) => {
          returnDatato.value.push({
            value: tk.Idx,
            text: tk.EmpName + ':' + tk.RDT,
          });
        });
        returnToNode.value = returnDatato.value.length > 0 ? returnDatato.value[0].value : '';
      } else {
        tks.forEach((tk) => {
          returnData.value.push({
            No: tk.Idx,
            Name: tk.EmpName + ':' + tk.RDT,
          });
        });
        returnToNode.value = returnData.value.length > 0 ? returnData.value[0].No : '';
      }

      await getReturnUsePhrase();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  /**
   * 获取退回常用短语
   */
  const getReturnUsePhrase = async () => {
    const ens = new BSEntities('BP.Sys.FastInputs');
    const data = await ens.DoMethodReturnJSON('InitData_ReturnFlow');
    console.log(data);
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data);
      return;
    }
    const dataMsg = JSON.parse(JSON.stringify(data));
    state.tags = dataMsg;
    const tags = state.tags.filter((item) => !!item.Vals);
    returnUseWorks.value = tags.map((item) => {
      return {
        No: item?.MyPK,
        Name: item?.Vals,
      };
    });
    returnDefaultWork.value = returnUseWorks.value.length > 0 ? returnUseWorks.value[0].No : '';
  };
  /**
   * 下拉框选中
   */
  const handleChange = (value) => {
    returnMsg.value = '';
    console.log('选中值', value);
    const selectVal = returnUseWorks.value.find((item) => item.No == value);
    console.log(selectVal.Name);
    if (selectVal.Name == '其他') {
      returnMsg.value = '';
    } else {
      returnMsg.value = selectVal.Name;
    }
  };
  /**
   * 编辑退回常用短语弹窗
   */
  const OpenUseExpresFlow = () => {
    modal.ModalVisible = true;
    modal.modalTitle = '退回常用短语';
    modal.modalType = 'UsefulExpresFlow';
    modal.modalHeight = {
      height: window.innerHeight * 0.45 + 'px',
    };
  };
  /**
   * 弹窗编辑完关闭按钮
   */
  const selectData = shallowRef<InstanceType<typeof UsefulExpresFlow>>();
  const handleOk = async () => {
    modal.ModalVisible = false;
    InitPage();
  };

  const ReturnWork = async () => {
    if (returnToNode.value === '') {
      message.error('请选择退回到的审核人');
      return;
    }
    if (returnMsg.value == '') {
      message.error('请填写退回原因');
      return;
    }
    loading.value = true;
    try {
      //单个退回
      const info = await Dev2InterfaceCCBill.ReturnWork(props.params.WorkID, parseInt(returnToNode.value), returnMsg.value);
      isShowMsg.value = true;
      msg.value = info;
    } catch (e) {
      message.error(e as string);
    } finally {
      loading.value = false;
    }
  };
  const emit = defineEmits(['trigger-close']);
  const Close = (type: number) => {
    emit('trigger-close');
    if(type == 1){
      const topWindow = (window.top === window ? window : window.top)!;
      const hashUrl = topWindow.location.hash;
      try {
        window.parent.postMessage({ type: MessageTypeEnum.ReloadPage, url: '/' + hashUrl }, '*');
      } catch (e) {
        const pre = hashUrl.includes('?') ? '&1=1' : '?1=1';
        topWindow.location.replace('/' + hashUrl + pre);
      }
    }

  };
</script>
<style scoped lang="less">
  .content {
    padding: 20px 0;
    margin: 5px 15px;
    border-radius: 5px;
    box-shadow: #03030333 5px 5px 10px 5px;
    .refund {
      display: flex;
      justify-content: flex-end;
    }
    .edit-cont {
      font-size: 20px;
      color: #3a64fe;
      margin: 0 10px;
    }
  }
</style>
