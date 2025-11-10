<template>
  <div>
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" width="800px" style="background-color: #f0f2f5">
        <ThemeWrapper>
          <div :span="8" class="colContent bg-cont">
            <Button type="primary" @click="Skip">跳转调整</Button>

            <Button type="primary" @click="Skip">删除</Button><Button type="primary" @click="Skip">移交</Button><Button type="primary" @click="Skip">强制结束</Button
            ><Button type="primary" @click="openTrack">轨迹</Button>

            <i class="icon-plane" style="margin-left: auto; font-weight: 700">流程测试容器\实例运维</i>
          </div>
        </ThemeWrapper>
        <div style="margin: 20px auto 0; background-color: white; border-radius: 10px; width: 80%">
          <div class="title">
            <span>流程信息</span>
            <img src="/resource/CompanyImgLogo/Tester.png" width="125px" height="45px" alt="" />
          </div>
          <div style="padding: 6px; border-radius: 2px">
            <Row>
              <Col :span="4" class="colTitle">标题</Col>
              <Col :span="20" class="colContent">{{ gwf.Title }}</Col>
            </Row>
            <Row>
              <Col :span="4" class="colTitle">工作ID</Col>
              <Col :span="4" class="colContent">{{ gwf.WorkID }}</Col>
              <Col :span="4" class="colTitle">状态</Col>
              <Col :span="4" class="colContent">
                <div v-if="gwf.WFState == 0" style="">空白</div>
                <div v-else-if="gwf.WFState == 1" style="color: orange">草稿</div>
                <div v-else-if="gwf.WFState == 2" style="color: green">进行中</div>
                <div v-else-if="gwf.WFState == 3" style="color: #1890ff">已完成</div>
                <div v-else-if="gwf.WFState == 4" style="color: goldenrod">挂起</div>
                <div v-else-if="gwf.WFState == 5" style="color: red">退回</div>
                <div v-else-if="gwf.WFState == 6" style="color: red">移交</div>
                <div v-else-if="gwf.WFState == 8" style="color: red">加签</div>
                <div v-else style="color: red">其他</div>
              </Col>
              <Col :span="4" class="colTitle">发起人</Col>
              <Col :span="4" class="colContent"> {{ gwf.Starter }},{{ gwf.StarterName }}</Col>
            </Row>
            <Row>
              <Col :span="4" class="colTitle">停留节点ID</Col>
              <Col :span="4" class="colContent">{{ gwf.FK_Node }},{{ gwf.NodeName }}</Col>
              <Col :span="4" class="colTitle">当前待办人员</Col>
              <Col :span="4" class="colContent">
                <Tooltip :title="gwf.TodoEmps" :open-delay="300" placement="top">
                  <div class="ellipsis-text" style="width: '200px'">{{ gwf.TodoEmps }} </div>
                </Tooltip>
              </Col>
              <Col :span="4" class="colTitle">流程名称</Col>
              <Col :span="4" class="colContent">{{ gwf.FlowName }}</Col>
              <!-- <Col :span="8" class="colContent"><Button type="link" @click="Skip">实例运维：跳转-调整-删除-移交-强制结束</Button></Col> -->
            </Row>
          </div>
          <div class="title">工作人员列表</div>
          <BasicTable @register="registerTable" bordered :pagination="false">
            <template #headerCell="{ column }">
              <template v-if="column.key === 'EmpName'"> <i class="icon-user"></i> {{ column.title }} </template>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'EmpName'">
                <template v-if="(record.IsPass == 0 && record.FK_Node == gwf.FK_Node) || (record.IsPass == 0 && record.FID != 0)">
                  <Button type="link" @click="ChangeUser(record, 'pc')" style="display: flex; padding: 4px 0; text-align: left">
                    <img :src="getAvtervter(record['FK_Emp'])" alt="" @error="defaultIcon" class="imgSize" /> {{ record['EmpName'] }}</Button
                  >
                </template>
                <template v-else>
                  <div style="display: flex; padding: 4px 0; text-align: left"
                    ><img :src="getAvtervter(record['FK_Emp'])" alt="" @error="defaultIcon" class="imgSize" />{{ record['EmpName'] }}</div
                  ></template
                >
              </template>
            </template>
            <template #action="{ record }">
              <template v-if="(record.IsPass == 0 && record.FK_Node == gwf.FK_Node) || (record.IsPass == 0 && record.FID != 0)">
                <Space wrap>
                  <Tooltip>
                    <template #title>PC端测试</template>
                    <Button @click="ChangeUser(record, 'pc')" :icon="h(DesktopOutlined)" />
                  </Tooltip>
                  <Tooltip>
                    <template #title>移动端测试</template>
                    <Button @click="ChangeUser(record, 'mobile')" :icon="h(MobileOutlined)" />
                  </Tooltip>
                </Space>
              </template>
            </template>
          </BasicTable>
          <template v-if="tableSubParentFlowData.length > 0">
            <div class="title">父子流程 - 实例</div>
            <Table :columns="subFlowColumns" :data-source="tableSubParentFlowData" bordered :pagination="false">
              <template #headerCell="{ column }">
                <template v-if="column.key === 'EmpName'"> <i class="icon-user"></i> {{ column.title }} </template>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'Title'">
                  <Button type="link" @click="ChangeFlowInstance(record)">{{ record.Title }}</Button>
                </template>
                <template v-if="column.key === 'EmpName'">
                  <template v-if="(record.IsPass == 0 && record.FK_Node == gwf.FK_Node) || (record.IsPass == 0 && record.FID != 0)">
                    <Button type="link" @click="ChangeUser(record, 'pc')" style="display: flex; padding: 4px 0; text-align: left">
                      <img :src="getAvtervter(record['FK_Emp'])" alt="" @error="defaultIcon" class="imgSize" /> {{ record['EmpName'] }}</Button
                    >
                  </template>
                </template>
              </template>
            </Table>
          </template>
        </div>
        <!--右侧滑出-->
        <Drawer
          :visible="drawer.visible"
          :title="drawer.title"
          :width="drawer.width"
          @close="drawerClose"
          :body-style="{
            padding: '0 12px',
          }"
        >
          <BaseModal :modalType="drawer.type" :params="route.query" :key="new Date().getTime()" />
        </Drawer>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { Button, Col, message, Row, Space, Spin, Tag, Tooltip, Drawer, Table } from 'ant-design-vue';
  import { DesktopOutlined, MobileOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { h, reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRoute } from 'vue-router';
  import { getAuthCache, setAuthCache } from '/@/utils/auth';
  import { ADMIN_TOKEN_KEY, TOKEN_KEY } from '/@/enums/cacheEnum';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { BasicTable, useTable } from '/@/components/Table';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import { ccbpm } from '/#/ccbpm';
  import ThemeWrapper from '../../Comm/ThemeWrapper.vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import WebUser from '/@/bp/web/WebUser';
  import { Emp } from '/@/bp/port/Emp';
  import BaseModal from '/@/WF/WorkOpt/BaseModal.vue';
  import { GloComm } from '../../Comm/GloComm';

  const props = defineProps({
    WorkID: {
      //请求参数集合
      type: Number,
      default: 0,
    },
    FlowNo: {
      type: String,
      default: '',
    },
  });
  const route = useRoute();
  const userStore = useUserStoreWithOut();
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const emit = defineEmits(['changeUserInfo', 'changeFrameSrc']);

  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  //获取代理路径
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  //用户头像图片存放地址
  const avatarPath: string = basePath + 'DataUser/UserIcon/';

  //抽屉：打开轨迹
  const drawer = reactive<Recordable>({
    visible: false,
    type: '',
    title: '',
    width: window.innerWidth * 0.5,
  });
  //
  const gwf = ref<Record<string, any>>({});
  const tableData = ref<Record<string, any>[]>([]);
  const tableSubParentFlowData = ref<Record<string, any>[]>([]);
  const subFlowColumns = ref<Record<string, any>[]>([]);
  const ChangeFlowInstance = (record) => {
    emit('changeUserInfo', getAuthCache(ADMIN_TOKEN_KEY));
    emit('changeFrameSrc', 'FlowInstance', record.WorkID, record.FID);
  };
  const InitPage = async () => {
    try {
      loading.value = true;
      //让管理员登录
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
      handler.AddPara('Token', getAuthCache(ADMIN_TOKEN_KEY));
      const data = await handler.DoMethodReturnString('Default_LetAdminerLogin');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      //获取当前用户的信息
      setAuthCache(TOKEN_KEY, getAuthCache(ADMIN_TOKEN_KEY));
      if (props.WorkID == 0) {
        const str: ccbpm.PostMessageInfo = {
          Token: getAuthCache(ADMIN_TOKEN_KEY),
          type: MessageTypeEnum.ChangeUserInfo,
        };
        window.parent.postMessage(str);
      } else emit('changeUserInfo', getAuthCache(TOKEN_KEY));
      //获取当前流程实例
      await ShowInstance();

      //子流程列
      InitSubFlowColumns();
      //获取子流程
      await ShowSubParentFlows();
      //显示
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();

  /**
   * 流程实例
   * @constructor
   */
  const ShowInstance = async () => {
    const pkval = props.WorkID || route.query.WorkID;
    //流程实例信息
    const en = new BSEntity('BP.WF.GenerWorkFlow', pkval as string);
    await en.RetrieveFromDBSources();
    gwf.value = en.getData();
    if (pkval === 0) {
      tableData.value = [];
      setTableData(tableData.value);
      return;
    }
    //流程运行信息
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
    handler.AddPara('WorkID', pkval);
    const data = await handler.DoMethodReturnJson('SelectOneUser_Init');
    tableData.value =
      data.map((item) => {
        return {
          ...item,
          EmpName: item.FK_Emp + ',' + item.EmpName,
          NodeName: item.FK_Node + ',' + item.NodeName,
        };
      }) || [];
    // tableData.value = data || [];
    console.log('tableData.value', tableData.value);
    setTableData(tableData.value);
  };

  const tableProps = {
    title: '',
    columns: [
      {
        title: '人员',
        dataIndex: 'EmpName',
        key: 'EmpName',
        width: 175,
      },
      // {
      //   title: '节点编号',
      //   dataIndex: 'FK_Node',
      //   key: 'FK_Node',
      //   width: 80,
      // },
      {
        title: '节点',
        dataIndex: 'NodeName',
        key: 'NodeName',
        width: 150,
      },
      {
        title: '下达时间',
        dataIndex: 'RDT',
        key: 'RDT',
      },
      {
        title: '处理时间',
        dataIndex: 'CDT',
        key: 'CDT',
        customRender: ({ text, record }) => {
          if (record.IsPass == 0) return '-';
          else return text;
        },
      },

      {
        title: '读取',
        dataIndex: 'IsRead',
        key: 'IsRead',
        width: 80,
        customRender: ({ text }) => {
          if (text == 0) return '未读';
          else return '已读';
        },
      },
      // {
      //   title: 'IsPass',
      //   dataIndex: 'IsPass',
      //   key: 'IsPass',
      //   width: 80,
      // },
      {
        title: '状态',
        dataIndex: 'State',
        key: 'State',
        width: 120,
        customRender: ({ record }) => {
          if (record.IsPass == 0 && record.FK_Node == gwf.value.FK_Node) return h(Tag, { color: 'green' }, () => '待办');
          else if (record.IsPass == 0 && record.FID != 0) return h(Tag, { color: 'green' }, () => '待办');
          else if (record.IsPass == -2) return h(Tag, { color: 'orange' }, () => '分流');
          else if (record.IsPass == 3) return h(Tag, { color: 'red' }, () => '未到达');
          else return h(Tag, { color: '' }, () => '已处理');
        },
      },
    ],
    dataSource: tableData.value,
    showIndexColumn: true,
    showTableSetting: false,
    tableSetting: { fullScreen: false },
    scroll: { y: window.innerHeight - 200 },
    canResize: true,
    actionColumn: {
      title: '切换用户',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  };
  const [registerTable, { setTableData, setProps }] = useTable(tableProps);
  const ShowSubParentFlows = async () => {
    const pkval = props.WorkID || route.query.WorkID;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
    handler.AddPara('WorkID', pkval);
    const data = await handler.DoMethodReturnJson('SelectSubOrParentFlow_Init');
    tableSubParentFlowData.value =
      data.map((item) => {
        return {
          ...item,
          NodeName: item.FK_Node + ',' + item.NodeName,
          StarterName: item.Starter + ',' + item.StarterName,
          WorkType: parseInt(pkval) == item.PWorkID ? '子流程' : '父流程',
        };
      }) || [];
    if (tableSubParentFlowData.value.length > 0) {
      tableProps.scroll = { y: 240 };
      setProps(tableProps);
    }
  };

  const InitSubFlowColumns = () => {
    subFlowColumns.value = [
      {
        title: '序号',
        dataIndex: 'SortIdx',
        key: 'SortIdx',
        width: 70,
        align: 'center',
        customRender: ({ index }) => {
          return `${index + 1}`;
        },
      },
      {
        title: '标题',
        dataIndex: 'Title',
        key: 'Title',
        width: 150,
      },
      {
        title: '类型',
        dataIndex: 'WorkType',
        key: 'WorkType',
        width: 70,
      },
      {
        title: '发起人',
        dataIndex: 'StarterName',
        key: 'StarterName',
        width: 150,
      },
      {
        title: '停留节点',
        dataIndex: 'NodeName',
        key: 'NodeName',
        width: 150,
      },

      {
        title: '单号',
        dataIndex: 'BillNo',
        key: 'BillNo',
        width: 100,
      },
      {
        title: '发起时间',
        dataIndex: 'RDT',
        key: 'RDT',
        width: 145,
      },
      {
        title: '状态',
        dataIndex: 'WFState',
        key: 'WFState',
        width: 80,
        customRender: ({ record }) => {
          if (record.WFState == 0) return h(Tag, { color: 'red' }, () => '空白');
          if (record.WFState == 1) return h(Tag, { color: 'red' }, () => '草稿');
          if (record.WFState == 2) return h(Tag, { color: 'green' }, () => '运行中');
          if (record.WFState == 5) return h(Tag, { color: 'yellow' }, () => '退回中');
          if (record.WFState == 3) return h(Tag, { color: 'green' }, () => '已完成');
        },
      },
    ];

    // dataSource: tableSubParentFlowData.value,
    // showIndexColumn: true,
    // showTableSetting: false,
    // tableSetting: { fullScreen: false },
    // scroll: { y: window.innerHeight - 100 },
    // actionColumn: {
    //   title: '切换用户',
    //   dataIndex: 'action',
    //   slots: { customRender: 'action' },
    // },
  };

  const Skip = () => {
    emit('changeFrameSrc', 'En');
  };
  /**
   * 切换用户，处理待办
   * @param record
   * @constructor
   */
  const ChangeUser = async (record, type) => {
    try {
      const key = 'sendKey';
      message.info({
        content: '正在打开请稍后...',
        key,
        duration: 0, // 设置为0表示不自动关闭
      });
      //切换用户
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');

      handler.AddPara('FK_Emp', record.FK_Emp);
      handler.AddPara('AdminerToken', getAuthCache(ADMIN_TOKEN_KEY));
      // 判断CCBPM运行模式
      if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) {
        let userNo = record.FK_Emp;
        if (WebUser.CCBPMRunModel === CCBPMRunModel.SAAS && userNo.startsWith(WebUser.OrgNo) == false) {
          userNo = WebUser.OrgNo + '_' + userNo;
        }
        const emp = new Emp(userNo);
        if ((await emp.RetrieveFromDBSources()) == 0) {
          message.error('人员[' + record.EmpName + ']不存在');
          return;
        }
        handler.AddPara('OrgNo', emp.OrgNo);
      }

      const data = await handler.DoMethodReturnString('SelectOneUser_ChangUser');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      // alert(data);
      //获取当前用户的信息
      setAuthCache(TOKEN_KEY, data);
      message.destroy(key);
      if (props.WorkID == 0) {
        const str: ccbpm.PostMessageInfo = {
          Token: data,
          type: MessageTypeEnum.ChangeUserInfo,
        };
        window.parent.postMessage(str);
        const result: ccbpm.PostMessageInfo = {
          type: MessageTypeEnum.ChangeFrameSrc,
          currPage: 'MyTestFlow',
          WorkID: record.WorkID,
        };
        window.parent.postMessage(result);
      } else {
        emit('changeUserInfo', data);
        //跳转页面
        if (type === 'pc') emit('changeFrameSrc', 'MyFlow', record.WorkID, record.FID);
        if (type === 'mobile') emit('changeFrameSrc', 'CCMobileMyFlow', record.WorkID, record.FID);
      }
    } catch (e) {
      message.error(e as string);
    }

    // window.location.replace('/#/WF/Designer/MyTestFlow?FlowNo=' + record.FK_Flow + '&WorkID=' + record.WorkID);
  };
  /*
   *获取人员头像
   */
  const getAvtervter = (Emp) => {
    return avatarPath + Emp + '.png?t=' + Math.random();
  };
  /*
   *人员默认头像
   */
  const defaultIcon = (event) => {
    const img = event.srcElement; // 刚开始是以参数的形式定义的，但是默认的图片一直不能使用，遂改为此方式
    img.src = DefaultUserIcon + '?t=' + Math.random(); // 默认一张图片。若是public中的图片，直接 ./ 就可以
    img.onerror = null; // 若默认的图片地址亦无法正常使用，添加此可控制不一直跳动
  };
  /**
   * 打开抽屉：轨迹
   */
  const openTrack = () => {
    drawer.visible = true;
    drawer.type = 'OneWork';
    drawer.title = '轨迹';
    drawer.width = window.innerWidth * 0.8;
  };
  /**
   * 关闭抽屉
   */
  const drawerClose = () => {
    drawer.visible = false;
  };
</script>
<style lang="less" scoped>
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 8px 12px;
    box-sizing: border-box;
    font-weight: 600;
    font-size: 16px;
    min-height: 45px;
    line-height: 45px;
    color: green;
  }
  .colTitle {
    background: #fafafa;
    border: 1px solid #f0f0f0;
    padding: 10px 8px;
  }
  .colField {
    background: #fafafa;
    border: 1px solid #f0f0f0;
    padding: 10px 8px;
    width: 150px;
  }
  .bg-cont {
    background-color: #ffffff;
  }
  .colContent {
    display: flex;
    align-items: center;
    border: 1px solid #f0f0f0;
    padding: 10px 8px;
    .ant-btn {
      margin: 0 5px;
      border-radius: 3px;
    }
  }
  .imgSize {
    width: 25px;
    border-radius: 50%;
    margin-right: 5px;
  }
  .ellipsis-text {
    white-space: nowrap; /* 强制不换行 */
    overflow: hidden; /* 隐藏超出部分 */
    text-overflow: ellipsis; /* 超出部分显示省略号 */
    /* 可选：添加 padding 避免文本贴边 */
    padding: 0 4px;
  }
</style>
