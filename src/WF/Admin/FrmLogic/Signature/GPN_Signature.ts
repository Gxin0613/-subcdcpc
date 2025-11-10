import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_Signature extends PageBaseGroupNew {
  constructor() {
    super('GPN_Signature');
    this.PageTitle = '字段签名';
  }

  public async Init() {
    this.AddGroup('A', '字段签名', 'icon-xxx'); //增加分组.
    this.AddBlank('0', '图片签名', this.HelpUn);
    this.AddBlank('1', '手写签名', this.HelpUn);
    this.AddBlank('2', '电子签章', this.HelpUn);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //本机导入表单.
    if (pageNo === 'ImpLocal.Way') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Template');
      handler.AddFile(this.UploadFile);
      handler.AddPara('RB_ImpType', tb1);
      handler.AddPara('FrmSort', sortNo);
      const data = await handler.DoMethodReturnString('ImpFrmLocal_Done');

      //提示信息.
      if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      else return new GPNReturnObj(GPNReturnType.Message, data);
    }
    //模板库导入
    if (pageNo == 'ImpTemplate') {
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
