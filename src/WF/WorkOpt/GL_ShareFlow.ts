import { message } from 'ant-design-vue';
import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_ShareFlow extends PageBaseGenerList {
  override LinkFieldClick(_object: Record<string, any>) {
    //throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_ShareFlow');
    this.PageTitle = '流程分享';
  }
  //重写的构造方法.
  async Init() {
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 300; // 分页的页面行数, 0不分页.
    this.GroupFields = 'ShareModel';
    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'Idx', Name: '#', IsShow: false, DataType: 1 },
      { Key: 'ShareModel', Name: '分享模式', IsShow: true, DataType: 1 },
      { Key: 'ShareKey', Name: '模式名称', IsShow: false, DataType: 1 },
      { Key: 'ShareName', Name: '模式名称', IsShow: true, DataType: 1 },
      { Key: 'Btn', Name: '操作', IsShow: true, DataType: 1 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', this.RequestVal('WorkID'));
    handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    const data: any = await handler.DoMethodReturnJson('Note_Init');
    this.Data = data;
    console.log('data', this.Data);
  }

  async BtnClick(btnName: string, _object: Record<string, any>) {
    if (btnName == '增加人员') {
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
