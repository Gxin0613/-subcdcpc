// 实体类
import { FrmAttachment } from '../Admin/FrmLogic/FrmAttachment/FrmAttachment';
import { FrmAttachmentDB } from '../Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
import WebUser from '/@/bp/web/WebUser';
import { getVstoHost } from '/@/utils/VstoUtils';
import { onlineEdit, installWpsAddin } from '/@/components/wps/index.cjs';
import { getAppEnvConfig } from '/@/utils/env';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { downloadByUrl } from '/@/utils/file/download';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';
import { setBase64 } from '/@/utils/gener/StringUtils';

export default class Dev2InterfaceAth {
  /**
   * 打开附件：按照配置模式打开.
   * @param athPK 附件ID.
   * @returns
   */
  public static async OpenAthAuto(athPK: string) {
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
    console.log('athPK', athPK);
    //附件数据.
    const athDB = new FrmAttachmentDB(athPK);
    await athDB.RetrieveFromDBSources();
    console.log('athDB', athDB);
    //附件的配置.
    const athDesc = new FrmAttachment(athDB.FK_FrmAttachment);
    await athDesc.RetrieveFromDBSources();
    console.log('athDesc', athDesc);
    //判断是否是vsto打开？
    if (athDesc.AthEditType === 0) {
      //office插件
      let onLineeditUrl = 'wordform://-fromccflow,AppID=AthHelper';
      if (athDB.FileExts === 'xls' || athDB.FileExts === 'xlsx') {
        onLineeditUrl = 'excelform://-fromccflow,AppID=AthHelper';
      }
      const WpsUrl = onLineeditUrl + ',AthMyPK=' + athDB.MyPK + ',Token=' + WebUser.Token?.replace(',,', '') + ',WSUrl=' + getVstoHost();
      window.location.href = WpsUrl;
      // return;
    }
    if (athDesc.AthEditType === 1) {
      //是否是wps打开.
      const downloadFileUrl = basePath + 'WF/VSTO/GenerFrmAttachmentByteWPS?token=' + WebUser.Token + '&frmAttachmentMyPK=' + athDB.MyPK;
      const uploadFileUrl = basePath + 'WF/VSTO/SaveFrmAttachmentWPS?token=' + WebUser.Token + '&frmAttachmentMyPK=' + athDB.MyPK;
      //安装wps插件后执行回调函数 不受保护模式打开
      installWpsAddin(onlineEdit, ['-1', WebUser.Name, downloadFileUrl, uploadFileUrl]);
      // return '';
    }
    //判断打开模式. 是office文档.
    if (athDesc.AthEditType === 2) {
      // window.open('xxxx');
      //office插件
      let onLineeditUrl = 'wordform://-fromccflow,AppID=WordDoc,operateTag=OnLineEditWord';
      if (athDB.FileExts === 'xls' || athDB.FileExts === 'xlsx') {
        onLineeditUrl = 'excelform://-fromccflow,AppID=AthHelper,operateTag=OnLineEditExcel';
      }
      const OfficeUrl = onLineeditUrl + ',AthMyPK=' + athDB.MyPK + ',Token=' + WebUser.Token?.replace(',,', '') + ',WSUrl=' + getVstoHost();
      window.location.href = OfficeUrl;
      // return;
    }
  }
  /**
   * 打开附件：使用kkview服务打开
   * @param filePath  附件全路径
   * @returns
   */
  public static async OpenAthKKViewByPath(filePath: string) {
    const { VITE_GLOB_PREVIEW_URL } = getAppEnvConfig();
    // 附件数据.
    const i = filePath.indexOf('DataUser');
    let str = filePath.substring(i);
    if (str.indexOf('/') == 0) {
      str = filePath.substring(0);
    }
    let fileUrl = str;
    if (typeof CommonConfig.IsOnlinePreviewOfAth == 'undefined') CommonConfig.IsOnlinePreviewOfAth = true;

    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      //配置的在线预览的方式，待处理.
      let host = VITE_GLOB_PREVIEW_URL;
      if (!host.endsWith('/') && !host.endsWith('\\')) {
        host = host + '/';
      }
      let url = '';
      if (!fileUrl.includes('http')) {
        fileUrl = fileUrl.replace(/\/\//g, '/').replaceAll('\\/', '/').replaceAll('//', '/').replaceAll('\\', '/');
        if (host.startsWith('http://') || host.startsWith('https://')) {
          url = host + fileUrl;
        } else {
          url = window.location.origin + VITE_GLOB_PREVIEW_URL + fileUrl;
        }
      } else {
        url = fileUrl;
      }
      url = encodeURIComponent(setBase64(url));
      //预览文件服务器.
      const fileServerHost = CommonConfig.PreviewPathOfAth;
      // window.open(fileServerHost + 'onlinePreview?url=' + url);
      const iframeAthView = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + url;
      return iframeAthView;
    }
  }
  /**
   * 打开附件：使用kkview服务打开
   * @param athPK
   * @returns
   */
  public static async OpenAthKKView(athPK: string) {
    const { VITE_GLOB_PREVIEW_URL, VITE_GLOB_KKFILE_MINIOHOST } = getAppEnvConfig();
    // const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
    console.log('athPK', athPK);
    // 附件数据.
    const athDB = new FrmAttachmentDB(athPK);
    await athDB.RetrieveFromDBSources();
    console.log('athDB', athDB);
    //附件的配置.
    const athDesc = new FrmAttachment(athDB.FK_FrmAttachment);
    await athDesc.RetrieveFromDBSources();
    console.log('athDesc', athDesc.AthEditType);

    const filePath = athDB.FileFullName;
    const i = filePath.indexOf('DataUser');
    let str = filePath.substring(i);
    if (str.indexOf('/') == 0) {
      str = filePath.substring(0);
    }
    let fileUrl = str;
    if (typeof CommonConfig.IsOnlinePreviewOfAth == 'undefined') CommonConfig.IsOnlinePreviewOfAth = true;

    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      if (athDesc.AthSaveWay == '4') {
        const url = encodeURIComponent(setBase64(athDB.FileFullName));
        const fileServerHost = CommonConfig.PreviewPathOfAth;
        const iframeAthView = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + url;
        return iframeAthView;
      } else if (athDesc.AthSaveWay == '5') {
        //如果是MinIO的方式.
        let url = athDB.FileFullName;
        if (!VITE_GLOB_KKFILE_MINIOHOST.endsWith('/') && !VITE_GLOB_KKFILE_MINIOHOST.endsWith('\\')) {
          url = VITE_GLOB_KKFILE_MINIOHOST + '/' + url;
        } else {
          url = VITE_GLOB_KKFILE_MINIOHOST + url;
        }
        url = url.replace(/([^:]\/)\/+/g, '$1'); // 替换非协议部分的重复斜杠;
        url = encodeURIComponent(setBase64(url));
        //预览文件服务器.
        const fileServerHost = CommonConfig.PreviewPathOfAth;
        const iframeAthView = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + url;
        return iframeAthView;
      } else if (athDesc.AthSaveWay == '6') {
        //如果是金山接口方式.
        const fileId = athDB?.MyNote;
        console.log(fileId);
        const httphandler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
        httphandler.AddPara('LinkType', 'edit');
        httphandler.AddPara('FileId', fileId);
        const response = await httphandler.DoMethodReturnString('Attachment_PreviewByKingsoft');
        console.log('response', response);
        return response;
      } else {
        //配置的在线预览的方式，待处理.
        let host = VITE_GLOB_PREVIEW_URL;
        if (!host.endsWith('/') && !host.endsWith('\\')) {
          host = host + '/';
        }
        let url = '';
        if (!fileUrl.includes('http')) {
          fileUrl = fileUrl.replace(/([^:]\/)\/+/g, '$1'); // 替换非协议部分的重复斜杠;
          if (host.startsWith('http://') || host.startsWith('https://')) {
            url = host + fileUrl;
          } else {
            url = window.location.origin + VITE_GLOB_PREVIEW_URL + fileUrl;
          }
        } else {
          url = fileUrl;
        }
        url = url.replace(/([^:]\/)\/+/g, '$1').replaceAll('\\/', '\\'); // 替换非协议部分的重复斜杠;
        url = encodeURIComponent(setBase64(url));
        //预览文件服务器.
        const fileServerHost = CommonConfig.PreviewPathOfAth;
        // window.open(fileServerHost + 'onlinePreview?url=' + url);
        const iframeAthView = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + url;
        return iframeAthView;
      }
    }
  }
  /**
   * 打开附件：使用vsto组件打开
   * @param athPK
   * @returns
   */
  public static async OpenAthVSTO(athPK: string) {
    console.log('athPK', athPK);
    //附件数据.
    const athDB = new FrmAttachmentDB(athPK);
    await athDB.RetrieveFromDBSources();
    console.log('athDB', athDB);
    //附件的配置.
    const athDesc = new FrmAttachment(athDB.FK_FrmAttachment);
    await athDesc.RetrieveFromDBSources();
    console.log('athDesc', athDesc.AthEditType);
    //office插件
    let onLineeditUrl = 'wordform://-fromccflow,AppID=WordDoc,operateTag=OnLineEditWord';
    if (athDB.FileExts === 'xls' || athDB.FileExts === 'xlsx') {
      onLineeditUrl = 'excelform://-fromccflow,AppID=AthHelper,operateTag=OnLineEditExcel';
    }
    const WpsUrl = onLineeditUrl + ',AthMyPK=' + athDB.MyPK + ',Token=' + WebUser.Token?.replace(',,', '') + ',WSUrl=' + getVstoHost();
    window.location.href = WpsUrl;
    // return;
    return '';
  }
  /**
   * 打开附件：使用浏览器打开
   * @param fullName 全路径
   * @returns
   */
  public static async OpenAthGenerByPath(fullName: string) {
    downloadByUrl({ url: fullName });
  }
  /**
   * 打开附件：使用浏览器打开
   * @param athPK
   * @returns
   */
  public static async OpenAthGener(athPK: string) {
    //附件数据.
    const athDB = new FrmAttachmentDB(athPK);
    await athDB.RetrieveFromDBSources();
    console.log('athDB', athDB);
    //附件的配置.
    const athDesc = new FrmAttachment(athDB.FK_FrmAttachment);
    await athDesc.RetrieveFromDBSources();
    console.log('athDesc', athDesc.AthEditType);

    if (athDesc.IsDownload != '1') return;
    let url = '';
    if (athDesc.AthSaveWay == '4') {
      url = athDB.FileFullName;
    } else {
      url = await GetFileUrl(athDB.MyPK);
    }
    downloadByUrl({ url: url });
  }
  public static async AddTaskOfKKFile(fileFullName: string) {
    const { VITE_GLOB_PREVIEW_URL, VITE_GLOB_KKFILE_PreviewPathOfAth } = getAppEnvConfig();
    let host = VITE_GLOB_PREVIEW_URL;
    if (!host.endsWith('/') && !host.endsWith('\\')) {
      host = host + '/';
    }
    const fileUrl = fileFullName;
    const startIndex = fileUrl.indexOf('DataUser/');
    const relativePath = fileUrl.substring(startIndex);
    const athUrl = relativePath.replace(/\/\//g, '/').replaceAll('\\/', '/').replaceAll('//', '/').replaceAll('\\', '/');
    const previewUrl = host + athUrl;
    console.log('previewUrl', previewUrl);
    // 加入预览队列.
    const url = `${VITE_GLOB_KKFILE_PreviewPathOfAth}addTask?url=${previewUrl}`;
    try {
      const httphandler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      httphandler.AddPara('URL', url);
      const response = await httphandler.DoMethodReturnString('DoKKFileAddTask');
      console.log('response', response);
    } catch (e: any) {
      message.error('kkfile路径:' + VITE_GLOB_KKFILE_PreviewPathOfAth);
    }
  }
  // 打开图片附件（金山接口）
  public static async OpenImageByKingsot(fileId: string, exts: string, fileName: string) {
    const httphandler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    httphandler.AddPara('FileExts', exts);
    httphandler.AddPara('FileId', fileId);
    httphandler.AddPara('FileName', fileName);
    const response: string = await httphandler.DoMethodReturnString('Attachment_ImagePreviewByKingsoft');
    console.log('response', response);
    return response;
  }
}
const GetFileUrl = async (mypk) => {
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  //附件数据.
  const athDB = new FrmAttachmentDB(mypk);
  await athDB.RetrieveFromDBSources();
  console.log('athDB', athDB);
  //附件的配置.
  const athDesc = new FrmAttachment(athDB.FK_FrmAttachment);
  await athDesc.RetrieveFromDBSources();
  console.log('athDesc', athDesc.AthEditType);
  const prefix = import.meta.env.MODE === 'development' ? '/api/' : basePath;
  const apiPath = 'WF/Comm/ProcessRequest';
  return (
    prefix +
    apiPath +
    '?DoType=HttpHandler&DoMethod=AttachmentUpload_Down&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&WorkID=' +
    athDB.RefPKVal +
    '&FK_Node=' +
    athDB.NodeID +
    '&MyPK=' +
    mypk +
    '&Token=' +
    WebUser.Token
  );
};
