import { FrmSorts } from '../../TSClass/Admin/FrmSort';
import { GloWF } from '../GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_ImpFrm extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpFrm');
    this.PageTitle = '导入表单';
  }

  public async Init() {
    this.AddGroup('A', '导入表单', 'icon-xxx'); //增加分组.
    this.FileUpload('ImpLocal', '从本机导入', '', this.ImpLocal);
    //@拼接枚举
    const str = '@0=按照模版的表单编号导入1@1=按照模版的表单编号导入2@2=按照模版的表单编号导入3';
    const json = GloWF.AtParaStringToJson(str);
    const jsonKeys = Object.keys(json);
    const list: { No: string; Name: string }[] = [];
    for (const key of jsonKeys) {
      list.push({
        No: key,
        Name: json[key],
      });
    }
    this.SelectItemsByList('ImpLocal.Way', '选择模式', this.ImpLocal, false, JSON.stringify(list));
    // this.SelectItemsByGroupList('ImpFrmID', '从表单库导入', this.ImpFrmID, false, GloWF.srcFrmTree, GloWF.srcFrmList);

    this.AddIcon('ImpFrmID', 'icon-user');
    this.AddIcon('ImpFrmIDxx', 'icon-user');
    this.AddIcon('ImpFrmIDxx', 'icon-user');
  }

  public async GenerSorts(): Promise<any[]> {
    const ens = new FrmSorts();
    await ens.Init();
    await ens.RetrieveAll();
    // []
    return ens;
    // return Promise.resolve([]);
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
