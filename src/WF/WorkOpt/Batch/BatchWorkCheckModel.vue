<template>
  <BaseComponent ref="baseComponent" :update-func="InitPage">
    <div>
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <template v-else>
          <div>
            <div style="display: flex; align-items: center">
              <template v-if="dataSource.length > 0">
                <div v-for="(btn, index) in btns" :key="index">
                  <Button v-if="btn == '发送'" type="primary" style="margin: 10px 5px" @click="PopModalShow(btn)">{{ btn }}</Button>
                </div>
                <Select v-if="toNDS.length != 0" v-model:value="toNodeID" style="width: 150px; margin-left: 12px">
                  <SelectOption v-for="item in toNDS" :key="item.No" :value="item.Name">
                    <i :class="item.icon" style="margin-right: 5px"></i><span>{{ item.Name }}</span></SelectOption
                  >
                </Select>
                <div v-for="(btn, index) in btns" :key="index">
                  <Button v-if="btn == '退回'" type="primary" style="margin: 10px 5px" @click="Btn_Return()">{{ btn }}</Button>
                </div>
                <div>
                  <!-- 批量审核 -->
                  <Button v-if="sta == 1 && BatchCheckNoteModel == '1'" style="margin: 10px 5px" @click="BatchAudit()">{{ '批量意见' }}</Button>
                </div>
              </template>
            </div>
            <div style="padding: 15px">
              <Table
                :row-selection="{ selectedRowKeys: SelectRowKeys, onChange: onSelectChange }"
                :rowKey="(record, index) => record.OID"
                :columns="columns"
                :dataSource="dataSource"
                :pagination="pagination"
                @change="handleTableChange"
              >
                <template #bodyCell="{ column, text, record, index }">
                  <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
                  <template v-if="column.dataIndex === 'Title'">
                    <a @click="LinkFieldClick(record)">{{ text }}</a>
                  </template>
                  <template v-if="column.dataIndex === 'FlowNote'">
                    <Textarea
                      v-model:value="record.FlowNote"
                      :auto-size="{ minRows: 2, maxRows: 2 }"
                      :placeholder="'请填写审核意见'"
                      :style="{ margin: '10px', width: '90%', height: '50px' }"
                      :allow-clear="true"
                      type="textarea"
                    />
                  </template>
                </template>
              </Table>
            </div>
          </div>
          <!--居中弹窗-->
        </template>
        <Modal v-model:open="popModal.visible" :title="'批处理发送'" @ok="handleEnsure" width="980px">
          <PopTreeEns
            ref="treeEns"
            :listSql="popMapExt.Tag3"
            :treeSql="popMapExt.Tag1"
            :parentNo="popMapExt.Tag5"
            :search-sql="popMapExt.Tag4 || ''"
            :is-have-upper-level="popMapExt.Tag6 === '0' ? false : true"
            :is-multi-select="true"
            :is-show-search="'1'"
            :selected-items="rowData.Worker"
            :selected-item-names="rowData.WorkerName"
          />
        </Modal>

        <!-- 居中弹窗 -->
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
          <BaseModal :modalType="modal.modalType" :params="urlParams" @handleCancel="handleCancel" :key="new Date().getTime()" class="sendBack" />
        </Modal>
        <!-- 审核意见 -->
        <Modal v-model:open="AuditModal.visible" :title="AuditModal.title" :width="AuditModal.Width" :body-style="AuditModal.Height" @ok="AuditModalOK">
          <Textarea
            v-model:value="AuditModal.auditOpinion"
            :placeholder="'请填写批量审核意见'"
            :style="{ margin: '10px', width: '90%', height: '200px' }"
            :allow-clear="true"
            type="textarea"
          />
        </Modal>
        <Modal v-model:open="MsgModal.visible" :title="MsgModal.title" :width="MsgModal.Width" :body-style="MsgModal.Height" @ok="MsgOK" style="overflow: auto">
          <div v-html="MsgModal.Msg"></div>
        </Modal>
      </Spin>
    </div>
  </BaseComponent>
</template>
<script setup lang="ts">
  import { reactive, ref, shallowRef } from 'vue';
  import { Spin, Table, Button, message, Modal, Select, SelectOption, Textarea } from 'ant-design-vue';
  import { GL_BatchWorkCheckModel } from '../../GenerList/GL_BatchWorkCheckModel';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { DataType } from '/@/bp/en/DataType';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import PopTreeEns from '/@/WF/Comm/subComponents/PopTreeEns.vue';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import { AtPara } from '/@/bp/da/AtPara';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import BSEntity from '/@/utils/gener/BSEntity';
  import BaseModal from '/@/WF/WorkOpt/BaseModal.vue';

  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });

  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  //分页
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    hideOnSinglePage: false, // 只有一页时是否隐藏分页器
    showSizeChanger: true, //是否可以改变pageSize
  });
  const handleTableChange = (paginationProp) => {
    pagination.current = paginationProp.current;
    pagination.pageSize = paginationProp.pageSize;
  };
  //获取所有数据
  const glEn: any = ref();
  const linkField = ref();
  //按钮组
  const btns = ref();
  //下拉框数据
  const toNDS = ref<any>([]);
  const toNodeID: any = ref(null);

  const nodeExt = ref();

  //发送pop树部分 开始
  //设置弹窗参数
  const popMapExt = reactive({
    ExtModel: 'Pop',
    ExtType: 'PopTreeEns',
    AtPara: new AtPara(),
    Tag1: GloWF.srcDeptLazily,
    Tag3: GloWF.srcEmpLazily,
    Tag4: GloWF.srcEmpSearchKey,
    Tag5: '0',
    Tag6: '1',
  });
  //设置参数.
  popMapExt.AtPara.SetVal('Label', '请选择');
  popMapExt.AtPara.SetVal('Icon', 'icon-options');
  popMapExt.AtPara.SetVal('IsShowSearch', '0');

  //弹窗显示
  const popModal = reactive({
    visible: false,
  });
  const rowData = ref();
  const BatchCheckNoteModel = ref('0');
  const BatchFields = ref('');
  const EditFields = ref('');
  //通过数组进行判断flowNote内容存在,存在返回true往下走，不存在返回false进行提示.
  const flowNoteArr = ref<string[]>([]);
  const PopModalShow = async (rowdata) => {
    if (SelectBox.value.length == 0) {
      message.info('请选择批处理的待办数据');
      return;
    }
    if (toNDS.value.length != 0) {
      const getToNds = toNDS.value.filter((tonode) => tonode.Name == toNodeID.value);
      console.log(getToNds);
      if (getToNds[0].IsSelectEmps == '1') {
        //通用选择器
        popModal.visible = true;
        rowData.value = rowdata;
        return;
        // } else {
        //   message.info('该类型暂未解析');
      }
    }
    //通过数组存储所有的flowNote,然后过滤判断是否存在为空的情况，为空则不打开弹窗
    flowNoteArr.value = [];
    for (let i = 0; i < SelectBox.value.length; i++) {
      let flowNote = SelectBox.value[i].FlowNote;
      if (BatchCheckNoteModel.value == '1') {
        flowNoteArr.value.push(flowNote);
        if (!flowNote) {
          message.info('您有选中的流程未填写审核意见.');
        }
      }
    }
    if (!!flowNoteArr.value) {
      let IsFlowNote = flowNoteArr.value.some((item) => item === '');
      console.log('IsFlowNote', IsFlowNote);
      if (IsFlowNote) {
        dialogShowModal.value = !IsFlowNote;
        return;
      }
    }

    const data = execSend();
    if (dialogShowModal.value == true) {
      MsgModalShow('返回信息', (await data) as any, window.innerWidth * 0.3);
      await InitPage();
    }
  };
  // 弹窗ok事件
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const checkedList: any = ref([]);
  const checkedNames: any = ref([]);
  //pop树结束

  //退回弹窗部分
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
    content: '',
  });
  //退回弹窗
  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
      overflowY: 'auto',
    };
  };
  const modalClose = async () => {
    modal.modalVisible = false;
  };
  //关闭弹窗
  const handleCancel = (isOnlyClose) => {
    modal.modalVisible = false;
    InitPage();
    if (isOnlyClose === true) return;
  };
  //退回弹窗部分结束

  const checkNote = ref(); //审核意见.
  const todoEmps = ref(''); //人员s.
  const handleEnsure = async (e: MouseEvent) => {
    try {
      popModal.visible = false;
      console.log(SelectBox.value);
      checkedList.value = treeEns.value?.allCheckList || [];
      checkedNames.value = treeEns.value?.checkedNames || [];
      //选择人员(设置人员拼接)
      todoEmps.value = checkedList.value.filter((item) => item != '').join(',');

      const data = execSend();
      // message.info(await data);
      if (dialogShowModal.value == true) {
        MsgModalShow('返回信息', (await data) as any, window.innerWidth * 0.3);
        await InitPage();
      }
    } catch (error: any) {
      message.error(error);
    }
  };

  // const respon(eMsg = ref(''); //响应的信息
  const sta = ref();

  const dialogShowModal = ref(true);
  //执行发送
  const execSend = async () => {
    try {
      dialogShowModal.value = true;
      if (sta.value == 1 && BatchCheckNoteModel.value == '0') {
        checkNote.value = window.prompt('请输入审核意见', '同意');
        if (checkNote.value == null || checkNote.value == '' || checkNote.value == undefined) {
          dialogShowModal.value = false;
          return;
        }
      }
      loading.value = true;
      if (BatchCheckNoteModel.value == '1') {
        if (window.confirm('确定要执行吗？') == false) {
          dialogShowModal.value = false;
          return;
        }
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_Batch');
      flowNoteArr.value = [];
      for (let i = 0; i < SelectBox.value.length; i++) {
        let WorkID = SelectBox.value[i].WorkID;
        let flowNote = SelectBox.value[i].FlowNote;
        await handler.AddPara('CB_' + WorkID, 'on');
        if (sta.value == 1 && BatchCheckNoteModel.value == '1') await handler.AddPara('TB_' + WorkID + '_WorkCheck_Doc', flowNote);
      }
      const ToNode = toNDS.value.find((tonode) => tonode.Name == toNodeID.value) || {};
      await handler.AddPara('FK_Node', props.params?.NodeID);
      await handler.AddPara('CheckNote', checkNote?.value);
      await handler.AddPara('ToNode', ToNode?.No);
      await handler.AddPara('ToEmps', todoEmps?.value);
      let data = await handler.DoMethodReturnString('WorkCheckModel_Send');
      data = data
        .replace(/@<a href='.*?>.*?<\/a>/g, '')
        .replace(/@/g, '<br>@')
        .replace(/%40/g, '@');
      return data;
    } catch (error: any) {
      message.error(error);
    } finally {
      loading.value = false;
    }
  };

  //初始化

  const urlParams = reactive({
    FK_Node: '',
    WorkID: 0,
    WorkIDs: '',
    isFrameCross: 0,
  });
  const Btn_Return = async () => {
    const workIds = SelectBox.value.map((item) => item.WorkID).join(',');
    if (workIds == '') {
      alert('选择需要退回的流程数据');
      return;
    }
    const node = new BSEntity('BP.WF.Node', props.params?.NodeID);
    await node.RetrieveFromDBSources();
    if (workIds.indexOf(',') == -1) {
      urlParams.WorkID = parseInt(workIds);
      urlParams.WorkIDs = workIds;
      urlParams.FK_Node = node.NodeID;
      modalShow('ReturnWork', '退回', window.innerWidth * 0.5, 400);
    } else {
      const WorkID = workIds.substring(0, workIds.indexOf(','));
      urlParams.WorkIDs = workIds;
      urlParams.FK_Node = node.NodeID;
      urlParams.WorkID = parseInt(WorkID);
      modalShow('ReturnWork', '退回', window.innerWidth * 0.5, 400);
    }
  };

  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const dataSource: any = ref([]);
  const columns = ref<any>([]);

  //多选框数据
  const SelectBox = ref<any>([]);
  const SelectRowKeys = ref<any>([]);
  //选择checkbox
  const onSelectChange = (selectedRowKeys: string[], selectedRows: DataType[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    SelectBox.value = selectedRows;
    SelectRowKeys.value = selectedRowKeys;
    console.log(SelectBox.value);
  };

  const AuditModal = reactive({
    visible: false,
    title: '',
    auditOpinion: '',
    Width: 800,
    Height: {},
  });

  //退回弹窗
  const AuditModalShow = (title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    AuditModal.visible = true;
    AuditModal.title = title;
    AuditModal.Width = width;
    AuditModal.Height = {
      height: height + 'px',
      overflowY: 'auto',
    };
  };
  const BatchAudit = () => {
    AuditModalShow('批量意见', window.innerWidth * 0.3, 300);
    console.log('批量退回');
  };
  const AuditModalOK = () => {
    AuditModal.visible = false;
    dataSource.value.forEach((item) => {
      SelectBox.value.filter((select) => {
        if (item.WorkID == select.WorkID) {
          item.FlowNote = AuditModal.auditOpinion;
        }
      });
    });
  };
  const MsgModal = reactive({
    visible: false,
    title: '',
    Msg: '',
    Width: 800,
    Height: {},
  });
  const MsgModalShow = (title: string, Msg: string, width: number = window.innerWidth * 0.5, height = 500) => {
    MsgModal.visible = true;
    MsgModal.title = title;
    MsgModal.Msg = Msg;
    MsgModal.Width = width;
    MsgModal.Height = {
      height: height + 'px',
      overflowY: 'auto',
    };
  };
  const MsgOK = () => {
    MsgModal.visible = false;
  };
  /**
   * 执行点击超链接事件
   * @param record
   * @constructor
   */
  const LinkFieldClick = async (record) => {
    if (glEn.value.LinkField === '') return;
    const result = await glEn.value.LinkFieldClick(record);
    if (!!result) afterOper(record[glEn.value.LinkField], result);
  };

  //执行完的操作
  async function afterOper(btnName, result) {
    console.log({ btnName });
    baseComponent.value?.handleGPNCallback(result, btnName);
  }

  const InitPage = async () => {
    try {
      loading.value = true;
      SelectRowKeys.value = [];
      //下拉框数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      await handler.AddUrlData();
      await handler.AddPara('FK_Node', props.params.NodeID);
      await handler.AddPara('PageName', 'Batch');
      const data = await handler.DoMethodReturnString('Batch_InitDDL');
      toNDS.value = data || [];
      //默认数据
      if (toNDS.value.length != 0) {
        toNodeID.value = toNDS.value[0]?.Name;
      }
      //表格数据
      const entity = new GL_BatchWorkCheckModel();
      entity.setParams(props.params || {});
      await entity.Init(); //获得数据.
      glEn.value = entity;
      console.log(entity);
      //按钮组
      btns.value = glEn.value.BtnOfToolbar == '' ? [] : glEn.value.BtnOfToolbar.split(',');
      linkField.value = glEn.value.LinkField;

      //判断审核组件的状态，如果启用了. 并且审核意见填写模式为一个 统一 的意见.
      const node = new BSEntity('BP.WF.Node', props.params?.NodeID);
      await node.RetrieveFromDBSources();
      nodeExt.value = node;
      BatchCheckNoteModel.value = GetPara(nodeExt.value?.data.AtPara, 'BatchCheckNoteModel');
      BatchFields.value = GetPara(nodeExt.value?.data.AtPara, 'BatchFields');
      EditFields.value = GetPara(nodeExt.value?.data.AtPara, 'EditFields');
      console.log(node.value);
      //审核组件状态 @0=禁用@1=启用@2=只读
      sta.value = nodeExt.value.data?.FWCSta;

      handlerColumns();

      dataSource.value = glEn.value.Data.Works;
      console.log(glEn.value.Data.Works);
      dataSource.value.forEach((item) => {
        item.FlowNote = '';
      });
      //初始化进行降序排序
      dataSource.value = dataSource.value.sort((a, b) => Date.parse(b.ADT) - Date.parse(a.ADT));

      // if
    } catch (e) {
      console.log(e);
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();

  const handlerColumns = () => {
    const mapAttrs = glEn.value.Data.Sys_MapAttr; //要显示的字段.
    if (sta.value == '1' && BatchCheckNoteModel.value == '1') {
      glEn.value.Columns.forEach((item) => {
        if (item.Key == 'FlowNote') item.IsShow = true;
      });
    }
    //设置列
    columns.value = glEn.value.Columns.filter((item) => !!item.IsShow);
    for (var i = 0; i < mapAttrs.length; i++) {
      var attr = mapAttrs[i];
      if (BatchFields.value == undefined) continue;
      if (BatchFields.value.indexOf(attr.KeyOfEn) == -1) continue;
      if (attr.Name == '审核意见') continue;
      columns.value.push({
        DataType: attr.DataType,
        IsShow: attr.IsShow,
        key: attr.Key,
        name: attr.Name,
        width: attr.width,
        dataIndex: attr.Key,
        title: attr.Name,
      });
    }
    columns.value = columns.value.map((item) => {
      if (item.Key === 'ADT') {
        //接收日期的列增加排序按钮
        return {
          DataType: item.DataType,
          IsShow: item.IsShow,
          key: item.Key,
          name: item.Name,
          width: item.width,
          dataIndex: item.Key,
          title: item.Name,
          defaultSortOrder: 'descend',
          sorter: (a: any, b: any) => Date.parse(a.ADT) - Date.parse(b.ADT),
          sortDirections: ['descend', 'ascend'],
        };
      } else {
        return {
          DataType: item.DataType,
          IsShow: item.IsShow,
          key: item.Key,
          name: item.Name,
          width: item.width,
          dataIndex: item.Key,
          title: item.Name,
        };
      }
    });
  };
</script>
<style lang="less" scoped></style>
