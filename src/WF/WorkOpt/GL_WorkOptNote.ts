import { message } from 'ant-design-vue';
import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_WorkOptNote extends PageBaseGenerList {
  constructor() {
    super('GL_WorkOptNote');
    this.PageTitle = '备注';
  }
  //重写的构造方法.
  async Init() {
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.BtnOfToolbar = '增加备注';

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'NDFrom', Name: '节点', IsShow: false, DataType: 2 },
      { Key: 'NDFromT', Name: '节点名称', IsShow: true, DataType: 1, width: 350 },
      { Key: 'EmpFromT', Name: '处理人', IsShow: true, DataType: 1, width: 66 },
      { Key: 'RDT', Name: '处理时间', IsShow: true, DataType: 1, width: 150 },
      { Key: 'Msg', Name: '备注信息', IsShow: true, DataType: 1, width: 150 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', this.RequestVal('WorkID'));
    handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    const data: any = await handler.DoMethodReturnJson('Note_Init');
    this.Data = data;
    console.log('data', this.Data);
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {}

  async BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '增加备注') {
      const msg = window.prompt('请输入备注信息,该信息将以消息的方式通知流程的所有参与人:', '');
      if (msg == '') return;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      await handler.AddPara('WorkID', this.RequestVal('WorkID'));
      await handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
      await handler.AddPara('NodeID', this.RequestVal('NodeID'));
      await handler.AddPara('Msg', msg);
      const data = await handler.DoMethodReturnString('Note_Save');
      if (data.indexOf('err@') == 0) {
        message.error(data);
        return;
      }
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    return;
    // throw new Error('Method not implemented.');
  }
}
