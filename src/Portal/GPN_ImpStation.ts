import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_ImpStation extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpStation');
    this.PageTitle = '导入角色数据';
  }
  public Init() {
    this.AddGroup('A', '导入');
    this.FileUpload('ImpExcel', '导入本机Excel文件', '111', this.Imp);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //本机模板
    if (pageNo == 'ImpExcel') {
      if (!this.isExcelFile(this.UploadFile.name)) {
        return new GPNReturnObj(GPNReturnType.Error, '您上传的文件不是Excel，请上传正确的Excel文件');
      }
      try {
        console.log(this.UploadFile);
        const handler = new HttpHandler('BP.WF.HttpHandler.GPMPage');
        handler.AddFile(this.UploadFile);
        handler.AddPara('ImpWay', tb1);
        const data = await handler.DoMethodReturnString('ExcelImpStation');
        if (data.includes('err@')) {
          return new GPNReturnObj(GPNReturnType.Error, data.replace('err@', ''));
        }
        return new GPNReturnObj(GPNReturnType.Message, data || '导入成功');
      } catch (error: any) {
        message.error(error);
      }
    }
  }

  public isExcelFile(fileName) {
    // 获取文件的后缀名
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // 判断后缀名是否为 'xls' 或 'xlsx'
    return fileExtension === 'xls' || fileExtension === 'xlsx';
  }

  public readonly Imp = `
### 角色导入功能说明
#### 使用前提
1. **后端配置要求**  
   ➠ <span style="color:red">必须启用配置参数：\`GroupStationModel=1\`</span>
   （未配置将导致功能不可用）
2. **功能说明**  
   ➠ 本功能用于导入组织架构中的岗位(角色)、岗位(角色)类型数据，是追加导入，不会覆盖原有数据。
#### 文件格式要求
1. **文件类型**  
   ➠ 仅支持 **.xlsx** 或 **.xls** 格式的Excel文件  
   ➠ 其他格式（如CSV/PDF）将自动拒绝
### Excel工作表格式规范
#### Sheet1 - 岗位关系表
| **必填列**       | **说明**                          |
|------------------|-----------------------------------|
| 岗位名称<span style="color:red">*</span>     | 岗位的名称（允许岗位名称相同但是需要<span style="color:red">不同岗位类型</span>） |
| 岗位类型<span style="color:red">*</span>        | 岗位所属分类（需与Sheet2类型匹配）|

​			**Sheet1 -注意事项**  
  - <span style="color:red">禁止添加额外列或修改列名 </span>   
  - <span style="color:red">岗位类型必须在Sheet2中存在</span>


#### **Sheet2 - 岗位类型表**
  | **必填列**       | **说明**                          |
  |------------------|-----------------------------------|
  | 岗位类型<span style="color:red">*</span>         | 组织架构中定义的所有岗位类型      |`;
}
