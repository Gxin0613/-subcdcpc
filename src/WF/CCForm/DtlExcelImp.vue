<template>
  <Spin :spinning="loading">
    <div class="list-picker">
      <Card style="border-radius: 10px; margin-bottom: 2px">
        <div class="clearfix">
          <Upload v-model:file-list="fileList" list-type="picture-card" accept=".xlsx,.xls" :max-count="1" :before-upload="beforeUpload" @remove="handleRemove">
            <UploadOutlined />{{ '上传Excel' }}</Upload
          >
          <Button type="primary" :disabled="fileList.length === 0" :loading="uploading" style="margin-top: 16px" @click="handleUpload">
            {{ uploading ? '导入中' : '开始导入' }}
          </Button>
        </div>
      </Card>
      <Card style="border-radius: 10px; margin-bottom: 2px">
        <h2>{{ '操作说明：' }}</h2>
        <ol>
          <!-- <li>1.<a onclick="DownTemplate()">{{'下载Excel模板'}}</a></li> -->
          <li>{{ '1、制作导入模板，将从表的列名复制到Excel的第一行。' }}</li>
          <li>{{ '2、填写数据。' }}</li>
          <li>{{ '3、选择Excel文件点击开始导入。' }}</li>
        </ol>
      </Card>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Card, Spin, Upload, Button, UploadProps, message } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);

  const fileList = ref<UploadProps['fileList']>([]);
  const uploading = ref<boolean>(false);

  // const DownTemplate = () => {
  //   //下载Excel模板文件
  // };

  const handleRemove: UploadProps['onRemove'] = (file) => {
    const index = fileList.value.indexOf(file);
    const newFileList = fileList.value.slice();
    newFileList.splice(index, 1);
    fileList.value = newFileList;
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    fileList.value = [...(fileList.value || []), file];
    return false;
  };

  const handleUpload = async () => {
    uploading.value = true;
    //调用导入接口
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddJson(props.params);
    handler.AddFile(fileList.value[0].originFileObj);
    const data = await handler.DoMethodReturnString('DtlImpByExcel_Imp');
    if (typeof data == 'string' && data.includes('err@') == true) {
      message.error(data.replace('err@', ''));
      return;
    }
    uploading.value = false;
    message.info(data);
  };

  const InitPage = async () => {
    try {
      loading.value = true;
      console.log(props.params);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>

<style scoped lang="less">
  :deep(.ant-col) {
    width: auto;
  }
</style>
