import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { getAppEnvConfig } from '../utils/env';
import WebUser from '../bp/web/WebUser';
import { CCBPMRunModel } from '../bp/difference/SystemConfig';

export class GPN_ImpOrg extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpOrg');
    this.PageTitle = '导入组织数据';
  }
  public async Init() {
    this.AddGroup('A', '导入');
    this.FileUpload('ImpOrgExcel', '导入本机Excel模板', '请上传符合ccbpm组织结构格式的模板数据', this.Imp);
    this.TextBox3_NameNoNote('ImpDingDing', '钉钉组织', this.HelpTodo, '', '规划中', 'Key2', 'Key3', '');
    this.TextBox3_NameNoNote('ImpWeiXin', '企业组织', this.HelpTodo, '', '规划中', 'Key2', 'Key3', '');
    this.TextBox3_NameNoNote('ImpHongShu', '小红书', this.HelpTodo, '', '规划中', 'Key2', 'Key3', '');

    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    let url = '';
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) {
      url = VITE_GLOB_API_URL + '/DataUser/TempleteOfImp/组织结构批量导入模板_单组织.xls';
    } else if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
      url = VITE_GLOB_API_URL + '/DataUser/TempleteOfImp/组织结构批量导入模板_集团.xlsx';
    }
    if (WebUser.CCBPMRunModel !== CCBPMRunModel.SAAS) {
      this.AddGroup('B', '模板');
      this.AddGoToUrl('DownTemplate', '下载Excel模板', url);
    }
    // this.AddHelp('Help', '模板说明', this.HelpIt);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //本机模板
    if (pageNo == 'ImpOrgExcel') {
      try {
        let data;
        const handler = new HttpHandler('BP.WF.HttpHandler.GPMPage');
        handler.AddFile(this.UploadFile);
        handler.AddPara('FK_Sort', sortNo);
        handler.AddPara('ImpWay', tb1);
        if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) {
          data = await handler.DoMethodReturnString('Template_Save');
        } else if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
          data = await handler.DoMethodReturnString('Template_SaveGroupIncByClear');
        } else {
          data = await handler.DoMethodReturnString('Template_SaveBySaaS');
        }
        return new GPNReturnObj(GPNReturnType.Message, data?.Msg || '导入成功');
      } catch (error: any) {
        message.error(error);
      }
    }
  }

  public readonly Imp = `
  #### 帮助
   - 上传模板、选择模式进行导入组织人员.
  ##### 导入模式说明
   - 追加更新模式导入
  `;
  public readonly HelpIt = `
  #### 数据制作说明
   - 新建一个Excel文件，比如 AAA.xlsx,
   - 在excel的工具栏中，找到文件另存为命令，选择 (Excel 工作簿(*.xlsx))格式. 
   - 在第一行数据填入如下列 </li>
   - 测试该模版是否可用,如果可用就把该文件放到 DatUser\TempleteOfImp\ 
   - 如果不可用：请尝试下载一个AccessDatabaseEngine.exe 文件安装到服务器上试试.
   #### 外键字段列
   - 外键字段列，存储的是外键名称， 比如：班级字段，存储的是 '1年级' 
   - 系统导入进去的则是 001 .
   #### 枚举字段
   - 枚举字段，存储的是标签列  比如：性别字段，存储的是 '女' 
   - 系统导入进去的则是 0.
   #### 外部数据源字段
   - 需要两个列, abc 与 abcT
   - abc 存储的是编号, abcT则是中文名称.
   #### Pop字段字段列
   - 列是Pop模式的列,  需要两个字段abc, 与abcT  abc存储 编号列， abcT存储的名称列.
   - 比如：选修科目字段, 要增加一个影子字段 选修科目T, 
   - '选修科目' 是存储的外键数据, 比如:001,002  
   - '选修科目T' 是存储的外键数据, 比如:语文,数学
  `;
}
