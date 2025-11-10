import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { getAppEnvConfig } from '/@/utils/env';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_ImpExcel extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpExcel'); //实体的类名，以GPE_开头.
    this.PageTitle = '导入'; //实体名称.
  }
  public async Init() {
    const dtlID = this.params.dtlInfo.No; //从表编号
    //增加子页面分组.
    this.AddGroup('A', '导入主表');
    this.FileUpload('Excel', '上传文件', '请上传符合格式的Excel文件.', this.Desc0);
    this.AddBlank('Excel.SelectModel', '选择方式', this.HelpTodo);
    //  this.FileUpload('1', '追加方式', '请上传符合格式的Excel文件.', this.HelpTodo);
    //  this.FileUpload('2', '更新方式', '请上传符合格式的Excel文件.', this.HelpTodo);
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    let fileUrl = '/DataUser/TempleteOfImp/' + dtlID + '.xls';
    if (VITE_GLOB_API_URL.endsWith('/')) {
      fileUrl = fileUrl.substring(1);
    }
    const url = VITE_GLOB_API_URL + fileUrl;
    this.AddGoToUrl('DownTemplate', '下载模板', url);

    this.AddGroup('B', '导入从表');
    this.AddBlank('SelectDtl', '选择从表', this.HelpTodo);
    this.FileUpload('SelectDtl.Uploade', '上传文件', '请上传符合格式的Excel文件.', this.Desc0);
    this.AddBlank('SelectDtl.Uploade.SelectSheet', '选择Sheet', this.HelpTodo);
    this.TextBox2_NameNote('sxxx', '设置关系', 'ddd', '主表字段', '从表字段');
    // this.AddBlank('SelectDtl.Uploade.SelectSheet.SelectCol', '选择关联的列', this.HelpTodo);
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param _sortNo 分类编号, 可以为空.
   * @param _tb1
   * @param _tb2
   * @param _tb3
   */
  public override async Save_TextBox_X(pageID: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageID == 'DownTemplate') return;

    //调用导入接口
    const dtlID = this.params.dtlInfo.No; //从表ID
    //流程 WorkID  //EntityNoName  No
    const workID = this.params.query.WorkID || this.params.query.No;

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddFile(this.UploadFile);
    handler.AddPara('EnsName', dtlID); //从表的ID.
    handler.AddPara('PageType', 'Vue3'); //vue3.
    handler.AddPara('FK_MapData', dtlID); //从表的ID.
    handler.AddPara('WorkID', workID); //WorkID.
    handler.AddPara('DDL_ImpWay', pageID);
    const data = await handler.DoMethodReturnJson<Recordable>('ImpExcel_Done');
    return new GPNReturnObj(GPNReturnType.Message, data?.Msg || '导入成功');
  }

  public readonly Desc0 = `  
#### 帮助  
  
1. **下载模板**  
   - 如遇到下载出错的情况，请联系管理员制作模板。  
     - **模板制作规则**：  
       - 将从表的列名复制到Excel的第一行。  
       ![屏幕截图](./resource/WF/Admin/FrmLogic/MapDtl/EditModel/DtlImg.png)  
     - **模板文件存放位置**：  
       - 把制作好的模板文件放入后台的 \`\DataUser\TemplateOfImp\` 目录。  
       ![文件路径截图](./resource/WF/Admin/FrmLogic/MapDtl/EditModel/FilePath.png)  
  
2. **输入数据**  
  
3. **上传Excel文件并执行导入**  
`;
}
