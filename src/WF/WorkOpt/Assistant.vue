<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" style="text-align: center">
        <Form layout="vertical" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <FormItem>
            <RadioGroup v-model:value="priVal" :disabled="priEable === 1">
              <Radio v-for="item in pris" :key="item.No" :value="item.No" :name="item.Name" :style="radioStyle">
                <template v-if="item.No === 0"> <Img src="/resource/WF/Img/PRI/0.png" style="display: inline" /> {{ item.Name }} </template>
                <template v-if="item.No === 1"> <Img src="/resource/WF/Img/PRI/1.png" style="display: inline" /> {{ item.Name }} </template>
                <template v-if="item.No === 2"> <Img src="/resource/WF/Img/PRI/2.png" style="display: inline" /> {{ item.Name }} </template>
              </Radio>
            </RadioGroup>
          </FormItem>
          <br />
          <FormItem>
            <Button type="primary" @click="Save">{{ '保存' }}</Button>
          </FormItem>
        </Form>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'PRI',
  };
</script>
<script lang="ts" setup>
  import { Spin, message, Form, FormItem, RadioGroup, Radio, Button } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const priVal = ref(0);
  const radioStyle = reactive({
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  });
  const InitPage = async () => {
    try {
      loading.value = true;

      //初始化提示词.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddJson(params);
      const data = await handler.DoMethodReturnString('Assistant_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const Save = async () => {
    //初始化提示词.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddJson(params);
    handler.AddPara('Words', 'xxxxxxxxxxxxxxxxxxxx');
    const data = await handler.DoMethodReturnString('Assistant_Save');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return;
    }
    return;
  };
</script>
<style scoped></style>
