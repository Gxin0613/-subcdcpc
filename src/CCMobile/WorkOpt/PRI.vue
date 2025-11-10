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
  import BSEntity from '/@/utils/gener/BSEntity';
  import { BtnLab } from '/@/WF/Admin/AttrNode/BtnLab';
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
  const gwf = ref();
  const priEable = ref(0);
  const pris = [
    {
      No: 2,
      Name: '高',
    },
    {
      No: 1,
      Name: '中',
    },
    {
      No: 0,
      Name: '低',
    },
  ];
  const priVal = ref(0);
  const radioStyle = reactive({
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  });
  const InitPage = async () => {
    try {
      loading.value = true;
      gwf.value = new BSEntity('BP.WF.GenerWorkFlow');
      gwf.value.setPK(props.params.WorkID as string);
      await gwf.value.RetrieveFromDBSources();
      priVal.value = gwf.value.data.PRI;
      const btnLab = new BtnLab(props.params.FK_Node);
      await btnLab.RetrieveFromDBSources();
      priEable.value = btnLab.PRIEnable;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const emit = defineEmits(['handleCancel']);
  const Save = async () => {
    gwf.value.PRI = priVal.value;
    await gwf.value.Update();
    message.success('保存成功');
    emit('handleCancel', true);
  };
</script>
<style scoped></style>
