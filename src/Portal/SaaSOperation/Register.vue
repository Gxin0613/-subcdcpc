<template>
  <div class="bg-register">
    <div class="register-page">
      <div class="reginster_title"
        >{{ '管理员登录帐号信息'
        }}<a
          @click="
            () => {
              router.push('/OpLogin');
            }
          "
          >我有账号，我要登录</a
        >
      </div>
      <Form :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
        <Row>
          <Col :span="12">
            <FormItem :label="'手机号(账号登录)'" :label-col="{ span: 8 }">
              <!-- <div> -->
              <Input v-model:value="formState.phone" @blur="CheckUserNo(formState.phone)" :placeholder="'请输入手机号'" />
              <!-- </div> -->
            </FormItem>
          </Col>
          <Col :span="12">
            <div style="margin-top: 5px"
              >{{ '测试站点，请使用手机号/邮件实名注册。'
              }}<a
                @click="
                  () => {
                    router.push('/Standard');
                  }
                "
                >已有注册，我要登录</a
              >
            </div>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <FormItem :label="'密码'" :validateStatus="validateStatus" :label-col="{ span: 8 }">
              <Input type="password" v-model:value="formState.password" :placeholder="'请输入密码'" />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="'确认密码'" :validateStatus="validateStatus" :label-col="{ span: 5 }">
              <Input type="password" v-model:value="formState.OkPassword" :placeholder="'请确认密码'" @input="handleConfirmPasswordInput" />
            </FormItem>
          </Col>
        </Row>
        <FormItem :label="'姓名'" :label-col="{ span: 4 }" :wrapper-col="{ span: 7 }">
          <Input v-model:value="formState.name" :placeholder="'管理员姓名'" />
        </FormItem>
        <Row>
          <Col :span="12">
            <FormItem label="E-mail" :label-col="{ span: 8 }">
              <Input v-model:value="formState.Email" :placeholder="'请输入E-mail'" />
            </FormItem>
          </Col>
          <Col :span="12">
            <div style="margin-top: 5px">丢失密码可以通过e-mail找回.</div>
          </Col>
        </Row>
        <div style="font-size: 20px; font-weight: 700">{{ '注册信息' }}</div>
        <Row>
          <Col :span="12">
            <FormItem :label="'企业账号'" :label-col="{ span: 8 }">
              <Input v-model:value="formState.firmNum" :placeholder="'企业账号'" @blur="CheckOrgNo(formState.firmNum)" />
            </FormItem>
          </Col>
          <Col :span="12">
            <div style="margin-top: 5px">{{ '例如：ccflow' }}</div>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <FormItem :label="'企业简称'" :label-col="{ span: 8 }">
              <Input v-model:value="formState.firmForShort" :placeholder="'请输入企业简称'" />
            </FormItem>
          </Col>
          <Col :span="12">
            <div style="margin-top: 5px">{{ '例如：驰骋BPM' }}</div>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <FormItem :label="'企业全称'" :label-col="{ span: 8 }">
              <Input v-model:value="formState.firmFullName" :placeholder="'济南驰骋信息技术有限公司'" />
            </FormItem>
          </Col>
          <Col :span="12">
            <div style="margin-top: 5px">例如:济南驰骋信息技术有限公司</div>
          </Col>
        </Row>
        <FormItem :wrapper-col="{ span: 14, offset: 4 }">
          <Button type="primary" @click="onSubmit">{{ '提交注册组织' }}</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Form, FormItem, Input, message, Row, Col, Button } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { reactive, toRaw, UnwrapRef, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  interface FormState {
    phone: string;
    password: string;
    OkPassword: string;
    name: string;
    Email: string;
    firmNum: string;
    firmForShort: string;
    firmFullName: string;
  }
  //提示错误信息
  const validateStatus = ref<string>('');
  const router = useRouter();
  const userStore = useUserStoreWithOut();

  const formState: UnwrapRef<FormState> = reactive({
    phone: '',
    password: '',
    OkPassword: '',
    name: '',
    Email: '',
    firmNum: '',
    firmForShort: '',
    firmFullName: '',
  });
  const data = ref();
  //注册
  console.log(userStore);
  const onSubmit = async () => {
    console.log('submit!', toRaw(formState));
    const userNo = formState.phone;
    if (userNo.indexOf('_') != -1) {
      message.error('人员编号[' + userNo + ']，不能有 - 号.');
      return;
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.Portal_SaaSOption');
    handler.AddPara('TB_Adminer', formState.phone);
    handler.AddPara('TB_PassWord', formState.password);
    handler.AddPara('TB_PassWord2', formState.OkPassword);
    handler.AddPara('TB_AdminerName', formState.name);
    handler.AddPara('TB_Email', formState.Email);
    handler.AddPara('TB_OrgNo', formState.firmNum);
    handler.AddPara('TB_OrgName', formState.firmForShort);
    handler.AddPara('TB_OrgNameFull', formState.firmFullName);
    data.value = await handler.DoMethodReturnString('RegisterAdminer_Submit');
    userStore.token = data.value;
    if (data.value) alert(`恭喜您注册成功.	
将要转入登录主页，请在系统管理菜单设计流程模版。`);
    router.push({
      path: '/Standard',
      query: {
        userNo: formState.name,
        T: Math.random(),
        Token: userStore.token,
      },
    });
  };
  //密码校验
  const handleConfirmPasswordInput = () => {
    // 确认密码输入框内容变化时触发
    if (formState.OkPassword !== formState.password) {
      validateStatus.value = 'error';
    } else {
      validateStatus.value = '';
    }
  };
  //手机号账号
  const CheckUserNo = (ctrl) => {
    if (ctrl == '') return;
    if (!/^1[3456789]\d{9}$/.test(ctrl)) {
      message.warning('手机号码有误，请重填');
      return false;
    }
    return;
  };
  //企业账号验证
  const CheckOrgNo = (ctrl) => {
    if (ctrl == '') return;
    if (ctrl.length <= 3) {
      message.warning('组织编号[' + ctrl + ']长度不够');
      return false;
    }
  };
</script>
<style lang="less">
  .bg-register {
    padding: 3% 0;
    background-color: #eee;
    scrollbar-width: none;
    overflow: hidden;
    .register-page {
      margin: 0 auto;
      width: 900px;
      padding: 50px;
      background: #fff;
      border-radius: 5px;
      box-shadow: 0 0 5px 2px #d2d2d2;
      .reginster_title {
        font-size: 18px;
        margin-bottom: 20px;
        font-weight: 700;
      }

      .ant-input {
        width: 240px;
      }
      .ant-form-item-control-input-content {
        display: flex;
      }
    }
  }
</style>
