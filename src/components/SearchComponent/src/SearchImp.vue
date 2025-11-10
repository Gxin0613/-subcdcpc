<template>
  <BaseComponent ref="baseComp">
    <div class="p-1">
      <Spin :spinning="loading" style="background-color: white">
        <Card :title="'操作步骤'" style="width: 100%">
          <ul>
            <li>
              第1步:
              <Button type="link" @click="downloadFile">{{ '下载导入数据模板' }}</Button
              >{{ '- 如果没有下载到模版，请通知管理员设计一个模版。' }}<b>{{ '请参考帮助设计一个模版' }}</b>
            </li>

            <!--<li>{{'请下载模版'}}<a href=""> </a></li>-->
            <li>第2步:选择在模版里组织好要导入的数据. <font color="red">警告:如果要擅自修改表格里列名或修改excel的版本存储格式，就会导致导入错误。</font></li>

            <li>第3步:从本机导入，请您选择Excel文件 点击导入按钮完成导入。</li>
            <Upload v-model:file-list="fileList" :max-count="1" :multiple="false" :remove="handleRemove" :before-upload="(file) => beforeUpload(file, attr)">
              <Button> <upload-outlined />{{ '点击上传' }}</Button>
            </Upload>

            <li style="display: flex; align-items: center">
              <span style="margin-right: 25px"> 导入的方式: </span>
              <RadioGroup v-model:value="ImpType" name="radioGroup" class="ImportMode">
                <Radio value="0">{{ '清空方式导入' }}</Radio
                ><br />
                <Radio value="1">{{ '更新方式导入' }}</Radio
                ><br />
                <Radio value="2">{{ '追加方式导入' }}</Radio
                ><br />
              </RadioGroup>
            </li>
          </ul>
          <div style="text-align: center; padding: 5px">
            <Button class="btn_style" style="margin-left: 12px; color: #fff" type="primary" @click="Imp_Done">
              <template #icon> <DownloadOutlined /> </template>{{ '执行导入' }}</Button
            >
          </div>
          <ul>
            <li> 如果含有外键字段，还需要在Excel添加一列外键的带"T"字段.例如，外键字段：CeShi,CeShiT</li>
            <li>{{ '如果导入失败：也许是服务器的环境问题，请在服务器上安装' }}<font color="red">AccessDatabaseEngine.exe</font>{{ '试试看。' }}</li>
          </ul>
        </Card>
        <Card :title="'数据制作说明'" style="width: 100%">
          <ul>
            <li>新建一个Excel文件，比如 AAA.xlsx,</li>
            <li>在excel的工具栏中，找到文件另存为命令，选择 (Excel 工作簿(*.xlsx))格式. </li>
            <li>{{ '在第一行数据填入如下列' }}</li>
            <li> <Table :columns="columns" :data-source="tableData" bordered size="small" /></li>
            <li>{{ '测试该模版是否可用,如果可用就把该文件放到 \DatUser\\TempleteOfImp\\' }}</li>
            <li> 如果不可用：请尝试下载一个AccessDatabaseEngine.exe 文件安装到服务器上试试.</li>
          </ul>
        </Card>
        <Card :title="'导入结果'" style="width: 100%">
          <div v-html="result"></div>
        </Card>
        <br />
      </Spin>
    </div>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Spin, Card, Button, RadioGroup, Radio, Upload, UploadFile, message, Table } from 'ant-design-vue';
  import { DownloadOutlined } from '@ant-design/icons-vue';
  import { ref } from 'vue';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getAppEnvConfig } from '/@/utils/env';
  import { AtPara } from '/@/bp/da/AtPara';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const ImpType = ref(0); //模板导入方式
  const result = ref('');
  //定义从表表格展示的数据和列
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const loading = ref(false);
  const InitPage = async () => {
    loading.value = true;
    try {
      const mapAttrs = new MapAttrs();
      await mapAttrs.Retrieve('FK_MapData', props.params.FrmID, 'Idx');
      mapAttrs
        .filter((mapAttr) => mapAttr.UIVisible != 0 && mapAttr.KeyOfEn != 'OID')
        .forEach((mapAttr) => {
          columns.value.push({
            title: mapAttr.Name,
            key: mapAttr.KeyOfEn,
            width: mapAttr.UIWidth,
            align: 'center',
          });
        });
    } catch (e) {
      message.error(e as string);
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  // 文件列表
  const fileList = ref<UploadFile[]>([]);

  const handleRemove = (file: UploadFile) => {
    const index = fileList.value.indexOf(file);
    const newFileList = fileList.value.slice();
    newFileList.splice(index, 1);
    fileList.value = newFileList;
    return Promise.resolve(true);
  };
  const beforeUpload = (file: UploadFile, attr) => {
    const atPara = new AtPara(attr.UIBindKey);
    const format = atPara.GetValStrByKey('Format');
    if (format === '*.*') {
      fileList.value = [...fileList.value, file];
      return false;
    }
    //后缀名
    const ext = file.name.substring(file.name.lastIndexOf('.') + 1);
    if (format.includes(ext) == false) {
      message.error('附件上传格式不正确');
      fileList.value = [];
      return false;
    }
    fileList.value = [...fileList.value, file];
    return false;
  };
  /**
   * 下载模板
   */
  const downloadFile = () => {
    const frmID = props.params.FrmID;
    const downloadUrl = VITE_GLOB_API_URL + '/DataUser/TempleteOfImp/' + frmID + '.xlsx';
    downloadByUrl({ url: downloadUrl });
  };
  //执行导入
  const Imp_Done = async () => {
    if (fileList.value.length == 0) {
      message.error('请选择需要导入的文件');
      return;
    }
    loading.value = true;
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddFile(fileList.value[0].originFileObj);
      handler.AddJson(props.params);
      handler.AddPara('ImpWay', ImpType.value);
      const data = await handler.DoMethodReturnString('ImpData_Done');
      result.value = '<span>导入成功</span><br/>';
      const datas = data.split('@Split');
      const waringInfo = datas[0].replace('errInfo=', '');
      const count = datas[1].replace('count=', '');
      const successInfo = datas[2].replace('successInfo=', '');
      const changeCount = datas[3].replace('changeCount=', '');
      result.value += '成功导入条数' + count + '<br/>';
      if (ImpType.value != 0) result.value += '成功更新条数' + changeCount + '<br/>';
      result.value += '成功导入数据<br/>';
      result.value += successInfo;
      result.value += "<span style='color:red'>警告</span><br/>";
      result.value += waringInfo;
    } catch (e) {
      result.value = "<span style='color:red'>导入失败:" + (e as string) + '</span>';
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  .ImportMode {
    display: flex;
  }
</style>
