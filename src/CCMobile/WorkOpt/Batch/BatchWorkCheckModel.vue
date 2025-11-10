<template>
  <div style="margin-top: 45px">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <template v-else>
        <div>
          <Checkbox v-model="isCheckAll" shape="square" :indeterminate="isIndeterminate" @change="onCheckAllChange" class="checkedAll">{{ '全选' }}</Checkbox>
          <CheckboxGroup v-model="checkList">
            <template v-for="(item, idx) in dataSource" :key="idx">
              <div class="vant-address-item">
                <div class="vant-cell vant-cell--borderless">
                  <div class="vant-cell__value vant-cell__value--alone">
                    <span v-for="column in columns" :key="column.Key">
                      <div v-if="column.key === glEn.LinkField" class="vant-gl-link-text">
                        <Checkbox :name="item.OID.toString()" shape="square" v-model="item.isChecked" @click="onSelectChange(idx, item)" class="checked" />
                        <span @click="LinkFieldClick(item)">{{ column.name }}:{{ item[column.key] }}</span>
                      </div>
                      <div v-else-if="column.dataIndex !== 'FlowNote'" class="vant-gl-text">
                        <span style="color: #808399"> {{ column.name }}</span>
                        <span>{{ item[column.key] }}</span>
                      </div>
                      <div v-else>
                        <span style="color: #808399"> {{ column.name }}</span>
                        <Textarea
                          v-model:value="item.FlowNote"
                          :auto-size="{ minRows: 2, maxRows: 2 }"
                          :placeholder="'请填写审核意见'"
                          :style="{ margin: '10px', width: '95%', height: '50px' }"
                          :allow-clear="true"
                          type="textarea"
                        />
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </CheckboxGroup>
        </div>
        <template v-if="dataSource.length > 0">
          <div style="height: 100%; overflow-y: auto">
            <div style="display: flex; align-items: center" class="vant-Btn">
              <div v-for="(btn, index) in btns" :key="index">
                <Button v-if="btn == '发送'" type="primary" style="margin: 10px 5px" @click="PopModalShow(btn)">{{ btn }}</Button>
              </div>
              <!-- 下拉框选择节点 -->
              <DropdownMenu v-if="toNDS.length > 0" direction="up">
                <DropdownItem v-model="toNodeID" :options="toNDS" />
              </DropdownMenu>

              <div v-for="(btn, index) in btns" :key="index">
                <Button v-if="btn == '退回'" type="primary" style="margin: 10px 5px" @click="Btn_Return()">{{ btn }}</Button>
              </div>
              <div>
                <!-- 批量审核 -->
                <Button v-if="sta == 1 && BatchCheckNoteModel == '1'" style="margin: 10px 5px" @click="BatchAudit()">{{ '批量意见' }}</Button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <Empty style="margin-top: 150px" />
        </template>
        <!--居中弹窗-->
      </template>
      <!-- 发送选择人员弹窗 -->
      <Popup v-model:show="popModal.visible" position="right" :style="{ width: '100%', height: '100%' }">
        <NavBar :title="'批处理发送'" :fixed="true" left-arrow @click-left="handleEnsure" />
        <div style="margin-top: 45px; overflow: hidden">
          <PopTreeEns
            ref="treeEns"
            :listSql="popMapExt.Tag3 || undefined"
            :treeSql="popMapExt.Tag1 || undefined"
            :parentNo="popMapExt.Tag5 || undefined"
            :search-sql="popMapExt.Tag4 || ''"
            :is-have-upper-level="popMapExt.Tag6 === '0' ? false : true"
            :is-multi-select="true"
            :is-show-search="'1'"
            :selected-items="rowData.Worker"
            :selected-item-names="rowData.WorkerName"
          />
        </div>
        <Tabbar class="tool-bar" v-model="active">
          <TabbarItem class="btn-type" @click="handleEnsure">
            <div> <CarryOutOutlined style="margin-right: 5px" />{{ '确认' }}</div>
          </TabbarItem>
        </Tabbar>
      </Popup>
      <!-- 退回弹窗显示 -->
      <Popup v-model:show="popModalReturn.visible" position="right" :style="{ width: '100%', height: '100%', backgroundColor: '#fafafd' }">
        <NavBar :title="popModalReturn.modalTitle" :fixed="true" left-arrow @click-left="ModalRetrun" />
        <!-- 返回信息弹窗显示 -->
        <template v-if="popModalReturn.modalType == 'ReturnMsg'">
          <div style="margin-top: 45px">
            <div style="margin: 20% 20px; padding: 15px; background-color: #fff; word-break: break-all; word-wrap: break-word" v-html="popModalReturn.Msg"></div>
          </div>
        </template>
        <BaseModal
          v-else-if="popModalReturn.modalType == 'ReturnWork'"
          :modalType="popModalReturn.modalType"
          :params="urlParams"
          @handleCancel="handleCancel"
          style="margin-top: 46px"
        />
      </Popup>
      <!-- 审核意见 -->
      <Popup v-model:show="AuditModal.visible" :closeable="true" @close="AuditModalOK" :style="{ padding: '30px' }">
        <Textarea
          v-model:value="AuditModal.auditOpinion"
          :placeholder="'请填写批量审核意见'"
          :style="{ margin: '10px', width: '20vh', height: '20vh' }"
          :allow-clear="true"
          type="textarea"
        />
        <div style="display: flex; justify-content: space-evenly">
          <Button type="primary" size="small" @click="AuditModalOK">{{ '确认' }}</Button>
          <Button size="small" @click="AuditModalClose">{{ '取消' }}</Button>
        </div>
      </Popup>
      <!-- 确认弹窗填写审核意见 -->
      <Dialog v-model:show="showDialog" :title="'请输入审核意见'" :show-confirm-button="true" :show-cancel-button="true" @confirm="confirmInput">
        <Field v-model="checkNote" type="textarea" :placeholder="'请输入内容'" />
      </Dialog>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, shallowRef } from 'vue';
  import { Checkbox, CheckboxGroup, Popup, NavBar, Tabbar, TabbarItem, Dialog, Field, showConfirmDialog, showToast, DropdownMenu, DropdownItem, Popover } from 'vant';
  import { Spin, Button, message, Textarea, Empty } from 'ant-design-vue';
  import { CarryOutOutlined } from '@ant-design/icons-vue';
  import { GL_BatchWorkCheckModel } from '/@/WF/GenerList/GL_BatchWorkCheckModel';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import PopTreeEns from '/@/CCMobile/CCForm/Pop/PopTreeEns.vue';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import { AtPara } from '/@/bp/da/AtPara';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import BSEntity from '/@/utils/gener/BSEntity';
  import BaseModal from '/@/WF/WorkOpt/BaseModal.vue';
  import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { useRouter } from 'vue-router';
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  const router = useRouter();
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  //获取所有数据
  const glEn: any = ref();
  const linkField = ref();
  //按钮组
  const btns = ref();
  //下拉框数据
  const toNDS = ref<any>([]);
  const toNodeID: any = ref(null);
  const nodeExt = ref();

  const Check = ref([]);

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
  const active = ref('');

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
   // debugger;
    if (SelectBox.value.length == 0) {
      showToast({
        message: '请选择批处理的待办数据',
        position: 'top',
      });
      return;
    }
    if (toNDS.value.length != 0) {
      const getToNds = toNDS.value.filter((tonode) => tonode.value == toNodeID.value);
      if (getToNds[0].IsSelectEmps == '1') {
        //通用选择器
        popModal.visible = true;
        rowData.value = rowdata;
        return;
      }
    }
    //通过数组存储所有的flowNote,然后过滤判断是否存在为空的情况，为空则不打开弹窗
    flowNoteArr.value = [];
    for (let i = 0; i < SelectBox.value.length; i++) {
      let flowNote = SelectBox.value[i].FlowNote;
      if (BatchCheckNoteModel.value == '1') {
        flowNoteArr.value.push(flowNote);
        if (!flowNote) {
          showToast({
            message: '您有选中的流程未填写审核意见',
            position: 'top',
          });
        }
      }
    }
    if (!!flowNoteArr.value) {
      let IsFlowNote = flowNoteArr.value.some((item) => item === '');
      console.log('IsFlowNote', IsFlowNote);
      if (IsFlowNote) {
        DiaolgShowModal.value = !IsFlowNote;
        return;
      }
    }
    checkNote.value = '';
    const data = await execSend();
    if (DiaolgShowModal.value == true) {
      console.log(data);
      modalShow('ReturnMsg', '返回信息', data || getReturnData.value);
      await InitPage();
    }
  };
  // 弹窗ok事件
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const checkedList: any = ref([]);
  const checkedNames: any = ref([]);
  //pop树结束

  //退回弹窗部分
  /**
   *  退回按钮弹窗操作
   * @param type
   * @param title
   */
  //弹窗显示
  const popModalReturn = reactive({
    visible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    Msg: '',
  });
  const modalShow = (type: string, title: string, Msg = '') => {
    popModalReturn.visible = true;
    popModalReturn.modalType = type;
    popModalReturn.modalTitle = title;
    popModalReturn.Msg = Msg;
  };
  //关闭弹窗
  const handleCancel = () => {
    popModalReturn.visible = false;
    InitPage();
  };
  //退回弹窗部分结束

  const checkNote = ref(); //审核意见.
  const todoEmps = ref(''); //人员s.
  const handleEnsure = async () => {
    try {
      popModal.visible = false;
      console.log(SelectBox.value);
      checkedList.value = treeEns.value?.allCheckList || [];
      checkedNames.value = treeEns.value?.checkedNames || [];
      //选择人员(设置人员拼接)
      todoEmps.value = checkedList.value.filter((item) => item != '').join(',');
      const data = await execSend();
      if (DiaolgShowModal.value == true) {
        modalShow('ReturnMsg', '返回信息', data || getReturnData.value);
        await InitPage();
      }
    } catch (error: any) {
      message.error(error);
    }
  };

  //弹窗返回按钮
  const ModalRetrun = async () => {
    popModalReturn.visible = false;
    await InitPage();
  };

  // const respon(eMsg = ref(''); //响应的信息
  //审核组件状态 @0=禁用@1=启用@2=只读
  const sta = ref();

  // 确认弹窗是否填写审核意见
  const showDialog = ref(false);
  const confirmInput = async () => {
    getReturnData.value = '';
    const data = await execSend();
    if (DiaolgShowModal.value == true) {
      console.log(getReturnData.value);
      modalShow('ReturnMsg', '返回信息', data || getReturnData.value);
      await InitPage();
    }
  };
  const isConfirm = ref(false);

  const DiaolgShowModal = ref(true);

  //返回弹窗内容
  const getReturnData = ref();
  // 确认弹窗
  const sendInterface = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_Batch');
    flowNoteArr.value = [];
    for (let i = 0; i < SelectBox.value.length; i++) {
      let WorkID = SelectBox.value[i].WorkID;
      let flowNote = SelectBox.value[i].FlowNote;
      await handler.AddPara('CB_' + WorkID, 'on');
      if (sta.value == 1 && BatchCheckNoteModel.value == '1') await handler.AddPara('TB_' + WorkID + '_WorkCheck_Doc', flowNote);
    }
    const ToNode = toNDS.value.find((tonode) => tonode.value == toNodeID.value) || {};
    await handler.AddPara('FK_Node', props.params?.NodeID);
    await handler.AddPara('CheckNote', checkNote?.value);
    await handler.AddPara('ToNode', ToNode?.value);
    await handler.AddPara('ToEmps', todoEmps?.value);
    let data = await handler.DoMethodReturnString('WorkCheckModel_Send');
    data = data
      .replace(/@<a href='.*?>.*?<\/a>/g, '')
      .replace(/@/g, '<br>@')
      .replace(/%40/g, '@');
    getReturnData.value = data;
    return data;
  };
  //执行发送
  const execSend = async () => {
    try {
      DiaolgShowModal.value = true;
      if (sta.value == 1 && BatchCheckNoteModel.value == '0') {
        showDialog.value = true;
        if (checkNote.value == null || checkNote.value == '' || checkNote.value == undefined) {
          DiaolgShowModal.value = false;
          return;
        }
      }
      loading.value = true;
      isConfirm.value = false;
      popModalReturn.Msg = '';
    //  debugger;
      if (BatchCheckNoteModel.value == '1') {
        showConfirmDialog({
          title: '确认操作',
          message: '确定要执行吗？?',
        })
          .then(async () => {
            isConfirm.value = true;
            getReturnData.value = '';
            await sendInterface();
            popModalReturn.Msg = getReturnData.value;
          })
          .catch(() => {
            DiaolgShowModal.value = false;
            handleCancel();
            return;
          });
      } else {
        isConfirm.value = true;
      }
      if (isConfirm.value) {
        getReturnData.value = '';
        await sendInterface();
      }
    } catch (error: any) {
      message.error(error);
    } finally {
      loading.value = false;
    }
  };

  const urlParams = reactive({
    FK_Node: '',
    WorkID: 0,
    WorkIDs: '',
    isFrameCross: 0,
  });
  //退回操作
  const Btn_Return = async () => {
    for (let i = 0; i < SelectBox.value.length; i++) {}
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
      modalShow('ReturnWork', '退回');
    } else {
      const WorkID = workIds.substring(0, workIds.indexOf(','));
      urlParams.WorkIDs = workIds;
      urlParams.FK_Node = node.NodeID;
      urlParams.WorkID = parseInt(WorkID);
      modalShow('ReturnWork', '退回');
    }
  };

  const dataSource: any = ref([]);
  const columns = ref<any>([]);

  const isCheckAll = ref(false);
  const checkList = ref([]);
  const isIndeterminate = ref(true);

  const onCheckAllChange = (bool: any) => {
    console.log('bool', bool);
    let data = dataSource.value.map((item) => String(item.OID));
    if (!!bool) {
      for (const [idx, val] of dataSource.value.entries()) {
        console.log(idx, val);
        val.isChecked = bool;
        SelectBox.value.push(val);
        SelectRowKeys.value.push(idx);
      }
    } else {
      for (const [idx, val] of dataSource.value.entries()) {
        console.log(idx, val);
        val.isChecked = bool;
        SelectBox.value = [];
        SelectRowKeys.value = [];
      }
    }
    checkList.value = bool ? data : [];
    isIndeterminate.value = false;
  };

  //多选框数据
  const SelectBox = ref<any>([]);
  const SelectRowKeys = ref<any>([]);
  //选择checkbox
  const onSelectChange = (selectedRowKeys: number, selectedRows: any) => {
    selectedRows.isChecked = !selectedRows.isChecked;
    if (selectedRows.isChecked) {
      SelectBox.value.push(selectedRows);
      SelectRowKeys.value.push(selectedRowKeys);
    } else {
      SelectBox.value = SelectBox.value.filter((item) => item.OID !== selectedRows.OID);
      SelectRowKeys.value = SelectRowKeys.value.filter((item) => item !== selectedRowKeys);
    }
    const checkedCount = SelectBox.value.length;
    isCheckAll.value = checkedCount === dataSource.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < dataSource.value.length;
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    console.log(SelectBox.value);
    console.log(SelectRowKeys.value);
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
    };
  };

  const BatchAudit = () => {
    if (SelectBox.value.length > 0) {
      AuditModalShow('批量意见', window.innerWidth * 0.3, 300);
    } else {
      showToast({
        message: '请选择批处理的待办数据',
        position: 'top',
      });
    }
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
  const AuditModalClose = () => {
    AuditModal.visible = false;
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
    //执行完的操作
    if (result.data == undefined || result.data == '') return;
    // const oldFetureData = result.data.replace('/#/WF/', '/CCMobile/');
    result.data = result.data.replace('/#/WF/', '/CCMobile/');
    switch (result.ReturnType) {
      case GPNReturnType.Message:
        message.info(result.data);
        break;
      case GPNReturnType.Error:
        message.error(result.data);
        break;
      case GPNReturnType.GoToUrl: //转到url.
        window.location.replace(result.data);
        break;
      case GPNReturnType.Close: //关闭.
        break;
      case GPNReturnType.CloseAndReload: //关闭并重载
        break;
      case GPNReturnType.Reload: //刷新
        await InitPage();
        break;
      case GPNReturnType.OpenUrlByDrawer: //重新绑定
      case GPNReturnType.OpenUrlByDrawer75: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByDrawer90: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByDrawer30: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByTab:
        router.push(result.data);
        break;
      case GPNReturnType.OpenUrlByNewWindow: //重新绑定
        router.push(result.data);
        break;
      case GPNReturnType.DoNothing: //重新绑定
        break;
      default:
        message.warning('类型:' + result.ReturnType + '还未解析');
        break;
    }
  }

  //初始化数据
  const InitPage = async () => {
    try {
      loading.value = true;
      SelectRowKeys.value = [];
      SelectBox.value = [];

      checkList.value = [];
      //下拉框数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      await handler.AddUrlData();
      await handler.AddPara('FK_Node', props.params.NodeID);
      await handler.AddPara('PageName', 'Batch');
      const data: any = await handler.DoMethodReturnString('Batch_InitDDL');
      if (!!data) {
        toNDS.value = data.map((item) => {
          return {
            value: item.No,
            text: item.Name,
            IsSelectEmps: item.IsSelectEmps,
            IsSelected: item.IsSelected,
            DeliveryParas: item.DeliveryParas,
          };
        });
      }

      console.log(toNDS.value);

      //默认数据
      if (toNDS.value.length != 0) {
        toNodeID.value = toNDS.value[0]?.value;
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
      //设置复选框默认不选中
      dataSource.value.forEach((item) => {
        item.isChecked = false;
        item.FlowNote = '';
      });
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
      return {
        DataType: item.DataType,
        IsShow: item.IsShow,
        key: item.Key,
        name: item.Name,
        width: item.width,
        dataIndex: item.Key,
        title: item.Name,
      };
    });
  };
</script>
<style lang="less" scoped>
  .checkedAll {
    padding: 10px;
  }
  .checked {
    margin-right: 10px;
  }
  :deep(.ant-empty-image) {
    height: 200px;
  }
  :deep(.ant-empty-image svg) {
    width: 200px;
  }
  :deep(.ant-empty-description) {
    font-size: 18px;
  }
  :deep(.van-dropdown-menu__title) {
    margin: var(--van-dropdown-menu-title-padding);
  }
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
  :deep(.van-nav-bar--fixed) {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
</style>
