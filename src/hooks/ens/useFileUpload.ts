import { message, UploadChangeParam, UploadFile, UploadProps } from 'ant-design-vue';
import { ref } from 'vue';
import { AtPara } from '/@/bp/da/AtPara';
import HttpHandler from '/@/utils/gener/HttpHandler';

export function useFileUpload() {
  const mapUploadFileList = ref<UploadFile[]>([]);
  // 文件变更
  const handleChange = (info: UploadChangeParam) => {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const deleteEntityMapFile = async (entityName: string, pkVal: string) => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommEntity');
      handler.AddPara('EnName', entityName);
      handler.AddPara('PKVal', pkVal);
      const data = await handler.DoMethodReturnString('EntityAth_Delete');
      message.info(data);
    } catch (e: any) {
      message.error(e.toString());
    }
  };

  // 文件删除
  const handleRemove: UploadProps['onRemove'] = (file: UploadFile) => {
    const index = mapUploadFileList.value.indexOf(file);
    const newFileList = mapUploadFileList.value.slice();
    newFileList.splice(index, 1);
    mapUploadFileList.value = newFileList;
  };
  // 阻止自动上传
  const beforeUpload = () => false;

  const uploadEntityMapFile = async (entityName: string, pkVal: string, file: File) => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommEntity');
      handler.AddFile(file);
      handler.AddPara('EnName', entityName);
      handler.AddPara('PKVal', pkVal);
      const data = await handler.DoMethodReturnString('EntityAth_Upload');
      message.info(data);
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  const uploadAttrBindFile = async (entityName: string, pkName: string, classID: string, pkval: string, fileList: UploadFile[], attr: Recordable) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('EnName', entityName);
    handler.AddPara('PK', pkName);
    handler.AddPara('ClassID', classID);
    handler.AddPara('PKVal', pkval);
    handler.AddPara('KeyOfEn', attr.Key);
    const atPara = new AtPara(attr.UIBindKey);
    handler.AddPara('SaveTo', atPara.GetValStrByKey('SaveTo'));
    handler.AddFile(fileList[0].originFileObj);
    await handler.DoMethodReturnString('Entity_Upload');
  };
  return {
    mapUploadFileList,
    beforeUpload,
    handleRemove,
    handleChange,
    uploadEntityMapFile,
    deleteEntityMapFile,
    uploadAttrBindFile,
    handleDrop: (e: DragEvent) => {
      console.log(e);
    },
  };
}
