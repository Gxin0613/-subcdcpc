import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { getAppEnvConfig } from '/@/utils/env';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_PrintRTF extends PageBaseGroupNew {
  constructor() {
    super('GPN_PrintRTF');
    this.PageTitle = '打印模版管理';
  }

  public async Init() {
    this.AddGroup('A', '导入表单', 'icon-xxx'); //增加分组.
    this.FileUpload('Imp', '导入模版', '', this.ImpLocal);
    this.AddBlank('Exp', '下载模版', '', this.ImpLocal);
    // this.AddBlank('Test', '打印测试', '', this.ImpLocal);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    //本机导入表单.
    if (pageNo === 'Imp') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_PrintTemplate');
      handler.AddFile(this.UploadFile);
      handler.AddPara('MyPK', this.PKVal);
      const data = await handler.DoMethodReturnString('PrintTemplate_Save');
      //提示信息.
      if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      else return new GPNReturnObj(GPNReturnType.Message, data);
    }
    //本机导出表单.
    if (pageNo === 'Exp') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_PrintTemplate');
      handler.AddPara('MyPK', this.PKVal);
      const data = await handler.DoMethodReturnString('PrintTemplate_Download');
      //提示信息.
      if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      const { VITE_GLOB_PREVIEW_URL } = getAppEnvConfig();
      let fileUrl = data;
      if (VITE_GLOB_PREVIEW_URL.endsWith('/')) {
        fileUrl = fileUrl.substring(1);
      }
      const url = VITE_GLOB_PREVIEW_URL + fileUrl;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }

  // 本机导入说明
  public readonly ImpLocal = `
  #### 帮助 
   ##### 上传模板
   - 请上传您的表单模板.
   ##### 选择导入模式
   - 请选择导入模式.
   - 按照模版的表单编号导入1：如果该编号已经存在就提示错误.
   - 按照模版的表单编号导入2：如果该编号已经存在就直接覆盖.
   - 按照模版的表单编号导入3：如果该编号已经存在就增加@WebUser.OrgNo(组织编号)导入.
        `;
  //从表单库导入说明
  public readonly ImpFrmID = `
  #### 帮助
   - 从表单库导入
  `;
}
