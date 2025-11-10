import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_ImpFlowData extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpFlowData');
    this.PageTitle = '流程数据导入';
  }

  public async Init() {
    //增加子页面.
    this.AddGroup('A', '系统支持'); //增加分组.
    this.FileUpload('DingDing', '钉钉数据导入', '请上传符合格式的Excel文件.', this.DingDing);
    this.FileUpload('WeiXin', '微信数据导入', '请上传符合格式的Excel文件.', this.WeiXin);
    this.FolderUpload('DingDingDtl', '钉钉附件数据导入', '请上传符合格式的Excel文件.', this.DingDing);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const flowNo = this.PKVal;
    if (pageNo == 'DingDing') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrFlow');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FlowNo', flowNo);
      // const data = await handler.DoMethodReturnJson<Recordable>('DingDing_ImpDataFile');
      let data = await handler.DoMethodReturnString('DingDing_ImpDataFile');
      if (typeof data === 'string') {
        if (data.includes('@')) {
          data = data.split('@').join('\n');
        }
      }
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    if (pageNo == 'DingDingDtl') {
      //获取文件流数组
      const UploadFilArr = this.UploadFilArr;
      const FolderArrName = this.FolderName;
      // //获取文件夹名称
      // if (Array.isArray(UploadFilArr) && UploadFilArr.length > 0) {
      //   AthName = this.UploadFilArr[0]?.originFileObj?.webkitRelativePath.split('/')[0];
      // }
    //  debugger;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrFlow');
      for (const file of UploadFilArr) {
        handler.AddFile(file?.originFileObj);
      }
      handler.AddPara('FlowNo', flowNo);
      handler.AddPara('AthName', FolderArrName || '');
      let data = await handler.DoMethodReturnString('DingDing_ImpAths');
      if (typeof data === 'string') {
        if (data.includes('@')) {
          data = data.split('@').join('\n');
        }
      }
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
  }

  public readonly DingDing = `
  #### 帮助
  - 选择从钉钉系统中导出的流程实例Excel格式的流程数据.
  - 上传执行导入.
  #### 说明
  - 系统读取excel以后，根据当前的流程节点设置，导入数据。
  - 能够解析出来审批意见，审核路径，流程轨迹图。
  - 能够设置当初的执行时间。
  - 适用于钉钉系统转ccbpm系统，流程实例数据的溯源。
  - ![导入钉钉格式模板](./resource/WF/Admin/AttrFlow/ImpFlowData_DingDing.png "导入钉钉格式模板")  

  `;

  public readonly WeiXin = `
  #### 帮助
  - 选择从微信系统中导出的流程实例Excel格式的流程数据.
  - 上传执行导入.
  #### 说明
  - 系统读取excel以后，根据当前的流程节点设置，导入数据。
  - 能够解析出来审批意见，审核路径，流程轨迹图。
  - 能够设置当初的执行时间。
  - 适用于微信系统转ccbpm系统，流程实例数据的溯源。
  - ![导入微信格式模板](./resource/WF/Admin/AttrFlow/ImpFlowData_WeiXin.png "导入微信格式模板")  

  `;
}
