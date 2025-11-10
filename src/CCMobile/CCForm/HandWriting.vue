<template>
  <Row style="padding: 1px; border-bottom: 1px solid #ccc">
    <Col :span="4" class="colInput">
      <Button type="text" @click="handleGenerate"><SaveOutlined />{{'确定'}}</Button>
    </Col>
    <Col :span="4" class="colInput">
      <Button type="text" @click="handleReset"><i class="icon-action-undo"></i>{{'重置'}}</Button>
    </Col>
    <Col :span="3" class="colLab">{{'画笔粗细'}}</Col>
    <Col :span="4" class="colInput">
      <Select v-model:value="lineWidth" style="width: 100%">
        <SelectOption v-for="item in lineWidths" :key="item.value" :value="item.value">{{ item.label }} </SelectOption>
      </Select>
    </Col>
    <Col :span="3" class="colLab">{{'画笔颜色'}}</Col>
    <Col :span="3" class="colInput">
      <NColorPicker v-model:value="lineColor" />
    </Col>
    <Col :span="3" class="colLab">是否剪裁:<Checkbox v-model:checked="isCrop" /> </Col>
  </Row>
  <ESignVue
    ref="esginRef"
    :imageSrc="props.imageSrc"
    v-model:bg-color="bgColor"
    :width="800"
    :height="height"
    :is-crop="isCrop"
    :line-width="lineWidth"
    :line-color="lineColor"
    :t="Math.random()"
  />
</template>
<script setup lang="ts">
  import { message, Select, SelectOption, Checkbox, Row, Col, Button } from 'ant-design-vue';
  import { SaveOutlined } from '@ant-design/icons-vue';
  import { NColorPicker } from 'naive-ui';
  import ESignVue from './ESignVue.vue';
  import { ref, shallowRef } from 'vue';
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';

  const props = defineProps({
    imageSrc: {
      type: String,
      default: '',
    },
    writingType: {
      type: String,
      default: 'KeyOfEn',
    },
    keyOfEn: {
      type: String,
      default: '',
    },
  });
  const lineWidth = ref(6);
  const lineColor = ref('#000000');
  const bgColor = ref('');
  const isCrop = ref(false);
  const route = useRoute();
  const lineWidths = [
    {
      value: 2,
      label: 2,
    },
    {
      value: 4,
      label: 4,
    },
    {
      value: 6,
      label: 6,
    },
    {
      value: 8,
      label: 8,
    },
    {
      value: 10,
      label: 10,
    },
  ];
  const height = window.innerHeight * 0.7 - 60;
  const esginRef: any = shallowRef<InstanceType<typeof ESignVue>>();
  const emit = defineEmits(['ChangeWriteImg']);
  //重置
  const handleReset = () => {
    esginRef.value.reset();
  };
  //保存
  const handleGenerate = () => {
    esginRef.value
      .generate()
      .then(async (res) => {
        if (props.writingType === 'KeyOfEn' || props.writingType === 'WorkCheck' || props.writingType === 'MakeImage') {
          //表单中的写字板 保存到数据库中
          let data = '';
          if (props.writingType === 'KeyOfEn') {
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
            handler.AddJson(route.query);
            handler.AddPara('KeyOfEn', props.keyOfEn);
            handler.AddPara('imageData', res.replace(/^data:image\/(png|jpg);base64,/, ''));
            data = await handler.DoMethodReturnString('HandWriting_Save');
          } else if (props.writingType === 'MakeImage') {
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_Setting');
            handler.AddJson(route.query);
            handler.AddPara('KeyOfEn', props.keyOfEn);
            handler.AddPara('imageData', res.replace(/^data:image\/(png|jpg);base64,/, ''));
            data = await handler.DoMethodReturnString('ImageBody_Save');
          }
          if (typeof data === 'string' && data.includes('err@')) {
            message.error(data.replace('err@', ''));
            return;
          }
          if (typeof data === 'string' && data.includes('info@')) res = data.replace('info@', '');
          res = replaceDataUserPath(res);
          console.log(res);
        }
        emit('ChangeWriteImg', res);
        console.log(res);
      })
      .catch((err) => {
        message.error(err); // 画布没有签字时会执行这里 'Not Signned'
      });
  };
  //截取DataUser/获得路径
  const replaceDataUserPath = (originalString) => {
    const index = originalString.indexOf('DataUser/');
    if (index !== -1) {
      return '/api/DataUser/' + originalString.substring(index + 'DataUser/'.length);
    }
    return originalString;
  };
</script>
<style scoped>
  .colLab {
    padding-left: 5px;
    padding-top: 5px;
  }
  .colInput {
    border-right: 1px solid #f0f0f0;
    padding-right: 10px;
  }
</style>
