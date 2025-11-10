<template>
  <div class="slider-cont">
    <Row class="title title_flow">
      <Col :span="24">
        <img src="" />
        <Button type="link" @click="BackFlowDesigner" class="btn-font">
          <DoubleLeftOutlined /><b>{{ '流程设计器' }}</b>
        </Button>
      </Col>
    </Row>
    <!--用户信息-->
    <div style="padding: 5px">
      <Row class="infoImg">
        <Col :span="18"> <img :src="userIcon" :onerror="defaultIcon" width="165" /> </Col>
      </Row>
      <Row class="info">
        <Col :span="12">{{ '测试账号' }}</Col>
        <Col :span="12">{{ props.UserNo }}</Col>
      </Row>
      <Row class="info">
        <Col :span="12">{{ '测试用户名' }}</Col>
        <Col :span="12">{{ props.UserName }}</Col>
      </Row>
      <Row class="info">
        <Col :span="12">{{ '所在部门' }}</Col>
        <Col :span="12">{{ props.DeptName }}</Col>
      </Row>
      <Row class="info">
        <Col :span="12">{{ '测试WorkID' }}</Col>
        <Col :span="12">{{ props.WorkID }}</Col>
      </Row>
    </div>
    <!--操作-->
    <Row class="title"
      ><Col :span="24" style="text-align: center; margin: 3px 0">{{ '操作' }}</Col></Row
    >
    <div>
      <ul>
        <li style="padding: 10px">
          <Button type="link" @click="ChangeUser"><i class="icon-people"></i>{{ '处理人列表' }}</Button></li
        >
        <li style="padding: 10px">
          <Button type="link" @click="ChangeFlowTester"><i class="icon-user"></i>{{ '切换发起人' }}</Button></li
        >
        <!-- <li  >
          <Button type="link" @click="ShowDBInfo"><i class="icon-eye"></i>{{'数据库信息'}}</Button></li
        > -->
        <li style="padding: 10px">
          <Button type="link" @click="StartFlow"><i class="icon-reload"></i>{{ '重新启动' }}</Button></li
        >
        <li style="padding: 10px">
          <Button type="link" @click="ChangeFlowInstance"><i class="icon-refresh"></i>{{ '切换测试实例' }}</Button></li
        >
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Row, Col, Button, message } from 'ant-design-vue';
  import { DoubleLeftOutlined } from '@ant-design/icons-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRoute } from 'vue-router';
  import { getAuthCache, setAuthCache } from '/@/utils/auth';
  import { ADMIN_TOKEN_KEY, TESTER_KEY, TOKEN_KEY } from '/@/enums/cacheEnum';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
  import { GloComm } from '../../Comm/GloComm';
  const props = defineProps({
    UserNo: {
      //请求参数集合
      type: String,
      default: '',
    },
    UserName: {
      //请求参数集合
      type: String,
      default: '',
    },
    DeptName: {
      //请求参数集合
      type: String,
      default: '',
    },
    WorkID: {
      //请求参数集合
      type: Number,
      default: 0,
    },
  });
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  //获取代理路径
  const basicPath = VITE_GLOB_API_URL;
  //用户头像图片
  const userIcon = basicPath + '/DataUser/UserIcon/' + props.UserNo + '.png';
  //没有用户头像图片时获取默认图片
  const defaultIcon = (e) => {
    let img = e.srcElement;
    img.src = DefaultUserIcon;
    img.onerror = null;
  };

  // const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
  const emit = defineEmits(['changeFrameSrc', 'changeUserInfo']);
  const route = useRoute();
  //const userInfo = ref(props.WebUser);

  //返回流程设计器
  const BackFlowDesigner = async () => {
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
    emit('changeUserInfo', getAuthCache(TOKEN_KEY));
    // userStore.setTestToken('');

    const flowNo = route.query.FlowNo;
    const url = GloComm.UrlFlowD(flowNo);
    window.location.replace(url);

    // window.location.replace(location.pathname + '#/WF/Designer/EditFlow?FlowNo=' + route.query.FlowNo + '&FK_Flow=' + route.query.FlowNo + '&EnName=NewFlow');
  };

  //切换用户
  const ChangeUser = () => {
    emit('changeFrameSrc', 'FlowInstance');
    //console.log('切换用户', props.UserNo);
  };
  const userStore = useUserStoreWithOut();
  const ChangeFlowTester = async () => {
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
    //获取当前测试用户的信息
    userStore.setToken(getAuthCache(TOKEN_KEY));
    // if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
    //   userStore.setTestToken(getAuthCache(TOKEN_KEY));
    // }
    await userStore.getUserInfoAction();
    emit('changeUserInfo', getAuthCache(TOKEN_KEY));
    emit('changeFrameSrc', 'FlowTester');
  };
  //重新启动
  const StartFlow = async () => {
    //初始发起的流程账号
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
    handler.AddPara('FK_Emp', getAuthCache(TESTER_KEY));
    handler.AddPara('AdminerToken', getAuthCache(ADMIN_TOKEN_KEY));
    const data = await handler.DoMethodReturnString('SelectOneUser_ChangUser');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return;
    }
    //获取当前用户的信息
    setAuthCache(TOKEN_KEY, data);
    //获取当前测试用户的信息
    userStore.token = getAuthCache(TOKEN_KEY);
    await userStore.getUserInfoAction();
    emit('changeUserInfo', data);

    emit('changeFrameSrc', 'MyFlow');
    //console.log('重新启动：', props.UserNo);
  };
  /**
   * 切换测试实例
   * @constructor
   */
  const ChangeFlowInstance = () => {
    emit('changeUserInfo', getAuthCache(ADMIN_TOKEN_KEY));
    emit('changeFrameSrc', 'SelectGWF');
  };
</script>

<style lang="less" scoped>
  .slider-cont {
    position: fixed;
    min-width: 230px;
    width: 230px;
  }
  .title {
    padding: 8px 22px;
    box-sizing: border-box;
    background-color: #f2f5f7;
    font-weight: 600;
    font-size: 13px;
  }
  .title_flow {
    text-align: center;
    background: #1890ff;
  }
  .btn-font {
    color: #fff;
    font-size: 16px;
    margin-right: 15px;
  }
  .info {
    padding: 8px 22px;
    box-sizing: border-box;
    background-color: #ffffff;
    font-weight: 100;
    font-size: 13px;
  }
  .infoImg {
    justify-content: center;
  }
  .infoImg img {
    padding: 8px 22px;
    margin: 0 auto;
  }
</style>
