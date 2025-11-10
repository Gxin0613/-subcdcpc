import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';
import { BtnLab } from '../Admin/AttrNode/BtnLab';
import { onlineEdit, installWpsAddin } from '/@/components/wps/index.cjs';
import WebUser from '/@/bp/web/WebUser';
import { getVstoHost } from '/@/utils/VstoUtils';

export class GL_OfficeTrack extends PageBaseGenerList {
  constructor() {
    super('GL_OfficeTrack');
    this.PageTitle = '公文版本';
  }
  //重写的构造方法.
  async Init() {
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.DTFieldOfSearch = 'RDT';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    //this.BtnOfToolbar = '最后版本';
    this.LinkField = 'Oper';
    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, DataType: 2 },
      { Key: 'NDFrom', Name: '节点ID', IsShow: true, DataType: 1 },
      { Key: 'NDFromT', Name: '节点名称', IsShow: true, DataType: 1 },

      { Key: 'EmpFrom', Name: '处理人', IsShow: true, DataType: 1 },
      { Key: 'EmpFromT', Name: '名称', IsShow: true, DataType: 1 },

      { Key: 'RDT', Name: '时间', IsShow: true, DataType: DataType.AppDateTime },
      { Key: 'Msg', Name: '备注', IsShow: true, DataType: 1 },
      { Key: 'Oper', Name: '操作', IsShow: true, DataType: 1, width: 200 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', this.RequestVal('WorkID'));
    handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    const data: any = await handler.DoMethodReturnJson('OfficeTrack_Init');
    data.forEach((en) => {
      en.Oper = '打开公文';
    });
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const onLineeditUrl =
      'wordform://-fromccflow,AppID=DocFile' +
      ',WorkID=' +
      this.RequestVal('WorkID') +
      ',FK_Node=' +
      this.RequestVal('NodeID') +
      ',IsReadonly=true' +
      ',Token=' +
      WebUser.Token?.replace(',,', '') +
      ',WSUrl=' +
      getVstoHost();
    window.location.href = onLineeditUrl;
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    const en = new BtnLab();
    await en.Init();
    en.NodeID = this.RequestVal('NodeID');
    await en.RetrieveFromDBSources();

    // const workID = this.RequestVal('WorkID');
    // const flowNo = this.RequestVal('FlowNo');
    //判断状态，是否是只读打开？
    // if (btnName == '增加备注') {
    //   const msg = window.prompt('请输入备注信息,该信息将以消息的方式通知流程的所有参与人:', '');
    //   if (msg == '') return;
    //   const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    //   await handler.AddPara('WorkID', this.RequestVal('WorkID'));
    //   await handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    //   await handler.AddPara('NodeID', this.RequestVal('NodeID'));
    //   await handler.AddPara('Msg', msg);
    //   const data = await handler.DoMethodReturnString('Note_Save');
    //   if (data.indexOf('err@') == 0) {
    //     message.error(data);
    //     return;
    //   }
    //   return new GPNReturnObj(GPNReturnType.Message, data);
    // }
    // return;
    // throw new Error('Method not implemented.');
  }
}
