import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { message } from 'ant-design-vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { XS } from './XS';

export class GPN_ADImp extends PageBaseGroupNew {
  constructor() {
    super('GPN_ADImp'); //实体的类名，以GPE_开头.
    this.PageTitle = '导入广告'; //实体名称.
  }
  public async Init() {
    this.AddGroup('A', '导入广告');
    this.FileUpload('Excel', '导入Excel文件', '请上传约定格式的文件', '上传文件然后执行导入');
    this.FileUpload('Zip', '导入zip文件', '请上传约定格式的文件', '上传文件然后执行导入');
    this.AddBlank('xx', '从接口导入', this.HelpTodo);
    //this.FileUpload('I2p', '导入广告', '请上传约定格式的文件', '上传文件然后执行导入');
    //this.TextBox2_NameNo('BatchNoName', '输入批次ID与名称', this.HelpUn, '', '任务编号', '任务名称', '');
    // this.SelectItemsByTree('BatchNoName.Orgs', '选择参与的组织', this.Imp, true, 'SELECT No,Name,ParentNo FROM YS_Org ', '0', false);
    // this.SelectItemsByGroupList('BatchNoName.Orgs.SelectOneFrm', '选择表单', '请选择要申报的表单', false, GloWF.srcFrmTree, GloWF.srcFrmList);
  }
  public async GenerSorts() {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    //本机模板
    if (pageID == 'Excel') {
      try {
        const xs = new XS();
        await xs.Init();

        const handler = new HttpHandler('BP.App.Handler_AD');
        handler.AddFile(this.UploadFile);
        const data = await handler.DoMethodReturnString('ImpAD');
        return new GPNReturnObj(GPNReturnType.Message, data);
      } catch (error: any) {
        message.error(error);
      }
    }
    //本机模板
    if (pageID == 'Zip') {
      try {
        const xs = new XS();
        await xs.Init();

        const handler = new HttpHandler('BP.App.Handler_AD');
        handler.AddFile(this.UploadFile);
        const data = await handler.DoMethodReturnString('ImpZipAD');
        return new GPNReturnObj(GPNReturnType.Message, data);
      } catch (error: any) {
        message.error(error);
      }
    }
  }

  public readonly Imp = `
  #### 帮助
   - 从其他部门的人员里导入人员，放入本部门中
   - 一个人拥有多个部门
  `;
  public readonly ImpExcel = `
  #### 帮助
   - 从excel导入数据.
   - 按照ccbpm的excel格式要求.
   - 格式文件位于 .  完善测试该方法.
  `;
}
