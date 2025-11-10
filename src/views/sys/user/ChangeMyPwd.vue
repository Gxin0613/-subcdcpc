<template>
  <div class="change-pwd">
    <Form :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 15 }" autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed">
      <!-- <div class="doc">{{$tt('views.sys.user.changemypwd._key15')}}</div> -->
      <FormItem :label="$tt('views.sys.user.changemypwd._key6')" name="oldpwd" :rules="$tt('views.sys.user.changemypwd._key13')">
        <Input.Password :placeholder="$tt('views.sys.user.changemypwd._key7')" v-model:value="formState.oldpwd" />
      </FormItem>
      <FormItem :label="$tt('views.sys.user.changemypwd._key8')" name="new1pwd" :rules="$tt('views.sys.user.changemypwd._key14')">
        <Input.Password :placeholder="$tt('views.sys.user.changemypwd._key9')" v-model:value="formState.new1pwd" />
      </FormItem>
      <FormItem :label="$tt('views.sys.user.changemypwd._key10')" name="strengthmeter">
        <StrengthMeter :value="formState.new1pwd" />
      </FormItem>
      <FormItem :label="$tt('views.sys.user.changemypwd._key11')" name="new2pwd" :rules="confirmPasswordRules">
        <Input.Password :placeholder="$tt('views.sys.user.changemypwd._key12')" v-model:value="formState.new2pwd" />
      </FormItem>
      <FormItem :wrapper-col="{ offset: 9, span: 16 }">
        <Button type="primary" html-type="submit">{{ $tt('views.sys.user.changemypwd._key16') }}</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script setup lang="ts">
  import { translateText } from '/@/locales/setupI18n';
  import { Form, FormItem, Input, message, Button } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import WebUser from '/@/bp/web/WebUser';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { getAppEnvConfig } from '/@/utils/env';
  import { AesEncryption } from '/@/utils/cipher';
  import StrengthMeter from '/@/components/StrengthMeter/src/StrengthMeter.vue';
  import { Rule } from 'ant-design-vue/es/form';
  import { Emp } from '/@/bp/port/Emp';
  import calendarUtil from '/@/utils/date/calendarUtil';

  interface FormState {
    oldpwd: string;
    new1pwd: string;
    new2pwd: string;
  }

  const { VITE_GLOB_ENCRYPTION_KEY, VITE_GLOB_PassWordComposeType } = getAppEnvConfig();

  const formState = reactive<FormState>({
    oldpwd: '',
    new1pwd: '',
    new2pwd: '',
  });
  const rules = ref([
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: translateText('views.sys.user.changemypwd._key1'),
    },
  ]);

  const enableRules = VITE_GLOB_PassWordComposeType == 1 ? rules : [];

  // 确认密码验证规则
  const confirmPasswordRules: Rule[] = [
    { required: true, message: translateText('views.sys.user.changemypwd._key2') },
    {
      validator: (_rule, value) => {
        if (!value || formState.new1pwd === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(translateText('views.sys.user.changemypwd._key3')));
      },
    },
  ];
  // const loading = ref<boolean>(false);
  //弹窗显示
  const changePwdModal = reactive({
    modalVisible: WebUser.IsFirstLogin == '1' ? true : false,
    closable: false,
    modalType: '',
    modalTitle: translateText('views.sys.user.changemypwd._key4'),
    modalWidth: window.innerWidth * 0.4,
    modalHeight: { height: '350px', width: '600px' },
    content: '',
  });
  const onFinish = async (values: any) => {
    console.log('Success:', values);
    let pkVal = WebUser.No;
    if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
      pkVal = WebUser.OrgNo + '_' + WebUser.No;
    }
    const en = new BSEntity('BP.Port.Emp', pkVal);
    await en.Retrieve();
    //密码敏感信息加密
    if (values.oldpwd == values.new1pwd) {
      message.info('新密码不能与旧密码相同，请重新设置');
      return;
    }
    const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
    const p1 = encryption.encryptByAES(values.oldpwd);
    const p2 = encryption.encryptByAES(values.new1pwd);
    const p3 = encryption.encryptByAES(values.new2pwd);
    // debugger;
    try {
      let str = await en.DoMethodReturnString('ChangePass', p1, p2, p3);
      console.trace(str);
      message.success(translateText('views.sys.user.changemypwd._key5'));
      WebUser.setIsFirstLogin = '0';
      WebUser.setIsPassWordChange = '0';
      changePwdModal.modalVisible = false;
      const emp = new Emp();
      emp.setPKVal(WebUser.No);
      await emp.RetrieveFromDBSources();
      emp.SetPara('pwdChangeDate', calendarUtil.getCurrentDate());
      await emp.Update();
    } catch (e: any) {
      message.error(e);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
</script>

<style scoped lang="less">
  .change-pwd {
    width: 100%;
    height: 400px;
    padding-top: 50px;
    background-color: white;
    // display: flex;
    // align-items: center;
    // justify-content: center;
  }
  .doc {
    padding: 15px 0 15px 30px;
    font-size: 13px;
    color: #686868;
  }
</style>
