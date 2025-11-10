<template>
  <div>
    <Modal
      centered
      v-model:open="changePwdModal.modalVisible"
      :closable="changePwdModal.closable"
      :maskClosable="false"
      :title="changePwdModal.modalTitle"
      :body-style="changePwdModal.modalHeight"
      footer=""
    >
      <Form :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 15 }" autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed">
        <div class="doc">帮助：{{ tips }}</div>
        <FormItem :label="'原密码'" name="oldpwd" :rules="[{ required: true, message: '请输入原密码!' }]">
          <Input.Password :placeholder="'请输入原密码'" v-model:value="formState.oldpwd" />
        </FormItem>

        <FormItem :label="'新密码'" name="new1pwd" :rules="[{ required: true, message: '请输入新密码!' }]">
          <Input.Password :placeholder="'请输入新密码'" v-model:value="formState.new1pwd" />
        </FormItem>
        <FormItem :label="'密码强度'" name="strengthmeter">
          <StrengthMeter :value="formState.new1pwd" />
        </FormItem>
        <FormItem :label="'确认密码'" name="new2pwd" :rules="[{ required: true, message: '请再次输入新密码!' }]">
          <Input.Password :placeholder="'请再次输入新密码'" v-model:value="formState.new2pwd" />
        </FormItem>
        <FormItem :wrapper-col="{ offset: 9, span: 16 }">
          <Button type="primary" html-type="submit">{{ '修改' }}</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script setup lang="ts">
  import { Modal, Form, FormItem, Input, message, Button } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import WebUser from '/@/bp/web/WebUser';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { getAppEnvConfig } from '/@/utils/env';
  import { AesEncryption } from '/@/utils/cipher';
  import StrengthMeter from '/@/components/StrengthMeter/src/StrengthMeter.vue';
  import { Emp } from '/@/bp/port/Emp';
  import calendarUtil from '/@/utils/date/calendarUtil';

  interface FormState {
    oldpwd: string;
    new1pwd: string;
    new2pwd: string;
  }
  const tips = ref('');
  if (WebUser.IsFirstLogin == '1') {
    tips.value = '用户首次登录需要修改密码';
  } else if (WebUser.IsPassWordChange == '1') {
    tips.value = '因密码长时间未修改请修改密码';
  }
  const formState = reactive<FormState>({
    oldpwd: '',
    new1pwd: '',
    new2pwd: '',
  });
  // const loading = ref<boolean>(false);
  //弹窗显示
  const changePwdModal = reactive({
    modalVisible: WebUser.IsFirstLogin == '1' || WebUser.IsPassWordChange == '1' ? true : false,
    closable: false,
    modalType: '',
    modalTitle: '修改密码',
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
    const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
    const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
    const p1 = encryption.encryptByAES(values.oldpwd);
    const p2 = encryption.encryptByAES(values.new1pwd);
    const p3 = encryption.encryptByAES(values.new2pwd);
  //  debugger;
    try {
      let str = await en.DoMethodReturnString('ChangePass', p1, p2, p3);
      console.trace(str);
      message.success('修改成功');
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
<style lang="less" scoped>
  .doc {
    padding: 0 0 15px 30px;
    font-size: 13px;
    color: #686868;
  }
</style>
