import axios from 'axios';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { getAppEnvConfig } from '/@/utils/env';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';

export class GPN_ImpTSEntity extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpTSEntity');
    this.PageTitle = '导入实体数据';
  }
  public async Init() {
    this.AddGroup('A', '导入数据');
    this.FileUpload('0', '清空方式导入', '请上传符合格式的模板数据,执行之前阅读帮助.', this.Help0);
    this.FileUpload('1', '更新追加方式导入', '请上传符合格式的模板数据,执行之前阅读帮助.', this.Help1);
    // this.FileUpload('2', '追加方式导入', '请上传符合格式的模板数据,执行之前阅读帮助.', this.Help2);

    const ens = this.RequestVal('TSEnName');
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    let fileUrl = '/DataUser/TempleteOfImp/' + ens + '.xlsx';
    if (VITE_GLOB_API_URL.endsWith('/')) {
      fileUrl = fileUrl.substring(1);
    }
    const url = VITE_GLOB_API_URL + fileUrl;

    this.AddGroup('B', '模板');
    this.AddGoToUrl('DownTemplate', '下载模板', url);
    this.AddHelp('Help', '模板说明', this.HelpIt);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageNo == 'DownTemplate') return;
    const ensName = this.RequestVal('TSEnName');
    const RefPK = this.RequestVal('RefPK');
    const RefPKVal = this.RequestVal('RefPKVal');

    if (ensName == 'TS.Port.AdminGroup.Org') {
      if (pageNo == '0') {
        if (!window.confirm('此模式会清空所有数据并进行导入，是否继续?')) {
          return;
        }
        // 清空方式
        // try {
        //   const handler = new HttpHandler('BP.WF.HttpHandler.GPMPage');
        //   handler.AddFile(this.UploadFile);
        //   const data = await handler.DoMethodReturnString('Template_SaveGroupIncByClear');
        //   return new GPNReturnObj(GPNReturnType.Message, data);
        // } catch (error: any) {
        //   return new GPNReturnObj(GPNReturnType.Message, error);
        // }
      }
      if (pageNo == '1') {
        try {
          const handler = new HttpHandler('BP.WF.HttpHandler.GPMPage');
          handler.AddFile(this.UploadFile);
          const data = await handler.DoMethodReturnString('Template_SaveGroupIncByAppend');
          return new GPNReturnObj(GPNReturnType.Message, data);
        } catch (error: any) {
          return new GPNReturnObj(GPNReturnType.Message, error);
        }
      }
    }

    const extReqUrl = this.RequestVal('ImpFuncUrl');
    if (!!extReqUrl) {
      const formData = new FormData();
      formData.append('file', this.UploadFile);
      formData.append('EnsName', ensName); //从表的ID.
      formData.append('ImpWay', pageNo); //vue3.
      formData.append('RefPK', RefPK); //从表
      formData.append('RefPKVal', RefPKVal); //从表
      if (extReqUrl.startsWith('http://') || extReqUrl.startsWith('https://')) {
        const res = await axios.post(extReqUrl, formData, {});
        if (res.status != 200) {
          message.error(res.data);
          return;
        }
        return new GPNReturnObj(GPNReturnType.CloseAndReload, res.data || '导入成功');
      }
    }

    // 如果是普通的EntityNoName，直接走到下面理论上就可以了
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm_Sys');
    handler.AddFile(this.UploadFile);
    handler.AddPara('EnsName', ensName); //从表的ID.
    handler.AddPara('ImpWay', pageNo); //vue3.
    handler.AddPara('RefPK', RefPK); //从表
    handler.AddPara('RefPKVal', RefPKVal); //从表
    const data = await handler.DoMethodReturnJson<Recordable>('ImpData_Done');
    return new GPNReturnObj(GPNReturnType.CloseAndReload, data?.Msg || '导入成功');
  }

  public readonly Help0 = `
  #### 清空方式
  - 首先删除现在的数据，把指定的模板的数据导入到数据库.
  - 执行之前需要慎重.
  `;
  public readonly Help1 = `
  #### 更新方式导入
  - 在现有的数据基础上追加数据, 如果有主键系统将会更新. 没有主键系统将会自动生成.
  `;
  public readonly Help2 = `
  #### 追加方式导入
  - 在现有的数据基础上追加数据, 如果有主键系统将会更新. 没有主键系统将会自动生成.
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
