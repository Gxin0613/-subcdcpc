import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';
import WebUser from '/@/bp/web/WebUser';
import { onlineEdit, installWpsAddin } from '/@/components/wps/index.cjs';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { getVstoHost } from '/@/utils/VstoUtils';
export class GPN_StartDocFlow extends PageBaseGroupNew {
  constructor() {
    super('GPN_StartDocFlow');
    this.PageTitle = '公文模板';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '公文模板'); //增加分组.
    this.SelectItemsByList('SelectGW', '选择公文模板', '选择公文模板进行编辑完成后保存', false, this.SelectOne);
    this.FileUpload('ImpFile', '导入本机文件', '请导入本机的文件.', this.HelpLocal);
  }

  //设备列表.
  public async SelectOne() {
    const flowNo = this.RequestVal('FK_Flow') || this.RequestVal('FlowNo');
    const workID = this.RequestVal('WorkID');
    const nodeID = this.RequestVal('FK_Node');
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('workID', workID);
    handler.AddPara('flowNo', flowNo);
    handler.AddPara('nodeID', nodeID);
    const result: any = await handler.DoMethodReturnJson('GPN_DocTemplates');
    result.forEach((en) => {
      en.Name = decodeURIComponent(en.Name);
    });
    console.log(result);
    return JSON.stringify(result);
  }
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageNo === 'SelectGW') {
      const fileName = this.RequestVal('tb1', 'SelectGW');
      const workID = this.RequestVal('WorkID');
      const nodeID = this.RequestVal('FK_Node');
      const btnNo = this.RequestVal('btnNo');
      const btnPara = this.RequestVal('btnPara');
      return this.onlineEditFile(workID, nodeID, btnNo, btnPara, fileName);
      return new GPNReturnObj(GPNReturnType.Close);
    }

    //本机模板
    if (pageNo == 'ImpFile') {
      try {
        const workID = this.RequestVal('WorkID');
        const nodeID = this.RequestVal('FK_Node');
        const btnNo = this.RequestVal('btnNo');
        const btnPara = this.RequestVal('btnPara');
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
        handler.AddFile(this.UploadFile);
        handler.AddPara('workId', workID);
        handler.AddPara('token', WebUser.Token?.replace(',,', ''));
        handler.AddPara('nodeID', nodeID);
        await handler.DoMethodReturnJson('SaveGongWenWord');
        this.onlineEditFile(workID, nodeID, btnNo, btnPara, null);
        return new GPNReturnObj(GPNReturnType.Close);
      } catch (error: any) {
        message.error(error);
      }
    }
  }
  parseStringToObjectGetByKey = (str, keyPara) => {
    const parts = str.split('@');
    const obj = {};

    parts.forEach((part) => {
      const [key, value] = part.split('=');
      obj[key] = value;
    });
    if (obj[keyPara] == 'undefined') {
      obj[keyPara] = null;
    }
    return obj[keyPara];
  };
  /**
   *
   * @param workID 在线编辑word和excel
   * @param nodeID
   * @param btnNo
   * @param btnPara
   * @returns
   */
  onlineEditFile = async (workID, nodeID, btnNo, btnPara, gongWenTemplateFile) => {
    switch (btnNo) {
      case 'DocWordForWord': //打开公文
        const onLineeditUrl =
          'wordform://-fromccflow,AppID=DocFile' +
          ',WorkID=' +
          workID +
          ',FK_Node=' +
          nodeID +
          ',officeBtnEnable=' +
          this.parseStringToObjectGetByKey(btnPara, 'OfficeBtnEnable') +
          ',gongWenTemplateFile=' +
          gongWenTemplateFile +
          ',Token=' +
          WebUser.Token?.replace(',,', '') +
          ',WSUrl=' +
          getVstoHost();
        window.location.href = onLineeditUrl;
        break;
      case 'DocWordForWPS':
        let officeEnable = this.parseStringToObjectGetByKey(btnPara, 'OfficeBtnEnable');
        if (officeEnable == 0 || officeEnable == 2) {
          officeEnable = 3;
        }
        if (officeEnable == 1) {
          officeEnable = -1;
        }
        const downloadFileUrl =
          import.meta.env.VITE_GLOB_API_URL +
          'WF/VSTO/GenerGongWenByteWPS?nodeID=' +
          nodeID +
          '&token=' +
          WebUser.Token +
          '&workId=' +
          workID +
          '&gongWenTemplateFile=' +
          gongWenTemplateFile;
        const uploadFileUrl = import.meta.env.VITE_GLOB_API_URL + 'WF/VSTO/SaveGongWenWordWPS?nodeID=' + nodeID + '&token=' + WebUser.Token + '&workId=' + workID;
        //安装wps插件后执行回调函数
        installWpsAddin(onlineEdit, [officeEnable, WebUser.Name, downloadFileUrl, uploadFileUrl]);

        break;
      case 'DocWord':
        if (this.parseStringToObjectGetByKey(btnPara, 'OfficeFileType') == 0) {
          const onLineEditUrl =
            'wordform://-fromccflow,AppID=DocFile' +
            ',WorkID=' +
            workID +
            ',FK_Node=' +
            nodeID +
            ',officeBtnEnable=' +
            this.parseStringToObjectGetByKey(btnPara, 'OfficeBtnEnable') +
            ',gongWenTemplateFile=' +
            gongWenTemplateFile +
            ',Token=' +
            WebUser.Token?.replace(',,', '') +
            ',WSUrl=' +
            getVstoHost();
          window.location.href = onLineEditUrl;
          return;
        }
        if (this.parseStringToObjectGetByKey(btnPara, 'OfficeFileType') == 1) {
          let officeEnable = this.parseStringToObjectGetByKey(btnPara, 'OfficeBtnEnable');
          if (officeEnable == 0 || officeEnable == 2) {
            officeEnable = 3;
          }
          if (officeEnable == 1) {
            officeEnable = -1;
          }
          const downloadFileUrl =
            import.meta.env.VITE_GLOB_API_URL +
            'WF/VSTO/GenerGongWenByteWPS?nodeID=' +
            nodeID +
            '&token=' +
            WebUser.Token +
            '&workId=' +
            workID +
            '&gongWenTemplateFile=' +
            gongWenTemplateFile;
          const uploadFileUrl = import.meta.env.VITE_GLOB_API_URL + 'WF/VSTO/SaveGongWenWordWPS?nodeID=' + nodeID + '&token=' + WebUser.Token + '&workId=' + workID;
          //安装wps插件后执行回调函数
          installWpsAddin(onlineEdit, [officeEnable, WebUser.Name, downloadFileUrl, uploadFileUrl]);
          return;
        }
        if (this.parseStringToObjectGetByKey(btnPara, 'OfficeFileType') == 3) {
          const encodeFileName = encodeURIComponent(gongWenTemplateFile);
          return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, '/#/WF/FrmOnlyOffice?WorkID=' + workID + '&NodeID=' + nodeID + '&gongWenTemplateFile=' + encodeFileName);
        }
        break;
      default:
        break;
    }
  };

  // 新建string枚举
  public readonly DocHelp = `
  #### 帮助
  - 字段附件，附件以字段名的形式在页面中显示; 
  #### 图例
  ![输入图片说明](./resource/WF/Admin/FrmLogic/SFTable/Img/Ath1.png "屏幕截图.png") 
  #### 数据存储
  - 附件的默认保存在web服务器上。
  - 可以保存到ftp服务器上, ftp的服务器的连接配置在全局的配置文件中。
  - 如果需要保存到数据库，就需要考虑数据库的存储与备份的问题，文件将会存储在 Sys_FrmAttachmentDB 表中。
 
    `;

  // 新建int枚举
  public readonly HelpLocal = `
  #### 帮助
  - 仅支持上传Word文件; 
    `;
}
