import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_Invoice extends PageBaseGroupNew {
  constructor() {
    super('GPN_Invoice');
    this.PageTitle = '导入发票';
  }
  public Init() {
    this.AddGroup('A', '请上传发票'); //增加分组.
    this.FileUpload('Invoice', '发票', '请上传发票.', this.Desc1);
  }

  // 返回类别,显示分组.: 需要是 No,Name 类型的json.
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageNo == 'Invoice') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('RefPKVal', this.RequestVal('WorkID'));
      const data = await handler.DoMethodReturnString('Dtl_Invoice');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
  }

  // 发票控件
  public readonly Desc1 = `
  #### 帮助
  - 请上传符合格式的发票.
    `;
}
